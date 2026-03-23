// Main game orchestrator - coordinates all modules

// Global game instance
let gameCore = null;

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

// Initialize the modular game system
function initializeGame() {
    try {
        // Create game core instance
        gameCore = new GameCore();

        // Make gameCore globally available for onclick handlers
        window.gameCore = gameCore;

        // Expose necessary functions to global scope for HTML onclick handlers
        window.generateGame = generateGame;
        window.setPrompt = setPrompt;
        window.showInputSection = showInputSection;
        window.createLetterGame = createLetterGame;
        window.createMathGame = createMathGame;
        window.createWordGame = createWordGame;
        window.createCountingGame = createCountingGame;
        window.createRhymeGame = createRhymeGame;
        window.selectSingleLetter = selectSingleLetter;
        window.selectMirrorWord = selectMirrorWord;
        window.selectLetter = selectLetter;
        window.checkMath = checkMath;
        window.checkWord = checkWord;
        window.checkCount = checkCount;
        window.checkRhyme = checkRhyme;

        // Initialize UI event listeners
        setupEventListeners();

        console.log('Game initialized successfully with modular architecture');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        showFallbackError();
    }
}

// Setup event listeners for UI elements
function setupEventListeners() {
    // Use event delegation for activity buttons
    const activitySection = DOMUtils.getElement('activitySection');
    if (activitySection) {
        const activityPrompts = {
            'btn-letter-reversal': 'My child often reverses letters like b and d',
            'btn-addition': 'Help with basic addition facts',
            'btn-sight-words': 'Trouble remembering sight words',
            'btn-counting': 'Need to practice counting to 20',
            'btn-rhyming': 'Difficulty with rhyming words'
        };

        DOMUtils.addEventListener(activitySection, 'click', (e) => {
            const btn = e.target.closest('[id^="btn-"]');
            if (btn && activityPrompts[btn.id] && gameCore && gameCore.uiManager) {
                gameCore.uiManager.setPromptInput(activityPrompts[btn.id]);
                gameCore.generateGame();
            }
        });
    }

    // Generate game button
    const generateBtn = DOMUtils.getElement('generateBtn');
    if (generateBtn) {
        DOMUtils.addEventListener(generateBtn, 'click', () => {
            if (gameCore) {
                gameCore.generateGame();
            }
        });
    }

    // Prompt input enter key
    const promptInput = DOMUtils.getElement('promptInput');
    if (promptInput) {
        DOMUtils.addEventListener(promptInput, 'keypress', (e) => {
            if (e.key === 'Enter' && gameCore) {
                gameCore.generateGame();
            }
        });
    }

    // Quick prompt buttons with event delegation
    const quickPromptContainer = DOMUtils.getElement('activitySection');
    if (quickPromptContainer) {
        DOMUtils.addEventListener(quickPromptContainer, 'click', (e) => {
            if (e.target.classList?.contains('quick-prompt') && gameCore && gameCore.uiManager) {
                gameCore.uiManager.setPromptInput(e.target.textContent);
            }
        });
    }
}

// Fallback error display for initialization failures
function showFallbackError() {
    const gameArea = DOMUtils.getElement('gameArea');
    if (gameArea) {
        gameArea.innerHTML = `
            <div class="error-message">
                <h2>Game Initialization Error</h2>
                <p>Sorry, there was a problem loading the game. Please refresh the page and try again.</p>
                <button onclick="location.reload()">Refresh Page</button>
            </div>
        `;
        gameArea.style.display = 'block';
    }
}

// Legacy functions for backward compatibility with inline onclick handlers
// These delegate to the modular gameCore instance

function setPrompt(text) {
    if (gameCore && gameCore.uiManager) {
        gameCore.uiManager.setPromptInput(text);
    }
}

function generateGame() {
    if (gameCore) {
        gameCore.generateGame();
    }
}

function createLetterGame() {
    if (gameCore) {
        gameCore.createLetterGame();
    }
}

function createMathGame() {
    if (gameCore) {
        gameCore.createMathGame();
    }
}

function createWordGame() {
    if (gameCore) {
        gameCore.createWordGame();
    }
}

function createCountingGame() {
    if (gameCore) {
        gameCore.createCountingGame();
    }
}

function createRhymeGame() {
    if (gameCore) {
        gameCore.createRhymeGame();
    }
}

function selectSingleLetter(element, letter, index) {
    if (gameCore) {
        gameCore.selectSingleLetter(element, letter, index);
    }
}

function selectMirrorWord(element, selectedWord, word1, word2) {
    if (gameCore) {
        gameCore.selectMirrorWord(element, selectedWord, word1, word2);
    }
}

function selectLetter(element, letter) {
    if (gameCore) {
        gameCore.selectLetter(element, letter);
    }
}

function checkMath(selected, correct) {
    if (gameCore) {
        gameCore.checkMath(selected, correct);
    }
}

function checkWord(selected, target) {
    if (gameCore) {
        gameCore.checkWord(selected, target);
    }
}

function checkCount(selected, correct) {
    if (gameCore) {
        gameCore.checkCount(selected, correct);
    }
}

function checkRhyme(selected, correct) {
    if (gameCore) {
        gameCore.checkRhyme(selected, correct);
    }
}

function showInputSection() {
    if (gameCore && gameCore.uiManager) {
        gameCore.uiManager.showInputSection();
    }
}

