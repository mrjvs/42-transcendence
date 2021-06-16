const canvas = document.getElementById('pong');

const context = canvas.getContext('2d');

function drawRect(x, y, w, h, color) {
  context.fillStyle = color;
  context.fillRect(x, y, w, h);
}

function drawText(text, x, y, color) {
  context.fillStyle = color;
  context.font = '75px Serif';
  context.fillText(text, x, y);
}

function drawCircle(x, y, r, color) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, r, 0, Math.PI * 2, false);
  context.closePath();
  context.fill();
}

drawRect(300, 100, 100, 100, 'red');
drawRect(0, 0, 600, 400, 'black');
drawRect(400, 100, 100, 100, 'red');

var rectX = 0;
function render() {
  drawRect(0, 0, 600, 400, 'black');
  drawText(user1.score, canvas.width / 4, canvas.height / 5, 'RED');
  drawText(user2.score, (canvas.width / 4) * 3, canvas.height / 5, 'RED');
  drawNet();
  drawRect(user1.x, user1.y, user1.width, user1.height, user1.color);
  drawRect(user2.x, user2.y, user2.width, user2.height, user2.color);
  drawCircle(ball.x, ball.y, ball.radius, ball.color);
  // drawRect(rectX, 100, 100, 100, 'red');
  // rectX += 2;
  // if (rectX > 490) rectX = 10;
  // console.log(rectX);
  update();
}

function game() {
  render();
}

const framePerSecond = 10;

setInterval(game, 1000 / framePerSecond);

var user1 = {
  x: 0,
  y: canvas.height / 2 - 300 / 2,
  width: 10,
  height: 300,
  color: 'PURPLE',
  score: 0,
};

var user2 = {
  x: canvas.width - 10,
  y: canvas.height / 2 - 300 / 2,
  width: 10,
  height: 300,
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

function drawNet() {
  for (var i = 0; i <= canvas.height; i += 30) {
    drawRect(net.x, net.y + i, net.width, net.height, net.color);
  }
}

var ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  speed: 5,
  velocityX: 5,
  velocityY: 5,
  color: 'ORANGE',
};

function update() {
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;
  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.velocityY = -ball.velocityY;
  }
  
  var player = ball.x < canvas.width / 2 ? user1 : user2;
  if (collision(ball, player)) {
    console.log("---------------");
    var collidePoint =
    (ball.y - (player.y + player.height / 2)) / (player.height / 2);
    var angleRad = collidePoint * (Math.PI / 4);
    var direction = ball.x < canvas.width / 2 ? 1 : -1;
    // maybe just make the direction -1
    // console.log(ball.velocityY);
    console.log(ball.velocityX);
    console.log(Math.cos(angleRad) * ball.speed * direction);
    ball.velocityX = (Math.cos(angleRad) * ball.speed * direction);
    console.log(ball.velocityX);
    ball.velocityY = Math.sin(angleRad) * ball.speed;
    // console.log(ball.velocityY);

    ball.speed += 0.1;

    // Change();
    // ball.x += velocityX;
    // ball.y += velocityY;
  }
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

// drawCircle(ball.x, ball.y, ball.radius, ball.color);

// drawCircle(300, 250, 100, "red");
