// Core game logic and mechanics
class GameCore {
    constructor() {
        this.gameState = new GameState();
        this.uiManager = new UIManager();
        this.gameTemplates = gameTemplates;
        this.gameData = gameData;
        this.analyticsLog = [];
        this.challengeStartTime = null;
        this.currentPrompt = '';
        this.promptCache = new Map(); // Memoization for analyzePrompt
        this.maxAnalyticsEntries = 500; // Prevent unbounded memory growth
    }

    // Start timer for response time and store prompt
    startChallengeTimer(prompt) {
        this.challengeStartTime = Date.now();
        this.currentPrompt = prompt || '';
    }

    // Log analytics for each challenge attempt
    logAnalyticsChoice(choice, correct, inputMethod) {
        // Focused analytics: challengeType, prompt, options, choice, correct, responseTime, score
        let challengeType = this.gameState.currentGame || 'unknown';
        let prompt = this.currentPrompt || '';
        let options = Array.from(document.querySelectorAll('.letter-option')).map(opt => opt.textContent);
        let trialId = Date.now() + '-' + Math.floor(Math.random() * 10000);
        let responseTime = this.challengeStartTime ? (Date.now() - this.challengeStartTime) : null;
        let score = this.gameState.gameScore;

        this.analyticsLog.push({
            trialId,
            challengeType,
            prompt,
            options,
            choice,
            correct,
            responseTime,
            score
        });

        // Limit analytics history to prevent memory bloat
        if (this.analyticsLog.length > this.maxAnalyticsEntries) {
            this.analyticsLog.shift();
        }

        // Reset timer after logging
        this.challengeStartTime = null;
    }

    // Analyze user prompt and determine game type (with memoization)
    analyzePrompt(prompt) {
        // Return cached result if available
        if (this.promptCache.has(prompt)) {
            return this.promptCache.get(prompt);
        }

        const lowercasePrompt = prompt.toLowerCase();
        let gameType = 'letter_reversal'; // Default

        if (lowercasePrompt.includes('letter') && (lowercasePrompt.includes('reverse') || lowercasePrompt.includes('b') || lowercasePrompt.includes('d'))) {
            gameType = 'letter_reversal';
        } else if (lowercasePrompt.includes('addition') || lowercasePrompt.includes('add') || lowercasePrompt.includes('math')) {
            gameType = 'addition';
        } else if (lowercasePrompt.includes('sight word') || lowercasePrompt.includes('word')) {
            gameType = 'sight_words';
        } else if (lowercasePrompt.includes('count') || lowercasePrompt.includes('number')) {
            gameType = 'counting';
        } else if (lowercasePrompt.includes('rhyme') || lowercasePrompt.includes('rhyming')) {
            gameType = 'rhyming';
        }

        // Cache the result
        this.promptCache.set(prompt, gameType);
        return gameType;
    }
            // Export analytics as CSV string (optimized with array join)
            exportAnalyticsCSV() {
                if (!this.analyticsLog || !this.analyticsLog.length) return '';
                const header = ['trialId','challengeType','prompt','options','choice','correct','responseTime','score'];
                const csvRows = [header.join(',')];
                
                for (const row of this.analyticsLog) {
                    const values = header.map(h => this.escapeCSVValue(row[h]));
                    csvRows.push(values.join(','));
                }
                return csvRows.join('\r\n');
            }

            // Helper: Escape CSV values
            escapeCSVValue(val) {
                if (Array.isArray(val)) val = val.join('|');
                if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
                    return '"' + val.replace(/"/g, '""') + '"';
                }
                return val;
            }

            // Trigger download of analytics CSV
            downloadAnalyticsCSV() {
                const csv = this.exportAnalyticsCSV();
                if (!csv) {
                    alert('No analytics data to export.');
                    return;
                }
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'analytics.csv';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
            }

    // Generate game based on prompt
    generateGame() {
        const prompt = this.uiManager.getPromptInput();
        if (!prompt) {
            this.uiManager.showNotification('Missing Input', 'Please enter a learning challenge or goal!', 'info');
            return;
        }

        const gameType = this.analyzePrompt(prompt);
        const template = this.gameTemplates[gameType];

        this.gameState.currentGame = gameType;
        this.gameState.reset();

        this.uiManager.showGameArea();
        this.createGame(template);
    }

    // Create game structure (optimized with Promise-based async)
    createGame(template) {
        const gameContentHTML = `
            <div class="game-title">${template.title}</div>
            <div class="game-content">
                <p style="margin-bottom: 20px;">${template.description}</p>
                <div id="gamePlayArea"></div>
            </div>
        `;

        this.uiManager.updateGameContent(gameContentHTML);

        // Wait for DOM to be ready
        return this.waitForElement('gamePlayArea').then(() => {
            console.log('Both gameContent and gamePlayArea found, proceeding with game creation');
            switch (template.gameType) {
                case 'letter_recognition':
                    return this.createLetterGame();
                case 'math_game':
                    return this.createMathGame();
                case 'word_recognition':
                    return this.createWordGame();
                case 'counting_game':
                    return this.createCountingGame();
                case 'rhyme_game':
                    return this.createRhymeGame();
            }
        }).catch(error => console.error('Game creation failed:', error));
    }

    // Helper: Wait for element to exist in DOM
    waitForElement(elementId, maxAttempts = 5, delay = 100) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const checkElement = () => {
                const element = DOMUtils.getElement(elementId);
                if (element) {
                    resolve(element);
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(checkElement, delay);
                } else {
                    reject(`Element ${elementId} not found after ${attempts} attempts`);
                }
            };
            checkElement();
        });
    }

    // Create letter recognition game
    createLetterGame() {
        // Prevent multiple simultaneous calls
        if (this.gameState.isCreatingGame) {
            console.log('Game creation already in progress, skipping...');
            return;
        }
        this.gameState.isCreatingGame = true;

        this.gameState.letterGameLevel = this.gameState.letterGameLevel || 1;

        // Use the existing gamePlayArea from createGame
        const gamePlayArea = DOMUtils.getElement('gamePlayArea');
        if (!gamePlayArea) {
            console.error('gamePlayArea element not found, game structure may not be initialized');
            this.gameState.isCreatingGame = false;
            return;
        }

        // Reset flags
        this.gameState.letterGameRetryCount = 0;
        this.gameState.isCreatingGame = false;

        const levelSelector = this.uiManager.createLevelSelector(this.gameState.letterGameLevel);
        const progressRing = this.uiManager.createProgressRing(this.gameState.selectedCount, this.gameState.totalTargets);


        const gamePlayAreaHTML = `
            <div class="mirror-words-container">
                <div class="score">Score: ${this.gameState.gameScore}</div>
                ${levelSelector}
                <div id="letterGameContent"></div>
                ${progressRing}
                <div class="challenge-btn-row">
                    <button class="new-game-btn" onclick="window.gameCore.createLetterGame()">New Challenge</button>
                    <button class="finish-btn" onclick="window.gameCore.showAnalyticsScreen()">Finish</button>
                    <button class="cancel-btn" onclick="showInputSection()">Cancel</button>
                </div>
            </div>
        `;

        this.uiManager.updateGamePlayArea(gamePlayAreaHTML);

        // Add level selector event listeners
        this.uiManager.addEventListener('.level-btn', 'click', (e) => {
            const level = parseInt(e.target.dataset.level);
            this.switchLetterLevel(level);
        });

        setTimeout(() => {
            switch(this.gameState.letterGameLevel) {
                case 1:
                    this.createSingleLetterLevel();
                    break;
                case 2:
                    this.createWordLevel();
                    break;
                case 3:
                    this.createNumberLevel();
                    break;
            }
        }, 50);
    }
    showAnalyticsScreen() {
        const gameArea = DOMUtils.getElement('gameArea');
        if (!gameArea) return;
        const csv = this.exportAnalyticsCSV();
        const rows = this.analyticsLog;
        let tableHtml = '<h2>Analytics Summary</h2>';
        if (rows.length) {
            tableHtml += '<div style="overflow-x:auto;"><table class="analytics-table"><thead><tr>';
            const header = ['trialId','challengeType','prompt','options','choice','correct','responseTime','score'];
            tableHtml += header.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';
            tableHtml += rows.map(row => `<tr>${header.map(h => `<td>${row[h]}</td>`).join('')}</tr>`).join('');
            tableHtml += '</tbody></table></div>';
            // Show summary stats
            const total = rows.length;
            const correct = rows.filter(r => r.correct).length;
            const avgTime = Math.round(rows.reduce((sum, r) => sum + (r.responseTime || 0), 0) / total);
            tableHtml += `<div class="analytics-stats"><b>Total Attempts:</b> ${total} &nbsp; <b>Correct:</b> ${correct} &nbsp; <b>Accuracy:</b> ${((correct/total)*100).toFixed(1)}% &nbsp; <b>Avg. Response Time:</b> ${isNaN(avgTime) ? '-' : avgTime + ' ms'}</div>`;
        } else {
            tableHtml += '<p>No analytics data found.</p>';
        }
        tableHtml += '<button class="analytics-btn" onclick="window.gameCore.downloadAnalyticsCSV()">Download Analytics CSV</button>';
        gameArea.innerHTML = `<div class="analytics-summary">${tableHtml}</div>`;
    }

    // Switch letter game level
    switchLetterLevel(level) {
        this.gameState.letterGameLevel = level;
        this.gameState.selectedCount = 0;
        this.gameState.totalTargets = 0;
        this.gameState.currentTargetLetter = '';
        this.gameState.levelsCompleted = 0;
        this.gameState.resetSolvedCases();
        this.gameState.resetSolvedMirrorWords();
        this.createLetterGame();
    }

    // Create single letter level (optimized with event delegation)
    createSingleLetterLevel() {
        // Start timer for analytics
        this.startChallengeTimer(`Find all ${this.gameState.currentTargetLetter}`);
        const gameContent = DOMUtils.getElement('letterGameContent');
        if (!gameContent) {
            console.error('letterGameContent element not found, retrying...');
            setTimeout(() => this.createSingleLetterLevel(), 100);
            return;
        }

        // Filter out already solved cases
        const availablePairs = this.gameData.confusingPairs.filter(pair =>
            !this.gameState.isCaseSolved(pair.pair)
        );

        if (availablePairs.length === 0) {
            this.gameState.resetSolvedCases();
            availablePairs.push(...this.gameData.confusingPairs);
        }

        const currentSet = Utils.getRandomElement(availablePairs);
        this.gameState.currentTargetLetter = Utils.getRandomElement(currentSet.pair);

        this.gameState.addSolvedCase(currentSet.pair);

        // Random total letters (3-8 total)
        const totalLetters = Utils.randomInt(3, 8);
        const targetCount = Utils.clamp(Math.ceil(totalLetters * 0.4), Math.floor(totalLetters * 0.6), totalLetters);
        const distractorCount = totalLetters - targetCount;

        const letterArray = [];

        // Add target letters
        for (let i = 0; i < targetCount; i++) {
            letterArray.push({
                letter: this.gameState.currentTargetLetter,
                isTarget: true,
                color: currentSet.colors[currentSet.pair.indexOf(this.gameState.currentTargetLetter)]
            });
        }

        // Add distractor letters
        const distractorLetter = currentSet.pair.find(l => l !== this.gameState.currentTargetLetter);
        for (let i = 0; i < distractorCount; i++) {
            letterArray.push({
                letter: distractorLetter,
                isTarget: false,
                color: currentSet.colors[currentSet.pair.indexOf(distractorLetter)]
            });
        }

        Utils.shuffleArray(letterArray);

        this.gameState.totalTargets = targetCount;
        this.gameState.selectedCount = 0;

        const instruction = this.uiManager.createInstruction(
            `Find all ${this.uiManager.highlightTargetLetter(this.gameState.currentTargetLetter)}<br><small>${targetCount} out of ${totalLetters}</small>`
        );

        // Use data attributes instead of inline onclick handlers
        const letterGrid = `
            <div class="single-letter-grid" id="letterGrid">
                ${letterArray.map((item, index) => `
                    <div class="letter-card" data-letter="${item.letter}" data-index="${index}" data-target="${item.isTarget}">
                        <div class="letter-card-content ${item.color} ${item.isTarget ? 'jerking-letter' : ''}">${item.letter}</div>
                    </div>
                `).join('')}
            </div>
        `;

        DOMUtils.setInnerHTML(gameContent, instruction + letterGrid);
        
        // Set up event delegation for letter cards
        const letterGridEl = DOMUtils.getElement('letterGrid');
        if (letterGridEl) {
            DOMUtils.addEventListener(letterGridEl, 'click', (e) => {
                const card = e.target.closest('.letter-card');
                if (card) {
                    const letter = card.dataset.letter;
                    const index = parseInt(card.dataset.index);
                    this.selectSingleLetter(card, letter, index);
                }
            });
        }
        
        // Reset progress ring to 0/totalTargets for new challenge
        this.uiManager.updateProgressRing(0, this.gameState.totalTargets);
    }

    // Create word level (optimized with event delegation)
    createWordLevel() {
        // Start timer for analytics
        this.startChallengeTimer('Find mirror words');
        const gameContent = DOMUtils.getElement('letterGameContent');
        if (!gameContent) {
            console.error('letterGameContent element not found, retrying...');
            setTimeout(() => this.createWordLevel(), 100);
            return;
        }

        // Filter out already solved mirror word pairs
        const availablePairs = this.gameData.mirrorWordPairs.filter(pair =>
            !this.gameState.isMirrorWordSolved(pair)
        );

        if (availablePairs.length === 0) {
            this.gameState.resetSolvedMirrorWords();
            availablePairs.push(...this.gameData.mirrorWordPairs);
        }

        const selectedPair = Utils.getRandomElement(availablePairs);
        this.gameState.addSolvedMirrorWord(selectedPair);

        const allWords = [selectedPair.word, selectedPair.mirror];

        // Add some distractor words
        const distractors = this.gameData.mirrorWordPairs
            .filter(pair => pair !== selectedPair)
            .slice(0, 2)
            .map(pair => Math.random() < 0.5 ? pair.word : pair.mirror);

        allWords.push(...distractors);
        Utils.shuffleArray(allWords);

        this.gameState.selectedCount = 0;
        this.gameState.totalTargets = 2; // Both words in the pair

        const instruction = this.uiManager.createInstruction(
            `Find mirror words<br><small>One backwards = the other</small>`
        );

        // Use data attributes for event delegation
        const wordDisplay = `
            <div class="word-display" id="wordDisplay">
                ${allWords.map((word, index) => `
                    <div class="mirror-word" data-word="${word}" data-word1="${selectedPair.word}" data-word2="${selectedPair.mirror}">
                        ${word.split('').map(letter => `
                            <span class="mirror-letter color-${(index % 6) + 1}">${letter}</span>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        `;

        DOMUtils.setInnerHTML(gameContent, instruction + wordDisplay);
        
        // Set up event delegation for word selection
        const wordDisplayEl = DOMUtils.getElement('wordDisplay');
        if (wordDisplayEl) {
            DOMUtils.addEventListener(wordDisplayEl, 'click', (e) => {
                const word = e.target.closest('.mirror-word');
                if (word) {
                    this.selectMirrorWord(word, word.dataset.word, word.dataset.word1, word.dataset.word2);
                }
            });
        }
    }

    // Create number level (optimized with event delegation)
    createNumberLevel() {
        // Start timer for analytics
        this.startChallengeTimer(`Find all ${this.gameState.currentTargetLetter}`);
        const gameContent = DOMUtils.getElement('letterGameContent');
        if (!gameContent) {
            console.error('letterGameContent element not found, retrying...');
            setTimeout(() => this.createNumberLevel(), 100);
            return;
        }

        const currentSet = Utils.getRandomElement(this.gameData.numberPairs);
        this.gameState.currentTargetLetter = Utils.getRandomElement(currentSet.pair);

        const numberSequences = [];
        for (let i = 0; i < 4; i++) {
            let sequence = '';
            for (let j = 0; j < 4 + Utils.randomInt(0, 3); j++) {
                sequence += Math.random() < 0.4 ? this.gameState.currentTargetLetter :
                           Math.random() < 0.5 ? currentSet.pair.find(n => n !== this.gameState.currentTargetLetter) :
                           String(Utils.randomInt(0, 9));
            }
            numberSequences.push(sequence);
        }

        this.gameState.selectedCount = 0;
        this.gameState.totalTargets = 0;

        const instruction = this.uiManager.createInstruction(
            `Find all ${this.uiManager.highlightTargetLetter(this.gameState.currentTargetLetter)}`
        );

        // Count total targets before rendering
        const targetLetter = this.gameState.currentTargetLetter;
        let totalTargets = 0;
        numberSequences.forEach(seq => {
            totalTargets += seq.split('').filter(n => n === targetLetter).length;
        });
        this.gameState.totalTargets = totalTargets;

        // Generate HTML with data attributes instead of inline onclick
        const numberSequencesHTML = this.generateNumberSequences(numberSequences, currentSet.pair, currentSet.colors, false);
        const numberDisplay = `
            <div class="word-display number-game" id="numberDisplay">
                ${numberSequencesHTML}
            </div>
        `;

        DOMUtils.setInnerHTML(gameContent, instruction + numberDisplay);
        
        // Set up event delegation for number selection
        const numberDisplayEl = DOMUtils.getElement('numberDisplay');
        if (numberDisplayEl) {
            DOMUtils.addEventListener(numberDisplayEl, 'click', (e) => {
                const numberSpan = e.target.closest('.mirror-letter');
                if (numberSpan) {
                    const letter = numberSpan.dataset.number;
                    this.selectLetter(numberSpan, letter);
                }
            });
        }
        
        // Update progress ring after rendering
        this.uiManager.updateProgressRing(this.gameState.selectedCount, this.gameState.totalTargets);
    }

    // Generate number sequences (optimized with data attributes)
    generateNumberSequences(sequences, confusingNumbers, colors, countTargets = true) {
        // If countTargets is true, increment totalTargets (legacy, not used in new flow)
        return sequences.map(sequence => {
            const numbers = sequence.split('').map((number, index) => {
                const colorIndex = confusingNumbers.indexOf(number);
                const isTarget = number === this.gameState.currentTargetLetter;
                if (isTarget && countTargets) this.gameState.totalTargets++;

                const colorClass = colorIndex !== -1 ? colors[colorIndex] : '';
                const jerkingClass = isTarget ? 'jerking-letter' : '';

                return `<span
                    class="mirror-letter ${colorClass} ${jerkingClass}"
                    data-number="${number}"
                >${number}</span>`;
            }).join('');

            return `<div class="mirror-word">${numbers}</div>`;
        }).join('');
    }

    // Handle single letter selection
    selectSingleLetter(element, letter, index) {
        const inputMethod = window.event && window.event.pointerType ? window.event.pointerType : 'mouse';
        if (!this.challengeStartTime) this.startChallengeTimer(`Find all ${this.gameState.currentTargetLetter}`);
        if (letter === this.gameState.currentTargetLetter && !element.classList.contains('selected-letter')) {
            DOMUtils.addClass(element, 'selected-letter');
            this.gameState.incrementSelectedCount();
            this.gameState.updateScore(15);

            this.uiManager.updateScoreDisplay(this.gameState.gameScore);
            this.uiManager.updateProgressRing(this.gameState.selectedCount, this.gameState.totalTargets);

            if (this.gameState.selectedCount === this.gameState.totalTargets) {
                // Log analytics ONCE for the whole challenge
                this.logAnalyticsChoice(this.gameState.currentTargetLetter, true, inputMethod);
                setTimeout(() => {
                    this.gameState.incrementLevelsCompleted();
                    this.uiManager.showNotification('Perfect!', `You found all ${this.gameState.totalTargets} "${this.gameState.currentTargetLetter}" letters!`, 'success');
                    if (this.gameState.levelsCompleted >= 5) {
                        if (this.gameState.letterGameLevel < 3) {
                            this.gameState.letterGameLevel++;
                            this.gameState.levelsCompleted = 0;
                            let msg = '';
                            if (this.gameState.letterGameLevel === 2) {
                                msg = "You've mastered single letters. Now try mirror words!";
                            } else if (this.gameState.letterGameLevel === 3) {
                                msg = "You've mastered mirror words. Now try numbers!";
                            }
                            if (msg) {
                                setTimeout(() => {
                                    this.uiManager.showNotification('Level Up!', msg, 'level-up');
                                }, 500);
                            }
                        } else {
                            setTimeout(() => {
                                this.uiManager.showNotification('Congratulations!', 'You have completed all challenges!', 'success');
                            }, 500);
                            return;
                        }
                    }
                    this.createLetterGame();
                }, 500);
            }
        } else if (letter !== this.gameState.currentTargetLetter) {
            DOMUtils.addClass(element, 'wrong-letter');
            setTimeout(() => {
                DOMUtils.removeClass(element, 'wrong-letter');
            }, 600);
        }
    }

    // Handle mirror word selection
    selectMirrorWord(element, selectedWord, word1, word2) {
        const inputMethod = window.event && window.event.pointerType ? window.event.pointerType : 'mouse';
        if (!this.challengeStartTime) this.startChallengeTimer(`Find mirror words: ${word1} & ${word2}`);
        if (selectedWord === word1 || selectedWord === word2) {
            if (!element.classList.contains('selected-letter')) {
                DOMUtils.addClass(element, 'selected-letter');
                this.gameState.incrementSelectedCount();
                this.gameState.updateScore(20);

                this.uiManager.updateScoreDisplay(this.gameState.gameScore);
                this.uiManager.updateProgressRing(this.gameState.selectedCount, this.gameState.totalTargets);

                if (this.gameState.selectedCount === this.gameState.totalTargets) {
                    // Log analytics ONCE for the whole challenge
                    this.logAnalyticsChoice(`${word1} & ${word2}`, true, inputMethod);
                    setTimeout(() => {
                        this.gameState.incrementLevelsCompleted();
                        this.uiManager.showNotification('Excellent!', `You found the mirror word pair: "${word1}" ↔ "${word2}"!`, 'success');
                        if (this.gameState.levelsCompleted >= 5) {
                            if (this.gameState.letterGameLevel < 3) {
                                this.gameState.letterGameLevel++;
                                this.gameState.levelsCompleted = 0;
                                let msg = '';
                                if (this.gameState.letterGameLevel === 2) {
                                    msg = "You've mastered single letters. Now try mirror words!";
                                } else if (this.gameState.letterGameLevel === 3) {
                                    msg = "You've mastered mirror words. Now try numbers!";
                                }
                                if (msg) {
                                    setTimeout(() => {
                                        this.uiManager.showNotification('Level Up!', msg, 'level-up');
                                    }, 500);
                                }
                            } else {
                                setTimeout(() => {
                                    this.uiManager.showNotification('Congratulations!', 'You have completed all challenges!', 'success');
                                }, 500);
                                return;
                            }
                        }
                        this.createLetterGame();
                    }, 500);
                }
            }
        } else {
            DOMUtils.addClass(element, 'wrong-letter');
            setTimeout(() => {
                DOMUtils.removeClass(element, 'wrong-letter');
            }, 600);
        }
    }

    // Handle letter selection (for numbers)
    selectLetter(element, letter) {
        DOMUtils.removeClass(element, 'jerking-letter');
        const inputMethod = window.event && window.event.pointerType ? window.event.pointerType : 'mouse';
        if (!this.challengeStartTime) this.startChallengeTimer(`Find all ${this.gameState.currentTargetLetter}`);
        if (letter === this.gameState.currentTargetLetter) {
            if (!element.classList.contains('selected-letter')) {
                DOMUtils.addClass(element, 'selected-letter');
                this.gameState.incrementSelectedCount();
                this.gameState.updateScore(10);

                this.uiManager.updateScoreDisplay(this.gameState.gameScore);
                this.uiManager.updateProgressRing(this.gameState.selectedCount, this.gameState.totalTargets);

                if (this.gameState.selectedCount === this.gameState.totalTargets) {
                    // Log analytics ONCE for the whole challenge
                    this.logAnalyticsChoice(this.gameState.currentTargetLetter, true, inputMethod);
                    setTimeout(() => {
                        this.gameState.incrementLevelsCompleted();
                        const contentType = this.gameState.letterGameLevel === 3 ? 'numbers' : 'letters';
                        this.uiManager.showNotification('Great Job!', `You found all ${this.gameState.totalTargets} "${this.gameState.currentTargetLetter}" ${contentType}!`, 'success');
                        if (this.gameState.levelsCompleted >= 5) {
                            if (this.gameState.letterGameLevel < 3) {
                                this.gameState.letterGameLevel++;
                                this.gameState.levelsCompleted = 0;
                                let msg = '';
                                if (this.gameState.letterGameLevel === 2) {
                                    msg = "You've mastered single letters. Now try mirror words!";
                                } else if (this.gameState.letterGameLevel === 3) {
                                    msg = "You've mastered mirror words. Now try numbers!";
                                }
                                if (msg) {
                                    setTimeout(() => {
                                        this.uiManager.showNotification('Level Up!', msg, 'level-up');
                                    }, 500);
                                }
                            } else {
                                setTimeout(() => {
                                    this.uiManager.showNotification('Congratulations!', 'You have completed all challenges!', 'success');
                                }, 500);
                                return;
                            }
                        }
                        this.createLetterGame();
                    }, 500);
                }
            }
        } else {
            DOMUtils.addClass(element, 'wrong-letter');
            setTimeout(() => {
                DOMUtils.removeClass(element, 'wrong-letter');
            }, 600);
        }
    }

    // Create math game
    createMathGame() {
        const num1 = Utils.randomInt(1, 10);
        const num2 = Utils.randomInt(1, 10);
        const correctAnswer = num1 + num2;

        const wrongAnswers = [
            correctAnswer + 1,
            correctAnswer - 1,
            correctAnswer + 2
        ].filter(ans => ans > 0);

        const allAnswers = [correctAnswer, ...wrongAnswers.slice(0, 2)].sort(() => Math.random() - 0.5);

        const gamePlayAreaHTML = `
            <div class="letter-game">
                <div class="score">Score: ${this.gameState.gameScore}</div>
                <div style="font-size: 2em; margin: 20px;">${num1} + ${num2} = ?</div>
                <div class="letter-options">
                    ${allAnswers.map(answer =>
                        `<div class="letter-option" onclick="window.gameCore.checkMath(${answer}, ${correctAnswer})">${answer}</div>`
                    ).join('')}
                </div>
                <button class="new-game-btn" onclick="window.gameCore.createMathGame()">Next Problem</button>
            </div>
        `;

        this.uiManager.updateGamePlayArea(gamePlayAreaHTML);
    }

    // Check math answer
    checkMath(selected, correct) {
        const inputMethod = window.event && window.event.pointerType ? window.event.pointerType : 'mouse';
        const options = DOMUtils.querySelectorAll('.letter-option');
        options.forEach(option => {
            if (parseInt(option.textContent) === selected) {
                const isCorrect = selected === correct;
                if (isCorrect) {
                    DOMUtils.addClass(option, 'correct');
                    this.gameState.updateScore(10);
                    setTimeout(() => this.createMathGame(), 1000);
                } else {
                    DOMUtils.addClass(option, 'incorrect');
                }
                this.logAnalyticsChoice(selected, isCorrect, inputMethod);
            }
        });
    }

    // Create word game
    createWordGame() {
        const targetWord = Utils.getRandomElement(this.gameData.sightWords);
        const distractors = this.gameData.sightWords.filter(word => word !== targetWord).slice(0, 2);
        const allWords = [targetWord, ...distractors].sort(() => Math.random() - 0.5);

        const gamePlayAreaHTML = `
            <div class="letter-game">
                <div class="score">Score: ${this.gameState.gameScore}</div>
                <div style="font-size: 1.5em; margin: 20px;">Find the word: <strong>${targetWord}</strong></div>
                <div class="letter-options">
                    ${allWords.map(word =>
                        `<div class="letter-option" style="font-size: 1.5em;" onclick="window.gameCore.checkWord('${word}', '${targetWord}')">${word}</div>`
                    ).join('')}
                </div>
                <button class="new-game-btn" onclick="window.gameCore.createWordGame()">Next Word</button>
            </div>
        `;

        this.uiManager.updateGamePlayArea(gamePlayAreaHTML);
    }

    // Check word answer
    checkWord(selected, target) {
        const inputMethod = window.event && window.event.pointerType ? window.event.pointerType : 'mouse';
        const options = DOMUtils.querySelectorAll('.letter-option');
        options.forEach(option => {
            if (option.textContent === selected) {
                const correct = selected === target;
                if (correct) {
                    DOMUtils.addClass(option, 'correct');
                    this.gameState.updateScore(10);
                    setTimeout(() => this.createWordGame(), 1000);
                } else {
                    DOMUtils.addClass(option, 'incorrect');
                }
                this.logAnalyticsChoice(selected, correct, inputMethod);
            }
        });
    }

    // Create counting game
    createCountingGame() {
        const targetNumber = Utils.randomInt(1, 20);
        const circles = '🔵'.repeat(targetNumber);

        const wrongAnswers = [
            targetNumber + 1,
            targetNumber - 1,
            targetNumber + 2
        ].filter(ans => ans > 0);

        const allAnswers = [targetNumber, ...wrongAnswers.slice(0, 2)].sort(() => Math.random() - 0.5);

        const gamePlayAreaHTML = `
            <div class="letter-game">
                <div class="score">Score: ${this.gameState.gameScore}</div>
                <div style="font-size: 1.5em; margin: 20px;">Count the circles:</div>
                <div style="font-size: 2em; margin: 20px; line-height: 1.2;">${circles}</div>
                <div class="letter-options">
                    ${allAnswers.map(answer =>
                        `<div class="letter-option" onclick="window.gameCore.checkCount(${answer}, ${targetNumber})">${answer}</div>`
                    ).join('')}
                </div>
                <button class="new-game-btn" onclick="window.gameCore.createCountingGame()">Next Count</button>
            </div>
        `;

        this.uiManager.updateGamePlayArea(gamePlayAreaHTML);
    }

    // Check counting answer
    checkCount(selected, correct) {
        const inputMethod = window.event && window.event.pointerType ? window.event.pointerType : 'mouse';
        const options = DOMUtils.querySelectorAll('.letter-option');
        options.forEach(option => {
            if (parseInt(option.textContent) === selected) {
                const isCorrect = selected === correct;
                if (isCorrect) {
                    DOMUtils.addClass(option, 'correct');
                    this.gameState.updateScore(10);
                    setTimeout(() => this.createCountingGame(), 1000);
                } else {
                    DOMUtils.addClass(option, 'incorrect');
                }
                this.logAnalyticsChoice(selected, isCorrect, inputMethod);
            }
        });
    }

    // Create rhyme game
    createRhymeGame() {
        const currentPair = Utils.getRandomElement(this.gameData.rhymePairs);
        const targetWord = currentPair[0];
        const rhymeWord = currentPair[1];

        const nonRhymes = ['apple', 'house', 'water', 'happy', 'green'].filter(word =>
            !currentPair.includes(word)
        ).slice(0, 2);

        const allWords = [rhymeWord, ...nonRhymes].sort(() => Math.random() - 0.5);

        const gamePlayAreaHTML = `
            <div class="letter-game">
                <div class="score">Score: ${this.gameState.gameScore}</div>
                <div style="font-size: 1.5em; margin: 20px;">Which word rhymes with: <strong>${targetWord}</strong>?</div>
                <div class="letter-options">
                    ${allWords.map(word =>
                        `<div class="letter-option" style="font-size: 1.2em;" onclick="window.gameCore.checkRhyme('${word}', '${rhymeWord}')">${word}</div>`
                    ).join('')}
                </div>
                <button class="new-game-btn" onclick="window.gameCore.createRhymeGame()">Next Rhyme</button>
            </div>
        `;

        this.uiManager.updateGamePlayArea(gamePlayAreaHTML);
    }

    // Check rhyme answer
    checkRhyme(selected, correct) {
        const inputMethod = window.event && window.event.pointerType ? window.event.pointerType : 'mouse';
        const options = DOMUtils.querySelectorAll('.letter-option');
        options.forEach(option => {
            if (option.textContent === selected) {
                if (selected === correct) {
                    DOMUtils.addClass(option, 'correct');
                    this.gameState.updateScore(10);
                    this.logAnalyticsChoice(selected, true, inputMethod);
                    setTimeout(() => this.createRhymeGame(), 1000);
                } else {
                    DOMUtils.addClass(option, 'incorrect');
                    this.logAnalyticsChoice(selected, false, inputMethod);
                }
            }
        });
    }
}
