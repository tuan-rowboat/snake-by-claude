# Snake Game Vue 3 - Refactored

A modern multiplayer Snake game built with Vue 3, TypeScript, and a well-organized component architecture.

## 🏗️ Project Structure

```
src/
├── components/           # Vue components
│   ├── GameMenu.vue     # Main menu with settings
│   ├── GameCanvas.vue   # Game rendering canvas
│   ├── GameOver.vue     # Game over screen
│   └── index.ts         # Component exports
├── types/               # TypeScript type definitions
│   └── game.ts          # Game-related types
├── utils/               # Utility functions
│   ├── constants.ts     # Game constants and configurations
│   ├── drawing.ts       # Canvas drawing utilities
│   ├── gameLogic.ts     # Game logic functions
│   ├── storage.ts       # Local storage utilities
│   └── index.ts         # Utility exports
└── SnakeGame.vue        # Main game component
```

## 🎮 Features

### Game Modes
- **Single Player**: Classic snake game with arrow keys or WASD
- **Multiplayer**: Two players competing on the same board
  - Player 1: Arrow keys (↑ ↓ ← →)
  - Player 2: WASD keys (W A S D)

### Customization
- Multiple snake head shapes (square, circle, triangle, diamond, star)
- Customizable colors for both players
- Different wall patterns (none, simple, cross, maze, random)
- Adjustable game speed (slow, normal, fast)
- Variable number of foods (1-5)

### Special Foods
- 🍎 **Regular Foods**: Apple, Berry, Banana, Cherry, Watermelon (10-30 pts)
- ⭐ **Golden Foods**: High-value collectibles (50-100 pts)
- 🍄 **Mushroom**: Doubles snake length (+5 pts)
- ☠️ **Poison**: Reduces snake length (-10 pts)

## 🔧 Components

### GameMenu.vue
- Game mode selection (single/multiplayer)
- Visual settings configuration
- Controls information
- High scores display
- Food effects reference

### GameCanvas.vue
- Real-time game rendering
- Score display for both players
- Canvas drawing management
- Pause/resume overlay

### GameOver.vue
- Winner announcement (multiplayer)
- Final scores display
- High score celebration
- Play again / menu options

## 🛠️ Utilities

### constants.ts
- Game dimensions and grid settings
- Food types and properties
- Wall patterns
- Color palettes
- Speed configurations

### drawing.ts
- Shape rendering functions
- Snake eye drawing
- Grid and wall rendering
- Pause overlay graphics

### gameLogic.ts
- Random wall generation
- Food spawning logic
- Collision detection
- Snake movement mechanics
- Direction validation

### storage.ts
- High score persistence
- Local storage management
- Score updates and sorting

## 🎯 Type Safety

All components and utilities are fully typed with TypeScript:

- `Position`: X/Y coordinates
- `Direction`: Movement vectors
- `Food`: Food items with types
- `GameState`: Menu/playing/paused/gameOver
- `GameMode`: Single/multiplayer
- `GameSettings`: All customizable options
- `GameProgress`: Live game state

## 🚀 Benefits of Refactoring

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Utilities can be easily tested and reused
3. **Type Safety**: Full TypeScript coverage prevents runtime errors
4. **Maintainability**: Clear separation of concerns
5. **Testability**: Pure functions are easy to unit test
6. **Scalability**: Easy to add new features or game modes

## 🎮 How to Play

1. Select game mode (Single Player or Two Players)
2. Customize your snake colors and game settings
3. Click "Start Game" to begin
4. Use controls to move your snake and collect food
5. Avoid walls, obstacles, and other snakes
6. Try to achieve the highest score!

## 🏆 Multiplayer Rules

- Both players share the same food
- Collision with the other player results in death
- Head-to-head collisions eliminate both players
- Winner is determined by who survives longest
- Ties are possible if both players die simultaneously

Enjoy the game! 🐍✨
