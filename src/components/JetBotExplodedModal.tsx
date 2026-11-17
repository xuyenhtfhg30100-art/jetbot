import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { JETBOT_PARTS, JetBotPart } from '../data/jetbotParts';
import { voiceNarrator } from '../audio/VoiceNarrator';

interface JetBotExplodedModalProps {
  activePartId: string | null;
  onSelectPart: (partId: string) => void;
  onClose: () => void;
  explodeDistance: number;
  onChangeExplodeDistance: (dist: number) => void;
  explodeMode: 'all' | 'single';
  onChangeExplodeMode: (mode: 'all' | 'single') => void;
  inspectDistance: number;
  onChangeInspectDistance: (dist: number) => void;
}

export const JetBotExplodedModal: React.FC<JetBotExplodedModalProps> = ({
  activePartId,
  onSelectPart,
  onClose,
  explodeDistance,
  onChangeExplodeDistance,
  explodeMode,
  onChangeExplodeMode,
  inspectDistance,
  onChangeInspectDistance,
}) => {
  const currentIndex = Math.max(
    0,
    JETBOT_PARTS.findIndex((p) => p.id === activePartId)
  );
  const currentPart: JetBotPart = JETBOT_PARTS[currentIndex] || JETBOT_PARTS[0];

  const [isAutoTour, setIsAutoTour] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(voiceNarrator.getIsMuted());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);
  const autoTourTimeoutRef = useRef<number | null>(null);

  // Subscribe to voice synthesis updates
  useEffect(() => {
    const unsub = voiceNarrator.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => {
      unsub();
      voiceNarrator.stop();
    };
  }, []);

  // Speak current part when selection changes
  const speakCurrentPart = useCallback(
    (part: JetBotPart, onComplete?: () => void) => {
      voiceNarrator.speak(part.voiceText, () => {
        onComplete?.();
      });
    },
    []
  );

  // Handle active part change
  useEffect(() => {
    speakCurrentPart(currentPart, () => {
      if (isAutoTour) {
        autoTourTimeoutRef.current = window.setTimeout(() => {
          const nextIndex = (currentIndex + 1) % JETBOT_PARTS.length;
          onSelectPart(JETBOT_PARTS[nextIndex].id);
        }, 1500);
      }
    });

    return () => {
      if (autoTourTimeoutRef.current) {
        clearTimeout(autoTourTimeoutRef.current);
      }
    };
  }, [currentPart, isAutoTour, currentIndex, onSelectPart, speakCurrentPart]);

  // Keyboard navigation: Arrows Left/Right, M for Mute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.code === 'Escape' && isPhotoZoomed) {
        setIsPhotoZoomed(false);
        return;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        const nextIdx = (currentIndex + 1) % JETBOT_PARTS.length;
        onSelectPart(JETBOT_PARTS[nextIdx].id);
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        const prevIdx = (currentIndex - 1 + JETBOT_PARTS.length) % JETBOT_PARTS.length;
        onSelectPart(JETBOT_PARTS[prevIdx].id);
      } else if (e.code === 'KeyM') {
        const muted = voiceNarrator.toggleMute();
        setIsMuted(muted);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, onSelectPart, isPhotoZoomed]);

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % JETBOT_PARTS.length;
    onSelectPart(JETBOT_PARTS[nextIdx].id);
  };

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + JETBOT_PARTS.length) % JETBOT_PARTS.length;
    onSelectPart(JETBOT_PARTS[prevIdx].id);
  };

  const handleToggleAutoTour = () => {
    if (isAutoTour) {
      setIsAutoTour(false);
      if (autoTourTimeoutRef.current) clearTimeout(autoTourTimeoutRef.current);
    } else {
      setIsAutoTour(true);
      speakCurrentPart(currentPart, () => {
        autoTourTimeoutRef.current = window.setTimeout(() => {
          const nextIdx = (currentIndex + 1) % JETBOT_PARTS.length;
          onSelectPart(JETBOT_PARTS[nextIdx].id);
        }, 1500);
      });
    }
  };

  const handleToggleMute = () => {
    const muted = voiceNarrator.toggleMute();
    setIsMuted(muted);
  };

  const handleReplaySpeech = () => {
    speakCurrentPart(currentPart);
  };

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden">
      {/* Slim Minimal Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 w-full pointer-events-auto">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-950/65 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-display font-semibold text-white text-xs sm:text-sm">
              Cấu tạo JetBot
            </span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-xs text-slate-400 tabular-nums">
              {currentIndex + 1}/{JETBOT_PARTS.length}
            </span>
          </div>

          {/* Segmented Mode Selector: All Parts vs Single Part */}
          <div className="flex items-center gap-1 bg-slate-950/65 backdrop-blur-md border border-white/10 rounded-xl p-1">
            <button
              onClick={() => onChangeExplodeMode('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                explodeMode === 'all'
                  ? 'bg-white/15 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tách đồng thời cả 12 bộ phận"
            >
              Tách toàn bộ
            </button>
            <button
              onClick={() => onChangeExplodeMode('single')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                explodeMode === 'single'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Chỉ tách riêng bộ phận đang chọn"
            >
              Từng phần
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleMute}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/65 backdrop-blur-md border border-white/10 text-xs text-slate-200 hover:bg-white/10 transition-colors"
            title="Bật / Tắt giọng thuyết minh [M]"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-emerald-400 animate-pulse' : 'text-slate-300'}`} />
            )}
            <span className="hidden sm:inline text-[11px]">
              {isMuted ? 'Tắt tiếng' : 'Thuyết minh'}
            </span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-950 hover:bg-slate-200 font-semibold text-xs transition-colors shadow-lg"
            title="Thu gọn lại [P]"
          >
            <X className="w-3.5 h-3.5" />
            <span>Thu gọn [P]</span>
          </button>
        </div>
      </div>

      {/* Minimalist Right Part List */}
      <div className="self-end pointer-events-auto my-auto hidden md:flex flex-col gap-0.5 bg-slate-950/55 backdrop-blur-md border border-white/10 rounded-xl p-1.5 max-h-[52vh] overflow-y-auto">
        {JETBOT_PARTS.map((part, idx) => {
          const isActive = part.id === currentPart.id;
          return (
            <button
              key={part.id}
              onClick={() => onSelectPart(part.id)}
              className={`w-full text-left px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-2 transition-colors ${
                isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span className={`text-[10px] tabular-nums ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="truncate max-w-[130px]">{part.shortName}</span>
            </button>
          );
        })}
      </div>

      {/* Compact Bottom Narration & Distance Card */}
      <div className="w-full max-w-lg mx-auto pointer-events-auto bg-slate-950/75 backdrop-blur-xl border border-white/10 rounded-xl px-3.5 py-2.5 shadow-2xl space-y-2">
        {/* Compact Sliders Strip */}
        <div className="grid grid-cols-2 gap-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onChangeExplodeDistance(explodeDistance - 0.2)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Thu gần khoảng tách"
            >
              <Minimize2 className="w-3 h-3" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[10px] leading-none mb-1">
                <span className="text-slate-400 truncate">Độ tách</span>
                <span className="text-emerald-400 font-medium tabular-nums">
                  {Math.round(explodeDistance * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={2}
                step={0.05}
                value={explodeDistance}
                onChange={(e) => onChangeExplodeDistance(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/15 rounded-full appearance-none cursor-pointer accent-emerald-400 block"
              />
            </div>
            <button
              onClick={() => onChangeExplodeDistance(explodeDistance + 0.2)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Mở rộng khoảng tách"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onChangeInspectDistance(inspectDistance - 0.5)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Phóng lại gần"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[10px] leading-none mb-1">
                <span className="text-slate-400 truncate">Gần / xa</span>
                <span className="text-cyan-400 font-medium tabular-nums">
                  {inspectDistance.toFixed(1)}m
                </span>
              </div>
              <input
                type="range"
                min={1.6}
                max={9.0}
                step={0.1}
                value={inspectDistance}
                onChange={(e) => onChangeInspectDistance(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/15 rounded-full appearance-none cursor-pointer accent-cyan-400 block"
              />
            </div>
            <button
              onClick={() => onChangeInspectDistance(inspectDistance + 0.5)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Thu ra xa"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Compact Title & Playback Controls */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate">
              <span className="tabular-nums text-emerald-400 font-medium">
                {currentPart.number}/{JETBOT_PARTS.length}
              </span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{currentPart.category}</span>
              {isSpeaking && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400 shrink-0">Đang đọc</span>
                </>
              )}
            </div>
            <h3 className="text-sm font-display font-bold text-white truncate">
              {currentPart.name}
            </h3>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 transition-colors"
              title="Bộ phận trước [←]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 transition-colors"
              title="Bộ phận tiếp theo [→]"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleToggleAutoTour}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                isAutoTour
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200'
              }`}
              title="Tự động thuyết minh tuần tự"
            >
              {isAutoTour ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
              <span className="hidden sm:inline">{isAutoTour ? 'Dừng' : 'Tự động'}</span>
            </button>

            <button
              onClick={handleReplaySpeech}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Đọc lại"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 hover:text-white transition-colors"
              title={isCollapsed ? 'Mở rộng thông tin' : 'Thu gọn thông tin'}
            >
              {isCollapsed ? 'Chi tiết' : 'Gọn'}
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="flex gap-3 items-start">
            {/* Real Part Photo Thumbnail (Click to enlarge) */}
            <button
              onClick={() => setIsPhotoZoomed(true)}
              className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden border border-white/15 bg-black group"
              title="Bấm để phóng to ảnh thực tế"
            >
              <img
                src={currentPart.imageUrl}
                alt={currentPart.name}
                style={{ objectPosition: currentPart.imagePosition }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/35 transition-colors flex items-center justify-center">
                <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>

            <div className="flex-1 min-w-0 space-y-1.5">
              {/* Compact Description */}
              <p className="text-[11px] text-slate-300 leading-snug font-sans">
                {currentPart.voiceText}
              </p>

              {/* Compact 2-Col Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-400 pt-1.5 border-t border-white/10">
                {currentPart.specs.map((spec, idx) => (
                  <div key={idx} className="truncate" title={spec}>
                    <span className="text-emerald-400 mr-1" aria-hidden="true">·</span>
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Compact Part Switcher */}
        <div className="flex md:hidden gap-1 overflow-x-auto pt-0.5">
          {JETBOT_PARTS.map((part) => (
            <button
              key={part.id}
              onClick={() => onSelectPart(part.id)}
              className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap shrink-0 transition-colors ${
                part.id === currentPart.id
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {part.number}. {part.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Full-size Part Photo Lightbox */}
      {isPhotoZoomed && (
        <div
          onClick={() => setIsPhotoZoomed(false)}
          className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-slate-950/95 border border-white/15 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="min-w-0">
                <div className="text-[11px] text-emerald-400">
                  Ảnh thực tế · Phần {currentPart.number}/{JETBOT_PARTS.length}
                </div>
                <h4 className="text-sm font-display font-bold text-white truncate">
                  {currentPart.name}
                </h4>
              </div>
              <button
                onClick={() => setIsPhotoZoomed(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-black flex items-center justify-center max-h-[70vh]">
              <img
                src={currentPart.imageUrl}
                alt={currentPart.name}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
