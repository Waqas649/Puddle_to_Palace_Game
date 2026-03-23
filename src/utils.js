// Utility functions for the game
class Utils {
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    static getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// DOM helper functions
class DOMUtils {
    static getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with id '${id}' not found`);
        }
        return element;
    }

    static querySelector(selector) {
        return document.querySelector(selector);
    }

    static querySelectorAll(selector) {
        return document.querySelectorAll(selector);
    }

    static createElement(tag, attributes = {}, textContent = '') {
        const element = document.createElement(tag);
        Object.keys(attributes).forEach(key => {
            element.setAttribute(key, attributes[key]);
        });
        if (textContent) {
            element.textContent = textContent;
        }
        return element;
    }

    static addClass(element, className) {
        element.classList.add(className);
    }

    static removeClass(element, className) {
        element.classList.remove(className);
    }

    static toggleClass(element, className) {
        element.classList.toggle(className);
    }

    static setTextContent(element, text) {
        element.textContent = text;
    }

    static setInnerHTML(element, html) {
        element.innerHTML = html;
    }

    static addEventListener(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
        }
    }

    static removeEventListener(element, event, handler) {
        if (element) {
            element.removeEventListener(event, handler);
        }
    }
}
