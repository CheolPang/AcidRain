const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const input = document.querySelector("#typing-input");
const scoreEl = document.querySelector("#score");
const livesEl = document.querySelector("#lives");
const levelEl = document.querySelector("#level");
const overlay = document.querySelector("#overlay");
const titleScreen = document.querySelector("#title-screen");
const difficultyScreen = document.querySelector("#difficulty-screen");
const overlayTitle = document.querySelector("#overlay-title");
const overlayMsg = document.querySelector("#overlay-msg");
const overlayMsgDv = document.querySelector("#overlay-msg-dv");
const overlayMsgTt = document.querySelector("#overlay-msg-tt");
const startBtn = document.querySelector("#start-btn");
const backBtn = document.querySelector("#back-btn");
const introRain = document.querySelector("#intro-rain");

// 퀴즈 모달
const quizModal = document.querySelector("#quiz-modal");
const quizQuestion = document.querySelector("#quiz-question");
const quizInput = document.querySelector("#quiz-input");
const quizTimerEl = document.querySelector("#quiz-timer");
const quizMsg = document.querySelector("#quiz-msg");

// ===== 사운드 =====
const sndSuccess = new Audio("assets/success.mp3");
const sndFail = new Audio("assets/fail.mp3");
const sndQuizSuccess = new Audio("assets/quiz_success.mp3");
const sndGameOver = new Audio("assets/gameover.mp3");
const sndQuiz = new Audio("assets/quiz.mp3");
// const backgroundAudio = new Audio("");
sndSuccess.volume = 0.6;
sndFail.volume = 0.6;
sndQuizSuccess.volume = 0.6;
sndGameOver.volume = 0.6;
sndQuiz.volume = 0.6;
// backgroundAudio.volume = 0.3;
function playSound(a) {
  try { a.currentTime = 0; a.play(); } catch (e) {}
}

// ===== 배경 =====
const BG_COUNT = 3;
const TITLE_BG = "url('assets/title.png') center/cover no-repeat, #ffffff";

// ===== 난이도 =====
const DIFFICULTY = {
  easy:   { baseSpeed: 30, spawnInterval: 2.6, quizInterval: 35, label: "쉬움" },
  normal: { baseSpeed: 40, spawnInterval: 2.0, quizInterval: 25, label: "보통" },
  hard:   { baseSpeed: 60, spawnInterval: 1.3, quizInterval: 18, label: "어려움" }
};

const QUIZ_TIME_LIMIT = 10;

const state = {
  running: false,
  paused: false,
  words: [],
  score: 0,
  lives: 3,
  level: 1,
  spawnTimer: 0,
  spawnInterval: 2.0,
  baseSpeed: 40,
  difficulty: "normal",
  lastTime: 0,
  // 퀴즈 관련
  quizElapsed: 0,
  quizInterval: 25,
  currentQuiz: null,
  quizTimeLeft: 0
};

function resetState(difficulty) {
  const cfg = DIFFICULTY[difficulty];
  state.running = true;
  state.paused = false;
  state.words = [];
  state.score = 0;
  state.lives = 3;
  state.level = 1;
  state.spawnTimer = 0;
  state.spawnInterval = cfg.spawnInterval;
  state.baseSpeed = cfg.baseSpeed;
  state.difficulty = difficulty;
  state.quizElapsed = 0;
  state.quizInterval = cfg.quizInterval;
  state.currentQuiz = null;
  state.quizTimeLeft = 0;
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

function shakeCanvas() {
  canvas.classList.remove("shaking");
  void canvas.offsetWidth;
  canvas.classList.add("shaking");
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
    playSound(sndSuccess);
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
  playSound(sndFail);
  shakeCanvas();
  updateHUD();
  if (state.lives <= 0) gameOver();
}

function gameOver() {
  state.running = false;
  state.paused = false;
  document.body.classList.remove("playing");
  hideQuiz();
  setTitleBg();
  overlay.style.animation = "none";
  overlay.style.background = "transparent";
  if (introRain) introRain.style.display = "none";
  overlayTitle.textContent = "GAME OVER";
  overlayMsg.textContent = `점수: ${state.score} · 레벨: ${state.level} · 난이도: ${DIFFICULTY[state.difficulty].label}`;
  playSound(sndGameOver);
  if (overlayMsgDv) overlayMsgDv.style.display = "none";
  if (overlayMsgTt) overlayMsgTt.style.display = "none";
  startBtn.textContent = "다시 시작";
  showTitleScreen();
  overlay.classList.remove("hidden");
}

// ===== 퀴즈 =====
function triggerQuiz() {
  state.paused = true;
  state.currentQuiz = getRandomQuiz();
  state.quizTimeLeft = QUIZ_TIME_LIMIT;
  playSound(sndQuiz);
  quizQuestion.textContent = state.currentQuiz.q;
  quizInput.value = "";
  quizMsg.textContent = "";
  quizMsg.className = "";
  quizTimerEl.textContent = QUIZ_TIME_LIMIT;
  quizTimerEl.classList.remove("urgent");
  quizModal.classList.remove("hidden");
  quizInput.focus();
}

function hideQuiz() {
  quizModal.classList.add("hidden");
  state.currentQuiz = null;
  state.paused = false;
  input.focus();
}

function resolveQuiz(isCorrect, isTimeout) {
  if (isCorrect) {
    quizMsg.textContent = "정답! +100";
    quizMsg.className = "correct";
    state.score += 100;
    playSound(sndQuizSuccess);
    updateHUD();
  } else {
    const answer = state.currentQuiz ? state.currentQuiz.a : "";
    quizMsg.textContent = isTimeout
      ? `시간 초과! 정답: ${answer}`
      : `오답! 정답: ${answer}`;
    quizMsg.className = "wrong";
    playSound(sndFail);
    shakeCanvas();
    state.lives--;
    updateHUD();
    if (state.lives <= 0) {
      setTimeout(() => { hideQuiz(); gameOver(); }, 1500);
      return;
    }
  }
  setTimeout(hideQuiz, 1200);
}

function checkQuizAnswer() {
  if (!state.currentQuiz) return;
  const typed = quizInput.value.trim();
  if (!typed) return;
  const q = state.currentQuiz;
  const correct = [q.a, q.a2, q.a3]
    .filter(Boolean)
    .some(ans => ans.trim() === typed);
  resolveQuiz(correct, false);
}

function updateQuizTimer(dt) {
  if (!state.currentQuiz) return;
  state.quizTimeLeft -= dt;
  const remaining = Math.max(0, Math.ceil(state.quizTimeLeft));
  quizTimerEl.textContent = remaining;
  if (remaining <= 3) quizTimerEl.classList.add("urgent");
  if (state.quizTimeLeft <= 0) {
    resolveQuiz(false, true);
  }
}

// ===== 게임 루프 =====
function update(dt) {
  if (state.paused) {
    updateQuizTimer(dt);
    return;
  }

  state.quizElapsed += dt;
  if (state.quizElapsed >= state.quizInterval) {
    state.quizElapsed = 0;
    triggerQuiz();
    return;
  }

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
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
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

input.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    if (e.isComposing) return;
    handleInput();
    input.value = "";
  }
});

quizInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    if (e.isComposing) return;
    checkQuizAnswer();
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
  if (state.running && !state.paused) input.focus();
});
