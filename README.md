# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Enhanced Tetris (React)

A modern, responsive Tetris game built with React, featuring:
- Clean UI with dark mode, rounded corners, and shadowed containers
- Playable on desktop and mobile (responsive layout)
- Pause button (icon, top-right of game grid)
- High Score tracking (localStorage)
- Sound effects (move, rotate, drop, clear, Tetris, game over)
- Animated overlays for game over, pause, and start
- Subtle white grid lines on a black game background
- Next piece preview and level display
- Keyboard and touch controls

## Features

- **Modern UI:** Uses CSS modules for a polished, dark-themed look
- **Pause Button:** Click the pause icon in the top-right of the game grid to pause/resume
- **High Score:** Highest score is saved in your browser (localStorage)
- **Sound Effects:** All actions have distinct sounds (requires user interaction to start audio)
- **Responsive:** Layout adapts for mobile and desktop
- **No Scrollbars:** Game always fits the viewport

## Controls

- **Arrow Left/Right:** Move piece left/right
- **Arrow Up:** Rotate piece
- **Arrow Down:** Soft drop
- **Spacebar:** Hard drop
- **Pause:** Click the pause icon (top-right of grid)
- **Touch:** Swipe left/right/down to move, swipe up to rotate (on mobile)

## Setup & Running

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Start the dev server:**
   ```sh
   npm run dev
   ```
3. **Open in browser:**
   Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal)

## Customization

- **Block size, board size:** Change `BLOCK_SIZE`, `BOARD_WIDTH`, `BOARD_HEIGHT` in `TetrisGame.jsx`
- **Colors and gradients:** Edit `TetrisGame.module.css` for theme tweaks
- **Sound effects:** See `AudioManager.js` to adjust or disable sounds
- **High Score:** Stored in `localStorage` under the key `tetrisHighScore`

## Known Issues
- Audio may require a user gesture to start (browser security)
- If you see errors about audio, ensure you interact with the page first

## License
MIT (or specify your own)
