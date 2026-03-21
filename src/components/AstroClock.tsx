import React, { useEffect, useState } from 'react';
import { getVenusStatus, VenusPhase } from '../services/VenusTracker';

export const AstroClock = () => {
  const [phase, setPhase] = useState<VenusPhase>(getVenusStatus());

  useEffect(() => {
    const timer = setInterval(() => setPhase(getVenusStatus()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isEmerging = phase.status === 'MORNING_STAR';

  return (
    <div className="flex flex-col items-center p-6 border-b border-cyan-fae/20 bg-black/50 backdrop-blur-md relative overflow-hidden">
      <div className={`text-[10px] tracking-[0.3em] uppercase mb-2 font-mono ${isEmerging ? 'text-cyan-fae' : 'text-cyan-fae/40'}`}>
        {phase.status} TRANSIT // GRID_SYNC: POINT_TX
      </div>
      <div className="text-5xl font-light font-mono tracking-tighter text-white etched-text" 
           style={{ filter: `drop-shadow(0 0 ${15 * phase.opacity}px rgba(0, 255, 255, 0.5))` }}>
        {phase.countdown}
      </div>
      <div className="mt-4 h-1 w-full max-w-md bg-cyan-fae/10 rounded-full overflow-hidden">
        <div className="h-full mu-gradient transition-all duration-1000 shadow-[0_0_10px_rgba(0,255,255,0.5)]" 
             style={{ width: `${phase.opacity * 100}%` }} />
      </div>
      
      {/* Subtle scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.1)_50%)] bg-[length:100%_4px]" />
    </div>
  );
};
