/**
 * VENUS TRACKER SERVICE // SYNTROPIC ALIGNMENT
 * Node: Point, TX
 * Target: Morning Star Emergence (March 28, 2026)
 */

export interface VenusPhase {
  status: 'UNDERWORLD' | 'MORNING_STAR';
  countdown: string;
  resonance: number;
  opacity: number;
}

const EMERGENCE_DATE = new Date('2026-03-28T12:00:00Z'); // Solar Noon Sync

export const getVenusStatus = (): VenusPhase => {
  const now = new Date();
  const diff = EMERGENCE_DATE.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      status: 'MORNING_STAR',
      countdown: '00:00:00',
      resonance: 432,
      opacity: 1.0
    };
  }

  // Calculate remaining time for the Underworld Transit
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    status: 'UNDERWORLD',
    countdown: `${days}d ${hours}h ${mins}m ${secs}s`,
    resonance: 144 + (288 * (1 - diff / (8 * 24 * 60 * 60 * 1000))), // Scaling toward 432Hz
    opacity: 0.3 + (0.7 * (1 - diff / (8 * 24 * 60 * 60 * 1000))) // Scaling Glow
  };
};
