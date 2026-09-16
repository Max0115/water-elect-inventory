import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Flame, Ruler, AlertTriangle, ChevronDown } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSelectLowStock?: () => void;
  placeholder?: string;
  className?: string;
}

const STORAGE_KEY = 'water_elect_recent_searches_v1';

// 水電常用熱門關鍵字
const POPULAR_KEYWORDS = [
  '南亞PVC',
  '白鐵',
  '球閥',
  '凡而',
  '歐魯',
  '順T',
  '電S',
  '電線',
  '斷路器',
  '壁虎'
];

// 水電常用管徑尺寸快選標籤 (分數與英吋並列)
const POPULAR_SIZES = [
  { label: '4分 (1/2")', query: '4分' },
  { label: '6分 (3/4")', query: '6分' },
  { label: '1吋 (1")', query: '1吋' },
  { label: '1吋2 (1-1/4")', query: '1吋2' },
  { label: '1吋半 (1-1/2")', query: '1吋半' },
  { label: '2吋 (2")', query: '2吋' },
  { label: '3吋 (3")', query: '3吋' },
  { label: '4吋 (4")', query: '4吋' },
  { label: '6吋 (6")', query: '6吋' },
];

export const SearchDropdown: React.FC<Props> = ({
  value,
  onChange,
  onSelectLowStock,
  placeholder = '搜尋材料品名、水電俗稱(如凡而、歐魯)、規格或庫位...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // 載入最近搜尋紀錄
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed loading recent searches', e);
    }
  }, []);

  // 儲存搜尋歷史
  const saveSearchTerm = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    const updated = [clean, ...recentSearches.filter(s => s !== clean)].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed saving recent searches', e);
    }
  };

  // 移除單一歷史
  const handleRemoveRecent = (termToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== termToRemove);
    setRecentSearches(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed removing recent search', err);
    }
  };

  // 清空所有歷史
  const handleClearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Failed clearing recent searches', err);
    }
  };

  // 點選標籤進行搜尋
  const handleSelectKeyword = (term: string) => {
    onChange(term);
    saveSearchTerm(term);
    setIsOpen(false);
  };

  // 監聽點選外部收合面板
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative flex-1 ${className}`}>
      {/* 搜尋輸入框 */}
      <div className="relative flex items-center">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717B8F] pointer-events-none" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              saveSearchTerm(value);
              setIsOpen(false);
            } else if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          className="w-full bg-[#161922] border border-[#2E3647] rounded-xl pl-9 pr-16 py-2 text-xs text-white placeholder-[#717B8F] focus:outline-none focus:border-cyan-500 transition shadow-inner"
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-gray-400 hover:text-white p-1 transition"
              title="清除搜尋內容"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-[#717B8F] hover:text-cyan-400 p-1 transition"
            title={isOpen ? '收合面板' : '展開智慧快選'}
          >
            <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 零狀態智慧下拉面板 (Zero-State Intelligent Dropdown) */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#1C202C] border border-[#2D3546] rounded-2xl shadow-2xl z-40 p-4 space-y-4 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">
          {/* 最近搜尋歷史 */}
          {recentSearches.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#8E96A4] font-medium">
                <span className="flex items-center">
                  <Clock size={12} className="mr-1.5 text-cyan-400" /> 最近搜尋紀錄
                </span>
                <button
                  type="button"
                  onClick={handleClearAllRecent}
                  className="text-[10px] text-[#717B8F] hover:text-red-400 transition"
                >
                  清空歷史
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSelectKeyword(term)}
                    className="group bg-[#161922] hover:bg-[#252B3A] text-gray-300 hover:text-white px-2.5 py-1 rounded-lg text-xs border border-[#2A3142] flex items-center transition"
                  >
                    <span>{term}</span>
                    <span
                      onClick={(e) => handleRemoveRecent(term, e)}
                      className="ml-1.5 text-[#626B7E] group-hover:text-red-400 p-0.5"
                    >
                      <X size={10} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 水電常用管徑尺寸快選膠囊 (1/8" ~ 6") */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#8E96A4] font-medium">
              <span className="flex items-center">
                <Ruler size={12} className="mr-1.5 text-cyan-400" /> 水電管徑尺寸快選 (台語分數與英吋)
              </span>
              <span className="text-[10px] text-[#717B8F]">支援雙向映射</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SIZES.map(({ label, query }) => (
                <button
                  key={query}
                  type="button"
                  onClick={() => handleSelectKeyword(query)}
                  className="bg-[#202532] hover:bg-cyan-950/80 text-cyan-300 hover:text-cyan-200 border border-cyan-800/40 hover:border-cyan-500/60 px-2.5 py-1 rounded-lg text-xs font-mono transition"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 熱門料品與俗稱快選 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#8E96A4] font-medium">
              <span className="flex items-center">
                <Flame size={12} className="mr-1.5 text-amber-400" /> 熱門搜尋與台語俗稱
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => handleSelectKeyword(kw)}
                  className="bg-[#181C25] hover:bg-[#252B3A] text-[#D1D5DB] hover:text-white border border-[#28303F] px-2.5 py-1 rounded-lg text-xs transition"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          {/* 庫存狀態快捷捷徑 */}
          {onSelectLowStock && (
            <div className="pt-2 border-t border-[#262C3A] flex justify-between items-center text-xs">
              <span className="text-[11px] text-[#717B8F]">快速過濾狀態：</span>
              <button
                type="button"
                onClick={() => {
                  onSelectLowStock();
                  setIsOpen(false);
                }}
                className="flex items-center text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/50 border border-red-800/40 px-2.5 py-1 rounded-lg text-xs font-medium transition"
              >
                <AlertTriangle size={12} className="mr-1 text-red-400" /> 只查看告急材料
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
