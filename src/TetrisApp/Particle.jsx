import React from 'react';
import './Particle.css';

const Particle = ({ x, y, color }) => {
  const style = {
    left: x,
    top: y,
    backgroundColor: color,
  };
  return <div className="particle" style={style} />;
};

export default Particle; 