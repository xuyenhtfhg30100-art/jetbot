/**
 * App Settings & Preferences Manager
 * Persists graphics, sound, and control preferences in localStorage.
 */

export interface AppSettings {
  // Graphics
  graphicsQuality: 'high' | 'medium' | 'low';
  shadows: boolean;
  ambientParticles: boolean;
  lidarScanRing: boolean;
  headlights: boolean;

  // Audio
  isMuted: boolean;
  masterVolume: number; // 0 - 100
  musicVolume: number; // 0 - 100
  sfxVolume: number; // 0 - 100
  speechRate: number; // 0.8 - 1.3

  // Controls & Camera
  orbitSensitivity: number; // 0.5 - 2.0
  invertY: boolean;
  autoTurntable: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  graphicsQuality: 'high',
  shadows: true,
  ambientParticles: true,
  lidarScanRing: true,
  headlights: true,

  isMuted: false,
  masterVolume: 80,
  musicVolume: 60,
  sfxVolume: 85,
  speechRate: 1.0,

  orbitSensitivity: 1.0,
  invertY: false,
  autoTurntable: true,
};

const STORAGE_KEY = 'jetbot_nexus_settings_v1';

class SettingsManager {
  private current: AppSettings;
  private listeners = new Set<(settings: AppSettings) => void>();

  constructor() {
    this.current = this.load();
  }

  private load(): AppSettings {
    if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS };
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback to default
    }
    return { ...DEFAULT_SETTINGS };
  }

  public get(): AppSettings {
    return { ...this.current };
  }

  public update(patch: Partial<AppSettings>): AppSettings {
    this.current = { ...this.current, ...patch };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.current));
    } catch {}
    this.notify();
    return { ...this.current };
  }

  public reset(): AppSettings {
    this.current = { ...DEFAULT_SETTINGS };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.current));
    } catch {}
    this.notify();
    return { ...this.current };
  }

  public subscribe(cb: (settings: AppSettings) => void): () => void {
    this.listeners.add(cb);
    cb(this.current);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.current));
  }
}

export const settingsManager = new SettingsManager();
