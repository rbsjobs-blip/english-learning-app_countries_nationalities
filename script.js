// Final Polished Code (Phase 10) - With Bug Fixes from Phase 11
document.addEventListener('DOMContentLoaded', () => {
    class LearningApp {
        constructor() {
            // --- Initialize Managers ---
            this.mediaManager = new MediaManager();
            this.adhdOptimizer = new ADHDOptimizer();

            // --- Application State ---
            this.state = {
                score: 0,
                streak: 0,
                bestStreak: 0,
                questionsAnswered: 0,
                modules: {
                    vocabulary: { completed: 0, total: 8 },
                    conversations: { completed: 0, total: 5 },
                    grammar: { completed: 0, total: 6 }
                },
                badges: [],
                currentTab: 'world-map'
            };

            // --- Data ---
            this.vocabularyData = [
                { country: 'Brazil', correct: 'Brazilian', image: 'images/flags/flag-brazil.png' },
                { country: 'USA', correct: 'American', image: 'images/flags/flag-usa.png' },
                { country: 'Japan', correct: 'Japanese', image: 'images/flags/flag-japan.png' },
                { country: 'Italy', correct: 'Italian', image: 'images/flags/flag-italy.png' },
                { country: 'Spain', correct: 'Spanish', image: 'images/flags/flag-spain.png' },
                { country: 'France', correct: 'French', image: 'images/flags/flag-france.png' },
                { country: 'Germany', correct: 'German', image: 'images/flags/flag-germany.png' },
                { country: 'Turkey', correct: 'Turkish', image: 'images/flags/flag-turkey.png' }
            ];
            this.conversationData = {
                scrambled: [
                    { character: 'Guide', avatar: 'images/characters/character-guide.png', sentence: "Hi, I'm a guide.", words: ["a", "Hi,", "I'm", "guide."] },
                    { character: 'David', avatar: 'images/characters/character-david.png', sentence: "Hi, Guide. Where are you from?", words: ["from?", "Where", "Hi,", "are", "Guide.", "you"] },
                    { character: 'Guide', avatar: 'images/characters/character-guide.png', sentence: "I'm from here.", words: ["from", "I'm", "here."] },
                    { character: 'David', avatar: 'images/characters/character-david.png', sentence: "Is this the capital?", words: ["the", "capital?", "Is", "this"] },
                    { character: 'Guide', avatar: 'images/characters/character-guide.png', sentence: "Yes, it is.", words: ["is.", "Yes,", "it"] }
                ]
            };
            // Corrected Grammar Data
            this.grammarCases = [
                { question: "_____ is this?", options: ["Who's", "Where", "Who"], correct: "Who" },
                { question: "_____ are you?", options: ["Who's", "Where", "Where's"], correct: "Where" },
                { question: "You're in France? _____ in France?", options: ["Where", "Where's", "Who's"], correct: "Where" },
                { question: "_____ with you?", options: ["Where", "Who", "Who's"], correct: "Who's" },
                { question: "Is Andy _____ New York?", options: ["at", "in", "from"], correct: "in" },
                { question: "_____ your school?", options: ["Who", "Where's", "at"], correct: "Where's" }
            ];
            this.badgeSystem = {
                available: [
                    { name: "First Step", description: "Answer your first question correctly.", icon: "images/badges/badge-first-step.png", condition: (s) => s.questionsAnswered > 0 && s.streak > 0 },
                    { name: "Quick Learner", description: "Answer 5 questions correctly.", icon: "images/badges/badge-quick-learner.png", condition: (s) => Object.values(s.modules).reduce((a, b) => a + b.completed, 0) >= 5 },
                    { name: "Perfect Streak", description: "Get a 10-answer streak.", icon: "images/badges/badge-perfect-streak.png", condition: (s) => s.streak >= 10 },
                    { name: "Vocabulary Whiz", description: "Complete the Vocabulary module.", icon: "images/badges/badge-vocabulary-whiz.png", condition: (s) => s.modules.vocabulary.completed >= s.modules.vocabulary.total },
                    { name: "Grammar Guru", description: "Master the Grammar module.", icon: "images/badges/badge-grammar-guru.png", condition: (s) => s.modules.grammar.completed >= s.modules.grammar.total }
                ]
            };

            // --- DOM Elements ---
            this.cacheDOMElements();
            
            // --- Initial Load ---
            this.loadState(); // Load progress before initializing
            this.init();
        }

        cacheDOMElements() {
            this.tabButtons = document.querySelectorAll('.tab-btn');
            this.tabPanes = document.querySelectorAll('.tab-pane');
            this.progressFill = document.querySelector('.progress-fill');
            this.gameContainer = document.querySelector('.game-container');
            this.focusModeToggle = document.getElementById('focus-mode-toggle');
        }

        init() {
            console.log("Initializing Learning Adventure...");
            if (!this.listenersInitialized) {
                this.setupEventListeners();
                this.listenersInitialized = true;
            }
            
            this.adhdOptimizer.startSession();
            this.updateProgressBar();
            this.renderProgressTab();
            this.loadAllModules();
        }

        setupEventListeners() {
            // Add a single listener to the container for the first user click to init audio
            this.gameContainer.addEventListener('click', () => this.mediaManager.initAudio(), { once: true });

            this.tabButtons.forEach(button => {
                button.addEventListener('click', () => this.handleTabClick(button));
            });
            this.focusModeToggle.addEventListener('click', () => this.toggleFocusMode());
        }

        toggleFocusMode() {
            this.gameContainer.classList.toggle('focus-mode-active');
            console.log("Focus Mode toggled.");
        }

        handleTabClick(button) {
            const newTabId = button.getAttribute('data-tab');
            this.state.currentTab = newTabId;

            this.tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });

            this.tabPanes.forEach(pane => {
                pane.classList.remove('active');
                pane.setAttribute('hidden', true);
            });

            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');
            
            const newPane = document.getElementById(newTabId);
            newPane.classList.add('active');
            newPane.removeAttribute('hidden');
            newPane.focus(); 

            if (newTabId === 'progress') {
                this.renderProgressTab();
            }
        }

        loadAllModules() {
            this.loadVocabularyExercise();
            this.loadConversationExercise();
            this.loadGrammarCase();
        }

        // --- State Management ---
        saveState() {
            try {
                localStorage.setItem('learningAppState', JSON.stringify(this.state));
                console.log("State saved.");
            } catch (e) {
                console.error("Could not save state to localStorage", e);
            }
        }

        loadState() {
            try {
                const savedState = localStorage.getItem('learningAppState');
                if (savedState) {
                    this.state = JSON.parse(savedState);
                    console.log("State loaded.");
                }
            } catch (e) {
                console.error("Could not load or parse state from localStorage. Starting fresh.", e);
            }
        }

        // --- Scoring and Gamification ---
        updateScore(isCorrect, moduleName) {
            if (!moduleName || !this.state.modules[moduleName]) {
                console.error("updateScore called without a valid moduleName:", moduleName);
                return; 
            }

            this.state.questionsAnswered++;
            if (isCorrect) {
                this.state.score += 10;
                this.state.streak++;
                if (this.state.streak > this.state.bestStreak) {
                    this.state.bestStreak = this.state.streak;
                }
                this.state.modules[moduleName].completed++;
                this.mediaManager.playSound('correct');
            } else {
                this.state.streak = 0;
                this.mediaManager.playSound('incorrect');
            }
            this.saveState();
            this.updateProgressBar();
            this.checkBadges();
        }

        updateProgressBar() {
            const total = Object.values(this.state.modules).reduce((s, m) => s + m.total, 0);
            const completed = Object.values(this.state.modules).reduce((s, m) => s + m.completed, 0);
            const progress = total > 0 ? (completed / total) * 100 : 0;
            this.progressFill.style.width = `${progress}%`;
            this.progressFill.textContent = `${Math.round(progress)}%`;
        }

        checkBadges() {
            this.badgeSystem.available.forEach(badge => {
                if (badge.condition(this.state) && !this.state.badges.includes(badge.name)) {
                    this.state.badges.push(badge.name);
                    this.showBadgeNotification(badge);
                    this.saveState();
                }
            });
        }
        
        showBadgeNotification(badge) {
            this.mediaManager.playSound('badge'); 
            alert(`Congratulations! You've earned a new badge: ${badge.name}`);
            console.log(`Badge earned: ${badge.name} - ${badge.description}`);
        }

        // --- Module-specific logic ---
        loadVocabularyExercise() {
            const pane = document.getElementById('vocabulary');
            const completed = this.state.modules.vocabulary.completed;
            const total = this.state.modules.vocabulary.total;

            if (completed >= total) {
                pane.innerHTML = '<h3>Congratulations! You have completed the Vocabulary module.</h3>';
                return;
            }

            const currentQuestion = this.vocabularyData[completed];
            const options = this._generateVocabOptions(currentQuestion.correct);

            pane.innerHTML = `
                <h3>Vocabulary Challenge</h3>
                <p>What is the nationality for someone from <strong>${currentQuestion.country}</strong>?</p>
                <img src="${currentQuestion.image}" alt="Flag of ${currentQuestion.country}" style="width: 100px; border: 1px solid #ccc; margin-bottom: 15px;">
                <div class="options-container">
                    ${options.map(opt => `<button class="option-btn" data-answer="${opt}">${opt}</button>`).join('')}
                </div>
            `;

            pane.querySelectorAll('.option-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.checkVocabAnswer(e.target, currentQuestion.correct));
            });
        }
        
        _generateVocabOptions(correctAnswer) {
            const allNationalities = this.vocabularyData.map(item => item.correct);
            let options = [correctAnswer];
            while (options.length < 4) {
                const randomOption = allNationalities[Math.floor(Math.random() * allNationalities.length)];
                if (!options.includes(randomOption)) {
                    options.push(randomOption);
                }
            }
            return options.sort(() => Math.random() - 0.5); // Shuffle options
        }

        checkVocabAnswer(button, correctAnswer) {
            const selectedAnswer = button.dataset.answer;
            const isCorrect = selectedAnswer === correctAnswer;

            document.getElementById('vocabulary').querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);

            if (isCorrect) {
                button.classList.add('correct');
            } else {
                button.classList.add('incorrect');
            }

            this.updateScore(isCorrect, 'vocabulary');

            setTimeout(() => {
                this.loadVocabularyExercise();
            }, 1200);
        }
        
        loadConversationExercise() {
            const pane = document.getElementById('conversations');
            const completed = this.state.modules.conversations.completed;
            const total = this.state.modules.conversations.total;

            if (completed >= total) {
                pane.innerHTML = '<h3>Congratulations! You have completed the Conversation module.</h3>';
                return;
            }

            const currentLine = this.conversationData.scrambled[completed];
            const shuffledWords = [...currentLine.words].sort(() => Math.random() - 0.5);

            pane.innerHTML = `
                <h3>Unscramble the Sentence</h3>
                <div class="conversation-line">
                    <img src="${currentLine.avatar}" alt="${currentLine.character}" class="avatar">
                    <p><strong>${currentLine.character}:</strong></p>
                </div>
                <div class="answer-area-convo"></div>
                <div class="word-bank">
                    ${shuffledWords.map(word => `<button class="word-btn">${word}</button>`).join('')}
                </div>
                <button id="check-convo-btn" disabled>Check</button>
            `;

            const wordBank = pane.querySelector('.word-bank');
            const answerArea = pane.querySelector('.answer-area-convo');
            const checkBtn = pane.querySelector('#check-convo-btn');

            const updateCheckButtonState = () => {
                checkBtn.disabled = answerArea.children.length === 0;
            };

            wordBank.addEventListener('click', (e) => {
                if (e.target.classList.contains('word-btn')) {
                    answerArea.appendChild(e.target);
                    updateCheckButtonState();
                }
            });

            answerArea.addEventListener('click', (e) => {
                if (e.target.classList.contains('word-btn')) {
                    wordBank.appendChild(e.target);
                    updateCheckButtonState();
                }
            });

            checkBtn.addEventListener('click', () => this.checkSentenceOrder(answerArea, currentLine.sentence));
        }

        checkSentenceOrder(answerArea, correctSentence) {
            const userAnswer = [...answerArea.children].map(btn => btn.textContent).join(' ');
            const isCorrect = userAnswer === correctSentence;

            document.querySelectorAll('.word-btn').forEach(btn => btn.disabled = true);
            
            if (isCorrect) {
                answerArea.classList.add('correct');
            } else {
                answerArea.classList.add('incorrect');
            }

            this.updateScore(isCorrect, 'conversations');

            setTimeout(() => {
                this.loadConversationExercise();
            }, 1500);
        }

        loadGrammarCase() {
            const pane = document.getElementById('grammar');
            const completed = this.state.modules.grammar.completed;
            const total = this.state.modules.grammar.total;

            if (completed >= total) {
                pane.innerHTML = '<h3>Congratulations! You have completed the Grammar module.</h3>';
                return;
            }

            const currentQuestion = this.grammarCases[completed];
            const options = [...currentQuestion.options].sort(() => Math.random() - 0.5);

            pane.innerHTML = `
                <h3>Grammar Challenge</h3>
                <p>${currentQuestion.question.replace(/_____/g, '<span class="blank"></span>')}</p>
                <div class="options-container">
                    ${options.map(opt => `<button class="option-btn" data-answer="${opt}">${opt}</button>`).join('')}
                </div>
            `;

            pane.querySelectorAll('.option-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.checkGrammarAnswer(e.target, currentQuestion.correct));
            });
        }

        checkGrammarAnswer(button, correctAnswer) {
            try {
                const selectedAnswer = button.dataset.answer;
                const isCorrect = selectedAnswer === correctAnswer;

                document.getElementById('grammar').querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);

                if (isCorrect) {
                    button.classList.add('correct');
                } else {
                    button.classList.add('incorrect');
                }

                this.updateScore(isCorrect, 'grammar');
            } catch (error) {
                console.error("An error occurred while checking grammar answer:", error);
            } finally {
                setTimeout(() => {
                    this.loadGrammarCase();
                }, 1200);
            }
        }

        // --- Render Functions ---
        renderProgressTab() {
            const pane = document.getElementById('progress');
            
            // Badge HTML Generation
            const badgesHTML = this.badgeSystem.available.map(badge => {
                const earned = this.state.badges.includes(badge.name);
                return `
                    <div class="badge-item ${earned ? 'earned' : ''}" title="${badge.description}">
                        <img src="${badge.icon}" alt="${badge.name}" class="badge-icon">
                        <div class="badge-info">
                            <h4 class="badge-name">${badge.name}</h4>
                            <p class="badge-description">${badge.description}</p>
                        </div>
                    </div>
                `;
            }).join('');

            pane.innerHTML = `
                <h2>Your Progress</h2>
                <div class="progress-stats">
                    <p><strong>Score:</strong> ${this.state.score}</p>
                    <p><strong>Current Streak:</strong> ${this.state.streak}</p>
                    <p><strong>Best Streak:</strong> ${this.state.bestStreak}</p>
                    <p><strong>Questions Answered:</strong> ${this.state.questionsAnswered}</p>
                </div>
                <h3>Your Badges</h3>
                <div class="badges-container">
                    ${badgesHTML}
                </div>
            `;
        }
    }

    // --- Helper Classes ---
    class MediaManager {
        constructor() {
            this.sounds = {};
            this.isAudioInitialized = false;
            // Pré-carrega os sons para garantir que estejam prontos quando forem tocados.
            this.initAudio();
        }

        initAudio() {
            if (this.isAudioInitialized) return;
            
            try {
                // Define os caminhos para os arquivos de áudio
                const audioFiles = {
                    'correct': 'audio/correct-answer.mp3',
                    'incorrect': 'audio/incorrect-answer.mp3',
                    'badge': 'audio/badge-unlocked.mp3'
                };

                // Cria um objeto Audio para cada som e o armazena
                for (const key in audioFiles) {
                    this.sounds[key] = new Audio(audioFiles[key]);
                    this.sounds[key].preload = 'auto';
                }
                
                this.isAudioInitialized = true;
                console.log("Audio files preloaded.");

            } catch (e) {
                console.error("Could not initialize or preload audio files.", e);
                this.isAudioInitialized = false;
            }
        }

        playSound(soundName) {
            if (!this.isAudioInitialized || !this.sounds[soundName]) {
                console.warn(`Sound "'${soundName}'" not loaded or found.`);
                return;
            }
            
            // Garante que o som toque desde o início se já estiver tocando
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play().catch(error => console.error(`Error playing sound: ${soundName}`, error));
        }
    }
    class ADHDOptimizer {
        constructor() {
            this.sessionDuration = 20 * 60; // 20 minutes in seconds
            this.timerId = null;
            this.timerDisplay = document.getElementById('timer-display');
        }

        startSession() {
            console.log("ADHD Optimizer session started.");
            let timeLeft = this.sessionDuration;

            this.timerId = setInterval(() => {
                if (timeLeft <= 0) {
                    clearInterval(this.timerId);
                    console.log("Session ended.");
                    return;
                }
                timeLeft--;
                this.updateTimerDisplay(timeLeft);
            }, 1000);
        }

        updateTimerDisplay(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            if (this.timerDisplay) {
                this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            }
        }

        stopSession() {
            clearInterval(this.timerId);
            console.log("Session stopped.");
        }
    }

    // --- Start the App ---
    const app = new LearningApp();
});