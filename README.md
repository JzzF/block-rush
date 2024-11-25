# GridCrafter

A fast-paced puzzle game for Telegram Mini Apps where players strategically place blocks on an 8x8 grid to clear lines and score points within a 90-second time limit.

## Features

- 🎮 Time Attack Mode: 90 seconds of intense puzzle action
- 📈 Dynamic Scoring: Multipliers increase as time progresses
- 🎯 Strategic Gameplay: Place blocks to clear rows and columns
- 🎵 Engaging Audio: Dynamic sound effects and background music
- 📱 Mobile-Friendly: Optimized for both desktop and mobile play
- 🏆 High Scores: Track your best performances
- 🔄 Quick Restart: Jump right back into the action

## How to Play

1. Select a block from the available options
2. Click or tap on the grid to place the block
3. Clear complete rows or columns to score points
4. Watch out for the timer and increasing multipliers!

## Scoring System

- Phase 1 (90-61s): 1.0x multiplier
- Phase 2 (60-31s): 1.5x multiplier
- Phase 3 (30-0s): 2.0x multiplier

Clear multiple lines at once for combo bonuses!

## Development

### Prerequisites

- Modern web browser with HTML5 Canvas support
- Telegram Mini App environment for full features

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/gridcrafter.git
```

2. Open index.html in a web browser or serve through a local server

### Project Structure

```
gridcrafter/
├── index.html          # Main game HTML
├── css/
│   ├── styles.css      # Core styles
│   └── animations.css  # Animation definitions
├── js/
│   ├── game.js         # Main game logic
│   ├── gameState.js    # Game state management
│   ├── renderer.js     # Canvas rendering
│   ├── config.js       # Game configuration
│   ├── audioManager.js # Sound management
│   └── animationManager.js # Animation system
└── audio/             # Game sound effects
```

## License

MIT License - feel free to use and modify for your own projects!

## Credits

- Game Design & Development: [Your Name]
- Sound Effects: [Source/Attribution]
- Background Music: [Source/Attribution]
