'use client';

import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Theme } from '../types';
import { FOLLOWER_RANGES, SORT_OPTIONS, GRADE_OPTIONS } from '../constants';

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
  onSortChange: (sort: string) => void;
  onGradeChange: (grade: 'all' | 'A' | 'B' | 'C') => void;
  resultCount?: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  theme, keywords, followerRanges, sortBy, gradeFilter,
  onKeywordChange, onSearch, onClearKeywords, onRangeToggle, onSortChange, onGradeChange, resultCount
}) => {
  return (
    <div className={`sticky top-16 z-20 border-b transition-colors duration-150 ${
      theme === 'light'
        ? 'bg-white border-gray-200'
        : 'bg-zinc-900 border-white/10'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Main filter row */}
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              value={keywords}
              onChange={onKeywordChange}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              placeholder="搜索关键词..."
              className={`w-full pl-11 pr-10 py-2.5 rounded-lg text-sm border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500/30 ${
                theme === 'light'
                  ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  : 'bg-zinc-800 border-white/10 text-white placeholder-gray-500'
              }`}
            />
            {keywords && (
              <button
                onClick={onClearKeywords}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Follower Range Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <span className={`text-xs font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>粉丝:</span>
            {FOLLOWER_RANGES.slice(0, 5).map((range) => (
              <button
                key={range.value}
                onClick={() => onRangeToggle(range.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-150 ${
                  followerRanges.includes(range.value)
                    ? theme === 'light'
                      ? 'bg-teal-500 text-white border-teal-500'
                      : 'bg-teal-500 text-white border-teal-500'
                    : theme === 'light'
                      ? 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      : 'bg-transparent border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Sort Select */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className={`px-3 py-2 rounded-lg text-sm border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500/30 ${
              theme === 'light'
                ? 'bg-white border-gray-200 text-gray-700'
                : 'bg-zinc-800 border-white/10 text-gray-300'
            }`}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Search Button */}
          <button
            onClick={onSearch}
            disabled={!keywords.trim()}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
              keywords.trim()
                ? theme === 'light'
                  ? 'bg-teal-500 text-white hover:bg-teal-600'
                  : 'bg-teal-500 text-white hover:bg-teal-600'
                : theme === 'light'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white/5 text-gray-500 cursor-not-allowed'
            }`}
          >
            搜索
          </button>
        </div>

        {/* Secondary filter row */}
        <div className="flex items-center justify-between mt-3">
          {/* Grade Filter */}
          <div className="flex items-center gap-2">
            <span className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>等级:</span>
            <div className="flex gap-1">
              {GRADE_OPTIONS.map((grade) => (
                <button
                  key={grade.value}
                  onClick={() => onGradeChange(grade.value as 'all' | 'A' | 'B' | 'C')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-150 ${
                    gradeFilter === grade.value
                      ? theme === 'light'
                        ? 'bg-teal-500 text-white border-teal-500'
                        : 'bg-teal-500 text-white border-teal-500'
                      : theme === 'light'
                        ? 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        : 'bg-transparent border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {grade.label}
                </button>
              ))}
            </div>
          </div>

          {/* Result Count */}
          {resultCount !== undefined && (
            <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
              共 <span className="font-semibold text-teal-600 dark:text-teal-400">{resultCount}</span> 位达人
            </p>
          )}
        </div>

        {/* Expanded follower ranges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {FOLLOWER_RANGES.slice(5).map((range) => (
            <button
              key={range.value}
              onClick={() => onRangeToggle(range.value)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors duration-150 ${
                followerRanges.includes(range.value)
                  ? theme === 'light'
                    ? 'bg-teal-500 text-white border-teal-500'
                    : 'bg-teal-500 text-white border-teal-500'
                  : theme === 'light'
                    ? 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    : 'bg-transparent border-white/10 text-gray-500 hover:border-white/20'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};