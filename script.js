let flashcards = [
    { english: "Old", polish: "stary" },
    { english: "Young", polish: "młody" },
    { english: "Bad", polish: "zły" },
    { english: "Good", polish: "dobry" },
    { english: "Interesting", polish: "interesujący" },
    { english: "Boring", polish: "nudny" },
    { english: "Fast", polish: "szybki" },
    { english: "Slow", polish: "wolny" },
    { english: "Large/Big", polish: "duży" },
    { english: "Small", polish: "mały" },
    { english: "Thin", polish: "chudy" },
    { english: "Fat", polish: "gruby" },
    { english: "Happy", polish: "szczęśliwy" },
    { english: "Sad", polish: "smutny" },
    { english: "Beautiful", polish: "piękny" },
    { english: "Ugly", polish: "brzydki" },
    { english: "Heavy", polish: "ciężki" },
    { english: "Light", polish: "lekki" },
    { english: "Tall", polish: "wysoki" },
    { english: "Short", polish: "niski" },
    { english: "Long", polish: "długi" },
    { english: "Expensive", polish: "drogi" },
    { english: "Cheap", polish: "tani" },
    { english: "Hot", polish: "gorący" },
    { english: "Cold", polish: "zimny" }
];

let currentCard = 0;
let score = 0;
let currentMode = 'learn';
let currentDirection = 'en_pl';
let correctAnswer = '';
let isFlipped = false;
let audioContext = null;
const testLength = 10; // Długość testu
let testProgress = 0; // Postęp testu

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSuccessSound() {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(800, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playErrorSound() {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(200, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
}

function playClickSound() {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

function showPointsAnimation(points, isCorrect) {
    const animation = document.createElement('div');
    animation.className = 'points-animation';
    animation.textContent = isCorrect ? `+${points} 🍌` : `${points} 🍌`;
    animation.style.color = isCorrect ? '#2ecc71' : '#e74c3c';
    
    const scoreContainer = document.querySelector('.score-container');
    scoreContainer.appendChild(animation);
    
    if (isCorrect) {
        playSuccessSound();
    } else {
        playErrorSound();
    }
    
    setTimeout(() => {
        animation.remove();
    }, 1000);
}

function updateGorillaPosition() {
    const gorilla = document.querySelector('.gorilla-climb');
    const progressBar = document.querySelector('.progress-bar');
    const progressContainer = document.querySelector('.progress-container');
    
    let progress;
    if (currentMode === 'learn') {
        progress = currentCard / flashcards.length;
    } else {
        progress = testProgress / testLength;
    }
    
    const containerWidth = progressContainer.offsetWidth;
    const gorillaWidth = gorilla.offsetWidth;
    const maxPosition = containerWidth - gorillaWidth;
    const position = progress * maxPosition;
    
    gorilla.style.left = `${position}px`;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateProgressBar() {
    let progress;
    if (currentMode === 'learn') {
        progress = (currentCard / flashcards.length) * 100;
    } else {
        progress = (testProgress / testLength) * 100;
    }
    document.getElementById('progressBar').style.width = `${progress}%`;
    updateGorillaPosition();
}

function updateScore(points) {
    score += points;
    document.getElementById('score').textContent = score;
    showPointsAnimation(points, points > 0);
}

function resetTest() {
    initAudio();
    currentCard = 0;
    score = 0;
    testProgress = 0;
    document.getElementById('score').textContent = score;
    shuffleArray(flashcards);
    updateProgressBar();
    showNextCard();
    playClickSound();
}

function flipCard() {
    initAudio();
    if (currentMode === 'learn') {
        const card = document.querySelector('.card');
        card.classList.toggle('flipped');
        isFlipped = !isFlipped;
        playClickSound();
    }
}

function showNextCard() {
    isFlipped = false;
    const card = document.querySelector('.card');
    card.classList.remove('flipped');
    
    if (currentCard >= flashcards.length) {
        currentCard = 0;
        shuffleArray(flashcards);
    }

    const currentWord = flashcards[currentCard];
    
    if (currentMode === 'learn') {
        if (currentDirection === 'en_pl') {
            document.getElementById('frontText').textContent = currentWord.english;
            document.getElementById('backText').textContent = currentWord.polish;
        } else {
            document.getElementById('frontText').textContent = currentWord.polish;
            document.getElementById('backText').textContent = currentWord.english;
        }
        document.querySelector('.buttons').style.display = 'block';
        document.querySelector('.test-buttons').style.display = 'none';
    } else {
        setupTestQuestion(currentWord);
    }

    updateProgressBar();
    speakWord(); // Automatyczne czytanie słowa
}

function setupTestQuestion(word) {
    if (currentDirection === 'en_pl') {
        document.getElementById('frontText').textContent = word.english;
        correctAnswer = word.polish;
    } else {
        document.getElementById('frontText').textContent = word.polish;
        correctAnswer = word.english;
    }
    
    document.querySelector('.buttons').style.display = 'none';
    document.querySelector('.test-buttons').style.display = 'grid';

    let options = [currentDirection === 'en_pl' ? word.polish : word.english];
    while (options.length < 4) {
        const randomWord = flashcards[Math.floor(Math.random() * flashcards.length)];
        const randomAnswer = currentDirection === 'en_pl' ? randomWord.polish : randomWord.english;
        if (!options.includes(randomAnswer)) {
            options.push(randomAnswer);
        }
    }
    options = shuffleArray(options);

    const buttons = document.querySelectorAll('.test-btn');
    buttons.forEach((btn, index) => {
        btn.textContent = options[index];
        btn.classList.remove('correct-answer', 'wrong-answer');
        btn.disabled = false;
    });
}

function showEndScreen(didWin) {
    const endScreen = document.createElement('div');
    endScreen.className = 'end-screen';
    
    const message = document.createElement('p');
    message.textContent = didWin ? 'Gratulacje! Wygrałeś! 🎉' : 'Niestety, spróbuj ponownie. 😞';
    
    const scoreInfo = document.createElement('p');
    scoreInfo.textContent = `Twój wynik: ${score} bananów 🍌`;
    
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Zagraj ponownie';
    resetButton.addEventListener('click', () => {
        endScreen.remove();
        resetTest();
    });
    
    endScreen.appendChild(message);
    endScreen.appendChild(scoreInfo);
    endScreen.appendChild(resetButton);
    
    document.body.appendChild(endScreen);
}

function checkTestAnswer(button) {
    initAudio();
    const selectedAnswer = button.textContent;
    const buttons = document.querySelectorAll('.test-btn');
    
    buttons.forEach(btn => {
        if (btn.textContent === correctAnswer) {
            btn.classList.add('correct-answer');
        }
        btn.disabled = true;
    });

    if (selectedAnswer === correctAnswer) {
        updateScore(10);
        button.classList.add('correct-answer');
        setTimeout(() => {
            currentCard++;
            testProgress++;
            if (testProgress === testLength) {
                showEndScreen(true);
            } else {
                showNextCard();
            }
        }, 1000);
    } else {
        button.classList.add('wrong-answer');
        updateScore(-5);
        setTimeout(() => {
            currentCard++;
            testProgress++;
            if (testProgress === testLength) {
                showEndScreen(false);
            } else {
                showNextCard();
            }
        }, 1500);
    }
}

function checkAnswer(type) {
    initAudio();
    if (type === 'correct') {
        updateScore(10);
        currentCard++;
        showNextCard();
    } else {
        updateScore(-5);
        const card = document.querySelector('.card');
        card.classList.add('flipped');
        isFlipped = true;
        
        setTimeout(() => {
            currentCard++;
            showNextCard();
        }, 2000);
    }
}

function setMode(mode) {
    initAudio();
    playClickSound();
    currentMode = mode;
    document.getElementById('learnBtn').classList.toggle('active', mode === 'learn');
    document.getElementById('testBtn').classList.toggle('active', mode === 'test');
    currentCard = 0;
    score = 0;
    testProgress = 0;
    document.getElementById('score').textContent = score;
    showNextCard();
}

function setDirection(direction) {
    initAudio();
    playClickSound();
    currentDirection = direction;
    document.getElementById('enPlBtn').classList.toggle('active', direction === 'en_pl');
    document.getElementById('plEnBtn').classList.toggle('active', direction === 'pl_en');
    currentCard = 0;
    showNextCard();
}

function speakWord() {
    initAudio();
    const textToSpeak = isFlipped ? 
        document.getElementById('backText').textContent : 
        document.getElementById('frontText').textContent;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = (currentDirection === 'en_pl') === !isFlipped ? 'en-US' : 'pl-PL';
    window.speechSynthesis.speak(utterance);
    playClickSound();
}

// Inicjalizacja
shuffleArray(flashcards);
showNextCard();

// Dodanie obsługi kliknięcia na dokument do inicjalizacji audio
document.addEventListener('click', initAudio, { once: true });
