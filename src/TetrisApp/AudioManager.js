import * as Tone from 'tone';

const sfx = {
  move: new Tone.Synth().toDestination(),
  rotate: new Tone.Synth().toDestination(),
  drop: new Tone.Synth().toDestination(),
  clear: new Tone.PolySynth().toDestination(),
  tetris: new Tone.PolySynth().toDestination(),
  gameOver: new Tone.Synth().toDestination(),
};

// SFX settings
sfx.move.oscillator.type = 'triangle';
sfx.rotate.oscillator.type = 'square';
sfx.drop.oscillator.type = 'sine';
sfx.clear.set({ oscillator: { type: 'triangle' } });
sfx.tetris.set({ oscillator: { type: 'triangle' } });
sfx.gameOver.oscillator.type = 'sawtooth';

export async function playSFX(type) {
  await Tone.start(); // Ensure AudioContext is started by user gesture
  switch (type) {
    case 'move':
      sfx.move.triggerAttackRelease('C5', '16n');
      break;
    case 'rotate':
      sfx.rotate.triggerAttackRelease('G4', '16n');
      break;
    case 'drop':
      sfx.drop.triggerAttackRelease('C4', '8n');
      break;
    case 'clear':
      sfx.clear.triggerAttackRelease(['C5', 'E5', 'G5'], '8n');
      break;
    case 'tetris':
      sfx.tetris.triggerAttackRelease(['C6', 'E6', 'G6'], '8n');
      break;
    case 'gameOver':
      sfx.gameOver.triggerAttackRelease('C3', '1s');
      break;
    default:
      break;
  }
} 