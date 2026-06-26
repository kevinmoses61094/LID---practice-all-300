// ===========================
// LiD Practice 300 — App Logic
// v2: Sample Tests, State Selector, Dashboard
// ===========================

// ---------- Global State ----------
let allQuestions = [];
let sessionQueue = [];
let currentIndex = 0;
let score = 0;
let wrongAnswers = [];
let answered = false;
let selectedMode = 'practice';
let selectedState = '';
let currentTestNumber = 1;
let isSampleTest = false;
let timerInterval = null;
let timeLeft = 3600; // 60 min in seconds

const STORAGE_KEY = 'lid_progress_v2';
const PASS_MARK = 17; // out of 33
const TEST_SIZE = 33;
const TOTAL_SAMPLE_TESTS = 60;

// ---------- State-specific questions (3 per Bundesland) ----------
// Each state has 3 questions with id 1000+
const STATE_QUESTIONS = {
  BW: [
    { id: 1001, question: "Welches ist das Wappen von Baden-Württemberg?", choices: ["Ein schwarzer Adler", "Drei schwarze Löwen auf goldenem Grund", "Ein weißes Kreuz auf rotem Grund", "Ein goldener Löwe auf schwarzem Grund"], correctAnswer: 1 },
    { id: 1002, question: "Was ist die Landeshauptstadt von Baden-Württemberg?", choices: ["Karlsruhe", "Freiburg", "Stuttgart", "Mannheim"], correctAnswer: 2 },
    { id: 1003, question: "Welcher Fluss fließt durch Stuttgart?", choices: ["Der Rhein", "Die Donau", "Der Neckar", "Der Main"], correctAnswer: 2 }
  ],
  BY: [
    { id: 1004, question: "Was ist die Landeshauptstadt von Bayern?", choices: ["Nürnberg", "Augsburg", "München", "Regensburg"], correctAnswer: 2 },
    { id: 1005, question: "Welches Fest ist weltbekannt und findet jedes Jahr in München statt?", choices: ["Karneval", "Oktoberfest", "Schützenfest", "Frühlingsfest"], correctAnswer: 1 },
    { id: 1006, question: "Wie heißt das Parlament in Bayern?", choices: ["Landtag", "Senat", "Abgeordnetenhaus", "Bürgerschaft"], correctAnswer: 0 }
  ],
  BE: [
    { id: 1007, question: "Was ist das bekannteste Wahrzeichen Berlins?", choices: ["Der Fernsehturm", "Das Brandenburger Tor", "Der Reichstag", "Die Berliner Mauer"], correctAnswer: 1 },
    { id: 1008, question: "Wie heißt das Parlament in Berlin?", choices: ["Landtag", "Senat", "Abgeordnetenhaus", "Bürgerschaft"], correctAnswer: 2 },
    { id: 1009, question: "In welchem Jahr wurde Berlin wieder Hauptstadt des vereinten Deutschlands?", choices: ["1989", "1990", "1991", "1999"], correctAnswer: 3 }
  ],
  BB: [
    { id: 1010, question: "Was ist die Landeshauptstadt von Brandenburg?", choices: ["Cottbus", "Brandenburg an der Havel", "Potsdam", "Frankfurt (Oder)"], correctAnswer: 2 },
    { id: 1011, question: "Welcher See liegt in der Nähe von Potsdam?", choices: ["Bodensee", "Müggelsee", "Wannsee", "Scharmützelsee"], correctAnswer: 2 },
    { id: 1012, question: "Wie heißt das Parlament in Brandenburg?", choices: ["Senat", "Bürgerschaft", "Landtag", "Abgeordnetenhaus"], correctAnswer: 2 }
  ],
  HB: [
    { id: 1013, question: "Was ist das kleinste Bundesland Deutschlands?", choices: ["Hamburg", "Saarland", "Bremen", "Berlin"], correctAnswer: 2 },
    { id: 1014, question: "Wofür ist Bremen bekannt?", choices: ["Automobilindustrie", "Hafen und Seehandel", "Pharmaindustrie", "Tourismus"], correctAnswer: 1 },
    { id: 1015, question: "Wie heißt das Märchen aus Bremen mit vier Tieren?", choices: ["Hänsel und Gretel", "Die Bremer Stadtmusikanten", "Dornröschen", "Rumpelstilzchen"], correctAnswer: 1 }
  ],
  HH: [
    { id: 1016, question: "Was ist die Landeshauptstadt von Hamburg?", choices: ["Hamburg ist ein Stadtstaat ohne Landeshauptstadt", "Altona", "Hamburg", "Wandsbek"], correctAnswer: 2 },
    { id: 1017, question: "Welcher Fluss mündet in Hamburg in die Nordsee?", choices: ["Rhein", "Elbe", "Weser", "Oder"], correctAnswer: 1 },
    { id: 1018, question: "Wie heißt das Parlament in Hamburg?", choices: ["Landtag", "Abgeordnetenhaus", "Bürgerschaft", "Senat"], correctAnswer: 2 }
  ],
  HE: [
    { id: 1019, question: "Was ist die Landeshauptstadt von Hessen?", choices: ["Frankfurt am Main", "Kassel", "Darmstadt", "Wiesbaden"], correctAnswer: 3 },
    { id: 1020, question: "Welche Stadt in Hessen ist das Finanzzentrum Deutschlands?", choices: ["Wiesbaden", "Frankfurt am Main", "Kassel", "Marburg"], correctAnswer: 1 },
    { id: 1021, question: "Wie heißt das Parlament in Hessen?", choices: ["Senat", "Bürgerschaft", "Abgeordnetenhaus", "Landtag"], correctAnswer: 3 }
  ],
  MV: [
    { id: 1022, question: "Was ist die Landeshauptstadt von Mecklenburg-Vorpommern?", choices: ["Rostock", "Schwerin", "Greifswald", "Stralsund"], correctAnswer: 1 },
    { id: 1023, question: "An welchem Meer liegt Mecklenburg-Vorpommern?", choices: ["Nordsee", "Ostsee", "Atlantik", "Mittelmeer"], correctAnswer: 1 },
    { id: 1024, question: "Wie heißt das Parlament in Mecklenburg-Vorpommern?", choices: ["Senat", "Bürgerschaft", "Landtag", "Abgeordnetenhaus"], correctAnswer: 2 }
  ],
  NI: [
    { id: 1025, question: "Was ist die Landeshauptstadt von Niedersachsen?", choices: ["Braunschweig", "Osnabrück", "Hannover", "Göttingen"], correctAnswer: 2 },
    { id: 1026, question: "Welche Automarke kommt aus Wolfsburg in Niedersachsen?", choices: ["BMW", "Mercedes", "Volkswagen", "Audi"], correctAnswer: 2 },
    { id: 1027, question: "Wie heißt das Parlament in Niedersachsen?", choices: ["Senat", "Landtag", "Bürgerschaft", "Abgeordnetenhaus"], correctAnswer: 1 }
  ],
  NW: [
    { id: 1028, question: "Was ist die Landeshauptstadt von Nordrhein-Westfalen?", choices: ["Köln", "Dortmund", "Essen", "Düsseldorf"], correctAnswer: 3 },
    { id: 1029, question: "Welcher Dom ist das bekannteste Wahrzeichen von Köln?", choices: ["Berliner Dom", "Kölner Dom", "Frankfurter Dom", "Ulmer Münster"], correctAnswer: 1 },
    { id: 1030, question: "Wie heißt das Parlament in Nordrhein-Westfalen?", choices: ["Senat", "Bürgerschaft", "Abgeordnetenhaus", "Landtag"], correctAnswer: 3 }
  ],
  RP: [
    { id: 1031, question: "Was ist die Landeshauptstadt von Rheinland-Pfalz?", choices: ["Koblenz", "Trier", "Ludwigshafen", "Mainz"], correctAnswer: 3 },
    { id: 1032, question: "Wofür ist das Rheintal in Rheinland-Pfalz bekannt?", choices: ["Industrie", "Weinanbau", "Bergbau", "Fischerei"], correctAnswer: 1 },
    { id: 1033, question: "Wie heißt das Parlament in Rheinland-Pfalz?", choices: ["Senat", "Bürgerschaft", "Landtag", "Abgeordnetenhaus"], correctAnswer: 2 }
  ],
  SL: [
    { id: 1034, question: "Was ist die Landeshauptstadt des Saarlandes?", choices: ["Homburg", "Neunkirchen", "Saarbrücken", "Merzig"], correctAnswer: 2 },
    { id: 1035, question: "An welches Land grenzt das Saarland im Westen?", choices: ["Belgien", "Luxemburg und Frankreich", "Niederlande", "Schweiz"], correctAnswer: 1 },
    { id: 1036, question: "Wie heißt das Parlament im Saarland?", choices: ["Senat", "Bürgerschaft", "Abgeordnetenhaus", "Landtag"], correctAnswer: 3 }
  ],
  SN: [
    { id: 1037, question: "Was ist die Landeshauptstadt von Sachsen?", choices: ["Leipzig", "Chemnitz", "Zwickau", "Dresden"], correctAnswer: 3 },
    { id: 1038, question: "Welches berühmte Musikfestival findet in Leipzig statt?", choices: ["Bachfest", "Beethovenfest", "Mozartfest", "Händelfest"], correctAnswer: 0 },
    { id: 1039, question: "Wie heißt das Parlament in Sachsen?", choices: ["Senat", "Bürgerschaft", "Landtag", "Abgeordnetenhaus"], correctAnswer: 2 }
  ],
  ST: [
    { id: 1040, question: "Was ist die Landeshauptstadt von Sachsen-Anhalt?", choices: ["Halle", "Dessau", "Magdeburg", "Merseburg"], correctAnswer: 2 },
    { id: 1041, question: "Welches UNESCO-Welterbe liegt in Dessau-Roßlau?", choices: ["Wartburg", "Bauhaus", "Meißner Dom", "Sanssouci"], correctAnswer: 1 },
    { id: 1042, question: "Wie heißt das Parlament in Sachsen-Anhalt?", choices: ["Senat", "Bürgerschaft", "Abgeordnetenhaus", "Landtag"], correctAnswer: 3 }
  ],
  SH: [
    { id: 1043, question: "Was ist die Landeshauptstadt von Schleswig-Holstein?", choices: ["Lübeck", "Flensburg", "Kiel", "Neumünster"], correctAnswer: 2 },
    { id: 1044, question: "An welche zwei Meere grenzt Schleswig-Holstein?", choices: ["Atlantik und Nordsee", "Nordsee und Ostsee", "Ostsee und Atlantik", "Nordsee und Mittelmeer"], correctAnswer: 1 },
    { id: 1045, question: "Wie heißt das Parlament in Schleswig-Holstein?", choices: ["Senat", "Bürgerschaft", "Landtag", "Abgeordnetenhaus"], correctAnswer: 2 }
  ],
  TH: [
    { id: 1046, question: "Was ist die Landeshauptstadt von Thüringen?", choices: ["Jena", "Gera", "Erfurt", "Weimar"], correctAnswer: 2 },
    { id: 1047, question: "Welche Burg in Thüringen ist UNESCO-Welterbe und mit Luther verbunden?", choices: ["Wartburg", "Burg Eltz", "Neuschwanstein", "Hohenzollern"], correctAnswer: 0 },
    { id: 1048, question: "Wie heißt das Parlament in Thüringen?", choices: ["Senat", "Bürgerschaft", "Abgeordnetenhaus", "Landtag"], correctAnswer: 3 }
  ]
};

// ---------- Seeded random (reproducible tests) ----------
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function shuffleWithSeed(arr, seed) {
  const rng = seededRandom(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build a sample test: 30 general + 3 state questions
function buildSampleTest(testNumber, stateCode) {
  const seed = testNumber * 7919;
  const shuffled = shuffleWithSeed(allQuestions, seed);
  const general = shuffled.slice(0, 30);
  const stateQs = stateCode && STATE_QUESTIONS[stateCode]
    ? STATE_QUESTIONS[stateCode]
    : shuffleWithSeed(allQuestions, seed + 1).slice(30, 33);
  return shuffleWithSeed([...general, ...stateQs], seed + 2);
}

// ---------- Boot ----------
async function loadQuestions() {
  try {
    const res = await fetch('questions.json');
    allQuestions = await res.json();
    initApp();
  } catch (e) {
    document.body.innerHTML = '<div style="padding:32px;text-align:center;color:red">Fehler: questions.json konnte nicht geladen werden.</div>';
  }
}

function initApp() {
  const progress = loadProgress();
  // Restore saved state
  if (progress.state) {
    selectedState = progress.state;
    document.getElementById('state-select').value = selectedState;
  }
  selectedMode = 'practice';
  document.querySelector('[data-mode="practice"]').classList.add('selected');
  renderDashboard();
  showScreen('home-screen');
}

// ---------- Screens ----------
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

// ---------- State selector ----------
function onStateChange() {
  selectedState = document.getElementById('state-select').value;
  const progress = loadProgress();
  progress.state = selectedState;
  saveProgressObj(progress);
  renderDashboard();
}

// ---------- Mode selection ----------
function selectMode(mode) {
  selectedMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
  document.querySelector(`[data-mode="${mode}"]`).classList.add('selected');

  const picker = document.getElementById('test-picker');
  const startBtn = document.getElementById('start-btn');

  if (mode === 'sample') {
    picker.style.display = 'block';
    populateTestPicker();
    startBtn.disabled = false;
    startBtn.textContent = 'Test starten →';
  } else {
    picker.style.display = 'none';
    if (mode === 'review') {
      const p = loadProgress();
      const hasWrong = p.wrongIds && p.wrongIds.length > 0;
      startBtn.disabled = !hasWrong;
      startBtn.textContent = hasWrong ? 'Start →' : 'Keine Fehler zum Üben';
    } else {
      startBtn.disabled = false;
      startBtn.textContent = 'Start →';
    }
  }
}

function populateTestPicker() {
  const sel = document.getElementById('test-number-select');
  const progress = loadProgress();
  const testScores = progress.testScores || {};
  sel.innerHTML = '';
  for (let i = 1; i <= TOTAL_SAMPLE_TESTS; i++) {
    const opt = document.createElement('option');
    const done = testScores[i];
    opt.value = i;
    if (done !== undefined) {
      const passed = done >= PASS_MARK;
      opt.textContent = `Test ${i} — ${done}/33 ${passed ? '✓' : '✗'}`;
    } else {
      opt.textContent = `Test ${i}`;
    }
    sel.appendChild(opt);
  }
}

// ---------- Start quiz ----------
function startQuiz() {
  const progress = loadProgress();

  if (selectedMode === 'sample') {
    if (!selectedState) {
      alert('Bitte zuerst dein Bundesland auswählen!');
      return;
    }
    currentTestNumber = parseInt(document.getElementById('test-number-select').value);
    sessionQueue = buildSampleTest(currentTestNumber, selectedState);
    isSampleTest = true;
    startTimer();
    document.getElementById('timer-bar').style.display = 'flex';
  } else if (selectedMode === 'practice') {
    sessionQueue = [...allQuestions];
    isSampleTest = false;
    document.getElementById('timer-bar').style.display = 'none';
  } else if (selectedMode === 'random') {
    sessionQueue = [...allQuestions].sort(() => Math.random() - 0.5);
    isSampleTest = false;
    document.getElementById('timer-bar').style.display = 'none';
  } else if (selectedMode === 'review') {
    const wrongIds = progress.wrongIds || [];
    sessionQueue = allQuestions.filter(q => wrongIds.includes(q.id));
    // also add state questions if wrong
    if (selectedState && STATE_QUESTIONS[selectedState]) {
      STATE_QUESTIONS[selectedState].forEach(q => {
        if (wrongIds.includes(q.id)) sessionQueue.push(q);
      });
    }
    if (sessionQueue.length === 0) { alert('Keine falschen Antworten zum Üben!'); return; }
    isSampleTest = false;
    document.getElementById('timer-bar').style.display = 'none';
  }

  currentIndex = 0;
  score = 0;
  wrongAnswers = [];
  answered = false;

  const labels = { sample: `Test ${currentTestNumber}`, practice: 'Alle Fragen', random: 'Zufallsmodus', review: 'Falsche Antworten' };
  document.getElementById('quiz-mode-label').textContent = labels[selectedMode] || '';

  showScreen('quiz-screen');
  renderQuestion();
}

// ---------- Timer ----------
function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 3600;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showResults();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');
  const el = document.getElementById('timer-display');
  el.textContent = `⏱ ${m}:${s}`;
  el.className = 'timer-display' + (timeLeft < 300 ? ' urgent' : '');
}

function stopTimer() {
  clearInterval(timerInterval);
}

// ---------- Render question ----------
function renderQuestion() {
  const q = sessionQueue[currentIndex];
  answered = false;

  const pct = (currentIndex / sessionQueue.length) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-text').textContent = `${currentIndex + 1} / ${sessionQueue.length}`;
  document.getElementById('score-display').textContent = `✓ ${score}`;
  document.getElementById('question-number').textContent = `Frage ${currentIndex + 1}`;
  document.getElementById('question-text').textContent = q.question;

  const list = document.getElementById('choices-list');
  list.innerHTML = '';
  q.choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = choice;
    btn.onclick = () => handleAnswer(i);
    list.appendChild(btn);
  });

  const fb = document.getElementById('feedback-msg');
  fb.className = 'feedback-msg';
  fb.textContent = '';
  document.getElementById('next-btn').disabled = true;
}

function handleAnswer(choiceIndex) {
  if (answered) return;
  answered = true;

  const q = sessionQueue[currentIndex];
  const isCorrect = choiceIndex === q.correctAnswer;
  const buttons = document.querySelectorAll('.choice-btn');
  buttons.forEach(b => b.disabled = true);
  buttons[q.correctAnswer].classList.add('correct');

  if (!isCorrect) {
    buttons[choiceIndex].classList.add('wrong');
    wrongAnswers.push(q.id);
  } else {
    score++;
    document.getElementById('score-display').textContent = `✓ ${score}`;
  }

  const fb = document.getElementById('feedback-msg');
  fb.className = 'feedback-msg show ' + (isCorrect ? 'correct' : 'wrong');
  fb.textContent = isCorrect
    ? '✓ Richtig! Sehr gut.'
    : `✗ Falsch. Richtige Antwort: "${q.choices[q.correctAnswer]}"`;

  document.getElementById('next-btn').disabled = false;
  autoSaveProgress();
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex >= sessionQueue.length) {
    stopTimer();
    showResults();
  } else {
    renderQuestion();
  }
}

// ---------- Results ----------
function showResults() {
  stopTimer();
  const total = sessionQueue.length;
  const pct = Math.round((score / total) * 100);
  const passed = isSampleTest && score >= PASS_MARK;

  document.getElementById('result-score-pct').textContent = pct + '%';
  document.getElementById('result-score-detail').textContent = `${score} richtig von ${total} Fragen`;

  let emoji = '😊', headline = 'Weiter so!';
  if (isSampleTest) {
    if (passed) { emoji = '🎉'; headline = 'Bestanden!'; }
    else { emoji = '📖'; headline = 'Nicht bestanden — nochmal üben!'; }
  } else {
    if (pct === 100) { emoji = '🏆'; headline = 'Perfekt!'; }
    else if (pct >= 80) { emoji = '🎉'; headline = 'Sehr gut!'; }
    else if (pct >= 60) { emoji = '📖'; headline = 'Weiter üben!'; }
    else { emoji = '💪'; headline = 'Nicht aufgeben!'; }
  }

  document.getElementById('result-emoji').textContent = emoji;
  document.getElementById('result-headline').textContent = headline;
  document.getElementById('result-correct').textContent = score;
  document.getElementById('result-wrong').textContent = total - score;

  // Pass/fail badge for sample tests
  const badge = document.getElementById('pass-fail-badge');
  if (isSampleTest) {
    badge.style.display = 'block';
    badge.textContent = passed ? `✓ BESTANDEN (${score}/33)` : `✗ NICHT BESTANDEN (${score}/33 — mind. 17 nötig)`;
    badge.className = 'pass-fail-badge ' + (passed ? 'passed' : 'failed');
    document.getElementById('result-score-label').textContent = `Test ${currentTestNumber} Ergebnis`;
  } else {
    badge.style.display = 'none';
    document.getElementById('result-score-label').textContent = 'Ergebnis';
  }

  const reviewBtn = document.getElementById('review-btn');
  reviewBtn.style.display = wrongAnswers.length > 0 ? 'block' : 'none';

  // Save results
  saveTestResult();
  showScreen('results-screen');
}

// ---------- Storage ----------
function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

function saveProgressObj(obj) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

function autoSaveProgress() {
  const p = loadProgress();
  const existingWrong = new Set(p.wrongIds || []);
  wrongAnswers.forEach(id => existingWrong.add(id));
  p.wrongIds = [...existingWrong];
  saveProgressObj(p);
}

function saveTestResult() {
  const p = loadProgress();

  // Save wrong answers
  const existingWrong = new Set(p.wrongIds || []);
  wrongAnswers.forEach(id => existingWrong.add(id));
  // Remove correct ones from wrong list
  sessionQueue.forEach((q, i) => {
    if (!wrongAnswers.includes(q.id)) existingWrong.delete(q.id);
  });
  p.wrongIds = [...existingWrong];

  if (isSampleTest) {
    // Save this test's score
    p.testScores = p.testScores || {};
    p.testScores[currentTestNumber] = score;

    // Save history entry
    p.testHistory = p.testHistory || [];
    p.testHistory.unshift({
      testNum: currentTestNumber,
      score,
      total: sessionQueue.length,
      passed: score >= PASS_MARK,
      date: new Date().toLocaleDateString('de-DE')
    });
    if (p.testHistory.length > 20) p.testHistory = p.testHistory.slice(0, 20);
  }

  saveProgressObj(p);
}

// ---------- Dashboard ----------
function renderDashboard() {
  const p = loadProgress();
  const testScores = p.testScores || {};
  const scores = Object.values(testScores);
  const testsCompleted = scores.length;
  const passed = scores.filter(s => s >= PASS_MARK).length;
  const failed = testsCompleted - passed;
  const avg = testsCompleted > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const avgPct = avg !== null ? Math.round((avg / TEST_SIZE) * 100) : 0;
  const wrongCount = (p.wrongIds || []).length;

  document.getElementById('dash-tests').textContent = testsCompleted;
  document.getElementById('dash-passed').textContent = passed;
  document.getElementById('dash-failed').textContent = failed;
  document.getElementById('dash-wrong').textContent = wrongCount;

  if (avg !== null) {
    document.getElementById('dash-avg').textContent = `${avg}/33 (${avgPct}%)`;
    document.getElementById('dash-bar').style.width = avgPct + '%';
    document.getElementById('dash-bar').style.background = avgPct >= 52 ? '#1A7A4A' : '#C0392B';
  } else {
    document.getElementById('dash-avg').textContent = '—';
    document.getElementById('dash-bar').style.width = '0%';
  }

  // Test history
  const history = p.testHistory || [];
  const wrap = document.getElementById('test-history-wrap');
  const histEl = document.getElementById('test-history');
  if (history.length > 0) {
    wrap.style.display = 'block';
    histEl.innerHTML = history.slice(0, 5).map(h => `
      <div class="history-row">
        <span class="history-test">Test ${h.testNum}</span>
        <span class="history-score ${h.passed ? 'green' : 'red'}">${h.score}/33</span>
        <span class="history-badge ${h.passed ? 'pass' : 'fail'}">${h.passed ? 'Bestanden' : 'Nicht best.'}</span>
        <span class="history-date">${h.date}</span>
      </div>
    `).join('');
  } else {
    wrap.style.display = 'none';
  }
}

// ---------- Navigation ----------
function restartSameMode() { startQuiz(); }
function reviewWrong() { selectedMode = 'review'; selectMode('review'); goHome(); }
function goHome() {
  stopTimer();
  renderDashboard();
  if (selectedMode === 'sample') populateTestPicker();
  showScreen('home-screen');
}

function clearProgress() {
  if (confirm('Gesamten Fortschritt löschen?')) {
    localStorage.removeItem(STORAGE_KEY);
    selectedState = '';
    document.getElementById('state-select').value = '';
    renderDashboard();
  }
}

// ---------- Boot ----------
loadQuestions();
