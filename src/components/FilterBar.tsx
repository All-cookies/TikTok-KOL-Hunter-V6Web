import React from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { Theme } from '../types';

interface FilterBarProps {
  theme: Theme;
  keywords: string;
  followerRanges: string[];
  sortBy: string;
  gradeFilter: 'all' | 'A' | 'B' | 'C';
  onKeywordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  onClearKeywords: () => void;
  onRangeToggle: (value: string) => void;
  onSortChange: (val: string) => void;
  onGradeChange: (val: 'all' | 'A' | 'B' | 'C') => void;
  resultCount?: number;
}

const RANGES = [
  { label: '< 1K', value: '0-1000' },
  { label: '1K-10K', value: '1000-10000' },
  { label: '10K-100K', value: '10000-100000' },
  { label: '100K-300K', value: '100000-300000' },
  { label: '300K-500K', value: '300000-500000' },
  { label: '500K-1M', value: '500000-1000000' },
  { label: '> 1M', value: '1000000-inf' },
];

export function FilterBar({
  theme,
  keywords,
  followerRanges,
  sortBy,
  gradeFilter,
  onKeywordChange,
  onSearch,
  onClearKeywords,
  onRangeToggle,
  onSortChange,
  onGradeChange,
  resultCount
}: FilterBarProps) {
  const isDark = theme === 'dark';
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [tagInput, setTagInput] = React.useState('');

  // Sync tagInput when keywords changes from parent (e.g., clear)
  React.useEffect(() => {
    const tags = keywords.split(',').map(k => k.trim()).filter(k => k);
    if (tags.length === 0) {
      setTagInput('');
    }
  }, [keywords]);

  // Parse keywords into tags
  const keywordTags = keywords
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);

    // If user types comma, add current input as tag
    if (value.endsWith(',')) {
      const newTag = value.slice(0, -1).trim();
      if (newTag) {
        const currentTags = keywords.split(',').map(k => k.trim()).filter(k => k);
        if (!currentTags.includes(newTag)) {
          const newKeywords = currentTags.length > 0
            ? keywords + ',' + newTag
            : newTag;
          onKeywordChange({ target: { value: newKeywords } } as any);
        }
      }
      setTagInput('');
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && tagInput === '' && keywordTags.length > 0) {
      // Remove last tag when pressing backspace on empty input
      const tags = keywords.split(',').map(k => k.trim()).filter(k => k);
      tags.pop();
      onKeywordChange({ target: { value: tags.join(',') } } as any);
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim()) {
        const newTag = tagInput.trim();
        const currentTags = keywords.split(',').map(k => k.trim()).filter(k => k);
        if (!currentTags.includes(newTag)) {
          const newKeywords = currentTags.length > 0
            ? keywords + ',' + newTag
            : newTag;
          onKeywordChange({ target: { value: newKeywords } } as any);
        }
        setTagInput('');
      }
    }
    if (e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag) {
        const currentTags = keywords.split(',').map(k => k.trim()).filter(k => k);
        if (!currentTags.includes(newTag)) {
          const newKeywords = currentTags.length > 0
            ? keywords + ',' + newTag
            : newTag;
          onKeywordChange({ target: { value: newKeywords } } as any);
        }
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const tags = keywords.split(',').map(k => k.trim()).filter(k => k);
    const filtered = tags.filter(t => t !== tagToRemove);
    onKeywordChange({ target: { value: filtered.join(',') } } as any);
  };

  // Auto collapse on search for mobile
  React.useEffect(() => {
    if (resultCount !== undefined && typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsCollapsed(true);
    }
  }, [resultCount]);

  return (
    <div className={`relative z-20 border-b transition-all duration-300 ${
      isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
        {/* Search Input Row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
              isDark ? 'text-gray-500 group-focus-within:text-teal-500' : 'text-gray-400 group-focus-within:text-teal-600'
            }`} />
            <input
              type="text"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              placeholder="输入关键词，按逗号或回车添加标签..."
              className={`w-full pl-12 pr-12 py-3.5 rounded-2xl text-base outline-none transition-all border-2 ${
                isDark
                  ? 'bg-white/5 border-white/5 text-white focus:bg-white/10 focus:border-teal-500/50'
                  : 'bg-gray-100 border-transparent text-gray-900 focus:bg-white focus:border-teal-500 focus:ring-8 focus:ring-teal-500/5'
              }`}
            />
            {keywords && (
              <button
                onClick={onClearKeywords}
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-xl hover:bg-black/5 ${
                  isDark ? 'text-gray-500 hover:bg-white/10' : 'text-gray-400'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onSearch}
              className="flex-1 md:flex-none px-10 py-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl text-base font-bold transition-all shadow-lg shadow-teal-600/20 active:scale-95"
            >
              立即搜集
            </button>
            {resultCount !== undefined && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`md:hidden p-3.5 rounded-2xl border transition-all ${
                  isDark ? 'border-white/10 text-gray-400' : 'border-gray-200 text-gray-600'
                }`}
              >
                <Filter className={`w-5 h-5 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
              </button>
            )}
          </div>
        </div>

        {/* Keyword Tags */}
        {keywordTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {keywordTags.map((tag, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium ${
                  isDark
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    : 'bg-teal-50 text-teal-700 border border-teal-200'
                }`}
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:bg-teal-500/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Filters Row - Collapsible on mobile */}
        <div className={`transition-all duration-300 overflow-hidden ${
          isCollapsed ? 'max-h-0 opacity-0 -mt-4' : 'max-h-[500px] opacity-100'
        }`}>
          {/* Follower Range Buttons - single row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-sm font-semibold whitespace-nowrap ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>粉丝量:</span>
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => onRangeToggle(r.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  followerRanges.includes(r.value)
                    ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/20'
                    : isDark
                      ? 'border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Bottom Row: Grade Filter + Sort + Result Count */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
            {/* Grade Filter */}
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold whitespace-nowrap ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>达人评级:</span>
              <div className="flex gap-1.5">
                {['all', 'A', 'B', 'C'].map((g) => (
                  <button
                    key={g}
                    onClick={() => onGradeChange(g as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      gradeFilter === g
                        ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/20'
                        : isDark
                          ? 'border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {g === 'all' ? '全部' : g + '级'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort + Result Count */}
            <div className="flex items-center gap-4">
              {resultCount !== undefined && (
                <span className={`text-sm font-bold ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  检索到 <span className={isDark ? 'text-teal-400' : 'text-teal-600'}>{resultCount}</span> 位
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>排序:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className={`text-xs sm:text-sm font-bold py-2 pl-3 pr-8 rounded-xl border outline-none appearance-none cursor-pointer transition-all ${
                      isDark
                        ? 'bg-zinc-800 border-white/10 text-gray-300 focus:border-teal-500/50'
                        : 'bg-white border-gray-200 text-gray-700 focus:border-teal-500 focus:shadow-sm'
                    }`}
                  >
                    <option value="score">综合评分</option>
                    <option value="followers">粉丝量</option>
                    <option value="views">播放量</option>
                    <option value="email">邮箱优先</option>
                  </select>
                  <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}