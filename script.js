// --- (variables d'état du message précédent ) ---
let currentLevel = 1;
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 30;
let timerInterval;

const homeScreen = document.getElementById('home-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const settingsModal = document.getElementById('settings-modal');

// --- GESTION DE LA MODALE PARAMÈTRES ---
document.getElementById('settings-btn').onclick = () => {
    displayScores();
    settingsModal.style.display = "block";
}

document.querySelector('.close-modal').onclick = () => {
    settingsModal.style.display = "none";
}

// Fermer si on clique en dehors de la boîte
window.onclick = (event) => {
    if (event.target == settingsModal) settingsModal.style.display = "none";
}

function displayScores() {
    const container = document.getElementById('scores-container');
    container.innerHTML = '';
    
    for (let i = 1; i <= 10; i++) {
        const best = localStorage.getItem(`level_${i}_best`) || 0;
        const div = document.createElement('div');
        div.classList.add('score-line');
        div.innerHTML = `<span>Niveau ${i}</span> <span class="highlight">${best}/10</span>`;
        container.appendChild(div);
    }
}

document.getElementById('reset-scores').onclick = () => {
    if(confirm("Voulez-vous vraiment effacer tous vos records ?")) {
        localStorage.clear();
        displayScores();
    }
}

// --- LOGIQUE DE JEU (Reprend les fonctions précédentes) ---

document.getElementById('start-btn').onclick = () => startLevel(1);

function startLevel(level) {
    currentLevel = level;
    currentQuestionIndex = 0;
    score = 0;
    showScreen(gameScreen);
    loadQuestion();
}

function loadQuestion() {
    clearInterval(timerInterval);
    timeLeft = 30;
    updateTimerUI();

    const qData = questionsDB[currentLevel][currentQuestionIndex];
    document.getElementById('question-text').innerText = qData.q;
    document.getElementById('current-level').innerText = currentLevel;
    document.getElementById('current-score').innerText = score;
    
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    
    qData.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(index);
        container.appendChild(btn);
    });

    updateProgressBar();
    startCountdown();
}

function startCountdown() {
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeOut();
        }
    }, 1000);
}

function updateTimerUI() {
    document.getElementById('time-left').innerText = timeLeft;
    const parent = document.getElementById('time-left').parentElement;
    timeLeft <= 5 ? parent.classList.add('timer-low') : parent.classList.remove('timer-low');
}

function handleTimeOut() {
    const correct = questionsDB[currentLevel][currentQuestionIndex].correct;
    document.querySelectorAll('.option-btn')[correct].classList.add('correct');
    setTimeout(() => nextQuestion(), 1500);
}

function checkAnswer(selected) {
    clearInterval(timerInterval);
    const correct = questionsDB[currentLevel][currentQuestionIndex].correct;
    const buttons = document.querySelectorAll('.option-btn');
    
    if(selected === correct) {
        buttons[selected].classList.add('correct');
        score++;
    } else {
        buttons[selected].classList.add('wrong');
        buttons[correct].classList.add('correct');
    }
    setTimeout(() => nextQuestion(), 1000);
}

function nextQuestion() {
    currentQuestionIndex++;
    if(currentQuestionIndex < 10) loadQuestion();
    else finishLevel();
}

function finishLevel() {
    showScreen(resultScreen);
    const passed = score >= 7;
    saveHighScore(currentLevel, score);

    document.getElementById('result-title').innerText = passed ? "Niveau Réussi !" : "Échec...";
    document.getElementById('result-msg').innerText = `Score : ${score}/10.`;
    
    document.getElementById('next-lvl-btn').style.display = passed && currentLevel < 10 ? 'inline-block' : 'none';
    document.getElementById('next-lvl-btn').onclick = () => startLevel(currentLevel + 1);
    document.getElementById('retry-btn').onclick = () => startLevel(currentLevel);
}

function saveHighScore(level, s) {
    const saved = localStorage.getItem(`level_${level}_best`) || 0;
    if (s > saved) localStorage.setItem(`level_${level}_best`, s);
}

function updateProgressBar() {
    document.getElementById('progress-bar').style.width = `${(currentQuestionIndex / 10) * 100}%`;
}

function showScreen(screen) {
    [homeScreen, gameScreen, resultScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}