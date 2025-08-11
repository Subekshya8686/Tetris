# Tetris Game - Code Explanation & Documentation

## Product Introduction

This is a fully-featured **Tetris game** built with React and modern web technologies. The game provides a classic Tetris experience with enhanced visual effects, responsive controls, and modern UI design. Players can enjoy the traditional block-stacking gameplay with features like:

- Classic Tetris mechanics with all 7 tetromino pieces
- Progressive difficulty scaling based on cleared lines
- Visual effects including particle animations and score popups
- Mobile-friendly touch controls alongside keyboard controls
- Pause/resume functionality
- High score persistence using localStorage
- Next piece preview
- Ghost piece projection for better piece placement

## Dependencies Used

### Core Dependencies

- **React** (`react`, `react-dom`): The main framework for building the user interface
- **Vite**: Build tool and development server for fast development experience

### Development Dependencies

- **ESLint**: Code linting for maintaining code quality
- **@vitejs/plugin-react**: Vite plugin for React support

### Built-in Web APIs Used

- **Canvas API**: For rendering the game board and pieces
- **localStorage**: For persisting high scores
- **Audio Web API**: For sound effects (via AudioManager)
- **Touch Events API**: For mobile touch controls
- **Keyboard Events API**: For desktop controls

## Project Structure

```
src/TetrisApp/
├── TetrisGame.jsx          # Main game component
├── TetrisGame.module.css   # Styles for the game
├── AudioManager.js         # Sound effects management
├── Particle.jsx            # Particle effect component
├── Particle.css            # Particle animations
├── ScorePopup.jsx          # Score display component
├── ScorePopup.css          # Score popup styles
└── index.js                # Entry point/exports
```

## Components Created

### 1. TetrisGame (Main Component)

**Location**: `TetrisGame.jsx`
**Purpose**: The core game component that manages all game logic, rendering, and user interactions.

**Key Responsibilities**:

- Game state management (board, pieces, score, etc.)
- Game loop implementation using `setInterval`
- Collision detection and piece movement
- Line clearing logic with scoring
- Canvas-based rendering of game board and pieces
- User input handling (keyboard and touch)
- UI overlay management (start screen, game over, pause)

### 2. Particle Component

**Location**: `Particle.jsx` + `Particle.css`
**Purpose**: Creates animated particle effects when lines are cleared.

**Features**:

- CSS-based animations for particles
- Colored particles based on cleared block colors
- Automatic cleanup after animation completes

### 3. ScorePopup Component

**Location**: `ScorePopup.jsx` + `ScorePopup.css`
**Purpose**: Displays animated score notifications when lines are cleared.

**Features**:

- Shows score values (100 per line, 800 for Tetris)
- Fade-out animation
- Positioned at the cleared line location

### 4. AudioManager

**Location**: `AudioManager.js`
**Purpose**: Manages sound effects for game actions.

**Sound Events**:

- Piece movement
- Piece rotation
- Line clearing
- Tetris (4-line clear)
- Hard drop
- Game over

## Code Logic Breakdown

### 1. Game Constants and Configuration

```javascript
const BOARD_WIDTH = 10; // Standard Tetris board width
const BOARD_HEIGHT = 20; // Standard Tetris board height
const BLOCK_SIZE = 30; // Pixel size of each block

// All 7 Tetris pieces with their shapes and colors
const TETROMINOES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "cyan",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "blue",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "orange",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "yellow",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: "green",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "purple",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: "red",
  },
};
```

### 2. State Management

The component uses React hooks to manage 13 different state variables:

```javascript
const [board, setBoard] =
  useState(/* 20x10 grid initialized with 'transparent' */);
const [currentPiece, setCurrentPiece] = useState(null);
const [nextPiece, setNextPiece] = useState(null);
const [score, setScore] = useState(0);
const [gameOver, setGameOver] = useState(false);
const [gameStarted, setGameStarted] = useState(false);
const [linesCleared, setLinesCleared] = useState(0);
const [gameSpeed, setGameSpeed] = useState(1000);
const [particles, setParticles] = useState([]);
const [popups, setPopups] = useState([]);
const [danger, setDanger] = useState(false);
const [paused, setPaused] = useState(false);
const [highScore, setHighScore] = useState(/* loaded from localStorage */);
```

### 3. Core Game Logic Functions

#### Collision Detection

```javascript
const checkCollision = useCallback(
  (piece, x, y, shape = piece.shape) => {
    // Checks if a piece at position (x,y) would collide with:
    // - Board boundaries (left, right, bottom)
    // - Existing blocks on the board
    // Returns true if collision detected, false otherwise
  },
  [board]
);
```

#### Piece Rotation

```javascript
const rotate = useCallback((piece) => {
  // Implements 90-degree clockwise rotation
  // Uses matrix transposition: rotated[j][N-1-i] = original[i][j]
}, []);
```

#### Line Clearing

```javascript
const clearLines = useCallback(() => {
  // 1. Identifies complete rows (no 'transparent' cells)
  // 2. Creates particle effects for cleared blocks
  // 3. Shows score popups
  // 4. Updates score and lines cleared count
  // 5. Plays appropriate sound effect
  // 6. Adds empty rows at the top
}, []);
```

### 4. Game Loop Implementation

The main game loop uses `useEffect` with `setInterval`:

```javascript
useEffect(() => {
  if (!gameStarted || gameOver || paused) return;

  function tick() {
    setCurrentPiece((piece) => {
      if (!piece) return piece;

      // Try to move piece down
      const newY = piece.y + 1;
      if (!checkCollision(piece, piece.x, newY)) {
        return { ...piece, y: newY };
      } else {
        // Piece has landed - merge it, clear lines, spawn new piece
        mergePiece(piece);
        clearLines();
        const newPiece = nextPiece || randomPiece();
        setNextPiece(randomPiece());

        // Check for game over
        if (checkCollision(newPiece, newPiece.x, newPiece.y)) {
          setGameOver(true);
          return null;
        }
        return newPiece;
      }
    });
  }

  const interval = setInterval(tick, gameSpeed);
  return () => clearInterval(interval);
}, [gameStarted, gameOver, paused, gameSpeed /* other dependencies */]);
```

### 5. User Input Handling

#### Keyboard Controls

- **Arrow Left/Right**: Move piece horizontally
- **Arrow Up**: Rotate piece
- **Arrow Down**: Soft drop (faster descent)
- **Spacebar**: Hard drop (instant drop to bottom)

#### Touch Controls (Mobile)

- **Horizontal swipe**: Move left/right
- **Upward swipe**: Rotate
- **Downward swipe**: Soft drop

### 6. Rendering System

The game uses HTML5 Canvas for efficient rendering:

```javascript
useEffect(() => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  // 1. Clear canvas and draw black background
  // 2. Draw grid lines
  // 3. Draw placed blocks from the board state
  // 4. Draw current falling piece
  // 5. Draw ghost piece (preview of where piece will land)
}, [board, currentPiece, checkCollision]);
```

### 7. Difficulty Progression

The game increases difficulty by reducing the fall speed:

```javascript
function getLevel(lines) {
  return Math.floor(lines / 10) + 1;
}

useEffect(() => {
  const level = getLevel(linesCleared);
  setGameSpeed(Math.max(100, 1000 - (level - 1) * 80));
}, [linesCleared]);
```

### 8. Visual Effects System

- **Particles**: Created when lines are cleared, animated with CSS
- **Score Popups**: Show points earned, fade out after display
- **Ghost Piece**: Semi-transparent preview of piece landing position
- **Danger State**: Visual warning when blocks reach near the top

### 9. Data Persistence

High scores are saved to browser's localStorage:

```javascript
const [highScore, setHighScore] = useState(() => {
  const saved = localStorage.getItem("tetrisHighScore");
  return saved ? parseInt(saved, 10) : 0;
});

useEffect(() => {
  if (score > highScore) {
    setHighScore(score);
    localStorage.setItem("tetrisHighScore", score.toString());
  }
}, [score, highScore]);
```

## Performance Optimizations

1. **useCallback**: Memoizes functions to prevent unnecessary re-renders
2. **Canvas Rendering**: Uses Canvas API instead of DOM manipulation for smooth graphics
3. **Effect Cleanup**: Properly cleans up intervals and event listeners
4. **Particle Management**: Automatically removes old particles to prevent memory leaks
5. **Conditional Rendering**: Only renders overlays and effects when needed

## Responsive Design Features

- Touch controls for mobile devices
- Scalable UI components
- Pause functionality for mobile context switching
- Grid-based layout that adapts to different screen sizes

## Sound Integration

The game integrates with an AudioManager for immersive audio feedback:

- Movement sounds for user actions
- Special sound for Tetris (4-line clear)
- Game over sound effect
- All sounds use `void playSFX()` to handle async audio loading

This Tetris implementation showcases modern React development practices while delivering a polished, feature-complete gaming experience that rivals classic Tetris implementations.
