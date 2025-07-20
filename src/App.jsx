import React from 'react';
import TetrisGame from './TetrisApp';

function App() {
  return (
    <div
      className="w-screen h-screen min-h-0 min-w-0 max-w-[100vw] max-h-[100vh] flex items-center justify-center bg-gray-900 text-white overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <TetrisGame />
    </div>
  );
}

export default App;
