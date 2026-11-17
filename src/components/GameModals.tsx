import React from 'react';
import { RotateCcw, Play, Trophy, Skull } from 'lucide-react';
import { RoverStats } from '../types/game';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onResume, onRestart }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div className="w-full max-w-sm p-6 rounded-2xl bg-slate-950/95 border border-white/10 shadow-2xl text-center space-y-5">
        <div className="space-y-1">
          <div className="text-xs text-slate-400">Tạm dừng</div>
          <h2 className="text-2xl font-display font-bold text-white">JetBot đang nghỉ</h2>
        </div>

        <div className="py-3 border-y border-white/10 text-xs text-slate-400 space-y-1.5 text-left">
          <div><strong className="text-slate-200">WASD / Phím mũi tên</strong> · Di chuyển</div>
          <div><strong className="text-slate-200">Space</strong> · Tăng tốc</div>
          <div><strong className="text-slate-200">P</strong> · Tách bộ phận &amp; thuyết minh</div>
          <div><strong className="text-slate-200">E</strong> · Quét trụ dữ liệu</div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-semibold text-sm transition-colors"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Tiếp tục</span>
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Chơi lại từ đầu</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  stats: RoverStats;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ stats, onRestart }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-sm p-6 rounded-2xl bg-slate-950/95 border border-rose-500/30 shadow-2xl text-center space-y-5">
        <div className="w-11 h-11 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center">
          <Skull className="w-5 h-5 text-rose-400" />
        </div>

        <div>
          <div className="text-xs text-rose-400">Hết năng lượng giáp</div>
          <h2 className="text-2xl font-display font-bold text-white mt-1">
            Mất kết nối JetBot
          </h2>
        </div>

        <div className="flex items-center justify-around py-3 border-y border-white/10 text-xs">
          <div>
            <span className="text-slate-500 block">Điểm</span>
            <span className="text-base text-white font-semibold tabular-nums">
              {stats.score.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Lõi dữ liệu</span>
            <span className="text-base text-white font-semibold tabular-nums">
              {stats.coresCollected}/{stats.totalCores}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Trụ đã quét</span>
            <span className="text-base text-white font-semibold tabular-nums">
              {stats.monolithsScanned}/{stats.totalMonoliths}
            </span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-semibold text-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Khởi động lại</span>
        </button>
      </div>
    </div>
  );
};

interface VictoryModalProps {
  stats: RoverStats;
  onRestart: () => void;
  onContinueExploring: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stats,
  onRestart,
  onContinueExploring,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md p-6 sm:p-7 rounded-2xl bg-slate-950/95 border border-white/15 shadow-2xl text-center space-y-5">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/15 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-emerald-400" />
        </div>

        <div>
          <div className="text-xs text-emerald-400">Hoàn thành nhiệm vụ</div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
            Đã quét toàn bộ trụ
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto">
            Bạn đã thu thập xong dữ liệu từ cả 4 khu vực công nghệ.
          </p>
        </div>

        <div className="flex items-center justify-around py-3 border-y border-white/10 text-xs">
          <div>
            <span className="text-slate-500 block">Tổng điểm</span>
            <span className="text-lg text-white font-semibold tabular-nums">
              {stats.score.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Lõi</span>
            <span className="text-lg text-white font-semibold tabular-nums">
              {stats.coresCollected}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Trụ</span>
            <span className="text-lg text-emerald-400 font-semibold tabular-nums">
              4/4
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={onContinueExploring}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-colors"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Tiếp tục lái</span>
          </button>

          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Chơi lại</span>
          </button>
        </div>
      </div>
    </div>
  );
};
