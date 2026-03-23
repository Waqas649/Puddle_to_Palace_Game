# Puddle to Palace

A browser-based educational game that turns learning challenges into fun, interactive activities for kids.

**[🎮 Play Live Demo](https://waqas649.github.io/Puddle_to_Palace_Game/)**

## Overview

Puddle to Palace helps children practice foundational learning skills through engaging mini-games. Parents or teachers describe a learning challenge, and the app generates an appropriate game activity on the spot.

## Features

- **Letter Reversal** — Practice distinguishing commonly confused letters like b/d and p/q
- **Basic Addition** — Reinforce simple math facts
- **Sight Words** — Recognize and practice high-frequency words
- **Counting Practice** — Build number sense through counting exercises
- **Rhyming Skills** — Develop phonological awareness with rhyming games

## Project Structure

```
Puddle_to_Palace_Game/
├── html/
│   ├── index.html      # Main entry point
│   ├── game.html       # Game screen
│   └── main.html       # Landing page
├── src/
│   ├── game.js         # Game orchestrator
│   ├── gameCore.js     # Core game logic and mechanics
│   ├── dataManager.js  # Game state and data templates
│   ├── uiManager.js    # UI rendering and updates
│   └── utils.js        # Shared utilities
└── assets/
    └── styles.css      # Stylesheet
```

## Getting Started

No build step required. Open `html/index.html` in any modern browser.

```bash
# Using Python's built-in server
python3 -m http.server 8080
# Then open http://localhost:8080/html/index.html
```

Or use the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) VS Code extension.

## Usage

1. Open the app in your browser
2. Select a learning activity from the grid, or type a custom challenge in the text box
3. Click **Generate Game** to start
4. Play through the challenges — the game tracks your score and response times

## Author

**Waqas** — [LinkedIn](https://www.linkedin.com/in/waqas495)

## License

Licensed under the [Apache License 2.0](LICENSE).
