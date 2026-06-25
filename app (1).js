// ===========================
// LiD Practice 300 — App Logic
// ===========================

// ---------- State ----------
let allQuestions = [];       // loaded from questions.json
let sessionQueue = [];       // questions for this session
let currentIndex = 0;
let score = 0;
let wrongAnswers = [];       // ids of questions answered wrong
let answered = false;        // has user answered current question?
let selectedMode = 'practice';

// localStorage keys
const STORAGE_KEY = 'lid_progress';

// ---------- Load & Boot ----------

// Load questions from JSON, then initialise the app
async function loadQuestions() {
  try {
    const res = await fetch('questions.json');
    allQuestions = await res.json();
    initApp();
  } catch (e) {
    alert('Could not load questions.json. Make sure the file exists and you are running via a local server.');
  }
}

function initApp() {
  renderStats();
  showScreen('home-screen');
}

// ---------- Screens ----------

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ---------- Home Screen ----------

function selectMode(mode) {
  selectedMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
  document.querySelector(`[data-mode="${mode}"]`).classList.add('selected');

  // disable start if review mode but no wrong answers saved
  const progress = loadProgress();
  const hasWrong = progress.wrongIds && progress.wrongIds.length > 0;
  const startBtn = document.getElementById('start-btn');

  if (mode === 'review' && !hasWrong) {
    startBtn.disabled = true;
    startBtn.textContent = 'No wrong answers yet';
  } else {
    startBtn.disabled = false;
    startBtn.textContent = 'Start →';
  }
}

function startQuiz() {
  const progress = loadProgress();

  if (selectedMode === 'practice') {
    sessionQueue = [...allQuestions];
  } else if (selectedMode === 'random') {
    // shuffle a copy of all questions
    sessionQueue = [...allQuestions].sort(() => Math.random() - 0.5);
  } else if (selectedMode === 'review') {
    const wrongIds = progress.wrongIds || [];
    sessionQueue = allQuestions.filter(q => wrongIds.includes(q.id));
    if (sessionQueue.length === 0) { alert('No wrong answers to review!'); return; }
  }

  currentIndex = 0;
  score = 0;
  wrongAnswers = [];
  answered = false;

  showScreen('quiz-screen');
  document.querySelector('.mode-label').textContent = modeLabel(selectedMode);
  renderQuestion();
}

function modeLabel(mode) {
  return { practice: 'Practice', random: 'Random', review: 'Review Wrongs' }[mode] || '';
}

// ---------- Quiz ----------

function renderQuestion() {
  const q = sessionQueue[currentIndex];
  answered = false;

  // Progress bar
  const pct = (currentIndex / sessionQueue.length) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-text').textContent =
    `${currentIndex + 1} / ${sessionQueue.length}`;

  // Score
  document.getElementById('score-display').textContent = `✓ ${score}`;

  // Question
  document.getElementById('question-number').textContent = `Question ${currentIndex + 1}`;
  document.getElementById('question-text').textContent = q.question;

  // Choices
  const list = document.getElementById('choices-list');
  list.innerHTML = '';
  q.choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = choice;
    btn.onclick = () => handleAnswer(i);
    list.appendChild(btn);
  });

  // Reset feedback
  const fb = document.getElementById('feedback-msg');
  fb.className = 'feedback-msg';
  fb.textContent = '';

  // Next button — disabled until answered
  document.getElementById('next-btn').disabled = true;
}

function handleAnswer(choiceIndex) {
  if (answered) return;
  answered = true;

  const q = sessionQueue[currentIndex];
  const isCorrect = choiceIndex === q.correctAnswer;
  const buttons = document.querySelectorAll('.choice-btn');

  // Disable all choices
  buttons.forEach(b => { b.disabled = true; });

  // Highlight correct and (if wrong) selected
  buttons[q.correctAnswer].classList.add('correct');
  if (!isCorrect) {
    buttons[choiceIndex].classList.add('wrong');
    wrongAnswers.push(q.id);
  } else {
    score++;
    document.getElementById('score-display').textContent = `✓ ${score}`;
  }

  // Feedback message
  const fb = document.getElementById('feedback-msg');
  fb.className = 'feedback-msg show ' + (isCorrect ? 'correct' : 'wrong');
  fb.textContent = isCorrect
    ? '✓ Richtig! Well done.'
    : `✗ Falsch. The correct answer is: "${q.choices[q.correctAnswer]}"`;

  // Enable Next
  document.getElementById('next-btn').disabled = false;

  // Auto-save progress
  saveProgress();
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex >= sessionQueue.length) {
    showResults();
  } else {
    renderQuestion();
  }
}

// ---------- Results ----------

function showResults() {
  const total = sessionQueue.length;
  const pct = Math.round((score / total) * 100);

  document.getElementById('result-score-pct').textContent = pct + '%';
  document.getElementById('result-score-detail').textContent =
    `${score} correct out of ${total} questions`;

  document.getElementById('result-correct').textContent = score;
  document.getElementById('result-wrong').textContent = total - score;

  // Emoji + headline based on score
  let emoji = '😊', headline = 'Good effort!';
  if (pct === 100)      { emoji = '🏆'; headline = 'Perfect score!'; }
  else if (pct >= 80)   { emoji = '🎉'; headline = 'Well done!'; }
  else if (pct >= 60)   { emoji = '📖'; headline = 'Keep practising!'; }
  else                  { emoji = '💪'; headline = 'Keep going!'; }

  document.getElementById('result-emoji').textContent = emoji;
  document.getElementById('result-headline').textContent = headline;

  // Show/hide "review wrong" button
  const reviewBtn = document.getElementById('review-btn');
  reviewBtn.style.display = wrongAnswers.length > 0 ? 'block' : 'none';

  showScreen('results-screen');
}

function restartSameMode() {
  startQuiz();
}

function reviewWrong() {
  selectedMode = 'review';
  startQuiz();
}

function goHome() {
  renderStats();
  showScreen('home-screen');
}

// ---------- localStorage ----------

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch { return {}; }
}

function saveProgress() {
  const existing = loadProgress();

  // Merge wrong answers from this session with stored ones
  const existingWrong = new Set(existing.wrongIds || []);
  wrongAnswers.forEach(id => existingWrong.add(id));

  // Track total answered and best scores
  const totalAnswered = (existing.totalAnswered || 0) + 1;
  const totalCorrect  = (existing.totalCorrect  || 0) + (score > (existing.lastScore || 0) ? 1 : 0);

  const progress = {
    ...existing,
    wrongIds:      [...existingWrong],
    totalAnswered,
    lastScore:     score,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function renderStats() {
  const progress = loadProgress();
  const wrongCount = (progress.wrongIds || []).length;

  document.getElementById('stat-total').textContent   = allQuestions.length;
  document.getElementById('stat-answered').textContent = progress.totalAnswered || 0;
  document.getElementById('stat-wrong').textContent   = wrongCount;

  // Reset review button state
  document.getElementById('start-btn').disabled = false;
  document.getElementById('start-btn').textContent = 'Start →';
}

function clearProgress() {
  if (confirm('Clear all saved progress?')) {
    localStorage.removeItem(STORAGE_KEY);
    renderStats();
  }
}

// ---------- Boot ----------
loadQuestions();
