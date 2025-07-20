import React, { useCallback, useEffect, useRef, useState } from 'react';
import { playSFX } from './AudioManager';
import Particle from './Particle';
import './Particle.css';
import ScorePopup from './ScorePopup';
import './ScorePopup.css';
import styles from './TetrisGame.module.css';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

const TETROMINOES = {
  I: { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: 'cyan' },
  J: { shape: [[1,0,0],[1,1,1],[0,0,0]], color: 'blue' },
  L: { shape: [[0,0,1],[1,1,1],[0,0,0]], color: 'orange' },
  O: { shape: [[1,1],[1,1]], color: 'yellow' },
  S: { shape: [[0,1,1],[1,1,0],[0,0,0]], color: 'green' },
  T: { shape: [[0,1,0],[1,1,1],[0,0,0]], color: 'purple' },
  Z: { shape: [[1,1,0],[0,1,1],[0,0,0]], color: 'red' },
};

function getLevel(lines) {
  return Math.floor(lines / 10) + 1;
}

const getGradient = (level) => {
  const gradients = [
    'linear-gradient(135deg, #232526 0%, #414345 100%)',
    'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
    'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)',
    'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
    'linear-gradient(135deg, #f953c6 0%, #b91d73 100%)',
    'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
  ];
  return gradients[(level-1) % gradients.length];
};

const TetrisGame = () => {
  // State
  const [board, setBoard] = useState(Array(BOARD_HEIGHT).fill(0).map(() => Array(BOARD_WIDTH).fill('transparent')));
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
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('tetrisHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Refs
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const touchStartRef = useRef(null);

  // Helpers
  const randomPiece = useCallback(() => {
    const keys = Object.keys(TETROMINOES);
    const key = keys[Math.floor(Math.random() * keys.length)];
    const shape = TETROMINOES[key].shape;
    return {
      shape,
      color: TETROMINOES[key].color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2),
      y: 0,
    };
  }, []);

  const checkCollision = useCallback((piece, x, y, shape = piece.shape) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const boardX = x + c;
          const boardY = y + r;
          if (
            boardX < 0 ||
            boardX >= BOARD_WIDTH ||
            boardY >= BOARD_HEIGHT ||
            (boardY >= 0 && board[boardY][boardX] !== 'transparent')
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, [board]);

  const rotate = useCallback((piece) => {
    const N = piece.shape.length;
    const rotated = Array(N).fill(0).map(() => Array(N).fill(0));
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        rotated[j][N - 1 - i] = piece.shape[i][j];
      }
    }
    return rotated;
  }, []);

  // Game Logic
  const mergePiece = useCallback((piece) => {
    setBoard(prev => {
      const newBoard = prev.map(row => [...row]);
      piece.shape.forEach((row, r) => {
        row.forEach((val, c) => {
          if (val) {
            const x = piece.x + c;
            const y = piece.y + r;
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
              newBoard[y][x] = piece.color;
            }
          }
        });
      });
      return newBoard;
    });
  }, []);

  const clearLines = useCallback(() => {
    setBoard(prev => {
      const newBoard = prev.filter(row => row.some(cell => cell === 'transparent'));
      const cleared = BOARD_HEIGHT - newBoard.length;
      if (cleared > 0) {
        // Particle and popup effect
        for (let i = 0; i < BOARD_HEIGHT; i++) {
          if (prev[i].every(cell => cell !== 'transparent')) {
            // Add particles for this row
            for (let x = 0; x < BOARD_WIDTH; x++) {
              setParticles(p => [...p, { x: x * BLOCK_SIZE + BLOCK_SIZE/2, y: i * BLOCK_SIZE + BLOCK_SIZE/2, color: prev[i][x], id: Math.random() }]);
            }
            setPopups(p => [...p, { score: cleared === 4 ? 800 : cleared * 100, x: BOARD_WIDTH * BLOCK_SIZE / 2, y: i * BLOCK_SIZE, id: Math.random() }]);
          }
        }
        setLinesCleared(l => l + cleared);
        setScore(s => s + (cleared === 4 ? 800 : cleared * 100));
        void playSFX(cleared === 4 ? 'tetris' : 'clear');
      }
      while (newBoard.length < BOARD_HEIGHT) {
        newBoard.unshift(Array(BOARD_WIDTH).fill('transparent'));
      }
      return newBoard;
    });
  }, []);

  // Adaptive game speed
  useEffect(() => {
    const level = getLevel(linesCleared);
    setGameSpeed(Math.max(100, 1000 - (level-1)*80));
  }, [linesCleared]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || paused) return;
    function tick() {
      setCurrentPiece(piece => {
        if (!piece) return piece;
        const newY = piece.y + 1;
        if (!checkCollision(piece, piece.x, newY)) {
          return { ...piece, y: newY };
        } else {
          mergePiece(piece);
          clearLines();
          const newPiece = nextPiece || randomPiece();
          setNextPiece(randomPiece());
          if (checkCollision(newPiece, newPiece.x, newPiece.y)) {
            setGameOver(true);
            void playSFX('gameOver');
            return null;
          }
          return newPiece;
        }
      });
    }
    const interval = setInterval(tick, gameSpeed);
    return () => clearInterval(interval);
  }, [gameStarted, gameOver, paused, gameSpeed, checkCollision, mergePiece, clearLines, nextPiece, randomPiece]);

  // Start game
  const startGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(0).map(() => Array(BOARD_WIDTH).fill('transparent')));
    setCurrentPiece(randomPiece());
    setNextPiece(randomPiece());
    setScore(0);
    setLinesCleared(0);
    setGameOver(false);
    setGameStarted(true);
    setParticles([]);
    setPopups([]);
    setPaused(false); // Ensure game is not paused when starting
  };

  // Keyboard controls
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const handle = (e) => {
      if (!currentPiece) return;
      let moved = false;
      let newPiece = { ...currentPiece };
      if (e.key === 'ArrowLeft') {
        newPiece.x--;
        if (!checkCollision(newPiece, newPiece.x, newPiece.y)) {
          setCurrentPiece(newPiece);
          void playSFX('move');
        }
      } else if (e.key === 'ArrowRight') {
        newPiece.x++;
        if (!checkCollision(newPiece, newPiece.x, newPiece.y)) {
          setCurrentPiece(newPiece);
          void playSFX('move');
        }
      } else if (e.key === 'ArrowDown') {
        newPiece.y++;
        if (!checkCollision(newPiece, newPiece.x, newPiece.y)) {
          setCurrentPiece(newPiece);
          void playSFX('move');
        }
      } else if (e.key === 'ArrowUp') {
        const rotated = rotate(currentPiece);
        if (!checkCollision(currentPiece, currentPiece.x, currentPiece.y, rotated)) {
          setCurrentPiece({ ...currentPiece, shape: rotated });
          void playSFX('rotate');
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        let dropY = currentPiece.y;
        while (!checkCollision(currentPiece, currentPiece.x, dropY + 1)) {
          dropY++;
        }
        setCurrentPiece({ ...currentPiece, y: dropY });
        void playSFX('drop');
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [currentPiece, checkCollision, rotate, gameStarted, gameOver]);

  // Touch controls for mobile
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const handleTouchEnd = (e) => {
      if (!touchStartRef.current) return;
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > 30) {
          // Right
          let newPiece = { ...currentPiece, x: currentPiece.x + 1 };
          if (!checkCollision(newPiece, newPiece.x, newPiece.y)) {
            setCurrentPiece(newPiece);
            void playSFX('move');
          }
        } else if (dx < -30) {
          // Left
          let newPiece = { ...currentPiece, x: currentPiece.x - 1 };
          if (!checkCollision(newPiece, newPiece.x, newPiece.y)) {
            setCurrentPiece(newPiece);
            void playSFX('move');
          }
        }
      } else {
        // Vertical swipe
        if (dy > 30) {
          // Down
          let newPiece = { ...currentPiece, y: currentPiece.y + 1 };
          if (!checkCollision(newPiece, newPiece.x, newPiece.y)) {
            setCurrentPiece(newPiece);
            void playSFX('move');
          }
        } else if (dy < -30) {
          // Up (rotate)
          const rotated = rotate(currentPiece);
          if (!checkCollision(currentPiece, currentPiece.x, currentPiece.y, rotated)) {
            setCurrentPiece({ ...currentPiece, shape: rotated });
            void playSFX('rotate');
          }
        }
      }
      touchStartRef.current = null;
    };
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentPiece, checkCollision, rotate, gameStarted, gameOver]);

  // Remove expired particles/popups
  useEffect(() => {
    if (!particles.length && !popups.length) return;
    const timeout = setTimeout(() => {
      setParticles(p => p.slice(10));
      setPopups(p => p.slice(1));
    }, 800);
    return () => clearTimeout(timeout);
  }, [particles, popups]);

  // Danger pulse
  useEffect(() => {
    setDanger(board.slice(0, 4).some(row => row.some(cell => cell !== 'transparent')));
  }, [board]);

  // Update high score if needed
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('tetrisHighScore', score.toString());
    }
  }, [score, highScore]);

  // Draw board and piece
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw solid black background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw white grid lines
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * BLOCK_SIZE, 0);
      ctx.lineTo(x * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * BLOCK_SIZE);
      ctx.lineTo(BOARD_WIDTH * BLOCK_SIZE, y * BLOCK_SIZE);
      ctx.stroke();
    }
    ctx.restore();
    // Draw board
    board.forEach((row, y) => {
      row.forEach((color, x) => {
        if (color !== 'transparent') {
          ctx.fillStyle = color;
          ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      });
    });
    // Draw current piece
    if (currentPiece) {
      ctx.fillStyle = currentPiece.color;
      currentPiece.shape.forEach((row, r) => {
        row.forEach((val, c) => {
          if (val) {
            ctx.fillRect((currentPiece.x + c) * BLOCK_SIZE, (currentPiece.y + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.strokeRect((currentPiece.x + c) * BLOCK_SIZE, (currentPiece.y + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          }
        });
      });
      // Draw ghost
      let ghostY = currentPiece.y;
      while (!checkCollision(currentPiece, currentPiece.x, ghostY + 1)) ghostY++;
      ctx.fillStyle = currentPiece.color + '40';
      currentPiece.shape.forEach((row, r) => {
        row.forEach((val, c) => {
          if (val) {
            ctx.fillRect((currentPiece.x + c) * BLOCK_SIZE, (ghostY + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          }
        });
      });
    }
  }, [board, currentPiece, checkCollision]);

  // UI
  const level = getLevel(linesCleared);
  // const hue = (score / 100) % 360;
  // const canvasBg = `hsl(${hue}, 50%, 15%)`;
  const canvasBg = '#000'; // solid black background

  // Pause button handler
  const handlePause = () => setPaused(true);
  const handleResume = () => setPaused(false);

  return (
    <div className={styles.tetrisRoot}>
      <div className={styles.tetrisContainer}>
        {/* Title */}
        <h1 className={styles.tetrisTitle}>Tetris</h1>
        <div className={styles.tetrisMain}>
          {/* Game Area */}
          <div className={styles.gameArea}>
            <div className={styles.tetrisCanvasBox} style={{ width: BOARD_WIDTH * BLOCK_SIZE, height: BOARD_HEIGHT * BLOCK_SIZE, background: canvasBg, position: 'relative', overflow: 'visible' }}>
              {/* Pause icon button inside the grid, top-right */}
              {gameStarted && !gameOver && !paused && (
                <button
                  style={{ position: 'absolute', top: 12, right: 12, zIndex: 50, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 0.9rem', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center' }}
                  onClick={handlePause}
                  aria-label="Pause"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="4" width="4" height="16" rx="2" fill="white"/>
                    <rect x="15" y="4" width="4" height="16" rx="2" fill="white"/>
                  </svg>
                </button>
              )}
              <canvas
                ref={canvasRef}
                width={BOARD_WIDTH * BLOCK_SIZE}
                height={BOARD_HEIGHT * BLOCK_SIZE}
                className={styles.tetrisCanvas}
                style={{ width: BOARD_WIDTH * BLOCK_SIZE, height: BOARD_HEIGHT * BLOCK_SIZE }}
              />
              {particles.map(p => <Particle key={p.id} x={p.x} y={p.y} color={p.color} />)}
              {popups.map(p => <ScorePopup key={p.id} score={p.score} x={p.x} y={p.y} />)}
              {/* Overlay must be rendered last so it is above everything else */}
              {(gameOver || (!gameStarted && !gameOver)) && (
                <div className={styles.overlay} style={{zIndex: 100}}>
                  {gameOver ? (
                    <>
                      GAME OVER!
                      <button
                        onClick={startGame}
                        className={styles.tetrisButton}
                      >
                        Play Again
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={startGame}
                      className={styles.tetrisButton}
                    >
                      Start Game
                    </button>
                  )}
                </div>
              )}
              {/* Pause overlay */}
              {paused && gameStarted && !gameOver && (
                <div className={styles.overlay} style={{zIndex: 100, background: 'rgba(0,0,0,0.7)'}}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 24 }}>Paused</div>
                  <button
                    onClick={handleResume}
                    className={styles.tetrisButton}
                  >
                    Resume
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Side Panel */}
          <div className={styles.sidePanel}>
            <div className={styles.lines}>
              High Score: <span>{highScore}</span>
            </div>
            <div className={styles.score}>
              Score: <span>{score}</span>
            </div>
            <div className={styles.level}>Level: <span>{level}</span></div>
            <div className={styles.nextPieceTitle}>Next Piece:</div>
            <div className={styles.nextPieceBox}>
              {nextPiece ? (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${nextPiece.shape[0].length}, ${BLOCK_SIZE / 2}px)` }}>
                  {nextPiece.shape.map((row, rIdx) => (
                    <React.Fragment key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 3,
                            backgroundColor: cell !== 0 ? nextPiece.color : 'transparent',
                            border: cell !== 0 ? '1px solid rgba(0,0,0,0.1)' : 'none',
                            margin: 1,
                          }}
                        />
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div style={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 14 }}>
                  No piece
                </div>
              )}
            </div>
            <div className={styles.controls}>
              <p><strong>Controls:</strong></p>
              <ul>
                <li>Arrow Left/Right: Move</li>
                <li>Arrow Up: Rotate</li>
                <li>Arrow Down: Soft Drop</li>
                <li>Spacebar: Hard Drop</li>
                <li>Pause: Pause Button (top right)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TetrisGame; 