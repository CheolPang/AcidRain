const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const input = document.getElementById("typing-input");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const levelEl = document.getElementById("level");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayMsg = document.getElementById("overlay-msg");
const startBtn = document.getElementById("start-btn");

const state = {
  running: false,
  words: [],
  score: 0,
  lives: 3,
  level: 1,
  spawnTimer: 0,
  spawnInterval: 2.0, // 초
  baseSpeed: 40,      // px/s
  lastTime: 0
};

function resetState() {
  state.running = true;
  state.words = [];
  state.score = 0;
  state.lives = 3;
  state.level = 1;
  state.spawnTimer = 0;
  state.spawnInterval = 2.0;
  state.baseSpeed = 40;
  updateHUD();
}

function updateHUD() {
  scoreEl.textContent = state.score;
  livesEl.textContent = state.lives;
  levelEl.textContent = state.level;
}

function spawnWord() {
  const speed = state.baseSpeed + Math.random() * 20 + (state.level - 1) * 10;
  state.words.push(new FallingWord(getRandomWord(), canvas.width, speed));
}

function findTargetWord() {
  const typed = input.value.trim();
  if (!typed) return null;
  // 가장 아래쪽(위험한) 단어 중 접두어 일치
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
    // 난이도 상승
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
  if (state.lives <= 0) {
    gameOver();
  }
}

function gameOver() {
  state.running = false;
  overlayTitle.textContent = "GAME OVER";
  overlayMsg.textContent = `점수: ${state.score} · 레벨: ${state.level}`;
  startBtn.textContent = "다시 시작";
  overlay.classList.remove("hidden");
}

function update(dt) {
  state.spawnTimer += dt;
  if (state.spawnTimer >= state.spawnInterval) {
    state.spawnTimer = 0;
    spawnWord();
  }

  for (const w of state.words) w.update(dt);

  // 바닥 충돌
  const survived = [];
  for (const w of state.words) {
    if (w.y >= canvas.height - 20) {
      loseLife();
    } else {
      survived.push(w);
    }
  }
  state.words = survived;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 바닥선 (지면)
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

input.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    // 한글 IME 조합 중 엔터는 무시 (조합 확정용)
    if (e.isComposing) return;
    handleInput();
    input.value = "";
  }
});

startBtn.addEventListener("click", () => {
  overlay.classList.add("hidden");
  resetState();
  input.value = "";
  input.focus();
  state.lastTime = performance.now();
  requestAnimationFrame(loop);
});

// 게임 중 클릭해도 입력창 포커스 유지
document.addEventListener("click", () => {
  if (state.running) input.focus();
});
