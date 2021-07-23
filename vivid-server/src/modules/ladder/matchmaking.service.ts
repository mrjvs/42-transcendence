import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ERank } from '~/models/ladder.entity';
import { ILadderUser, LadderUserEntity } from '~/models/ladder_user.entity';
import { PongService } from '../pong/pong.service';

type UnmatchedPlayer = {
  id: string;
  timeJoined: Date;
  rank: ERank;
};

interface IMatchingPlayer {
  player: UnmatchedPlayer;
  socket: any;
  ladderId: string;
}

interface IPlayerPool {
  [PlayerId: string]: IMatchingPlayer;
}

const playerPool: IPlayerPool = {};

const MAX_TIME_IN_QUEUE = 2 * 1000; // 2s

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
    if (isUserAlreadyInPool) return;

    let user = await this.ladderUserRepository.findOne({
      where: { ladder: ladderId, user: client.auth },
    });
    if (!user) {
      user = await this.ladderUserRepository.save({
        ladder: ladderId,
        user: client.auth,
        points: 0,
      });
    }

    playerPool[user.user] = {
      player: {
        id: user.user,
        timeJoined: new Date(),
        rank: user.rank,
      },
      socket: client,
      ladderId,
    };
  }

  leavePool(client: any) {
    if (!client || !client.auth) return;
    if (playerPool[client.auth]) delete playerPool[client.auth];
  }

  matchMake(): boolean {
    if (Object.keys(playerPool).length < 1) {
      return false;
    }

    console.log('does matching, players:', Object.keys(playerPool).length);

    for (const [playerIdA, playerA] of Object.entries(playerPool)) {
      for (const [playerIdB, playerB] of Object.entries(playerPool)) {
        if (this.isMatch(playerA, playerB)) {
          // create game and join them
          const gameId = this.pongService.createGame();
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

          // TODO save match and adjust player ratings
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

  // TODO check if this is all correct
  isMatch(player1: IMatchingPlayer, player2: IMatchingPlayer): boolean {
    if (player1 === player2) return false;
    if (player1.ladderId !== player2.ladderId) return false;

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
    const rankDiff = Math.abs(player1.player.rank - player2.player.rank);

    console.log({
      player1: player1.player.rank, // for some reason rank is undefined (issues on ladderUserEntity)
      player2: player2.player.rank,
      rankDiff: rankDiff,
      matchMakingDiff: diff,
    });

    if (rankDiff > diff) return false;

    return true;
  }

  @Cron('*/5 * * * * *')
  doMatchMake() {
    this.matchMake();
  }
}
