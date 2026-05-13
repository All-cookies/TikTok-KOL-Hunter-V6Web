'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Creator, Theme, ActiveTab, SavedCreator, KolScore } from '../../types';
import { getSavedCreators, saveCreator, removeCreator } from '../../lib/storage';
import { FilterBar } from '../../components/FilterBar';
import { CreatorCard } from '../../components/CreatorCard';
import { CreatorTooltip } from '../../components/CreatorTooltip';

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

  useEffect(() => {
    setSavedCreators(getSavedCreators());
  }, []);

  const toggleSave = useCallback((uniqueId: string) => {
    const isSaved = savedCreators.some(c => c.unique_id === uniqueId);
    if (isSaved) {
      removeCreator(uniqueId);
      setSavedCreators(prev => prev.filter(c => c.unique_id !== uniqueId));
    } else {
      const creator = results.find(c => c.unique_id === uniqueId);
      if (creator) {
        const saved = saveCreator(creator);
        setSavedCreators(prev => [saved, ...prev.filter(c => c.unique_id !== uniqueId)]);
      }
    }
  }, [results, savedCreators]);

  const handleExport = useCallback(() => {
    const dataToExport = activeTab === 'saved' ? savedCreators : results;
    if (dataToExport.length === 0) return;

    const headers = ['Username', 'Nickname', 'Followers', 'Videos', 'Best Video Plays', 'Email', 'Bio', 'Profile URL', 'Keyword'];
    const rows = dataToExport.map(r => [
      r.unique_id,
      r.nickname,
      r.follower_count,
      r.video_count,
      r.best_video_plays,
      r.email || '',
      r.bio || '',
      r.profile_url,
      r.search_keyword
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
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

      if (!res.ok) throw new Error('采集失败');
      const data = await res.json();
      setResults(data.creators || []);
    } catch (e) {
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
  const currentResultCount = activeTab === 'saved' ? savedCreators.length : sortedResults.length;

  return (
    <div className={`min-h-screen transition-colors duration-150 ${
      theme === 'light' ? 'bg-gray-50' : 'bg-zinc-950'
    }`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-6 border-b transition-colors duration-150 ${
        theme === 'light'
          ? 'bg-white border-gray-200'
          : 'bg-zinc-900 border-white/10'
      }`}>
        <Link href="/" className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            theme === 'light' ? 'bg-teal-50' : 'bg-teal-500/20'
          }`}>
            <span className={`text-sm font-semibold ${theme === 'light' ? 'text-teal-600' : 'text-teal-400'}`}>K</span>
          </div>
          <h1 className={`font-semibold text-base ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
            KOL Hunter
          </h1>
        </Link>

        <nav className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
              activeTab === 'search'
                ? theme === 'light'
                  ? 'bg-teal-50 text-teal-700'
                  : 'bg-teal-500/20 text-teal-300'
                : theme === 'light'
                  ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            搜索达人
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
              activeTab === 'saved'
                ? theme === 'light'
                  ? 'bg-teal-50 text-teal-700'
                  : 'bg-teal-500/20 text-teal-300'
                : theme === 'light'
                  ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            我的收藏
          </button>
        </nav>

        <div className="flex items-center gap-2">
          {currentCreators.length > 0 && (
            <button
              onClick={handleExport}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors duration-150 ${
                theme === 'light'
                  ? 'border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-600'
                  : 'border-white/10 text-gray-400 hover:border-teal-500/30 hover:text-teal-400'
              }`}
            >
              导出
            </button>
          )}
          <button
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            className={`p-2 rounded-lg transition-colors duration-150 ${
              theme === 'light'
                ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                : 'bg-white/10 text-gray-400 hover:text-white hover:bg-white/15'
            }`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      {/* Filter Bar - only on search tab */}
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
      <main className="pt-14">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 rounded-lg text-sm ${
              theme === 'light' ? 'bg-red-50 text-red-600' : 'bg-red-500/10 text-red-400'
            }`}>
              {error}
            </div>
          )}

          {/* Loading Skeleton */}
          {activeTab === 'search' && loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`h-48 rounded-lg animate-pulse ${
                  theme === 'light' ? 'bg-white border border-gray-200' : 'bg-zinc-800 border border-white/10'
                }`} />
              ))}
            </div>
          )}

          {/* Search Results */}
          {activeTab === 'search' && searched && !loading && (
            <div>
              {sortedResults.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                <div className={`text-center py-16 rounded-lg ${
                  theme === 'light' ? 'bg-white border border-gray-200' : 'bg-zinc-800 border border-white/10'
                }`}>
                  <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>未找到符合条件的达人</p>
                </div>
              )}
            </div>
          )}

          {/* Empty State - Search tab before search */}
          {activeTab === 'search' && !searched && (
            <div className={`text-center py-16 rounded-lg ${
              theme === 'light' ? 'bg-white border border-gray-200' : 'bg-zinc-800 border border-white/10'
            }`}>
              <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                输入关键词开始搜索达人
              </p>
            </div>
          )}

          {/* Saved Tab */}
          {activeTab === 'saved' && (
            <div>
              {savedCreators.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {savedCreators.map((creator) => (
                    <CreatorTooltip
                      key={creator.unique_id}
                      creator={creator}
                      theme={theme}
                      copiedEmail={copiedEmail}
                      onCopyEmail={copyEmail}
                      formatNumber={formatNumber}
                      isSaved={true}
                      onToggleSave={toggleSave}
                      score={creator.score}
                    >
                      <CreatorCard
                        creator={creator}
                        theme={theme}
                        copiedEmail={copiedEmail}
                        onCopyEmail={copyEmail}
                        formatNumber={formatNumber}
                        isSaved={true}
                        onToggleSave={toggleSave}
                        score={creator.score}
                      />
                    </CreatorTooltip>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-16 rounded-lg ${
                  theme === 'light' ? 'bg-white border border-gray-200' : 'bg-zinc-800 border border-white/10'
                }`}>
                  <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>还没有收藏任何达人</p>
                  <p className={`text-xs mt-1 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
                    搜索结果中点击心形图标即可收藏
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}