export enum AppPhase {
  LANDING = 'LANDING',
  TRACKING = 'TRACKING',
  PROPOSAL = 'PROPOSAL',
  SUCCESS = 'SUCCESS',
}

export interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  type: 'heart' | 'rose' | 'sakura';
  opacity: number;
}

export interface LyricLine {
  time: number; // in seconds
  en: string;
  id: string; // Indonesian translation
}
