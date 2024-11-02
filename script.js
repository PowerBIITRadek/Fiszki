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
let currentDirection = 'en_pl'; // 'en_pl' lub 'pl_en'
let correctAnswer = '';
let isFlipped = false;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateProgressBar() {
    const progress = (currentCard / flashcards.length) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

function updateScore(points) {
    score += points;
    document.getElementById('score').textContent = score;
}

function resetTest() {
    currentCard = 0;
    score = 0;
    document.getElementById('score').textContent = score;
    shuffleArray(flashcards);
    updateProgressBar();
    showNextCard();
}

function flipCard() {
    if (currentMode === 'learn') {
        const card = document.querySelector('.card');
        card.classList.toggle('flipped');
        isFlipped = !isFlipped;
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

    // Przygotuj opcje odpowiedzi
    let options = [currentDirection === 'en_pl' ? word.polish : word.english];
    while (options.length < 4) {
        const randomWord = flashcards[Math.floor(Math.random() * flashcards.length)];
        const randomAnswer = currentDirection === 'en_pl' ? randomWord.polish : randomWord.english;
        if (!options.includes(randomAnswer)) {
            options.push(randomAnswer);
        }
    }
    options = shuffleArray(options);

    // Ustaw przyciski
    const buttons = document.querySelectorAll('.test-btn');
    buttons.forEach((btn, index) => {
        btn.textContent = options[index];
        btn.classList.remove('correct-answer', 'wrong-answer');
        btn.disabled = false;
    });
}

function checkTestAnswer(button) {
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
            showNextCard();
        }, 1000);
    } else {
        button.classList.add('wrong-answer');
        updateScore(-5);
        setTimeout(() => {
            currentCard++;
            showNextCard();
        }, 1500);
    }
}

function checkAnswer(type) {
    if (type === 'correct') {
        updateScore(10);
        currentCard++;
        showNextCard();
    } else {
        updateScore(-5);
        // Pokaż tłumaczenie przed przejściem do następnej karty
        const card = document.querySelector('.card');
        card.classList.add('flipped');
        isFlipped = true;
        
        // Poczekaj 2 sekundy przed pokazaniem następnej karty
        setTimeout(() => {
            currentCard++;
            showNextCard();
        }, 2000);
    }
}

function setMode(mode) {
    currentMode = mode;
    document.getElementById('learnBtn').classList.toggle('active', mode === 'learn');
    document.getElementById('testBtn').classList.toggle('active', mode === 'test');
    currentCard = 0;
    score = 0;
    document.getElementById('score').textContent = score;
    showNextCard();
}

function setDirection(direction) {
    currentDirection = direction;
    document.getElementById('enPlBtn').classList.toggle('active', direction === 'en_pl');
    document.getElementById('plEnBtn').classList.toggle('active', direction === 'pl_en');
    currentCard = 0;
    showNextCard();
}

function speakWord(event) {
    event.stopPropagation();
    const textToSpeak = isFlipped ? 
        document.getElementById('backText').textContent : 
        document.getElementById('frontText').textContent;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = (currentDirection === 'en_pl') === !isFlipped ? 'en-US' : 'pl-PL';
    window.speechSynthesis.speak(utterance);
}

// Inicjalizacja
shuffleArray(flashcards);
showNextCard();
