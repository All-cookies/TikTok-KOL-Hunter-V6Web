'use client';

import React from 'react';
import { Search, Filter, Hash, X, Sparkles, Loader2 } from 'lucide-react';
import { Theme } from '../types';
import { FOLLOWER_RANGES, LIMIT_OPTIONS } from '../constants';

interface SearchBarProps {
  theme: Theme;
  loading: boolean;
  keywords: string;
  keywordTags: string[];
  showAdvanced: boolean;
  followerRanges: string[];
  sortBy: string;
  limit: number;
  onKeywordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  onRemoveTag: (tag: string) => void;
  onToggleAdvanced: () => void;
  onRangeToggle: (range: string) => void;
  onSortChange: (sort: string) => void;
  onLimitChange: (limit: number) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  theme, loading, keywords, keywordTags, showAdvanced, followerRanges, sortBy, limit,
  onKeywordChange, onSearch, onRemoveTag, onToggleAdvanced, onRangeToggle, onSortChange, onLimitChange
}) => {
  return (
    <div className={`rounded-2xl shadow-xl mb-8 p-6 lg:p-10 transition-colors duration-300 ${
      theme === 'light' ? 'bg-white border border-slate-100 shadow-slate-200/50' : 'bg-zinc-900/50 border border-white/5 shadow-black/50'
    }`}>
      <div className="mb-8">
        <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 ${theme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>
          <Search className="w-3.5 h-3.5" />
          搜索关键词
          <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-black tracking-normal ${theme === 'light' ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-500/20 text-emerald-400'}`}>支持多个关键词，用逗号分割</span>
          <span className="ml-auto flex items-center gap-2 text-[10px] font-mono text-emerald-500">
            <span className="w-1 h-1 bg-current rounded-full animate-pulse" />
            V3.0 引擎运行中
          </span>
        </label>
        <div className="relative group">
          <input
            type="text"
            value={keywords}
            onChange={onKeywordChange}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="尝试搜索行业领域、品类词、品牌竞品或受众标签等"
            className={`w-full rounded-2xl px-6 py-5 pl-14 transition-all focus:outline-none focus:ring-1 ${
              theme === 'light'
                ? 'bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder-zinc-400 focus:border-emerald-400 focus:ring-emerald-200 shadow-inner'
                : 'bg-zinc-950 border border-white/5 text-white placeholder-zinc-700 focus:border-emerald-500/50 focus:ring-emerald-500/10 shadow-inner'
            }`}
          />
          <Search className={`absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-600'}`} />
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-600'}`}>推荐搜索:</span>
          {['3C', 'AI Tools', 'Beauty', 'Home Decor', 'Fashion', 'Outdoor'].map(suggestion => (
            <button
              key={suggestion}
              onClick={() => onKeywordChange({ target: { value: suggestion } } as any)}
              className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                theme === 'light'
                  ? 'bg-zinc-50 border-zinc-100 text-zinc-500 hover:border-emerald-200 hover:text-emerald-600'
                  : 'bg-white/5 border-white/5 text-zinc-500 hover:border-emerald-500/30 hover:text-emerald-400'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>

        {keywordTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-dashed border-zinc-100 dark:border-white/5">
            {keywordTags.map((tag) => (
              <span key={tag} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                theme === 'light' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
              }`}>
                <Hash className="w-3 h-3 opacity-50" />
                {tag}
                <button onClick={() => onRemoveTag(tag)} className="hover:text-red-500 transition-colors ml-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onSearch}
          disabled={loading || !keywords.trim()}
          className={`flex-[2] flex items-center justify-center gap-3 px-8 py-4.5 rounded-2xl font-bold transition-all active:scale-[0.98] ${
            theme === 'light'
              ? 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl shadow-zinc-200'
              : 'bg-zinc-100 text-zinc-950 hover:bg-white shadow-xl shadow-black/20'
          }`}
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> 深度采集扫描中...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> 启动深度采集</>
          )}
        </button>
        <button
          onClick={onToggleAdvanced}
          className={`flex-1 px-6 py-4.5 border rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
            showAdvanced
              ? theme === 'light' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : theme === 'light' ? 'bg-white border-zinc-200 text-zinc-500 hover:border-emerald-300' : 'bg-transparent border-white/10 text-zinc-500 hover:border-zinc-700'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span className="text-sm">高级定向筛选</span>
        </button>
      </div>

      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showAdvanced ? 'max-h-[800px] opacity-100 mt-10' : 'max-h-0 opacity-0'}`}>
        <div className={`pt-8 border-t ${theme === 'light' ? 'border-zinc-100' : 'border-white/5'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* 维度 1: 粉丝数量 */}
            <div>
              <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-5 ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                粉丝量区间
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FOLLOWER_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => onRangeToggle(range.value)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-black border transition-all text-center ${
                      followerRanges.includes(range.value)
                        ? (theme === 'light'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
                            : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300')
                        : theme === 'light' ? 'bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200' : 'bg-transparent border-white/5 text-zinc-500 hover:border-zinc-700'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 维度 2: 搜集数量 */}
            <div className={`lg:border-x lg:px-10 ${theme === 'light' ? 'lg:border-zinc-100' : 'lg:border-white/5'}`}>
              <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-5 ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <div className="w-1 h-3 bg-rose-400 rounded-full" />
                搜集数量
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LIMIT_OPTIONS.map((num) => (
                  <button
                    key={num}
                    onClick={() => onLimitChange(num)}
                    className={`py-2.5 rounded-xl text-xs font-black border transition-all ${
                      limit === num
                        ? (theme === 'light'
                            ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm'
                            : 'bg-rose-500/20 border-rose-500/30 text-rose-300')
                        : theme === 'light' ? 'bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200' : 'bg-transparent border-white/5 text-zinc-500 hover:border-zinc-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* 维度 3: 排序逻辑 */}
            <div>
              <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-5 ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <div className="w-1 h-3 bg-amber-400 rounded-full" />
                排序逻辑
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['views', 'followers', 'latest', 'email'].map((opt) => (
                   <button
                    key={opt}
                    onClick={() => onSortChange(opt)}
                    className={`py-2.5 rounded-xl text-xs font-black border transition-all ${
                      sortBy === opt
                        ? (theme === 'light'
                            ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm'
                            : 'bg-amber-500/20 border-amber-500/30 text-amber-300')
                        : theme === 'light' ? 'bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200' : 'bg-transparent border-white/5 text-zinc-500 hover:border-zinc-700'
                    }`}
                  >
                    {opt === 'views' ? '播放量' : opt === 'followers' ? '粉丝量' : opt === 'latest' ? '最近发布' : '邮箱优先'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};