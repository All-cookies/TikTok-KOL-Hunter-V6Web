'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Download,
  LayoutGrid,
  List,
  Moon,
  Sun,
  Sparkles,
} from 'lucide-react';
import { Creator, Theme, ViewMode } from '../types';
import { Sidebar } from '../components/Sidebar';
import { SearchBar } from '../components/SearchBar';
import { StatsGrid } from '../components/StatsGrid';
import { CreatorCard } from '../components/CreatorCard';
import HeroBanner from '../components/HeroBanner';

export default function Home() {
  const [keywords, setKeywords] = useState('');
  const [keywordTags, setKeywordTags] = useState<string[]>([]);
  const [followerRanges, setFollowerRanges] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('views');
  const [limit, setLimit] = useState(20);
  const [results, setResults] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeywords(value);
    const tags = value.split(/[,，]/).map(t => t.trim()).filter(t => t.length > 0);
    setKeywordTags(tags);
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = keywordTags.filter(t => t !== tagToRemove);
    setKeywordTags(newTags);
    setKeywords(newTags.join(', '));
  };

  const handleRangeToggle = (value: string) => {
    setFollowerRanges((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]
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

  const handleExport = useCallback(() => {
    if (results.length === 0) return;

    const headers = ['Username', 'Nickname', 'Followers', 'Videos', 'Best Video Plays', 'Email', 'Bio', 'Profile URL', 'Keyword'];
    const rows = results.map(r => [
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
    link.download = `tiktok-kol-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }, [results]);

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const stats = useMemo(() => {
    const emailCount = results.filter((r) => r.email).length;
    const totalFollowers = results.reduce((sum, r) => sum + r.follower_count, 0);
    const totalPlays = results.reduce((sum, r) => sum + r.best_video_plays, 0);
    return {
      total: results.length,
      emailCount,
      emailRate: results.length > 0 ? Math.round((emailCount / results.length) * 100) : 0,
      avgFollowers: results.length > 0 ? Math.round(totalFollowers / results.length) : 0,
      totalPlays,
    };
  }, [results]);

  const sortedResults = useMemo(() => {
    const sorted = [...results];
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
      case 'latest':
      default:
        return sorted;
    }
  }, [results, sortBy]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans tracking-tight ${
      theme === 'light' ? 'bg-[#FAFAFA]' : 'bg-black text-white'
    }`}>
      {/* Decorative Atmospheric Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none">
        <div className={`absolute -top-[10%] -right-[10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-10 ${theme === 'light' ? 'bg-zinc-200' : 'bg-zinc-900'}`} />
        <div className={`absolute -bottom-[10%] -left-[10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-5 ${theme === 'light' ? 'bg-emerald-100' : 'bg-zinc-900'}`} />
      </div>

      <Sidebar theme={theme} />

      <main className="lg:ml-64 relative min-h-screen">
        {/* Pro Header */}
        <header className={`sticky top-0 z-30 px-10 py-6 transition-all ${
          theme === 'light' ? 'bg-white/80 backdrop-blur-md border-b border-zinc-100' : 'bg-black/60 backdrop-blur-md border-b border-white/5'
        }`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-600'}`}>Operational Suite Pro</span>
              <span className={theme === 'light' ? 'text-zinc-100' : 'text-white/10'}>|</span>
              <span className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>TikTok Intelligence Center</span>
            </div>

            <div className="flex items-center gap-6">
              <div className={`hidden sm:flex items-center gap-2 pr-4 border-r ${theme === 'light' ? 'border-zinc-200' : 'border-white/10'}`}>
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'}`}>Engine Stable</span>
              </div>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all ${theme === 'light' ? 'text-zinc-400 hover:text-zinc-900' : 'text-zinc-500 hover:text-white'}`}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-10 py-16">
          {/* Hero Section */}
          <HeroBanner theme={theme} />

          <SearchBar
            theme={theme}
            loading={loading}
            keywords={keywords}
            keywordTags={keywordTags}
            showAdvanced={showAdvanced}
            followerRanges={followerRanges}
            sortBy={sortBy}
            limit={limit}
            onKeywordChange={handleKeywordChange}
            onSearch={handleSearch}
            onRemoveTag={removeTag}
            onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
            onRangeToggle={handleRangeToggle}
            onSortChange={setSortBy}
            onLimitChange={setLimit}
          />

          {/* Error */}
          {error && (
            <div className={`border rounded-xl p-4 mb-8 flex items-center gap-3 ${
              theme === 'light' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <span className="font-bold">{error}</span>
            </div>
          )}

          {searched && !loading && (
            <div>
              <StatsGrid stats={stats} theme={theme} formatNumber={formatNumber} />

              <div className="flex items-center justify-between mt-12 mb-8">
                <div className="flex items-center gap-8">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    已捕获样本数 <span className="font-mono text-emerald-500">{sortedResults.length}</span> 位达人
                  </span>
                  <div className={`flex p-1 rounded-xl ${theme === 'light' ? 'bg-zinc-100' : 'bg-white/5 border border-white/5'}`}>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? (theme === 'light' ? 'bg-white text-zinc-900 shadow-sm' : 'bg-white text-black shadow-xl') : 'text-zinc-500 hover:text-white'}`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? (theme === 'light' ? 'bg-white text-zinc-900 shadow-sm' : 'bg-white text-black shadow-xl') : 'text-zinc-500 hover:text-white'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleExport}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all border ${
                    theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900 hover:border-emerald-300' : 'bg-zinc-900 border-white/5 text-white hover:border-emerald-500/20'
                  }`}
                >
                  <Download className="w-4 h-4" /> 导出数据报表
                </button>
              </div>

              {sortedResults.length > 0 ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {sortedResults.map((creator) => (
                    <CreatorCard
                      key={creator.unique_id}
                      creator={creator}
                      theme={theme}
                      copiedEmail={copiedEmail}
                      onCopyEmail={copyEmail}
                      formatNumber={formatNumber}
                    />
                  ))}
                </div>
              ) : (
                <div className={`text-center py-20 backdrop-blur-sm rounded-2xl border ${
                  theme === 'light' ? 'bg-white/60 border-zinc-200/80' : 'bg-zinc-900/40 border-white/5'
                }`}>
                  <p className={theme === 'light' ? 'text-zinc-500' : 'text-zinc-500'}>未找到符合条件的博主</p>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`h-80 rounded-2xl border animate-pulse ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-white/5 border-white/5'}`} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}