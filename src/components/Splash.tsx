import { useEffect, useState } from 'react';

interface SplashProps {
  onDone: () => void;
}

export function Splash({ onDone }: SplashProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 900);
    const t3 = setTimeout(onDone, 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className="fixed inset-0 bg-tekno-bg flex flex-col items-center justify-center z-50">
      <div className="relative flex items-center justify-center mb-8">
        <div
          className="absolute w-32 h-32 rounded-full border-2 border-tekno-primary/30 animate-pulse-glow"
          style={{ transition: 'opacity 0.5s', opacity: phase >= 1 ? 1 : 0 }}
        />
        <div
          className="absolute w-24 h-24 rounded-full border border-tekno-cyan/40"
          style={{ transition: 'opacity 0.5s', opacity: phase >= 1 ? 1 : 0 }}
        />
        <div
          className="text-5xl font-bold text-gradient"
          style={{ transition: 'opacity 0.5s, transform 0.5s', opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? 'scale(1)' : 'scale(0.8)' }}
        >
          T
        </div>
      </div>
      <h1
        className="text-2xl font-bold text-tekno-text tracking-tight"
        style={{ transition: 'opacity 0.4s', opacity: phase >= 2 ? 1 : 0 }}
      >
        Türkmen AI
      </h1>
      <p
        className="text-sm text-tekno-textdim mt-1 tracking-widest uppercase"
        style={{ transition: 'opacity 0.4s', opacity: phase >= 2 ? 1 : 0 }}
      >
        by TekNova
      </p>
    </div>
  );
}
