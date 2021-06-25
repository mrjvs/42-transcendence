////////////////////////////////////////////////////////////

class Draw {
  background() {
    this.rectangle(0, 0, 600, 400, 'black');
  }

  private text(
    text: string,
    x: number,
    y: number,
    color: string,
    font: string,
  ) {
    context.fillStyle = color;
    context.font = font;
    context.fillText(text, x, y);
  }

  buttons(screen: number) {
    this.background();
    this.rectangle(50, 175, 200, 50, 'red');
    this.rectangle(350, 175, 200, 50, 'red');

    let left_button: string, right_button: string;
    if (screen === 1) {
      left_button = 'one player';
      right_button = 'two players';
    } else if (screen === 2) {
      left_button = 'arrow keys';
      right_button = 'mouse';
    }
    this.text(left_button!, 75, 208, 'purple', 'bold 30px arial');
    this.text(right_button!, 375, 208, 'purple', 'bold 30px arial');
  }

  scores(left_player_score: string, right_player_score: string) {
    this.text(
      left_player_score,
      canvas.width / 4,
      canvas.height / 5,
      'RED',
      '75px Serif',
    );
    this.text(
      right_player_score,
      (canvas.width / 4) * 3,
      canvas.height / 5,
      'RED',
      '75px Serif',
    );
  }

  rectangle(x: number, y: number, w: number, h: number, color: string) {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
  }

  pads(x: number, y: number, w: number, h: number, color: string) {
    this.rectangle(x, y, w, h, color);
  }

  ball(x: number, y: number, radius: number, color: string) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
  }

  net(canvasHeight: number) {
    const net: Net = {
      x: canvas.width / 2 - 4 / 2,
      y: 0,
      width: 4,
      height: 14,
      color: 'WHITE',
    };
    for (var i = 0; i <= canvasHeight; i += 30) {
      this.rectangle(net.x, net.y + i, net.width, net.height, net.color);
    }
  }
}

////////////////////////////////////////////////////////////

const canvas = <HTMLCanvasElement>document.getElementById('pong');
const context = canvas.getContext('2d')!;

type Player = {
  y: number;
  x: number;
  score: number;
};

type Ball = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  velocityX: number;
  velocityY: number;
  color: string;
};

type Net = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

////////////////////////////////////////////////////////////

class Pong {
  left_player: Player;
  right_player: Player;
  ball: Ball;
  move_left_player: number;
  move_right_player: number;
  increase_speed_after_contact: number;
  computer_level: number;
  two_players: boolean;
  framePerSecond: number;
  draw: Draw;
  player_width: number;
  player_height: number;
  player_color: string;

  constructor() {
    // Game settings
    this.left_player = {
      y: canvas.height / 2 - 100 / 2,
      x: 0,
      score: 0,
    };

    this.right_player = {
      y: canvas.height / 2 - 100 / 2,
      x: canvas.width - 10,
      score: 0,
    };

    this.ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: 10,
      speed: 2,
      velocityX: 2,
      velocityY: 2,
      color: 'ORANGE',
    };

    this.two_players = false;
    this.computer_level = 0.01;
    this.increase_speed_after_contact = 0.2;
    this.framePerSecond = 100;
    this.player_width = 10;
    this.player_height = 100;
    this.player_color = 'PURPLE';

    this.draw = new Draw();
    this.move_left_player = 0;
    this.move_right_player = 0;
  }

  // Set event listener for key control
  playWithKeys() {
    window.addEventListener(
      'keydown',
      (event) => {
        switch (event.key) {
          case 'w':
            this.move_left_player = -5;
            break;
          case 's':
            this.move_left_player = 5;
            break;
          case 'ArrowUp':
            this.move_right_player = -5;
            break;
          case 'ArrowDown':
            this.move_right_player = 5;
            break;
        }
      },
      true,
    );
    window.addEventListener(
      'keyup',
      (event) => {
        switch (event.key) {
          case 'w':
            this.move_left_player = 0;
            break;
          case 's':
            this.move_left_player = 0;
            break;
          case 'ArrowUp':
            this.move_right_player = 0;
            break;
          case 'ArrowDown':
            this.move_right_player = 0;
            break;
        }
      },
      true,
    );
  }

  // Set event listener for mouse control
  playWithMouse() {
    canvas.addEventListener('mousemove', (event: MouseEvent) => {
      let rect = canvas.getBoundingClientRect();
      this.left_player.y = event.clientY - rect.top - this.player_height / 2;
    });
  }

  // Calculate if the ball hit a pad
  private collision(player: Player) {
    let playerTop = player.y;
    let playerBottom = player.y + this.player_height;
    let playerLeft = player.x;
    let playerRight = player.x + this.player_width;
    let ballTop = this.ball.y - this.ball.radius;
    let ballBottom = this.ball.y + this.ball.radius;
    let ballLeft = this.ball.x - this.ball.radius;
    let ballRight = this.ball.x + this.ball.radius;
    return (
      ballBottom > playerTop &&
      ballTop < playerBottom &&
      ballRight > playerLeft &&
      ballLeft < playerRight
    );
  }

  private moveRightPlayer() {
    if (this.two_players) {
      return this.move_right_player;
    }
    // If right player is a bot
    return (
      (this.ball.y - (this.right_player.y + this.player_height / 2)) *
      this.computer_level
    );
  }

  private resetBall() {
    this.ball.x = canvas.width / 2;
    this.ball.y = canvas.height / 2;
    this.ball.speed = 2;
    this.ball.velocityX = 2;
    this.ball.velocityY = 2;
    this.ball.velocityX = -this.ball.velocityX;
  }

  private updateBallLocation() {
    // Check for wall hit
    if (
      this.ball.y + this.ball.radius > canvas.height ||
      this.ball.y - this.ball.radius < 0
    )
      this.ball.velocityY = -this.ball.velocityY;

    // Check on which player's side the ball is
    const player =
      this.ball.x < canvas.width / 2 ? this.left_player : this.right_player;

    // Check for pad collision and change ball direction
    if (this.collision(player)) {
      const collidePoint =
        (this.ball.y - (player.y + this.player_height / 2)) /
        (this.player_height / 2);
      const angleRad = collidePoint * (Math.PI / 4);
      const direction = this.ball.x < canvas.width / 2 ? 1 : -1;
      this.ball.velocityX = Math.cos(angleRad) * this.ball.speed * direction;
      this.ball.velocityY = Math.sin(angleRad) * this.ball.speed;
      this.ball.speed += this.increase_speed_after_contact;
    }

    // Check for goal and reset ball
    if (
      this.ball.x - this.ball.radius < 0 ||
      this.ball.x + this.ball.radius > canvas.width
    ) {
      player.score += 1;
      // TODO end game
      // if (player.score === 10) {
      // 	MatchService.newMatch(IMatch);
      // exit(0); ?
      // }
      this.resetBall();
    }

    // Update ball location
    this.ball.x += this.ball.velocityX;
    this.ball.y += this.ball.velocityY;
  }

  private updatePlayerLocation() {
    this.left_player.y += this.move_left_player;
    this.right_player.y += this.moveRightPlayer();
  }

  private render() {
    this.draw.background();
    // Draw scores
    this.draw.scores(
      this.right_player.score.toString(),
      this.left_player.score.toString(),
      // canvas.width / 4,
      // canvas.height / 5,
      // 'RED',
      // '75px Serif'
    );
    // this.draw.score(
    // (canvas.width / 4) * 3,
    // canvas.height / 5,
    // 'RED',
    // '75px Serif'
    // );
    // Draw net
    this.draw.net(canvas.height);
    // Draw left player
    this.draw.pads(
      this.left_player.x,
      this.left_player.y,
      this.player_width,
      this.player_height,
      this.player_color,
    );
    // Draw right player
    this.draw.pads(
      this.right_player.x,
      this.right_player.y,
      this.player_width,
      this.player_height,
      this.player_color,
    );
    // Draw ball
    this.draw.ball(this.ball.x, this.ball.y, this.ball.radius, this.ball.color);
  }

  // Game loop
  start() {
    setInterval(() => {
      this.updateBallLocation();
      this.updatePlayerLocation();
      this.render();
    }, 1000 / this.framePerSecond);
  }
}

////////////////////////////////////////////////////////////

(function main() {
  const game = new Pong();

  // Set game options
  // game.two_player = true;
  // game.playWithMouse();
  game.playWithKeys();

  // Start game
  game.start();
})();

////////////////////////////////////////////////////////////

// enum Options {
//   ONE_PLAYER = 1,
//   TWO_PLAYERS,
//   KEYS,
//   MOUSE,
// }

// class GameOptions {
//   public controls: number;
//   public numberOfPlayers: number;

//   constructor() {
//     this.controls = 0;
//     this.numberOfPlayers = 0;
//   }

//   private button(event: MouseEvent): string {
//     const x: number = event.clientX;
//     const y: number = event.clientY;
//     if (x > 50 && x < 250 && y > 175 && y < 225) return 'left';
//     if (x > 350 && x < 550 && y > 175 && y < 225) return 'right';
//     return '';
//   }

//   private chooseControls(event: MouseEvent) {
//     let choice: string = gameOptions.button(event);
//     if (choice) {
//       if (choice === 'left') playWithKeys();
//       else playWithMouse();
//       canvas.removeEventListener('click', this.chooseControls);
//       startGame();
//     }
//   }

//   private onePlayerOptions() {
//     canvas.removeEventListener('click', this.chooseNumberOfPlayers);
//     draw.buttons(2);
//     canvas.addEventListener('click', this.chooseControls);
//   }

//   private chooseNumberOfPlayers(event: MouseEvent) {
//     let choice: string = gameOptions.button(event);

//     if (choice) {
//       console.log('2: ' + choice);
//       if (choice === 'left') return Options.ONE_PLAYER;
//       else return Options.TWO_PLAYERS;
//     }
//     return 0;

//     // if (choice) {
//     //   if (choice === 'left') this.onePlayerOptions();
//     //   else {
//     //     two_player = true;
//     // playWithKeys();
//     // startGame();
//     // }
//     // }
//   }

//   async loadGameOptions() {
//     draw.buttons(1);
//     canvas.addEventListener('click', this.chooseNumberOfPlayers);
//   }

// }

////////////////////////////////////////////////////////////
