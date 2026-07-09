const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const input = document.getElementById("typing-input");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const levelEl = document.getElementById("level");
const overlay = document.getElementById("overlay");
const titleScreen = document.getElementById("title-screen");
const difficultyScreen = document.getElementById("difficulty-screen");
const overlayTitle = document.getElementById("overlay-title");
const overlayMsg = document.getElementById("overlay-msg");
const startBtn = document.getElementById("start-btn");
const backBtn = document.getElementById("back-btn");
const introRain = document.getElementById("intro-rain");

// ===== 배경 상수 =====
const BG_COUNT = 3; // bg1.png ~ bg3.png
const TITLE_BG = "url('assets/title.png') center/cover no-repeat, #ffffff";

// ===== 난이도 프리셋 =====
const DIFFICULTY = {
  easy:   { baseSpeed: 30, spawnInterval: 2.6, label: "쉬움" },
  normal: { baseSpeed: 40, spawnInterval: 2.0, label: "보통" },
  hard:   { baseSpeed: 60, spawnInterval: 1.3, label: "어려움" }
};

const state = {
  running: false,
  words: [],
  score: 0,
  lives: 3,
  level: 1,
  spawnTimer: 0,
  spawnInterval: 2.0,
  baseSpeed: 40,
  difficulty: "normal",
  lastTime: 0
};

function resetState(difficulty) {
  const cfg = DIFFICULTY[difficulty];
  state.running = true;
  state.words = [];
  state.score = 0;
  state.lives = 3;
  state.level = 1;
  state.spawnTimer = 0;
  state.spawnInterval = cfg.spawnInterval;
  state.baseSpeed = cfg.baseSpeed;
  state.difficulty = difficulty;
  updateHUD();
}

function updateHUD() {
  scoreEl.textContent = state.score;
  livesEl.textContent = state.lives;
  levelEl.textContent = state.level;
}

function setRandomGameBg() {
  const n = Math.floor(Math.random() * BG_COUNT) + 1;
  canvas.style.background = `url('assets/bg${n}.png') center/cover no-repeat, #ffffff`;
}

function setTitleBg() {
  canvas.style.background = TITLE_BG;
}

function spawnWord() {
  const speed = state.baseSpeed + Math.random() * 20 + (state.level - 1) * 10;
  state.words.push(new FallingWord(getRandomWord(), canvas.width, speed));
}

function findTargetWord() {
  const typed = input.value.trim();
  if (!typed) return null;
  const matches = state.words
    .filter(w => w.text.startsWith(typed))
    .sort((a, b) => b.y - a.y);
  return matches[0] || null;
}

function handleInput() {
  const typed = input.value.trim();
  if (!typed) return;
  const target = state.words.find(w => w.text === typed);
  if (target) {
    state.score += target.text.length * 10;
    state.words = state.words.filter(w => w !== target);
    input.value = "";
    updateHUD();
    if (state.score > state.level * 200) {
      state.level++;
      state.spawnInterval = Math.max(0.6, state.spawnInterval - 0.15);
      state.baseSpeed += 10;
      updateHUD();
    }
  }
}

function loseLife() {
  state.lives--;
  updateHUD();
  if (state.lives <= 0) gameOver();
}

function gameOver() {
  state.running = false;
  document.body.classList.remove("playing");
  setTitleBg();
  // 재실행 시 인트로 애니메이션이 다시 돌지 않도록 강제 상태 고정
  overlay.style.animation = "none";
  overlay.style.background = "transparent";
  if (introRain) introRain.style.display = "none";
  overlayTitle.textContent = "GAME OVER";
  overlayMsg.textContent = `점수: ${state.score} · 레벨: ${state.level} · 난이도: ${DIFFICULTY[state.difficulty].label}`;
  startBtn.textContent = "다시 시작";
  showTitleScreen();
  overlay.classList.remove("hidden");
}

function update(dt) {
  state.spawnTimer += dt;
  if (state.spawnTimer >= state.spawnInterval) {
    state.spawnTimer = 0;
    spawnWord();
  }
  for (const w of state.words) w.update(dt);
  const survived = [];
  for (const w of state.words) {
    if (w.y >= canvas.height - 20) loseLife();
    else survived.push(w);
  }
  state.words = survived;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 바닥선
  ctx.strokeStyle = "#ff6b6b";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - 20);
  ctx.lineTo(canvas.width, canvas.height - 20);
  ctx.stroke();
  ctx.setLineDash([]);

  const target = findTargetWord();
  for (const w of state.words) {
    w.draw(ctx, w === target);
  }
}

function loop(ts) {
  if (!state.running) return;
  const dt = Math.min((ts - state.lastTime) / 1000, 0.05);
  state.lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

// ===== 화면 전환 =====
function showTitleScreen() {
  titleScreen.classList.remove("hidden");
  difficultyScreen.classList.add("hidden");
}

function showDifficultyScreen() {
  titleScreen.classList.add("hidden");
  difficultyScreen.classList.remove("hidden");
}

function startGame(difficulty) {
  overlay.classList.add("hidden");
  document.body.classList.add("playing");
  setRandomGameBg();
  resetState(difficulty);
  input.value = "";
  input.focus();
  state.lastTime = performance.now();
  requestAnimationFrame(loop);
}

// ===== 이벤트 =====
input.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    if (e.isComposing) return;
    handleInput();
    input.value = "";
  }
});

startBtn.addEventListener("click", () => {
  showDifficultyScreen();
});

if (backBtn) {
  backBtn.addEventListener("click", () => {
    showTitleScreen();
  });
}

document.querySelectorAll(".diff-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    startGame(btn.dataset.difficulty);
  });
});

document.addEventListener("click", () => {
  if (state.running) input.focus();
});
