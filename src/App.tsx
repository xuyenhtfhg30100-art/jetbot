/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './three/GameEngine';
import { GameState, RoverStats, TechSector } from './types/game';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { TechDossierModal } from './components/TechDossierModal';
import { HardwareSpecsModal } from './components/HardwareSpecsModal';
import { PauseModal, GameOverModal, VictoryModal } from './components/GameModals';
import { JetBotExplodedModal } from './components/JetBotExplodedModal';
import { SettingsModal } from './components/SettingsModal';
import { RobotCodeModal } from './components/RobotCodeModal';
import { soundManager } from './audio/SoundEffects';
import { JETBOT_PARTS } from './data/jetbotParts';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('title');
  const [cameraMode, setCameraMode] = useState<'chase' | 'fpv' | 'underside' | 'inspect'>('chase');
  const [isExploded, setIsExploded] = useState(false);
  const [explodedPartId, setExplodedPartId] = useState<string | null>(null);
  const [explodeDistance, setExplodeDistance] = useState(1.0);
  const [explodeMode, setExplodeMode] = useState<'all' | 'single'>('all');
  const [inspectDistance, setInspectDistance] = useState(4.2);
  const [hoveredPart, setHoveredPart] = useState<{ id: string; x: number; y: number } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCodeOpen, setIsCodeOpen] = useState(false);
  const [isScriptRunning, setIsScriptRunning] = useState(false);
  const [stats, setStats] = useState<RoverStats>({
    speed: 0,
    maxSpeed: 38,
    shield: 100,
    energy: 100,
    score: 0,
    combo: 1,
    comboTimer: 0,
    coresCollected: 0,
    totalCores: 28,
    monolithsScanned: 0,
    totalMonoliths: 4,
    upgrades: {
      boostEfficiency: 1,
      shieldHardening: 1,
      sensorRange: 1,
      quantumDrift: 1,
    },
    position: { x: 0, y: 0, z: 0 },
    heading: 0,
  });

  const [nearSector, setNearSector] = useState<TechSector | null>(null);
  const [dossierSector, setDossierSector] = useState<TechSector | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sectorsList, setSectorsList] = useState<TechSector[]>([]);

  // Mount Three.js engine once in dedicated ref container
  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new GameEngine(mountRef.current, {
      onStatsUpdate: (newStats) => {
        setStats(newStats);
      },
      onStateChange: (newState) => {
        setGameState(newState);
      },
      onNearMonolith: (sector) => {
        setNearSector(sector);
      },
      onTriggerScan: (sector) => {
        setDossierSector(sector);
        setIsDossierOpen(true);
      },
      onExplodedChange: (exploded, activePartId) => {
        setIsExploded(exploded);
        setExplodedPartId(activePartId);
      },
      onExplodeConfigChange: (dist, mode) => {
        setExplodeDistance(dist);
        setExplodeMode(mode);
      },
      onInspectDistanceChange: (dist) => {
        setInspectDistance(dist);
      },
      onHoverPartChange: (partId, x, y) => {
        setHoveredPart(partId ? { id: partId, x, y } : null);
      },
      onToggleSettings: () => {
        setIsSettingsOpen((prev) => !prev);
      },
    });

    engineRef.current = engine;
    setSectorsList(engine.sectors);

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const handleStartGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.setGameState('playing');
      soundManager.playBoost();
      soundManager.startAmbientCyberMusic();
    }
  }, []);

  const handleRestart = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.restartGame();
    }
  }, []);

  const handleResume = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.setGameState('playing');
    }
  }, []);

  const handleTriggerScan = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.triggerScan();
    }
  }, []);

  const handleToggleCamera = useCallback(() => {
    if (engineRef.current) {
      const newMode = engineRef.current.toggleCameraMode();
      setCameraMode(newMode);
    }
  }, []);

  const handleOpenTerminal = useCallback(() => {
    setDossierSector(nearSector || null);
    setIsDossierOpen(true);
  }, [nearSector]);

  const handleCloseTerminal = useCallback(() => {
    setIsDossierOpen(false);
  }, []);

  const handleOpenSpecs = useCallback(() => {
    setIsSpecsOpen(true);
  }, []);

  const handleCloseSpecs = useCallback(() => {
    setIsSpecsOpen(false);
  }, []);

  const handleUnlockSector = useCallback((sectorId: string, dossier: any) => {
    if (engineRef.current) {
      engineRef.current.unlockSector(sectorId, dossier);
      setSectorsList([...engineRef.current.sectors]);
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  }, []);

  const handleToggleExploded = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.toggleExplodedMode();
    }
  }, []);

  const handleSelectExplodedPart = useCallback((partId: string) => {
    if (engineRef.current) {
      engineRef.current.selectPart(partId);
    }
  }, []);

  const handleChangeExplodeDistance = useCallback((dist: number) => {
    engineRef.current?.setExplodeDistance(dist);
  }, []);

  const handleChangeExplodeMode = useCallback((mode: 'all' | 'single') => {
    engineRef.current?.setExplodeMode(mode);
  }, []);

  const handleChangeInspectDistance = useCallback((dist: number) => {
    engineRef.current?.setInspectDistance(dist);
  }, []);

  const handleOpenCodeFromTitle = useCallback(() => {
    handleStartGame();
    setIsCodeOpen(true);
  }, [handleStartGame]);

  const handleToggleCode = useCallback(() => {
    setIsCodeOpen((prev) => !prev);
  }, []);

  const handleEnsurePlayingForCode = useCallback(() => {
    if (engineRef.current) {
      if (engineRef.current.isExplodedMode) {
        engineRef.current.setExplodedMode(false);
      }
      engineRef.current.setGameState('playing');
      soundManager.startAmbientCyberMusic();
    }
  }, []);

  // Global KeyK shortcut to toggle Autonomous Code drawer
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.code === 'KeyK') {
        setIsCodeOpen((prev) => {
          const next = !prev;
          if (next && engineRef.current) {
            if (engineRef.current.isExplodedMode) {
              engineRef.current.setExplodedMode(false);
            }
            if (gameState === 'title') {
              engineRef.current.setGameState('playing');
              soundManager.startAmbientCyberMusic();
            }
          }
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Isolated Three.js WebGL Canvas Mount Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full z-0 pointer-events-auto" />

      {/* Screen Shell Overlays */}
      {gameState === 'title' && !isExploded && (
        <TitleScreen
          onStart={handleStartGame}
          onOpenSpecs={handleOpenSpecs}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onToggleExploded={handleToggleExploded}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenCode={handleOpenCodeFromTitle}
        />
      )}

      {(gameState === 'playing' || gameState === 'paused') && !isExploded && (
        <GameHUD
          stats={stats}
          nearSector={nearSector}
          sectors={sectorsList}
          onTriggerScan={handleTriggerScan}
          onOpenTerminal={handleOpenTerminal}
          onToggleCamera={handleToggleCamera}
          cameraMode={cameraMode}
          onOpenSpecs={handleOpenSpecs}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isExploded={isExploded}
          onToggleExploded={handleToggleExploded}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isCodeOpen={isCodeOpen}
          isScriptRunning={isScriptRunning}
          onToggleCode={handleToggleCode}
        />
      )}

      {/* Pause Screen */}
      {gameState === 'paused' && (
        <PauseModal onResume={handleResume} onRestart={handleRestart} />
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <GameOverModal stats={stats} onRestart={handleRestart} />
      )}

      {/* Victory Screen */}
      {gameState === 'victory' && (
        <VictoryModal
          stats={stats}
          onRestart={handleRestart}
          onContinueExploring={() => setGameState('playing')}
        />
      )}

      {/* Real-time Google Search Grounding & Gemini High-Thinking Dossier Modal */}
      {isDossierOpen && (
        <TechDossierModal
          sector={dossierSector}
          onClose={handleCloseTerminal}
          onUnlockSector={handleUnlockSector}
        />
      )}

      {/* Physical Robot Hardware Reference & 6-Photo Gallery Modal */}
      {isSpecsOpen && (
        <HardwareSpecsModal
          onClose={handleCloseSpecs}
          onInspectPartIn3D={(partId) => {
            setIsSpecsOpen(false);
            engineRef.current?.setExplodeMode('single');
            engineRef.current?.selectPart(partId);
          }}
        />
      )}

      {/* Floating 3D Part Hover Tooltip */}
      {hoveredPart && !isSpecsOpen && !isDossierOpen && !isSettingsOpen && (() => {
        const part = JETBOT_PARTS.find((p) => p.id === hoveredPart.id);
        if (!part) return null;
        return (
          <div
            className="fixed z-40 pointer-events-none px-3 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-white/15 shadow-lg text-xs"
            style={{
              left: Math.min(window.innerWidth - 220, hoveredPart.x + 14),
              top: Math.max(12, hoveredPart.y - 36),
            }}
          >
            <div className="font-medium text-white">
              <span className="text-emerald-400 tabular-nums mr-1.5">
                {String(part.number).padStart(2, '0')}
              </span>
              {part.shortName}
            </div>
            <div className="text-[10px] text-slate-400">Bấm để xem thông tin</div>
          </div>
        );
      })()}

      {/* JetBot Exploded Disassembly & Vietnamese Voice Tour Modal */}
      {isExploded && (
        <JetBotExplodedModal
          activePartId={explodedPartId}
          onSelectPart={handleSelectExplodedPart}
          onClose={handleToggleExploded}
          explodeDistance={explodeDistance}
          onChangeExplodeDistance={handleChangeExplodeDistance}
          explodeMode={explodeMode}
          onChangeExplodeMode={handleChangeExplodeMode}
          inspectDistance={inspectDistance}
          onChangeInspectDistance={handleChangeInspectDistance}
        />
      )}

      {/* Autonomous Code Editor Drawer */}
      <RobotCodeModal
        isOpen={isCodeOpen && !isExploded}
        engine={engineRef.current}
        onClose={() => setIsCodeOpen(false)}
        onEnsurePlaying={handleEnsurePlayingForCode}
        onRunningChange={setIsScriptRunning}
      />

      {/* System Settings & Customization Modal */}
      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
}
