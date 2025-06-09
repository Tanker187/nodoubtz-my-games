const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 12, PADDLE_HEIGHT = 100;
const BALL_SIZE = 14;
const PLAYER_X = 24, AI_X = canvas.width - 24 - PADDLE_WIDTH;
const PADDLE_SPEED = 7;
const BALL_SPEED = 6;

// Game state
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;
let ballX = canvas.width / 2 - BALL_SIZE / 2;
let ballY = canvas.height / 2 - BALL_SIZE / 2;
let ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
let ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
let playerScore = 0, aiScore = 0;

// Mouse control
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  playerY = mouseY - PADDLE_HEIGHT / 2;
  if (playerY < 0) playerY = 0;
  if (playerY > canvas.height - PADDLE_HEIGHT)
    playerY = canvas.height - PADDLE_HEIGHT;
});

// Draw everything
function draw() {
  // Background
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Net
  ctx.strokeStyle = '#fff2';
  ctx.beginPath();
  for (let y = 0; y < canvas.height; y += 28) {
    ctx.moveTo(canvas.width / 2, y);
    ctx.lineTo(canvas.width / 2, y + 14);
  }
  ctx.stroke();

  // Paddles
  ctx.fillStyle = '#fff';
  ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.fillRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

  // Ball
  ctx.fillRect(ballX, ballY, BALL_SIZE, BALL_SIZE);

  // Score
  ctx.font = '36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(playerScore, canvas.width / 4, 50);
  ctx.fillText(aiScore, canvas.width * 3 / 4, 50);
}

// Update game state
function update() {
  // Ball movement
  ballX += ballVelX;
  ballY += ballVelY;

  // Ball collision with top/bottom walls
  if (ballY < 0) {
    ballY = 0;
    ballVelY = -ballVelY;
  } else if (ballY + BALL_SIZE > canvas.height) {
    ballY = canvas.height - BALL_SIZE;
    ballVelY = -ballVelY;
  }

  // Ball collision with player paddle
  if (
    ballX < PLAYER_X + PADDLE_WIDTH &&
    ballX > PLAYER_X &&
    ballY + BALL_SIZE > playerY &&
    ballY < playerY + PADDLE_HEIGHT
  ) {
    ballX = PLAYER_X + PADDLE_WIDTH;
    ballVelX = -ballVelX;
    // Add some "english"
    let deltaY = ballY + BALL_SIZE / 2 - (playerY + PADDLE_HEIGHT / 2);
    ballVelY = deltaY * 0.25;
  }

  // Ball collision with AI paddle
  if (
    ballX + BALL_SIZE > AI_X &&
    ballX + BALL_SIZE < AI_X + PADDLE_WIDTH &&
    ballY + BALL_SIZE > aiY &&
    ballY < aiY + PADDLE_HEIGHT
  ) {
    ballX = AI_X - BALL_SIZE;
    ballVelX = -ballVelX;
    let deltaY = ballY + BALL_SIZE / 2 - (aiY + PADDLE_HEIGHT / 2);
    ballVelY = deltaY * 0.25;
  }

  // Score check
  if (ballX < 0) {
    aiScore++;
    resetBall();
  } else if (ballX + BALL_SIZE > canvas.width) {
    playerScore++;
    resetBall();
  }

  // AI movement (simple follow)
  let aiCenter = aiY + PADDLE_HEIGHT / 2;
  if (aiCenter < ballY + BALL_SIZE / 2 - 12) {
    aiY += PADDLE_SPEED;
  } else if (aiCenter > ballY + BALL_SIZE / 2 + 12) {
    aiY -= PADDLE_SPEED;
  }
  // Clamp AI paddle
  if (aiY < 0) aiY = 0;
  if (aiY > canvas.height - PADDLE_HEIGHT)
    aiY = canvas.height - PADDLE_HEIGHT;
}

function resetBall() {
  ballX = canvas.width / 2 - BALL_SIZE / 2;
  ballY = canvas.height / 2 - BALL_SIZE / 2;
  ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
  ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
}

// Main loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Start game
loop();