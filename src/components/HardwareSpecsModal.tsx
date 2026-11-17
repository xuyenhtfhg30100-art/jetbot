import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { JETBOT_PARTS } from '../data/jetbotParts';

interface HardwareSpecsModalProps {
  onClose: () => void;
  onInspectPartIn3D?: (partId: string) => void;
}

const ROBOT_PHOTOS = [
  {
    url: '/assets/aistudio/1793244628427_7934224854875087571_7934224854875087571_999c5d7b46ec87e4222f865fa0ead56d_876e576c.jpg',
    title: 'Góc chính diện',
    desc: 'Bản mạch nhiều tầng, giá đỡ cọc đồng lục giác, bánh dẫn hướng trước và 2 ăng-ten sau.',
  },
  {
    url: '/assets/aistudio/1793244628469_7934224854875087571_7934224854875087571_26bcdcdbfa9661ab39a6d0933eef784b_32480a93.jpg',
    title: 'Góc trực diện cao',
    desc: 'RPLIDAR trên đỉnh, bo mạch công suất Waveshare và tấm sàn tròn anod xanh lá.',
  },
  {
    url: '/assets/aistudio/1793244628501_7934224854875087571_7934224854875087571_2613f4e85334f8045fe8817a09d6b968_e77c63d3.jpg',
    title: 'Cạnh bên trái',
    desc: 'Mâm đúc chrome xanh dương, lốp cao su gai lớn, khối tản nhiệt và camera trước.',
  },
  {
    url: '/assets/aistudio/1793244628532_7934224854875087571_7934224854875087571_23285d03e94780dd9cc544dfefca76e4_4d8c6a40.jpg',
    title: 'Camera CSI & cáp FFC',
    desc: 'Camera góc rộng gắn pát nhôm xanh cùng cáp dẹt trắng AWM 20706 uốn cong vào bo mạch.',
  },
  {
    url: '/assets/aistudio/1793244628559_7934224854875087571_7934224854875087571_0e20460306e593598b655c7b569f861a_68754907.jpg',
    title: 'Mặt sau & cổng kết nối',
    desc: 'Cổng USB 3.0, Ethernet RJ45, công tắc nguồn và 2 ăng-ten đầu ren đồng SMA.',
  },
  {
    url: '/assets/aistudio/1793244628590_7934224854875087571_7934224854875087571_a832d2c57251180c53fc038304119dc6_6f56ca08.jpg',
    title: 'Nhìn từ trên xuống',
    desc: 'Nắp cảm biến khắc chữ RPLIDAR, khoét vòm bánh xe trên đĩa nhôm xanh đối xứng.',
  },
  {
    url: '/assets/aistudio/1793244628619_7934224854875087571_7934224854875087571_3627f593a484c018f5d2b453b0f88dfe_41a67cb8.jpg',
    title: 'Gầm xe, pin & động cơ',
    desc: 'Khối pin Samsung 18650 xanh dương dưới bo mạch cùng cặp động cơ kim loại và bánh xoay.',
  },
];

export const HardwareSpecsModal: React.FC<HardwareSpecsModalProps> = ({
  onClose,
  onInspectPartIn3D,
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [selectedPartId, setSelectedPartId] = useState<string>(JETBOT_PARTS[0].id);

  const selectedPart =
    JETBOT_PARTS.find((p) => p.id === selectedPartId) || JETBOT_PARTS[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-950/95 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Minimal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="font-display font-bold text-white text-base">
              Ảnh thực tế &amp; phần cứng JetBot
            </h2>
            <p className="text-xs text-slate-400">
              Đối chiếu mô hình 3D với ảnh chụp thực tế · Bấm vào từng bộ phận để xem thông tin
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Photo Viewer */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-7 relative aspect-[4/3] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
              <img
                src={ROBOT_PHOTOS[photoIndex].url}
                alt={ROBOT_PHOTOS[photoIndex].title}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() =>
                  setPhotoIndex((prev) => (prev - 1 + ROBOT_PHOTOS.length) % ROBOT_PHOTOS.length)
                }
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/75 text-white hover:bg-slate-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPhotoIndex((prev) => (prev + 1) % ROBOT_PHOTOS.length)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/75 text-white hover:bg-slate-900 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="md:col-span-5 flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="text-xs text-emerald-400 mb-1 tabular-nums">
                  Ảnh {photoIndex + 1} / {ROBOT_PHOTOS.length}
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-2">
                  {ROBOT_PHOTOS[photoIndex].title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {ROBOT_PHOTOS[photoIndex].desc}
                </p>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {ROBOT_PHOTOS.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPhotoIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border transition-all ${
                      photoIndex === idx
                        ? 'border-emerald-400 opacity-100'
                        : 'border-white/10 opacity-50 hover:opacity-90'
                    }`}
                  >
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive 12-Part Selector + Live Detail Panel */}
          <div className="pt-4 border-t border-white/10 space-y-4">
            <div className="text-xs font-medium text-slate-400">
              12 cụm linh kiện mô hình hóa (chọn để xem chi tiết)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {JETBOT_PARTS.map((part) => {
                const isSelected = part.id === selectedPart.id;
                return (
                  <button
                    key={part.id}
                    onClick={() => {
                      setSelectedPartId(part.id);
                      setPhotoIndex(part.photoGalleryIndex);
                    }}
                    className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-white/12 text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span
                      className={`text-[11px] tabular-nums shrink-0 ${
                        isSelected ? 'text-emerald-400 font-semibold' : 'text-slate-500'
                      }`}
                    >
                      {String(part.number).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-medium truncate">{part.shortName}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Part Detail Info */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
                    <span>{selectedPart.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      Phần {selectedPart.number} / {JETBOT_PARTS.length}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-display font-bold text-white">
                    {selectedPart.name}
                  </h4>
                </div>

                {onInspectPartIn3D && (
                  <button
                    onClick={() => onInspectPartIn3D(selectedPart.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors shrink-0"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Xem trên mô hình 3D</span>
                  </button>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {selectedPart.voiceText}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 pt-2 border-t border-white/5">
                {selectedPart.specs.map((spec, idx) => (
                  <div key={idx} className="text-xs text-slate-300">
                    <span className="text-emerald-400 mr-1.5">·</span>
                    {spec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Bấm trực tiếp vào bộ phận trên mô hình 3D hoặc phím P để tách chi tiết
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-950 font-semibold text-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
