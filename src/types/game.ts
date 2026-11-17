export type GameState = 'title' | 'playing' | 'paused' | 'victory' | 'gameover';

export interface RoverUpgrades {
  boostEfficiency: number; // 1 to 3
  shieldHardening: number; // 1 to 3
  sensorRange: number; // 1 to 3
  quantumDrift: number; // 1 to 3
}

export interface RoverStats {
  speed: number;
  maxSpeed: number;
  shield: number; // 0 - 100
  energy: number; // 0 - 100
  score: number;
  combo: number;
  comboTimer: number;
  coresCollected: number;
  totalCores: number;
  monolithsScanned: number;
  totalMonoliths: number;
  upgrades: RoverUpgrades;
  position: { x: number; y: number; z: number };
  heading: number;
}

export interface GroundingChunk {
  title: string;
  uri: string;
}

export interface IntelDossier {
  summary: string;
  groundingChunks: GroundingChunk[];
  webSearchQueries: string[];
  thinkingAnalysis?: string;
  timestamp: string;
}

export interface TechSector {
  id: string;
  title: string;
  codename: string;
  category: string;
  icon: string;
  description: string;
  defaultPrompt: string;
  worldPos: [number, number, number];
  color: number;
  hexColor: string;
  unlocked: boolean;
  intelDossier?: IntelDossier;
}

export interface DataCoreItem {
  id: number;
  x: number;
  y: number;
  z: number;
  collected: boolean;
  type: 'quantum' | 'neural' | 'energy';
  points: number;
}

export interface HazardItem {
  id: number;
  x: number;
  y: number;
  z: number;
  radius: number;
  type: 'laserPrism' | 'glitchRift' | 'firewallWall';
  angle?: number;
  rotationSpeed?: number;
}

export interface SoundSettings {
  muted: boolean;
  sfxVolume: number;
  ambientVolume: number;
}
