// Data management and state handling
class GameState {
    constructor() {
        this.currentGame = null;
        this.gameScore = 0;
        this.currentLevel = 1;
        this.levelsCompleted = 0;
        this.letterGameLevel = 1;
        this.selectedCount = 0;
        this.totalTargets = 0;
        this.currentTargetLetter = '';
        this.solvedCases = [];
        this.solvedMirrorWords = [];
        this.letterGameRetryCount = 0;
    }

    reset() {
        this.gameScore = 0;
        this.currentLevel = 1;
        this.levelsCompleted = 0;
        this.letterGameLevel = 1;
        this.selectedCount = 0;
        this.totalTargets = 0;
        this.currentTargetLetter = '';
        this.solvedCases = [];
        this.solvedMirrorWords = [];
        this.letterGameRetryCount = 0;
    }

    updateScore(points) {
        this.gameScore += points;
    }

    incrementSelectedCount() {
        this.selectedCount++;
    }

    incrementLevelsCompleted() {
        this.levelsCompleted++;
    }

    addSolvedCase(casePair) {
        this.solvedCases.push(casePair);
    }

    addSolvedMirrorWord(wordPair) {
        this.solvedMirrorWords.push(wordPair);
    }

    resetSolvedCases() {
        this.solvedCases = [];
    }

    resetSolvedMirrorWords() {
        this.solvedMirrorWords = [];
    }

    isCaseSolved(casePair) {
        return this.solvedCases.some(solved =>
            (solved.includes(casePair[0]) && solved.includes(casePair[1]))
        );
    }

    isMirrorWordSolved(wordPair) {
        return this.solvedMirrorWords.some(solved =>
            solved.word === wordPair.word || solved.mirror === wordPair.mirror
        );
    }
}

// Game templates and configuration
const gameTemplates = {
    'letter_reversal': {
        title: '🔄 Letter Direction Detective',
        description: 'Help identify the correct letter orientation!',
        gameType: 'letter_recognition'
    },
    'addition': {
        title: '➕ Math Adventure',
        description: 'Solve addition problems to score points!',
        gameType: 'math_game'
    },
    'sight_words': {
        title: '👁️ Word Spotter',
        description: 'Quickly identify common sight words!',
        gameType: 'word_recognition'
    },
    'counting': {
        title: '🔢 Number Counter',
        description: 'Practice counting with interactive activities!',
        gameType: 'counting_game'
    },
    'rhyming': {
        title: '🎵 Rhyme Time',
        description: 'Find words that sound alike!',
        gameType: 'rhyme_game'
    }
};

// Game data
const gameData = {
    confusingPairs: [
        { pair: ['b', 'd'], colors: ['color-1', 'color-2'] },
        { pair: ['p', 'q'], colors: ['color-3', 'color-4'] },
        { pair: ['u', 'n'], colors: ['color-5', 'color-6'] },
        { pair: ['m', 'w'], colors: ['color-1', 'color-3'] },
        { pair: ['f', 't'], colors: ['color-2', 'color-5'] },
        { pair: ['6', '9'], colors: ['color-4', 'color-6'] }
    ],

    numberPairs: [
        { pair: ['6', '9'], colors: ['color-1', 'color-2'] },
        { pair: ['2', '5'], colors: ['color-3', 'color-4'] },
        { pair: ['1', '7'], colors: ['color-5', 'color-6'] }
    ],

    mirrorWordPairs: [
        { word: 'stressed', mirror: 'desserts' },
        { word: 'tool', mirror: 'loot' },
        { word: 'evil', mirror: 'live' },
        { word: 'lever', mirror: 'revel' },
        { word: 'level', mirror: 'level' },
        { word: 'flow', mirror: 'wolf' },
        { word: 'stop', mirror: 'pots' },
        { word: 'drawer', mirror: 'reward' },
        { word: 'sleep', mirror: 'peels' },
        { word: 'doom', mirror: 'mood' }
    ],

    sightWords: ['the', 'and', 'a', 'to', 'said', 'you', 'he', 'it', 'in', 'was', 'for', 'that', 'have', 'they', 'but', 'had', 'what', 'were', 'when', 'who'],

    rhymePairs: [
        ['cat', 'hat'], ['dog', 'log'], ['sun', 'fun'], ['book', 'look'],
        ['car', 'star'], ['bee', 'tree'], ['fish', 'dish'], ['ring', 'sing']
    ]
};

// Local storage helpers
class StorageManager {
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    static load(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            return defaultValue;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('Failed to remove from localStorage:', error);
        }
    }

    static clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.warn('Failed to clear localStorage:', error);
        }
    }
}
