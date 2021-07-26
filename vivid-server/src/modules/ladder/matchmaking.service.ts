import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { addons } from '~/constants';
import { IRank } from '@/ladder.entity';
import { LadderUserEntity } from '@/ladder_user.entity';
import { PongService } from '$/pong/pong.service';

type UnmatchedPlayer = {
  id: string;
  timeJoined: Date;
  rank: IRank;
};

interface IMatchingPlayer {
  player: UnmatchedPlayer;
  socket: any;
  ladder: {
    id: string;
    type: string;
  };
}

interface IPlayerPool {
  [PlayerId: string]: IMatchingPlayer;
}

const playerPool: IPlayerPool = {};

const MAX_TIME_IN_QUEUE = 10 * 60 * 1000; // 10m

@Injectable()
export class MatchMakingService {
  constructor(
    @InjectRepository(LadderUserEntity)
    private ladderUserRepository: Repository<LadderUserEntity>,
    @Inject(forwardRef(() => PongService))
    private pongService: PongService,
  ) {}

  async joinPool(client: any, ladderId: string) {
    if (!client || !client.auth) return;
    const isUserAlreadyInPool = !!playerPool[client.auth];
    if (isUserAlreadyInPool) {
      client.emit('matchmakingStatus', {
        status: 'alreadyin',
      });
      return;
    }

    let user;
    try {
      user = await this.ladderUserRepository.findOne({
        where: { ladder: ladderId, user: client.auth },
        relations: ['ladder'],
      });
      if (!user) {
        user = await this.ladderUserRepository.save({
          ladder: ladderId,
          user: client.auth,
          points: 0,
        });
        user = await this.ladderUserRepository.findOneOrFail({
          where: { id: user.id },
          relations: ['ladder'],
        });
      }
    } catch (err) {
      client.emit('matchmakingStatus', {
        status: 'error',
      });
      return;
    }

    client.emit('matchmakingStatus', {
      status: 'matching',
      rank:
        user.getRank() && !user.getRank().invalidRank
          ? {
              ...user.getRank(),
              icon: user.ladder.details.icon,
            }
          : null,
    });

    playerPool[user.user] = {
      player: {
        id: user.user,
        timeJoined: new Date(),
        rank: user.getRank(),
      },
      socket: client,
      ladder: {
        id: ladderId,
        type: (user.ladder as any).type,
      },
    };
  }

  leavePool(client: any) {
    if (!client || !client.auth) return;
    if (
      playerPool[client.auth] &&
      playerPool[client.auth].socket.id === client.id
    ) {
      delete playerPool[client.auth];
    }
  }

  matchMake(): boolean {
    if (Object.keys(playerPool).length < 1) {
      return false;
    }

    for (const [playerIdA, playerA] of Object.entries(playerPool)) {
      for (const [playerIdB, playerB] of Object.entries(playerPool)) {
        if (this.isMatch(playerA, playerB)) {
          // create game and join them
          const gameId = this.pongService.createGame(
            playerA.ladder.type,
            playerA.ladder.id,
            addons,
          );
          this.pongService.joinGame(playerIdA, gameId);
          this.pongService.joinGame(playerIdB, gameId);

          const statusObj = {
            status: 'game',
            gameId,
          };
          playerA.socket.emit('matchmakingStatus', statusObj);
          playerB.socket.emit('matchmakingStatus', statusObj);

          delete playerPool[playerIdA];
          delete playerPool[playerIdB];
        }
      }
    }

    // if too long
    for (const [playerId, player] of Object.entries(playerPool)) {
      if (
        new Date().getTime() - player.player.timeJoined.getTime() >
        MAX_TIME_IN_QUEUE
      ) {
        player.socket.emit('matchmakingStatus', {
          status: 'toolong',
        });
        delete playerPool[playerId];
      }
    }

    return true;
  }

  isMatch(player1: IMatchingPlayer, player2: IMatchingPlayer): boolean {
    if (player1 === player2) return false;
    if (player1.ladder.id !== player2.ladder.id) return false;
    if (player1.ladder.type !== player2.ladder.type) return false;

    let diff = 0;
    if (
      new Date().getTime() - player1.player.timeJoined.getTime() >
      MAX_TIME_IN_QUEUE / 4
    ) {
      diff = 2;
    } else if (
      new Date().getTime() - player1.player.timeJoined.getTime() >
      MAX_TIME_IN_QUEUE / 2
    ) {
      diff = 4;
    }
    const rankDiff = Math.abs(
      player1.player.rank.name - player2.player.rank.name,
    );

    if (rankDiff > diff) return false;

    return true;
  }

  @Cron('*/5 * * * * *')
  doMatchMake() {
    this.matchMake();
  }
}
