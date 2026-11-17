import React from 'react';
import { Volume2, VolumeX, Play, Layers, Sliders, Image, Code2 } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
  onOpenSpecs: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleExploded?: () => void;
  onOpenSettings?: () => void;
  onOpenCode?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  onOpenSpecs,
  isMuted,
  onToggleMute,
  onToggleExploded,
  onOpenSettings,
  onOpenCode,
}) => {
  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* Subtle radial vignette for text legibility without hiding the 3D scene */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950/80 pointer-events-none" />

      {/* Minimal Top Bar */}
      <div className="relative flex items-center justify-between w-full pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-display text-sm font-semibold tracking-wide text-white/90">
            JetBot 3D
          </span>
          <span className="text-slate-600 text-xs">·</span>
          <span className="text-xs text-slate-400">Nexus Rover</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenSpecs}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Ảnh thực tế & Phần cứng"
          >
            <Image className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Ảnh thực tế</span>
          </button>

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Cài đặt (O)"
            >
              <Sliders className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Cài đặt</span>
            </button>
          )}

          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title={isMuted ? 'Bật âm thanh (M)' : 'Tắt âm thanh (M)'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-slate-300" />
            )}
          </button>
        </div>
      </div>

      {/* Minimalist Center-Bottom Lockup so the 3D JetBot stays clear in center */}
      <div className="relative max-w-xl mx-auto text-center flex flex-col items-center mt-auto mb-6">
        <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-white">
          Nexus JetBot
        </h1>

        <p className="mt-2.5 text-sm sm:text-base text-slate-300/90 max-w-md leading-relaxed font-sans">
          Bấm trực tiếp vào từng bộ phận trên xe hoặc nhấn <span className="text-white font-medium">P</span> để tách rời &amp; xem thông tin chi tiết.
        </p>

        {/* Clean Action Pair */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 pointer-events-auto">
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2.5 px-7 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Bắt đầu</span>
          </button>

          {onToggleExploded && (
            <button
              onClick={onToggleExploded}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 text-white font-medium text-sm transition-all active:scale-[0.98]"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Tách bộ phận (P)</span>
            </button>
          )}

          {onOpenCode && (
            <button
              onClick={onOpenCode}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 text-white font-medium text-sm transition-all active:scale-[0.98]"
            >
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Code tự lái (K)</span>
            </button>
          )}
        </div>
      </div>

      {/* Quiet Unboxed Key Hints */}
      <div className="relative w-full text-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span><strong className="text-slate-200 font-medium">WASD</strong> Di chuyển</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span><strong className="text-slate-200 font-medium">Space</strong> Tăng tốc</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span><strong className="text-slate-200 font-medium">P</strong> Tách bộ phận</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span><strong className="text-slate-200 font-medium">K</strong> Code tự lái</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span><strong className="text-slate-200 font-medium">C</strong> Góc nhìn</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span><strong className="text-slate-200 font-medium">O</strong> Cài đặt</span>
        </div>
      </div>
    </div>
  );
};
