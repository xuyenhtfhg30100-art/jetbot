import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  Monitor,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { AppSettings, settingsManager } from '../utils/settings';
import { soundManager } from '../audio/SoundEffects';
import { voiceNarrator } from '../audio/VoiceNarrator';

interface SettingsModalProps {
  onClose: () => void;
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({
  checked,
  onChange,
}) => (
  <button
    type="button"
    onClick={onChange}
    className={`w-10 h-5 rounded-full flex items-center p-0.5 transition-colors shrink-0 ${
      checked ? 'bg-emerald-500 justify-end' : 'bg-white/15 justify-start'
    }`}
  >
    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
  </button>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<AppSettings>(settingsManager.get());
  const [activeTab, setActiveTab] = useState<'graphics' | 'audio' | 'controls'>('graphics');

  useEffect(() => {
    const unsub = settingsManager.subscribe((s) => setSettings(s));
    return unsub;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyO') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = settingsManager.update({ [key]: value });
    setSettings(updated);

    if (key === 'masterVolume') soundManager.setMasterVolume(value as number);
    if (key === 'musicVolume') soundManager.setMusicVolume(value as number);
    if (key === 'sfxVolume') soundManager.setSfxVolume(value as number);
    if (key === 'isMuted') {
      soundManager.setMuted(value as boolean);
      voiceNarrator.setMuted(value as boolean);
    }
    if (key === 'speechRate') voiceNarrator.setSpeechRate(value as number);
  };

  const handleReset = () => {
    const res = settingsManager.reset();
    setSettings(res);
    soundManager.setMasterVolume(res.masterVolume);
    soundManager.setMusicVolume(res.musicVolume);
    soundManager.setSfxVolume(res.sfxVolume);
    soundManager.setMuted(res.isMuted);
    voiceNarrator.setSpeechRate(res.speechRate);
    voiceNarrator.setMuted(res.isMuted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md select-none">
      <div className="relative w-full max-w-xl bg-slate-950/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-base font-display font-bold text-white">Cài đặt</h2>
            <p className="text-xs text-slate-400">Đồ họa, âm thanh và điều khiển</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Đóng (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clean Tab Bar */}
        <div className="flex px-6 border-b border-white/10 gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('graphics')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'graphics'
                ? 'border-white text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Đồ họa</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'audio'
                ? 'border-white text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Âm thanh</span>
          </button>

          <button
            onClick={() => setActiveTab('controls')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'controls'
                ? 'border-white text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Điều khiển</span>
          </button>
        </div>

        {/* Tab Body (Hairline dividers instead of nested cards) */}
        <div className="px-6 py-2 overflow-y-auto flex-1 text-sm">
          {activeTab === 'graphics' && (
            <div className="divide-y divide-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
                <div>
                  <div className="font-medium text-white">Chất lượng hiển thị</div>
                  <div className="text-xs text-slate-400">Độ nét và tỉ lệ khung hình</div>
                </div>
                <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                  {(['low', 'medium', 'high'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => updateSetting('graphicsQuality', q)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        settings.graphicsQuality === q
                          ? 'bg-white text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {q === 'low' ? 'Thấp' : q === 'medium' ? 'Chuẩn' : 'Cao'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="font-medium text-white">Đổ bóng thời gian thực</div>
                  <div className="text-xs text-slate-400">Đổ bóng mềm từ robot và công trình</div>
                </div>
                <ToggleSwitch
                  checked={settings.shadows}
                  onChange={() => updateSetting('shadows', !settings.shadows)}
                />
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="font-medium text-white">Hạt ánh sáng không gian</div>
                  <div className="text-xs text-slate-400">Các điểm sáng lơ lửng trong sa bàn</div>
                </div>
                <ToggleSwitch
                  checked={settings.ambientParticles}
                  onChange={() => updateSetting('ambientParticles', !settings.ambientParticles)}
                />
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="font-medium text-white">Tia quét RPLIDAR 360°</div>
                  <div className="text-xs text-slate-400">Vòng tia laser quanh cảm biến đỉnh xe</div>
                </div>
                <ToggleSwitch
                  checked={settings.lidarScanRing}
                  onChange={() => updateSetting('lidarScanRing', !settings.lidarScanRing)}
                />
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="font-medium text-white">Đèn pha LED phía trước</div>
                  <div className="text-xs text-slate-400">Chiếu sáng mặt đường trước JetBot</div>
                </div>
                <ToggleSwitch
                  checked={settings.headlights}
                  onChange={() => updateSetting('headlights', !settings.headlights)}
                />
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="divide-y divide-white/5">
              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="font-medium text-white">Tắt toàn bộ âm thanh</div>
                  <div className="text-xs text-slate-400">Phím tắt: M</div>
                </div>
                <ToggleSwitch
                  checked={settings.isMuted}
                  onChange={() => updateSetting('isMuted', !settings.isMuted)}
                />
              </div>

              <div className="py-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Âm lượng tổng</span>
                  <span className="text-slate-400 tabular-nums">{settings.masterVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.masterVolume}
                  onChange={(e) => updateSetting('masterVolume', Number(e.target.value))}
                  className="w-full accent-emerald-400 h-1 bg-white/10 rounded-full cursor-pointer"
                />
              </div>

              <div className="py-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Nhạc nền</span>
                  <span className="text-slate-400 tabular-nums">{settings.musicVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.musicVolume}
                  onChange={(e) => updateSetting('musicVolume', Number(e.target.value))}
                  className="w-full accent-emerald-400 h-1 bg-white/10 rounded-full cursor-pointer"
                />
              </div>

              <div className="py-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Hiệu ứng động cơ &amp; va chạm</span>
                  <span className="text-slate-400 tabular-nums">{settings.sfxVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.sfxVolume}
                  onChange={(e) => updateSetting('sfxVolume', Number(e.target.value))}
                  className="w-full accent-emerald-400 h-1 bg-white/10 rounded-full cursor-pointer"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
                <div>
                  <div className="font-medium text-white">Tốc độ giọng thuyết minh</div>
                  <div className="text-xs text-slate-400">Giọng đọc tiếng Việt khi bấm P</div>
                </div>
                <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                  {[0.8, 1.0, 1.2].map((r) => (
                    <button
                      key={r}
                      onClick={() => updateSetting('speechRate', r)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        settings.speechRate === r
                          ? 'bg-white text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {r === 0.8 ? '0.8x' : r === 1.0 ? '1.0x' : '1.2x'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="divide-y divide-white/5">
              <div className="py-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Độ nhạy xoay camera</span>
                  <span className="text-slate-400 tabular-nums">{settings.orbitSensitivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.orbitSensitivity}
                  onChange={(e) => updateSetting('orbitSensitivity', Number(e.target.value))}
                  className="w-full accent-emerald-400 h-1 bg-white/10 rounded-full cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="font-medium text-white">Đảo trục nhìn dọc</div>
                  <div className="text-xs text-slate-400">Đảo hướng kéo chuột lên xuống</div>
                </div>
                <ToggleSwitch
                  checked={settings.invertY}
                  onChange={() => updateSetting('invertY', !settings.invertY)}
                />
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="font-medium text-white">Tự động xoay khi soi 360°</div>
                  <div className="text-xs text-slate-400">Xoay chậm quanh mô hình ở chế độ I và P</div>
                </div>
                <ToggleSwitch
                  checked={settings.autoTurntable}
                  onChange={() => updateSetting('autoTurntable', !settings.autoTurntable)}
                />
              </div>

              <div className="py-4 text-xs text-slate-400 grid grid-cols-2 gap-y-2 gap-x-4">
                <div><strong className="text-slate-200 font-medium">WASD</strong> · Di chuyển</div>
                <div><strong className="text-slate-200 font-medium">Space</strong> · Tăng tốc</div>
                <div><strong className="text-slate-200 font-medium">P</strong> · Tách bộ phận</div>
                <div><strong className="text-slate-200 font-medium">C</strong> · Đổi góc nhìn</div>
                <div><strong className="text-slate-200 font-medium">U</strong> · Soi gầm xe</div>
                <div><strong className="text-slate-200 font-medium">I</strong> · Triển lãm 360°</div>
                <div><strong className="text-slate-200 font-medium">E</strong> · Quét trụ dữ liệu</div>
                <div><strong className="text-slate-200 font-medium">M</strong> · Tắt/bật tiếng</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-white hover:bg-slate-200 text-slate-950 font-semibold text-xs transition-colors"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
};
