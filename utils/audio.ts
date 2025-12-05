export const playSound = (type: 'move' | 'win' | 'start') => {
  // Prevent errors in environments without AudioContext
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const now = ctx.currentTime;

  if (type === 'move') {
    // A solid "thock" sound for stone placement
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
    
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === 'win') {
    // Ethereal chord
    const freqs = [261.63, 329.63, 392.00, 523.25]; // C Major
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.1, now + 0.5 + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.01, now + 3);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(now);
      o.stop(now + 3.5);
    });
  } else if (type === 'start') {
    // Deep drone
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(50, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.5);
    gain.gain.linearRampToValueAtTime(0, now + 2);
    
    // Filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, now);
    filter.frequency.linearRampToValueAtTime(500, now + 1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 2);
  }
};