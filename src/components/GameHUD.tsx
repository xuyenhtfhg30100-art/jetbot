import React, { useState, useEffect } from 'react';
import {
  Shield,
  Zap,
  Cpu,
  Radio,
  Search,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Layers,
  Sliders,
  Camera,
  Image,
  Code2,
} from 'lucide-react';
import { RoverStats, TechSector } from '../types/game';

interface GameHUDProps {
  stats: RoverStats;
  nearSector: TechSector | null;
  sectors: TechSector[];
  onTriggerScan: () => void;
  onOpenTerminal: () => void;
  onToggleCamera: () => void;
  cameraMode: 'chase' | 'fpv' | 'underside' | 'inspect';
  onOpenSpecs: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isExploded?: boolean;
  onToggleExploded?: () => void;
  onOpenSettings?: () => void;
  isCodeOpen?: boolean;
  isScriptRunning?: boolean;
  onToggleCode?: () => void;
}

const CAMERA_LABELS: Record<GameHUDProps['cameraMode'], string> = {
  chase: 'Theo sau',
  fpv: 'FPV',
  underside: 'Gầm xe',
  inspect: '360°',
};

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  nearSector,
  sectors,
  onTriggerScan,
  onOpenTerminal,
  onToggleCamera,
  cameraMode,
  onOpenSpecs,
  isMuted,
  onToggleMute,
  isExploded,
  onToggleExploded,
  onOpenSettings,
  isCodeOpen,
  isScriptRunning,
  onToggleCode,
}) => {
  const [minimalHidden, setMinimalHidden] = useState(false);

  // Keyboard shortcut 'H' to hide/show secondary HUD elements
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'KeyH' &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        setMinimalHidden((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden">
      {/* Top Bar: Minimalist Telemetry Left + Compact Toolbar Right */}
      <div className="flex items-start justify-between gap-4 w-full">
        {/* Top-Left: Single Compact Glass Telemetry Panel */}
        <div className="pointer-events-auto bg-slate-950/65 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2.5 space-y-2 min-w-[200px]">
          {/* Thin Shield & Energy Bars */}
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="flex items-center gap-1 text-slate-400">
                  <Shield className="w-3 h-3 text-cyan-400" />
                  Giáp
                </span>
                <span className="tabular-nums font-medium">{Math.round(stats.shield)}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-150 ${
                    stats.shield > 40 ? 'bg-cyan-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${stats.shield}%` }}
                />
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="flex items-center gap-1 text-slate-400">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Năng lượng
                </span>
                <span className="tabular-nums font-medium">{Math.round(stats.energy)}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-100"
                  style={{ width: `${stats.energy}%` }}
                />
              </div>
            </div>
          </div>

          {/* Clean Inline Stats */}
          <div className="flex items-center gap-2.5 text-[11px] text-slate-400 pt-0.5">
            <span className="tabular-nums">
              <strong className="text-white font-medium">{stats.speed}</strong> m/s
            </span>
            <span className="text-slate-600">·</span>
            <span className="tabular-nums flex items-center gap-1">
              <Cpu className="w-3 h-3 text-slate-400" />
              <strong className="text-white font-medium">{stats.coresCollected}</strong>/{stats.totalCores}
            </span>
            <span className="text-slate-600">·</span>
            <span className="tabular-nums flex items-center gap-1">
              <Radio className="w-3 h-3 text-slate-400" />
              <strong className="text-white font-medium">{stats.monolithsScanned}</strong>/{stats.totalMonoliths}
            </span>
          </div>
        </div>

        {/* Top-Right: Compact Score + Clean Icon Toolbar */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <div className="flex items-center gap-1 bg-slate-950/65 backdrop-blur-md border border-white/10 rounded-xl p-1">
            {/* Score readout */}
            <div className="px-3 py-1 flex items-baseline gap-2 border-r border-white/10 mr-0.5">
              <span className="text-sm font-semibold text-white tabular-nums">
                {stats.score.toLocaleString()}
              </span>
              {stats.combo > 1 && (
                <span className="text-[11px] font-medium text-amber-400">
                  x{stats.combo}
                </span>
              )}
            </div>

            {/* Camera View Toggle */}
            <button
              onClick={onToggleCamera}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-white/10 transition-colors"
              title="Đổi góc nhìn (C)"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{CAMERA_LABELS[cameraMode]}</span>
            </button>

            {/* Exploded View Button [P] */}
            {onToggleExploded && (
              <button
                onClick={onToggleExploded}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  isExploded
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
                title="Tách bộ phận & thuyết minh (P)"
              >
                <Layers className={`w-3.5 h-3.5 ${isExploded ? 'text-slate-950' : 'text-cyan-400'}`} />
                <span className="hidden md:inline">Tách [P]</span>
              </button>
            )}

            {/* Autonomous Code Editor Button [K] */}
            {onToggleCode && (
              <button
                onClick={onToggleCode}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  isCodeOpen
                    ? 'bg-cyan-400 text-slate-950 font-semibold'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
                title="Nhập code điều khiển tự động (K)"
              >
                <Code2 className={`w-3.5 h-3.5 ${isCodeOpen ? 'text-slate-950' : 'text-cyan-400'}`} />
                <span className="hidden md:inline">Code [K]</span>
                {isScriptRunning && !isCodeOpen && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            )}

            {/* Real Robot Photos */}
            <button
              onClick={onOpenSpecs}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Ảnh robot thực tế"
            >
              <Image className="w-4 h-4" />
            </button>

            {/* Search / Terminal */}
            <button
              onClick={onOpenTerminal}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Tra cứu công nghệ AI"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Settings */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Cài đặt (O)"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}

            {/* Mute */}
            <button
              onClick={onToggleMute}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title={isMuted ? 'Bật âm thanh (M)' : 'Tắt âm thanh (M)'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Hide/Show Minimal HUD */}
            <button
              onClick={() => setMinimalHidden((prev) => !prev)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Ẩn/hiện radar (H)"
            >
              {minimalHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {cameraMode === 'inspect' && (
            <div className="px-3 py-1 rounded-lg bg-slate-950/70 backdrop-blur-md border border-white/10 text-[11px] text-slate-300">
              Kéo chuột xoay 360° · Lăn chuột phóng to
            </div>
          )}
        </div>
      </div>

      {/* Center Proximity Prompt (Clean & Uncluttered) */}
      {nearSector && (
        <div className="self-center my-auto pointer-events-auto flex flex-col items-center animate-fade-in">
          <div className="px-6 py-4 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-white/15 text-center shadow-2xl flex flex-col items-center gap-2.5 max-w-sm">
            <div className="text-xs font-medium text-cyan-400">Trụ công nghệ gần đây</div>
            <div className="text-lg font-display font-bold text-white">{nearSector.title}</div>
            <button
              onClick={onTriggerScan}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-all active:scale-95"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Quét dữ liệu [E]</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Row: Minimal Radar Corner & Subtle Hint */}
      <div className="flex items-end justify-between w-full">
        {!minimalHidden ? (
          <div className="pointer-events-auto flex items-center gap-3 bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl p-2 pr-3.5">
            <div className="relative w-12 h-12 bg-slate-900/90 border border-white/10 rounded-full flex items-center justify-center overflow-hidden">
              <div className="absolute inset-2 border border-white/5 rounded-full" />
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
              {sectors.map((s) => {
                const relX = (s.worldPos[0] - stats.position.x) / 100;
                const relZ = (s.worldPos[2] - stats.position.z) / 100;
                const clampX = Math.max(-0.85, Math.min(0.85, relX));
                const clampZ = Math.max(-0.85, Math.min(0.85, relZ));
                return (
                  <div
                    key={s.id}
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: s.hexColor,
                      transform: `translate(${clampX * 20}px, ${clampZ * 20}px)`,
                    }}
                    title={s.title}
                  />
                );
              })}
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5 tabular-nums">
              <div className="text-slate-200 font-medium">Hướng {stats.heading}°</div>
              <div>
                {stats.position.x}, {stats.position.z}
              </div>
            </div>
          </div>
        ) : (
          <div />
        )}

        <div className="hidden sm:flex items-center gap-2.5 text-[11px] text-slate-400/80">
          <span>WASD Di chuyển</span>
          <span>·</span>
          <span>P Tách bộ phận</span>
          <span>·</span>
          <span>K Code tự lái</span>
          <span>·</span>
          <span>C Góc nhìn</span>
          <span>·</span>
          <span>H Ẩn radar</span>
        </div>
      </div>
    </div>
  );
};
