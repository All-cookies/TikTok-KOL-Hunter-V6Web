'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Creator, Theme, ActiveTab, SavedCreator, KolScore } from '../../types';
import { getSavedCreators, saveCreator, removeCreator } from '../../lib/storage';
import { FilterBar } from '../../components/FilterBar';
import { CreatorCard } from '../../components/CreatorCard';
import { CreatorTooltip } from '../../components/CreatorTooltip';
import { Moon, Sun, Download, Heart, Search } from 'lucide-react';

export default function SearchPage() {
  const [keywords, setKeywords] = useState('');
  const [followerRanges, setFollowerRanges] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('score');
  const [limit, setLimit] = useState(20);
  const [gradeFilter, setGradeFilter] = useState<'all' | 'A' | 'B' | 'C'>('all');

  interface CreatorResult extends Creator {
    score?: KolScore;
  }

  const [results, setResults] = useState<CreatorResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('light');
  const [activeTab, setActiveTab] = useState<ActiveTab>('search');
  const [savedCreators, setSavedCreators] = useState<SavedCreator[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Hydrate saved creators from localStorage on mount
  useEffect(() => {
    setSavedCreators(getSavedCreators());
  }, []);

  const toggleSave = useCallback((uniqueId: string) => {
    const isSaved = savedCreators.some(c => c.unique_id === uniqueId);
    if (isSaved) {
      removeCreator(uniqueId);
      setSavedCreators(prev => prev.filter(c => c.unique_id !== uniqueId));
    } else {
      const creator = results.find(c => c.unique_id === uniqueId) || savedCreators.find(c => c.unique_id === uniqueId);
      if (creator) {
        const saved = saveCreator(creator);
        setSavedCreators(prev => [saved, ...prev.filter(c => c.unique_id !== uniqueId)]);
      }
    }
  }, [results, savedCreators]);

  const handleExport = useCallback(() => {
    const dataToExport = activeTab === 'saved' ? savedCreators : results;
    if (dataToExport.length === 0) return;

    const headers = ['Username', 'Nickname', 'Followers', 'Likes', 'Email', 'Bio', 'Profile URL', 'Keyword'];
    const rows = dataToExport.map(r => [
      r.unique_id,
      r.nickname,
      r.follower_count,
      r.best_video_likes || 0,
      r.email || '',
      r.bio || '',
      r.profile_url,
      r.search_keyword
    ]);

    const csvContent = "﻿" + [headers.join(','), ...rows.map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tiktok-kol-${activeTab === 'saved' ? 'saved' : 'results'}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }, [results, savedCreators, activeTab]);

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const clearKeywords = () => {
    setKeywords('');
  };

  const handleRangeToggle = (value: string) => {
    setFollowerRanges(prev =>
      prev.includes(value) ? prev.filter(r => r !== value) : [...prev, value]
    );
  };

  const handleSearch = async () => {
    if (!keywords.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: keywords.trim(), followerRanges, sortBy, limit }),
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', JSON.stringify(data).slice(0, 300));

      if (!res.ok) throw new Error(data.error || '采集失败');
      setResults(data.creators || []);
    } catch (e) {
      console.error('Search error:', e);
      setError(e instanceof Error ? e.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  const sortedResults = useMemo(() => {
    let sorted = [...results];

    if (gradeFilter !== 'all') {
      sorted = sorted.filter(r => r.score?.grade === gradeFilter);
    }

    switch (sortBy) {
      case 'views':
        return sorted.sort((a, b) => b.best_video_plays - a.best_video_plays);
      case 'followers':
        return sorted.sort((a, b) => b.follower_count - a.follower_count);
      case 'email':
        return sorted.sort((a, b) => {
          if (a.email && !b.email) return -1;
          if (!a.email && b.email) return 1;
          return b.best_video_plays - a.best_video_plays;
        });
      case 'score':
      default:
        return sorted;
    }
  }, [results, sortBy, gradeFilter]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const currentCreators = activeTab === 'saved' ? savedCreators : sortedResults;

  return (
    <div className={`min-h-screen transition-colors duration-150 ${
      theme === 'light' ? 'bg-gray-50' : 'bg-zinc-950'
    }`}>
      {/* Header */}
      <header className={`relative z-40 h-20 flex items-center justify-between px-4 sm:px-8 border-b transition-colors duration-150 ${
        theme === 'light'
          ? 'bg-white'
          : 'bg-zinc-900 border-white/10'
      }`}>
        <div className="flex items-center gap-4 sm:gap-12">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 ${
              theme === 'light' ? 'bg-teal-600 shadow-teal-500/20' : 'bg-teal-500 shadow-teal-500/10'
            }`}>
              <span className="text-white font-black text-lg sm:text-xl">K</span>
            </div>
            <h1 className={`font-black text-lg sm:text-xl tracking-tight hidden xs:block ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
              KOL Hunter
            </h1>
          </Link>

          <nav className="flex items-center p-1 sm:p-1.5 rounded-2xl bg-gray-100/80 dark:bg-white/5 border border-transparent dark:border-white/5">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 sm:px-8 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                activeTab === 'search'
                  ? theme === 'light'
                    ? 'bg-white text-teal-600 shadow-xl shadow-gray-200/50'
                    : 'bg-white/10 text-teal-400 shadow-xl shadow-black/20'
                  : theme === 'light'
                    ? 'text-gray-500 hover:text-gray-800'
                    : 'text-gray-400 hover:text-gray-100'
              }`}
            >
              达人库
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 sm:px-8 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 relative ${
                activeTab === 'saved'
                  ? theme === 'light'
                    ? 'bg-white text-teal-600 shadow-xl shadow-gray-200/50'
                    : 'bg-white/10 text-teal-400 shadow-xl shadow-black/20'
                  : theme === 'light'
                    ? 'text-gray-500 hover:text-gray-800'
                    : 'text-gray-400 hover:text-gray-100'
              }`}
            >
              我的收藏
              {savedCreators.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-red-500 text-[8px] sm:text-[10px] font-bold text-white ring-2 sm:ring-4 ring-white dark:ring-zinc-900 shadow-lg">
                  {savedCreators.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {currentCreators.length > 0 && (
            <button
              onClick={handleExport}
              className={`group flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all active:scale-95 ${
                theme === 'light'
                  ? 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 shadow-sm'
                  : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:animate-bounce" />
              <span className="hidden sm:inline">导出数据</span>
            </button>
          )}
          <button
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            className={`p-2.5 sm:p-3 rounded-2xl transition-all active:scale-90 ${
              theme === 'light'
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/15'
            }`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 sm:w-5 sm:h-5" /> : <Sun className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </header>

      {/* Filter Bar - only on search tab */}
      <div>
        {activeTab === 'search' && (
          <FilterBar
            theme={theme}
            keywords={keywords}
            followerRanges={followerRanges}
            sortBy={sortBy}
            gradeFilter={gradeFilter}
            onKeywordChange={(e) => setKeywords(e.target.value)}
            onSearch={handleSearch}
            onClearKeywords={clearKeywords}
            onRangeToggle={handleRangeToggle}
            onSortChange={setSortBy}
            onGradeChange={setGradeFilter}
            resultCount={searched ? sortedResults.length : undefined}
          />
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Error Message */}
          {error && (
            <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 ${
              theme === 'light' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Search Tab Content */}
          {activeTab === 'search' && (
             <>
               {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`h-[320px] rounded-2xl animate-pulse ${
                      theme === 'light' ? 'bg-white border border-gray-100' : 'bg-zinc-900 border border-white/5'
                    }`} />
                  ))}
                </div>
              ) : searched ? (
                sortedResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedResults.map((creator) => (
                      <CreatorTooltip
                        key={creator.unique_id}
                        creator={creator}
                        theme={theme}
                        copiedEmail={copiedEmail}
                        onCopyEmail={copyEmail}
                        formatNumber={formatNumber}
                        isSaved={savedCreators.some(c => c.unique_id === creator.unique_id)}
                        onToggleSave={toggleSave}
                        score={creator.score}
                      >
                        <CreatorCard
                          creator={creator}
                          theme={theme}
                          copiedEmail={copiedEmail}
                          onCopyEmail={copyEmail}
                          formatNumber={formatNumber}
                          isSaved={savedCreators.some(c => c.unique_id === creator.unique_id)}
                          onToggleSave={toggleSave}
                          score={creator.score}
                        />
                      </CreatorTooltip>
                    ))}
                  </div>
                ) : (
                  <div className={`flex flex-col items-center justify-center py-24 rounded-3xl border border-dashed ${
                    theme === 'light' ? 'bg-white border-gray-200' : 'bg-zinc-900 border-white/10'
                  }`}>
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className={`text-sm font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                      未找到符合条件的达人，请尝试修改关键词
                    </p>
                  </div>
                )
              ) : (
                <div className={`flex flex-col items-center justify-center py-24 rounded-3xl border border-dashed ${
                  theme === 'light' ? 'bg-white border-gray-200' : 'bg-zinc-900 border-white/10'
                }`}>
                   <div className="w-20 h-20 rounded-full bg-teal-500/10 flex items-center justify-center mb-6">
                    <Search className="w-10 h-10 text-teal-500" />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                    开启您的达人发现之旅
                  </h3>
                  <p className={`text-sm max-w-sm text-center ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                    输入关键词搜索 TikTok 上的潜力 KOL，并根据粉丝量、播放量进行精准筛选。
                  </p>
                </div>
              )}
             </>
          )}

          {/* Saved Tab Content */}
          {activeTab === 'saved' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>我的收藏</h2>
                  <p className={`text-sm font-medium mt-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                    共收藏了 {savedCreators.length} 位达人
                  </p>
                </div>
              </div>

              {savedCreators.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {savedCreators.map((creator) => (
                    <CreatorCard
                      key={creator.unique_id}
                      creator={creator}
                      theme={theme}
                      copiedEmail={copiedEmail}
                      onCopyEmail={copyEmail}
                      formatNumber={formatNumber}
                      isSaved={true}
                      onToggleSave={toggleSave}
                    />
                  ))}
                </div>
              ) : (
                <div className={`flex flex-col items-center justify-center py-24 rounded-3xl border border-dashed ${
                  theme === 'light' ? 'bg-white border-gray-200' : 'bg-zinc-900 border-white/10'
                }`}>
                   <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                    <Heart className="w-10 h-10 text-red-500" />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                    暂无收藏记录
                  </h3>
                  <p className={`text-sm text-center ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                    在搜索结果中点击达人卡片上的心形图标即可收藏。
                  </p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="mt-6 px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-bold transition-all"
                  >
                    去搜索达人
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}