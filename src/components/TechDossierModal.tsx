import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  ExternalLink,
  BrainCircuit,
  Sparkles,
  Globe,
  Loader2,
  Zap,
} from 'lucide-react';
import { TechSector, GroundingChunk } from '../types/game';

interface TechDossierModalProps {
  sector: TechSector | null;
  onClose: () => void;
  onUnlockSector: (sectorId: string, dossier: any) => void;
}

export const TechDossierModal: React.FC<TechDossierModalProps> = ({
  sector,
  onClose,
  onUnlockSector,
}) => {
  const [activeTab, setActiveTab] = useState<'grounding' | 'thinking'>('grounding');
  const [query, setQuery] = useState(
    sector?.defaultPrompt || 'Các xu hướng công nghệ nổi bật và mới nhất trong năm 2026 là gì?'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [groundingText, setGroundingText] = useState<string>('');
  const [webQueries, setWebQueries] = useState<string[]>([]);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);

  const [thinkingPrompt, setThinkingPrompt] = useState(
    'Thiết kế kiến trúc hệ thống đa tác nhân Autonomous Agentic AI có khả năng tự kiểm chứng logic và phân rã nhiệm vụ phức tạp năm 2026.'
  );
  const [thinkingText, setThinkingText] = useState<string>('');
  const [thinkingLoading, setThinkingLoading] = useState(false);
  const [thinkingNotice, setThinkingNotice] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (sector) {
      setQuery(sector.defaultPrompt);
      if (sector.intelDossier) {
        setGroundingText(sector.intelDossier.summary);
        setGroundingChunks(sector.intelDossier.groundingChunks);
        setWebQueries(sector.intelDossier.webSearchQueries);
      } else {
        fetchGroundingIntel(sector.defaultPrompt);
      }
    }
  }, [sector]);

  const fetchGroundingIntel = async (promptToUse?: string) => {
    const p = promptToUse || query;
    if (!p.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: p, model: 'gemini-2.5-flash' }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Lỗi máy chủ (${res.status})`);
      }

      const data = await res.json();
      setGroundingText(data.text || '');
      setWebQueries(data.webSearchQueries || []);
      setGroundingChunks(data.groundingChunks || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi truy vấn Google Search Grounding.');
    } finally {
      setLoading(false);
    }
  };

  const executeHighThinking = async () => {
    if (!thinkingPrompt.trim()) return;

    setThinkingLoading(true);
    setError(null);
    setThinkingNotice(null);

    try {
      const res = await fetch('/api/high-thinking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: thinkingPrompt }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Lỗi máy chủ (${res.status})`);
      }

      const data = await res.json();
      setThinkingText(data.text || '');
      if (data.notice) setThinkingNotice(data.notice);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi suy luận sâu.');
    } finally {
      setThinkingLoading(false);
    }
  };

  const handleClaimUpgrade = () => {
    if (sector) {
      onUnlockSector(sector.id, {
        summary: groundingText,
        groundingChunks,
        webSearchQueries: webQueries,
        timestamp: new Date().toISOString(),
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[88vh] bg-slate-950/95 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="font-display font-bold text-white text-base">
              {sector ? sector.title : 'Tra cứu công nghệ 2026'}
            </h2>
            <p className="text-xs text-slate-400">
              {sector ? sector.description : 'Tìm kiếm trực tiếp và phân tích chuyên sâu'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clean Tab Bar */}
        <div className="flex px-6 border-b border-white/10 gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('grounding')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'grounding'
                ? 'border-white text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Tìm kiếm trực tiếp</span>
          </button>

          <button
            onClick={() => setActiveTab('thinking')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'thinking'
                ? 'border-white text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Suy luận sâu</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {activeTab === 'grounding' ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchGroundingIntel()}
                  placeholder="Nhập câu hỏi tìm kiếm..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-white/30 text-white text-sm outline-none"
                />
                <button
                  onClick={() => fetchGroundingIntel()}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-semibold text-xs transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>{loading ? 'Đang tìm...' : 'Tìm kiếm'}</span>
                </button>
              </div>

              {webQueries.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                  <span>Từ khóa:</span>
                  {webQueries.map((q, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="text-slate-600">·</span>}
                      <span className="text-slate-300">“{q}”</span>
                    </React.Fragment>
                  ))}
                </div>
              )}

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                  <span className="text-xs">Đang tổng hợp dữ liệu...</span>
                </div>
              ) : groundingText ? (
                <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {groundingText}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Nhấn Tìm kiếm để tra cứu thông tin mới nhất.
                </div>
              )}

              {groundingChunks.length > 0 && (
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <div className="text-xs font-medium text-slate-400">
                    Nguồn tham khảo ({groundingChunks.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groundingChunks.map((chunk, i) => (
                      <a
                        key={i}
                        href={chunk.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2.5 group"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0" />
                        <div className="overflow-hidden">
                          <div className="text-xs font-medium text-slate-200 truncate">
                            {chunk.title}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">{chunk.uri}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {thinkingNotice && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                  {thinkingNotice}
                </div>
              )}

              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={thinkingPrompt}
                  onChange={(e) => setThinkingPrompt(e.target.value)}
                  placeholder="Nhập yêu cầu suy luận hoặc thiết kế..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-white/30 text-white text-sm outline-none resize-none"
                />
                <button
                  onClick={executeHighThinking}
                  disabled={thinkingLoading}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-semibold text-xs transition-colors disabled:opacity-50"
                >
                  {thinkingLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{thinkingLoading ? 'Đang suy luận...' : 'Phân tích chuyên sâu'}</span>
                </button>
              </div>

              {thinkingLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                  <span className="text-xs">Đang phân tích...</span>
                </div>
              ) : thinkingText ? (
                <div className="pt-4 border-t border-white/10 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {thinkingText}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {sector && !sector.unlocked
              ? 'Quét hoàn tất · Nhận thưởng nâng cấp JetBot'
              : sector && sector.unlocked
              ? 'Đã lưu dữ liệu trụ này'
              : 'Nhấn ESC để đóng'}
          </div>

          <div className="flex items-center gap-2">
            {sector && !sector.unlocked && (
              <button
                onClick={handleClaimUpgrade}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Nhận nâng cấp</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
