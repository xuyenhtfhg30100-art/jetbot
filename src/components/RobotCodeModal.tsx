import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Square, RotateCcw, Crosshair, X, Code2, Terminal } from 'lucide-react';
import { GameEngine } from '../three/GameEngine';
import { ROBOT_CODE_SAMPLES } from '../data/robotCodeSamples';
import { runRobotScript, RobotScriptController } from '../utils/robotScriptRunner';

interface RobotCodeModalProps {
  isOpen: boolean;
  engine: GameEngine | null;
  onClose: () => void;
  onEnsurePlaying: () => void;
  onRunningChange?: (running: boolean) => void;
}

export const RobotCodeModal: React.FC<RobotCodeModalProps> = ({
  isOpen,
  engine,
  onClose,
  onEnsurePlaying,
  onRunningChange,
}) => {
  const [selectedSampleId, setSelectedSampleId] = useState<string>(ROBOT_CODE_SAMPLES[0].id);
  const [code, setCode] = useState<string>(ROBOT_CODE_SAMPLES[0].code);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const controllerRef = useRef<RobotScriptController | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const currentSample =
    ROBOT_CODE_SAMPLES.find((s) => s.id === selectedSampleId) || ROBOT_CODE_SAMPLES[0];

  useEffect(() => {
    onRunningChange?.(isRunning);
  }, [isRunning, onRunningChange]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, error]);

  // Stop any running script if drawer unmounts
  useEffect(() => {
    return () => {
      controllerRef.current?.stop();
      controllerRef.current = null;
      onRunningChange?.(false);
    };
  }, [onRunningChange]);

  const handleStop = useCallback(() => {
    controllerRef.current?.stop();
    controllerRef.current = null;
    engine?.clearAutoControl();
    setIsRunning(false);
  }, [engine]);

  const handleRun = useCallback(() => {
    if (!engine) return;

    // Stop any previous execution first
    controllerRef.current?.stop();
    controllerRef.current = null;

    onEnsurePlaying();
    setError(null);
    setLogs([]);
    setIsRunning(true);

    const controller = runRobotScript(code, engine, {
      onLog: (msg) => {
        setLogs((prev) => [...prev.slice(-40), msg]);
      },
      onError: (errMsg) => {
        setError(errMsg);
      },
      onFinish: () => {
        setIsRunning(false);
        controllerRef.current = null;
      },
    });

    controllerRef.current = controller;
  }, [code, engine, onEnsurePlaying]);

  const handleSelectSample = (sampleId: string) => {
    if (isRunning) {
      handleStop();
    }
    const found = ROBOT_CODE_SAMPLES.find((s) => s.id === sampleId);
    if (found) {
      setSelectedSampleId(found.id);
      setCode(found.code);
      setError(null);
      setLogs([]);
    }
  };

  const handleResetSample = () => {
    if (isRunning) {
      handleStop();
    }
    setCode(currentSample.code);
    setError(null);
    setLogs([]);
  };

  const handleResetCenter = () => {
    if (isRunning) {
      handleStop();
    }
    engine?.resetRoverToCenter();
    setLogs((prev) => [...prev.slice(-40), 'Đã đưa JetBot về tọa độ tâm (0, 0).']);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();

    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const nextCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(nextCode);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      data-no-canvas-wheel="true"
      className="fixed left-4 top-20 bottom-4 sm:bottom-6 w-[calc(100vw-2rem)] sm:w-[400px] z-30 pointer-events-auto bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Code2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-display font-semibold text-sm text-white truncate">
            Tự động lái (Code)
          </span>
          {isRunning && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Đang chạy
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Đóng trình soạn code [K]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Sample Presets */}
      <div className="px-3.5 pt-3 pb-2.5 border-b border-white/10 space-y-2 shrink-0">
        <div className="flex flex-wrap gap-1.5">
          {ROBOT_CODE_SAMPLES.map((sample) => {
            const active = sample.id === selectedSampleId;
            return (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  active
                    ? 'bg-cyan-400 text-slate-950'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {sample.label}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">{currentSample.description}</p>
      </div>

      {/* Code Editor Textarea */}
      <div className="flex-1 min-h-[160px] flex flex-col p-3 gap-2 overflow-hidden">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleTextareaKeyDown}
          spellCheck={false}
          placeholder="// Nhập lệnh điều khiển JetBot ở đây..."
          className="flex-1 w-full resize-none rounded-xl bg-slate-900/90 border border-white/10 focus:border-cyan-400/60 focus:outline-none p-3 font-mono text-[12px] leading-relaxed text-slate-100 placeholder:text-slate-600"
        />

        {/* Quick API Hint */}
        <div className="text-[10px] text-slate-400 leading-relaxed font-mono px-0.5 truncate" title="robot.forward(spd), robot.backward(spd), robot.left(spd), robot.right(spd), robot.setMotors(l, r), robot.moveDistance(m, spd), robot.turnAngle(deg, spd), robot.boost(bool), robot.scan(), robot.getState(), sleep(sec), log(msg)">
          API: <span className="text-cyan-300">robot.moveDistance(m)</span> ·{' '}
          <span className="text-cyan-300">turnAngle(deg)</span> ·{' '}
          <span className="text-cyan-300">setMotors(l,r)</span> ·{' '}
          <span className="text-cyan-300">sleep(s)</span>
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-2 shrink-0">
          {isRunning ? (
            <button
              onClick={handleStop}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-semibold text-xs transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Dừng lại</span>
            </button>
          ) : (
            <button
              onClick={handleRun}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors"
              title="Chạy code (Ctrl + Enter)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Chạy code</span>
            </button>
          )}

          <button
            onClick={handleResetCenter}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs transition-colors"
            title="Đưa robot về tọa độ tâm (0, 0)"
          >
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span>Về tâm</span>
          </button>

          <button
            onClick={handleResetSample}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Khôi phục code mẫu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mini Console Output */}
      <div className="border-t border-white/10 bg-black/40 px-3.5 py-2.5 shrink-0">
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
          <span className="flex items-center gap-1 font-medium text-slate-300">
            <Terminal className="w-3 h-3 text-cyan-400" />
            Nhật ký chạy (Ctrl+Enter)
          </span>
          {(logs.length > 0 || error) && (
            <button
              onClick={() => {
                setLogs([]);
                setError(null);
              }}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              Xóa
            </button>
          )}
        </div>
        <div
          ref={logContainerRef}
          className="h-20 overflow-y-auto font-mono text-[11px] leading-snug space-y-0.5"
        >
          {error && (
            <div className="text-rose-400 break-words">
              Lỗi: {error}
            </div>
          )}
          {logs.length === 0 && !error ? (
            <div className="text-slate-500">
              Chọn mẫu hoặc sửa code rồi nhấn &ldquo;Chạy code&rdquo;...
            </div>
          ) : (
            logs.map((line, i) => (
              <div key={i} className="text-emerald-300/90 break-words">
                &gt; {line}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
