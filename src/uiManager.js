// UI management and interactions
class UIManager {
    constructor() {
        this.notificationContainer = DOMUtils.getElement('notificationContainer');
    }

    // Show notification
    showNotification(title, message, type = 'info', duration = 4000) {
        const notification = DOMUtils.createElement('div', { class: `notification ${type}` });

        // Get appropriate emoji based on type
        let emoji = '';
        switch(type) {
            case 'success':
                emoji = '🎉';
                break;
            case 'level-up':
                emoji = '🎓';
                break;
            case 'info':
                emoji = 'ℹ️';
                break;
            default:
                emoji = '🎮';
        }

        DOMUtils.setInnerHTML(notification, `
            <button class="notification-close" onclick="this.parentNode.remove()">×</button>
            <div class="notification-content">
                <div class="notification-title">
                    <span>${emoji}</span>
                    <span>${title}</span>
                </div>
                <div class="notification-message">${message}</div>
            </div>
        `);

        this.notificationContainer.appendChild(notification);

        // Auto-remove after specified duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('sliding-out');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, duration);
    }

    // Update score display
    updateScoreDisplay(score) {
        const scoreElement = DOMUtils.querySelector('.score');
        if (scoreElement) {
            DOMUtils.setTextContent(scoreElement, `Score: ${score}`);
        }
    }

    // Update progress ring
    updateProgressRing(selectedCount, totalTargets) {
        const progressFill = DOMUtils.querySelector('.progress-ring-fill');
        const progressText = DOMUtils.querySelector('.progress-text');

        if (progressFill && progressText) {
            const circumference = 2 * Math.PI * 50;
            progressFill.style.strokeDasharray = `${circumference * (selectedCount / totalTargets)} ${circumference}`;
            DOMUtils.setTextContent(progressText, `${selectedCount}/${totalTargets}`);
        }
    }

    // Show input section
    showInputSection() {
        const inputSection = DOMUtils.getElement('inputSection');
        const gameArea = DOMUtils.getElement('gameArea');
        const activitySection = DOMUtils.getElement('activitySection');

        if (inputSection && gameArea) {
            inputSection.style.display = 'block';
            gameArea.style.display = 'none';
        }
        if (activitySection) {
            activitySection.style.display = 'block';
        }
    }

    // Show game area
    showGameArea() {
        const inputSection = DOMUtils.getElement('inputSection');
        const gameArea = DOMUtils.getElement('gameArea');
        const activitySection = DOMUtils.getElement('activitySection');

        if (inputSection && gameArea) {
            inputSection.style.display = 'none';
            gameArea.style.display = 'block';
            console.log('Game area shown successfully');
        } else {
            console.error('Could not find inputSection or gameArea elements');
        }
        if (activitySection) {
            activitySection.style.display = 'none';
        }
    }

    // Set prompt input value
    setPromptInput(text) {
        const promptInput = DOMUtils.getElement('promptInput');
        if (promptInput) {
            promptInput.value = text;
        }
    }

    // Get prompt input value
    getPromptInput() {
        const promptInput = DOMUtils.getElement('promptInput');
        return promptInput ? promptInput.value.trim() : '';
    }

    // Update game content
    updateGameContent(html) {
        const gameContent = DOMUtils.getElement('gameContent');
        if (gameContent) {
            DOMUtils.setInnerHTML(gameContent, html);
            console.log('Game content updated successfully:', html.substring(0, 100) + '...');
        } else {
            console.error('gameContent element not found for update');
        }
    }

    // Update game play area
    updateGamePlayArea(html) {
        const gamePlayArea = DOMUtils.getElement('gamePlayArea');
        if (gamePlayArea) {
            console.log('Found gamePlayArea element:', gamePlayArea);
            DOMUtils.setInnerHTML(gamePlayArea, html);
            console.log('Game play area updated successfully');
        } else {
            console.error('gamePlayArea element not found for update');
            // Debug: list all elements with id containing 'game'
            const allGameElements = document.querySelectorAll('[id*="game"]');
            console.log('All game-related elements:', Array.from(allGameElements).map(el => `${el.id}: ${el.tagName}`));
        }
    }

    // Add event listeners to elements
    addEventListener(selector, event, handler) {
        const elements = DOMUtils.querySelectorAll(selector);
        elements.forEach(element => {
            element.addEventListener(event, handler);
        });
    }

    // Remove event listeners from elements
    removeEventListener(selector, event, handler) {
        const elements = DOMUtils.querySelectorAll(selector);
        elements.forEach(element => {
            element.removeEventListener(event, handler);
        });
    }

    // Animate element
    animateElement(element, animationClass, duration = 500) {
        DOMUtils.addClass(element, animationClass);
        setTimeout(() => {
            DOMUtils.removeClass(element, animationClass);
        }, duration);
    }

    // Highlight target letter
    highlightTargetLetter(letter) {
        return `<span class="target-highlight">${letter}</span>`;
    }

    // Create instruction HTML
    createInstruction(text, targetLetter = null) {
        let instructionText = text;
        if (targetLetter) {
            instructionText = instructionText.replace('${targetLetter}', this.highlightTargetLetter(targetLetter));
        }
        return `<div class="instruction">${instructionText}</div>`;
    }

    // Create level selector HTML
    createLevelSelector(currentLevel) {
        return `
            <div class="level-selector">
                <button class="level-btn ${currentLevel === 1 ? 'active' : ''}" data-level="1">
                    📝 Single Letters
                </button>
                <button class="level-btn ${currentLevel === 2 ? 'active' : ''}" data-level="2">
                    🔤 Words
                </button>
                <button class="level-btn ${currentLevel === 3 ? 'active' : ''}" data-level="3">
                    🔢 Numbers
                </button>
            </div>
        `;
    }

    // Create progress ring HTML
    createProgressRing(selectedCount, totalTargets) {
        const circumference = 2 * Math.PI * 50;
        const dashArray = `${circumference * (selectedCount / Math.max(totalTargets, 1))} ${circumference}`;

        return `
            <div class="progress-ring">
                <svg class="progress-ring-circle" width="120" height="120">
                    <circle class="progress-ring-bg" cx="60" cy="60" r="50"></circle>
                    <circle class="progress-ring-fill" cx="60" cy="60" r="50" stroke-dasharray="${dashArray}"></circle>
                </svg>
                <div class="progress-text">${selectedCount}/${totalTargets}</div>
            </div>
        `;
    }
}
