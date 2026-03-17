const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("best-score");
const speedEl = document.getElementById("speed");
const statusEl = document.getElementById("status");
const startButton = document.getElementById("start-button");
const pauseButton = document.getElementById("pause-button");
const controlButtons = document.querySelectorAll(".mobile-controls button");
const overlayEl = document.getElementById("overlay");
const overlayKickerEl = document.getElementById("overlay-kicker");
const overlayTitleEl = document.getElementById("overlay-title");
const overlayTextEl = document.getElementById("overlay-text");
const lastActionEl = document.getElementById("last-action");
const streakEl = document.getElementById("streak");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const baseTick = 170;
const bestScoreKey = "snake-demo-best-score";
const swipeThreshold = 24;

let snake = [];
let food = { x: 5, y: 5 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let streak = 0;
let gameLoop = null;
let isRunning = false;
let isPaused = false;
let speedLevel = 1;
let touchStart = null;

function loadBestScore() {
  const best = Number(localStorage.getItem(bestScoreKey) || 0);
  bestScoreEl.textContent = String(best);
}

function updateOverlay(kicker, title, text, visible = true) {
  overlayKickerEl.textContent = kicker;
  overlayTitleEl.textContent = title;
  overlayTextEl.textContent = text;
  overlayEl.classList.toggle("hidden", !visible);
}

function updateStatus(text, actionText = text) {
  statusEl.textContent = text;
  lastActionEl.textContent = actionText;
}

function updateStreak() {
  streakEl.textContent = `连续吃到 ${streak} 个`;
}

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  food = randomFoodPosition();
  score = 0;
  streak = 0;
  speedLevel = 1;
  scoreEl.textContent = "0";
  speedEl.textContent = "1x";
  updateStatus("游戏进行中", "起步");
  updateStreak();
  draw();
}

function randomFoodPosition() {
  while (true) {
    const candidate = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };

    const onSnake = snake.some((segment) => segment.x === candidate.x && segment.y === candidate.y);
    if (!onSnake) {
      return candidate;
    }
  }
}

function setDirection(newDirection) {
  if (!isRunning || isPaused) {
    return;
  }

  if (newDirection.x === -direction.x && newDirection.y === -direction.y) {
    return;
  }

  nextDirection = newDirection;
}

function getDelay() {
  return Math.max(70, baseTick - (speedLevel - 1) * 16);
}

function restartLoop() {
  if (gameLoop) {
    clearInterval(gameLoop);
  }
  gameLoop = setInterval(tick, getDelay());
}

function updateBestScore() {
  const best = Number(localStorage.getItem(bestScoreKey) || 0);
  if (score > best) {
    localStorage.setItem(bestScoreKey, String(score));
    bestScoreEl.textContent = String(score);
  }
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(49, 79, 39, 0.05)";
  for (let x = 0; x < tileCount; x += 1) {
    for (let y = 0; y < tileCount; y += 1) {
      if ((x + y) % 2 === 0) {
        ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
      }
    }
  }
}

function drawSnake() {
  snake.forEach((segment, index) => {
    const gradient = ctx.createLinearGradient(
      segment.x * gridSize,
      segment.y * gridSize,
      segment.x * gridSize + gridSize,
      segment.y * gridSize + gridSize
    );

    if (index === 0) {
      gradient.addColorStop(0, "#254d23");
      gradient.addColorStop(1, "#163d18");
    } else {
      gradient.addColorStop(0, "#49a34e");
      gradient.addColorStop(1, "#2f7d32");
    }

    ctx.fillStyle = gradient;
    roundRect(
      segment.x * gridSize + 2,
      segment.y * gridSize + 2,
      gridSize - 4,
      gridSize - 4,
      index === 0 ? 7 : 6
    );

    if (index === 0) {
      drawEyes(segment);
    }
  });
}

function drawEyes(head) {
  const eyePoints = getEyePoints();
  ctx.fillStyle = "#f7f6ef";
  eyePoints.forEach((point) => {
    ctx.beginPath();
    ctx.arc(head.x * gridSize + point.x, head.y * gridSize + point.y, 1.9, 0, Math.PI * 2);
    ctx.fill();
  });
}

function getEyePoints() {
  if (direction.x === 1) {
    return [{ x: 14, y: 7 }, { x: 14, y: 13 }];
  }
  if (direction.x === -1) {
    return [{ x: 6, y: 7 }, { x: 6, y: 13 }];
  }
  if (direction.y === -1) {
    return [{ x: 7, y: 6 }, { x: 13, y: 6 }];
  }
  return [{ x: 7, y: 14 }, { x: 13, y: 14 }];
}

function drawFood() {
  const centerX = food.x * gridSize + gridSize / 2;
  const centerY = food.y * gridSize + gridSize / 2;

  ctx.fillStyle = "#d95d39";
  ctx.beginPath();
  ctx.arc(centerX, centerY + 1, 6.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#7a9d34";
  ctx.beginPath();
  ctx.ellipse(centerX + 4, centerY - 6, 3.5, 1.8, -0.5, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  drawBoard();
  drawSnake();
  drawFood();
}

function endGame() {
  isRunning = false;
  isPaused = false;
  pauseButton.textContent = "暂停";
  startButton.textContent = "再来一局";
  updateStatus(`游戏结束，得分 ${score}`, "撞上了");

  if (gameLoop) {
    clearInterval(gameLoop);
    gameLoop = null;
  }

  updateOverlay("Game Over", "撞到了", `本局得分 ${score}，点击“再来一局”继续。`);
  draw();
}

function tick() {
  if (!isRunning || isPaused) {
    return;
  }

  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  const hitWall =
    head.x < 0 ||
    head.y < 0 ||
    head.x >= tileCount ||
    head.y >= tileCount;

  const hitSelf = snake.some((segment) => segment.x === head.x && segment.y === head.y);

  if (hitWall || hitSelf) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1;
    streak += 1;
    scoreEl.textContent = String(score);
    updateBestScore();
    updateStreak();

    speedLevel = Math.min(1 + Math.floor(score / 3), 7);
    speedEl.textContent = `${speedLevel}x`;
    food = randomFoodPosition();
    updateStatus(`游戏进行中，当前 ${score} 分`, `吃到第 ${score} 个`);
    restartLoop();
  } else {
    streak = 0;
    updateStreak();
    snake.pop();
  }

  draw();
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fill();
}

function startGame() {
  if (gameLoop) {
    clearInterval(gameLoop);
  }

  isRunning = true;
  isPaused = false;
  pauseButton.textContent = "暂停";
  startButton.textContent = "重新开始";
  resetGame();
  updateOverlay("Live", "开局了", "保持节奏，别急着反向。", false);
  restartLoop();
}

function togglePause() {
  if (!isRunning) {
    return;
  }

  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? "继续" : "暂停";

  if (isPaused) {
    updateStatus("游戏已暂停", "已暂停");
    updateOverlay("Pause", "暂停中", "按继续，或者空格恢复。");
  } else {
    updateStatus(`游戏进行中，当前 ${score} 分`, "继续前进");
    updateOverlay("Live", "开局了", "保持节奏，别急着反向。", false);
  }
}

function handleDirectionInput(key) {
  const map = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    W: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    S: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    A: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
    D: { x: 1, y: 0 }
  };

  const selected = map[key];
  if (selected) {
    setDirection(selected);
  }
}

function handleSwipe(start, end) {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;

  if (Math.abs(deltaX) < swipeThreshold && Math.abs(deltaY) < swipeThreshold) {
    return;
  }

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    setDirection(deltaX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
  } else {
    setDirection(deltaY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
  }
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    togglePause();
    return;
  }

  handleDirectionInput(event.key);
});

controlButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const dir = button.dataset.dir;
    if (dir === "up") {
      setDirection({ x: 0, y: -1 });
    } else if (dir === "down") {
      setDirection({ x: 0, y: 1 });
    } else if (dir === "left") {
      setDirection({ x: -1, y: 0 });
    } else if (dir === "right") {
      setDirection({ x: 1, y: 0 });
    }
  });
});

canvas.addEventListener("pointerdown", (event) => {
  touchStart = { x: event.clientX, y: event.clientY };
});

canvas.addEventListener("pointerup", (event) => {
  if (!touchStart) {
    return;
  }

  handleSwipe(touchStart, { x: event.clientX, y: event.clientY });
  touchStart = null;
});

canvas.addEventListener("pointerleave", () => {
  touchStart = null;
});

startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", togglePause);

loadBestScore();
resetGame();
updateOverlay("Ready", "贪吃蛇", "点击开始，先跑起来。");
