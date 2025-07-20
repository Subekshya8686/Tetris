import React from 'react';
import './ScorePopup.css';

const ScorePopup = ({ score, x, y }) => {
  const style = {
    left: x,
    top: y,
  };
  return (
    <div className="score-popup" style={style}>
      +{score}
    </div>
  );
};

export default ScorePopup; 