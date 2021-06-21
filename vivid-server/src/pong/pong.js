// const canvas = <HTMLCanvasElement> document.getElementById('pong');
const canvas = document.getElementById('pong');
const context = canvas.getContext('2d');

var move_left_player = 0;
var move_right_player = 0;
const increase_speed_after_contact = 0.2;
const computer_level = 0.1;
var two_player = false;
const framePerSecond = 100;

var user_left = {
  x: 0,
  y: canvas.height / 2 - 100 / 2,
  width: 10,
  height: 100,
  color: 'PURPLE',
  score: 0,
};

var user_right = {
  x: canvas.width - 10,
  y: canvas.height / 2 - 100 / 2,
  width: 10,
  height: 100,
  color: 'PURPLE',
  score: 0,
};

const net = {
  x: canvas.width / 2 - 4 / 2,
  y: 0,
  width: 4,
  height: 14,
  color: 'WHITE',
};

var ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  speed: 2,
  velocityX: 2,
  velocityY: 2,
  color: 'ORANGE',
};

function playWithMouse() {
  canvas.addEventListener('mousemove', mouseMovePaddle);
}

function mouseMovePaddle(evt) {
  let rect = canvas.getBoundingClientRect();
  user_left.y = evt.clientY - rect.top - user_left.height / 2;
}

function playWithKeys() {
  window.addEventListener('keydown', keydown, true);
  window.addEventListener('keyup', keyup, true);
}

function keyup(e) {
  switch (e.keyCode) {
    case 38:
      move_right_player = 0;
      break;
    case 40:
      move_right_player = 0;
      break;
    case 87:
      move_left_player = 0;
      break;
    case 83:
      move_left_player = 0;
      break;
  }
}

function keydown(e) {
  switch (e.keyCode) {
    case 38:
      move_right_player = -5;
      break;
    case 40:
      move_right_player = 5;
      break;
    case 87:
      move_left_player = -5;
      break;
    case 83:
      move_left_player = 5;
      break;
  }
}

function makeButtons(screen) {
  drawRect(0, 0, 600, 400, 'black');
  drawRect(50, 175, 200, 50, 'red');
  drawRect(350, 175, 200, 50, 'red');
  if (screen === 1) {
    drawTextStart('one player', 75, 208, 'purple');
    drawTextStart('two players', 375, 208, 'purple');
  } else if (screen === 2) {
    drawTextStart('arrow keys', 75, 208, 'purple');
    drawTextStart('mouse', 400, 208, 'purple');
  }
}

function drawRect(x, y, w, h, color) {
  context.fillStyle = color;
  context.fillRect(x, y, w, h);
}

function drawText(text, x, y, color) {
  context.fillStyle = color;
  context.font = '75px Serif';
  context.fillText(text, x, y);
}

function drawTextStart(text, x, y, color) {
  context.fillStyle = color;
  context.font = 'bold 30px arial';
  context.fillText(text, x, y);
}

function drawCircle(x, y, r, color) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, r, 0, Math.PI * 2, false);
  context.closePath();
  context.fill();
}

function drawNet() {
  for (var i = 0; i <= canvas.height; i += 30) {
    drawRect(net.x, net.y + i, net.width, net.height, net.color);
  }
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = 2;
  ball.velocityX = 2;
  ball.velocityY = 2;
  ball.velocityX = -ball.velocityX;
}

function collision(b, p) {
  p.top = p.y;
  p.bottum = p.y + p.height;
  p.left = p.x;
  p.right = p.x + p.width;
  b.top = b.y - b.radius;
  b.bottom = b.y + b.radius;
  b.left = b.x - b.radius;
  b.right = b.x + b.radius;
  return (
    b.top < p.bottum && b.bottom > p.top && b.left < p.right && b.right > p.left
  );
}

function moveRightPlayer() {
  if (two_player) {
    return move_right_player;
  }
  return (ball.y - (user_right.y + user_right.height / 2)) * computer_level;
}

function update() {
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0)
    ball.velocityY = -ball.velocityY;

  var player = ball.x < canvas.width / 2 ? user_left : user_right;

  if (collision(ball, player)) {
    var collidePoint =
      (ball.y - (player.y + player.height / 2)) / (player.height / 2);
    var angleRad = collidePoint * (Math.PI / 4);
    var direction = ball.x < canvas.width / 2 ? 1 : -1;
    ball.velocityX = Math.cos(angleRad) * ball.speed * direction;
    ball.velocityY = Math.sin(angleRad) * ball.speed;
    ball.speed += increase_speed_after_contact;
  }

  if (ball.x - ball.radius < 0) {
    user_right.score += 1;
    resetBall();
  } else if (ball.x + ball.radius > canvas.width) {
    user_left.score += 1;
    resetBall();
  }
}

function render() {
  drawRect(0, 0, 600, 400, 'black');
  drawText(user_left.score, canvas.width / 4, canvas.height / 5, 'RED');
  drawText(user_right.score, (canvas.width / 4) * 3, canvas.height / 5, 'RED');
  drawNet();
  drawRect(
    user_left.x,
    user_left.y,
    user_left.width,
    user_left.height,
    user_left.color,
  );
  drawRect(
    user_right.x,
    user_right.y,
    user_right.width,
    user_right.height,
    user_right.color,
  );
  drawCircle(ball.x, ball.y, ball.radius, ball.color);
  update();
  user_left.y += move_left_player;
  user_right.y += moveRightPlayer();
}

function inLeftButton(x, y) {
  return x > 50 && x < 250 && y > 175 && y < 225;
}

function inRightButton(x, y) {
  return x > 350 && x < 550 && y > 175 && y < 225;
}

function startGame() {
  canvas.removeEventListener('click', chooseControls);
  setInterval(render, 1000 / framePerSecond);
}

function chooseControls(event) {
  var x = event.clientX;
  var y = event.clientY;
  if (inLeftButton(x, y)) {
    playWithKeys();
    startGame();
  } else if (inRightButton(x, y)) {
    playWithMouse();
    startGame();
  }
}

function onePlayerOptions() {
  makeButtons(2);
  canvas.removeEventListener('click', chooseNumberOfPlayers);
  canvas.addEventListener('click', chooseControls);
}

function chooseNumberOfPlayers(event) {
  var x = event.clientX;
  var y = event.clientY;
  if (inLeftButton(x, y)) {
    onePlayerOptions();
  } else if (inRightButton(x, y)) {
    two_player = true;
    playWithKeys();
    startGame();
  }
}

function chooseGameOptions() {
  makeButtons(1);
  canvas.addEventListener('click', chooseNumberOfPlayers);
}

chooseGameOptions();
