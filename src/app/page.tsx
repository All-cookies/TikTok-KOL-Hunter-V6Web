'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Mail,
  MailX,
  Users,
  Play,
  TrendingUp,
  ExternalLink,
  Sparkles,
  Zap,
  BarChart3,
  X,
  Check,
  Loader2,
  Hash,
  Sun,
  Moon
} from 'lucide-react';

interface Creator {
  unique_id: string;
  nickname: string;
  follower_count: number;
  video_count: number;
  bio: string;
  email: string | null;
  profile_url: string;
  best_video_plays: number;
  search_keyword: string;
}

const FOLLOWER_RANGES = [
  { value: 'under1k', label: '< 1K', fullLabel: '素人 (<1K)' },
  { value: '1k-10k', label: '1K - 10K', fullLabel: '尾部KOL (1K-10K)' },
  { value: '10k-50k', label: '10K - 50K', fullLabel: '腰部KOL (1万-5万)' },
  { value: '50k-100k', label: '50K - 100K', fullLabel: '中腰部 (5万-10万)' },
  { value: '100k-300k', label: '100K - 300K', fullLabel: '中部KOL (10万-30万)' },
  { value: '300k-500k', label: '300K - 500K', fullLabel: '中头部 (30万-50万)' },
  { value: '500k-1m', label: '500K - 1M', fullLabel: '头部KOL (50万-100万)' },
  { value: '1m-5m', label: '1M - 5M', fullLabel: '顶级KOL (100万-500万)' },
  { value: 'over5m', label: '> 5M', fullLabel: '超级头部 (>500万)' },
];

const SORT_OPTIONS = [
  { value: 'views', label: '播放量', icon: Play },
  { value: 'followers', label: '粉丝数', icon: Users },
  { value: 'latest', label: '最新发布', icon: TrendingUp },
  { value: 'hasEmail', label: '有邮箱', icon: Mail },
];

const LIMIT_OPTIONS = [10, 20, 50, 100];

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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
      case 'hasEmail':
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
    <div className={`min-h-screen font-sans selection:bg-violet-500/20 transition-colors duration-300 ${
      theme === 'light' ? 'bg-[#f8f9fc] text-slate-800' : 'bg-[#0a0a0f] text-white'
    }`}>
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {theme === 'light' ? (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-200/40 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-fuchsia-200/30 rounded-full blur-[100px]" />
            <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-cyan-200/20 rounded-full blur-[80px]" />
            <div
              className="absolute inset-0 opacity-[0.4]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.15) 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }}
            />
          </>
        ) : (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-fuchsia-600/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-cyan-600/10 rounded-full blur-[80px]" />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }}
            />
          </>
        )}
      </div>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 z-40 hidden lg:block shadow-sm transition-colors duration-300 ${
        theme === 'light' ? 'bg-white/70 backdrop-blur-xl border-r border-slate-200/80' : 'bg-[#0f0f1a]/80 backdrop-blur-xl border-r border-white/5'
      }`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`font-bold text-lg tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>KOL Hunter</h1>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-gray-500'}`}>TikTok 红人采集</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              theme === 'light'
                ? 'bg-violet-50 border border-violet-100 text-violet-700'
                : 'bg-white/5 border border-white/10 text-white'
            }`}>
              <Search className="w-4 h-4 text-violet-500" />
              搜索采集
            </button>
            <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              theme === 'light' ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-50' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}>
              <BarChart3 className="w-4 h-4" />
              数据看板
            </button>
            <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              theme === 'light' ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-50' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}>
              <Users className="w-4 h-4" />
              我的收藏
            </button>
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <div className={`border rounded-xl p-4 transition-colors duration-300 ${
              theme === 'light' ? 'bg-gradient-to-br from-violet-50 to-fuchsia-50 border-violet-100' : 'bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-white/5'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-violet-500" />
                <span className={`text-sm font-semibold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Pro 版本</span>
              </div>
              <p className={`text-xs mb-3 ${theme === 'light' ? 'text-slate-500' : 'text-gray-500'}`}>解锁无限采集与高级筛选</p>
              <button className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${
                theme === 'light' ? 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}>
                升级方案
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 relative z-10">
        {/* Top Bar */}
        <header className={`sticky top-0 z-30 px-6 py-4 shadow-sm transition-colors duration-300 ${
          theme === 'light' ? 'bg-white/70 backdrop-blur-xl border-b border-slate-200/80' : 'bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5'
        }`}>
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4 lg:hidden">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>KOL Hunter</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-sm">
              <span className={theme === 'light' ? 'text-slate-400' : 'text-gray-500'}>工具</span>
              <span className={theme === 'light' ? 'text-slate-300' : 'text-gray-700'}>/</span>
              <span className={`font-medium ${theme === 'light' ? 'text-slate-700' : 'text-white'}`}>TikTok 采集</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400'
                }`}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                theme === 'light' ? 'bg-emerald-50 border border-emerald-200' : 'bg-emerald-500/10 border border-green-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  theme === 'light' ? 'bg-emerald-500' : 'bg-green-400'
                }`} />
                <span className={`text-xs font-medium ${
                  theme === 'light' ? 'text-emerald-700' : 'text-green-400'
                }`}>系统正常</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Hero Section */}
          <div className="mb-10">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 transition-colors duration-300 ${
              theme === 'light' ? 'bg-violet-50 border border-violet-200' : 'bg-violet-500/10 border border-violet-500/20'
            }`}>
              <Zap className={`w-3 h-3 ${theme === 'light' ? 'text-violet-500' : 'text-violet-400'}`} />
              <span className={`text-xs font-semibold ${theme === 'light' ? 'text-violet-700' : 'text-violet-300'}`}>智能采集引擎 v2.0</span>
            </div>
            <h1 className={`text-4xl lg:text-5xl font-bold mb-3 tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
              发现 TikTok{' '}
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                优质红人
              </span>
            </h1>
            <p className={`text-lg max-w-2xl ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
              输入关键词，AI 自动采集博主数据、分析粉丝画像、提取商业联系方式
            </p>
          </div>

          {/* Search Panel */}
          <div className={`rounded-2xl shadow-xl mb-8 transition-colors duration-300 ${
            theme === 'light'
              ? 'bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-slate-200/50'
              : 'bg-[#12121f]/80 backdrop-blur-xl border border-white/10 shadow-black/50'
          }`}>
            <div className="p-6 lg:p-8">
              {/* Keywords Input */}
              <div className="mb-6">
                <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${
                  theme === 'light' ? 'text-slate-700' : 'text-gray-300'
                }`}>
                  <Hash className="w-4 h-4 text-violet-500" />
                  搜索关键词
                  <span className={`text-xs font-normal ${theme === 'light' ? 'text-slate-400' : 'text-gray-500'}`}>支持多个关键词，用逗号分隔</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={keywords}
                    onChange={handleKeywordChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="例如: tech review, beauty, fitness, gaming..."
                    className={`w-full rounded-xl px-5 py-4 pl-12 transition-all focus:outline-none focus:ring-2 ${
                      theme === 'light'
                        ? 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-violet-400 focus:ring-violet-100'
                        : 'bg-black/40 border border-white/10 text-white placeholder-gray-600 focus:border-violet-500/50 focus:ring-violet-500/10'
                    }`}
                  />
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'light' ? 'text-slate-400' : 'text-gray-500'}`} />
                </div>

                {keywordTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {keywordTags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          theme === 'light'
                            ? 'bg-violet-50 border border-violet-200 text-violet-700'
                            : 'bg-violet-500/10 border border-violet-500/20 text-violet-300'
                        }`}
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:opacity-80 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Button */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={handleSearch}
                  disabled={loading || !keywords.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-200 hover:shadow-violet-500/30 active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      正在采集数据...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      开始采集
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`px-4 py-4 border rounded-xl font-medium transition-all ${
                    showAdvanced
                      ? theme === 'light'
                        ? 'bg-violet-50 border-violet-300 text-violet-700'
                        : 'bg-violet-500/10 border-violet-500/30 text-violet-300'
                      : theme === 'light'
                        ? 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              {/* Advanced Options */}
              <div className={`overflow-hidden transition-all duration-300 ${showAdvanced ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className={`pt-6 space-y-6 ${theme === 'light' ? 'border-t border-slate-200' : 'border-t border-white/10'}`}>
                  {/* Follower Ranges */}
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'}`}>
                      粉丝数量区间 <span className={`font-normal ${theme === 'light' ? 'text-slate-400' : 'text-gray-500'}`}>可多选</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {FOLLOWER_RANGES.map((range) => (
                        <button
                          key={range.value}
                          onClick={() => handleRangeToggle(range.value)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            followerRanges.includes(range.value)
                              ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                              : theme === 'light'
                                ? 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-700'
                                : 'bg-white/5 border border-white/10 text-gray-400 hover:border-violet-500/30 hover:text-gray-300'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sort By */}
                    <div>
                      <label className={`block text-sm font-semibold mb-3 ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'}`}>排序方式</label>
                      <div className="flex flex-wrap gap-2">
                        {SORT_OPTIONS.map((option) => {
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.value}
                              onClick={() => setSortBy(option.value)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                sortBy === option.value
                                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/25'
                                  : theme === 'light'
                                    ? 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-cyan-300'
                                    : 'bg-white/5 border border-white/10 text-gray-400 hover:border-cyan-500/30'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Limit */}
                    <div>
                      <label className={`block text-sm font-semibold mb-3 ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'}`}>采集数量</label>
                      <div className="flex gap-2">
                        {LIMIT_OPTIONS.map((num) => (
                          <button
                            key={num}
                            onClick={() => setLimit(num)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              limit === num
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                                : theme === 'light'
                                  ? 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-emerald-300'
                                  : 'bg-white/5 border border-white/10 text-gray-400 hover:border-emerald-500/30'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className={`border rounded-xl p-4 mb-8 flex items-center gap-3 ${
              theme === 'light' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <X className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Results */}
          {searched && !loading && (
            <>
              {/* Stats Dashboard */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  title="采集博主"
                  value={stats.total}
                  icon={Users}
                  color="violet"
                  subtitle="总计"
                  theme={theme}
                />
                <StatCard
                  title="有邮箱"
                  value={stats.emailCount}
                  icon={Mail}
                  color="emerald"
                  subtitle={`覆盖率 ${stats.emailRate}%`}
                  theme={theme}
                />
                <StatCard
                  title="平均粉丝"
                  value={formatNumber(stats.avgFollowers)}
                  icon={TrendingUp}
                  color="cyan"
                  subtitle="每位博主"
                  theme={theme}
                />
                <StatCard
                  title="总播放量"
                  value={formatNumber(stats.totalPlays)}
                  icon={Play}
                  color="fuchsia"
                  subtitle="最佳视频"
                  theme={theme}
                />
              </div>

              {/* Toolbar */}
              {sortedResults.length > 0 && (
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
                      找到 <span className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{sortedResults.length}</span> 位博主
                    </span>
                    <div className={`flex items-center gap-1 rounded-lg p-1 ${
                      theme === 'light' ? 'bg-slate-100 border border-slate-200' : 'bg-white/5 border border-white/10'
                    }`}>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${
                          viewMode === 'grid'
                            ? theme === 'light' ? 'bg-white text-slate-800 shadow-sm' : 'bg-white/10 text-white'
                            : theme === 'light' ? 'text-slate-400 hover:text-slate-600' : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${
                          viewMode === 'list'
                            ? theme === 'light' ? 'bg-white text-slate-800 shadow-sm' : 'bg-white/10 text-white'
                            : theme === 'light' ? 'text-slate-400 hover:text-slate-600' : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleExport}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      theme === 'light'
                        ? 'bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-sm'
                        : 'bg-white/5 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    导出 CSV
                  </button>
                </div>
              )}

              {/* Results Content */}
              {sortedResults.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {sortedResults.map((creator, i) => (
                      <CreatorCard
                        key={creator.unique_id}
                        creator={creator}
                        index={i}
                        copiedEmail={copiedEmail}
                        onCopyEmail={copyEmail}
                        formatNumber={formatNumber}
                        theme={theme}
                      />
                    ))}
                  </div>
                ) : (
                  <div className={`rounded-2xl border overflow-hidden shadow-sm transition-colors duration-300 ${
                      theme === 'light'
                        ? 'bg-white/80 backdrop-blur-xl border-slate-200/80'
                        : 'bg-[#12121f]/60 backdrop-blur-xl border-white/10'
                    }`}>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={`border-b ${theme === 'light' ? 'border-slate-200 bg-slate-50/80' : 'border-white/10 bg-white/5'}`}>
                            <th className={`text-left p-4 font-medium text-xs uppercase tracking-wider ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>博主</th>
                            <th className={`text-left p-4 font-medium text-xs uppercase tracking-wider ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>粉丝</th>
                            <th className={`text-left p-4 font-medium text-xs uppercase tracking-wider ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>播放量</th>
                            <th className={`text-left p-4 font-medium text-xs uppercase tracking-wider ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>邮箱</th>
                            <th className={`text-left p-4 font-medium text-xs uppercase tracking-wider ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>来源</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedResults.map((creator) => (
                            <tr key={creator.unique_id} className={`border-b transition-colors ${
                              theme === 'light' ? 'border-slate-100 hover:bg-slate-50/50' : 'border-white/5 hover:bg-white/5'
                            }`}>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                    theme === 'light'
                                      ? 'bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-600'
                                      : 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-300'
                                  }`}>
                                    {creator.unique_id[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <a
                                      href={creator.profile_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`font-semibold transition-colors flex items-center gap-1 ${
                                        theme === 'light' ? 'text-slate-800 hover:text-violet-600' : 'text-white hover:text-fuchsia-400'
                                      }`}
                                    >
                                      @{creator.unique_id}
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                    <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-gray-500'}`}>{creator.nickname}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`font-medium ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{formatNumber(creator.follower_count)}</span>
                              </td>
                              <td className="p-4">
                                <span className={`font-medium ${theme === 'light' ? 'text-cyan-600' : 'text-cyan-400'}`}>{formatNumber(creator.best_video_plays)}</span>
                              </td>
                              <td className="p-4">
                                {creator.email ? (
                                  <button
                                    onClick={() => copyEmail(creator.email!)}
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                                      copiedEmail === creator.email
                                        ? theme === 'light'
                                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : theme === 'light'
                                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                    }`}
                                  >
                                    {copiedEmail === creator.email ? (
                                      <Check className="w-3 h-3" />
                                    ) : (
                                      <Mail className="w-3 h-3" />
                                    )}
                                    {copiedEmail === creator.email ? '已复制' : creator.email}
                                  </button>
                                ) : (
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${
                                    theme === 'light'
                                      ? 'bg-slate-100 border border-slate-200 text-slate-400'
                                      : 'bg-gray-500/10 border border-gray-500/20 text-gray-500'
                                  }`}>
                                    <MailX className="w-3 h-3" />
                                    无邮箱
                                  </span>
                                )}
                              </td>
                              <td className="p-4">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                  theme === 'light'
                                    ? 'bg-violet-50 border border-violet-200 text-violet-700'
                                    : 'bg-violet-500/10 border border-violet-500/20 text-violet-300'
                                }`}>
                                  {creator.search_keyword}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ) : (
                <div className={`text-center py-20 backdrop-blur-sm rounded-2xl border ${
                  theme === 'light' ? 'bg-white/60 border-slate-200/80' : 'bg-[#12121f]/40 border-white/5'
                }`}>
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                    theme === 'light' ? 'bg-slate-100' : 'bg-white/5'
                  }`}>
                    <Search className={`w-8 h-8 ${theme === 'light' ? 'text-slate-400' : 'text-gray-600'}`} />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'}`}>未找到博主</h3>
                  <p className={theme === 'light' ? 'text-slate-500' : 'text-gray-500'}>尝试更换关键词或调整筛选条件</p>
                </div>
              )}
            </>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 p-6 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded" />
                    <div className="h-3 bg-slate-200 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <footer className={`mt-16 pt-8 text-center ${theme === 'light' ? 'border-t border-slate-200/80' : 'border-t border-white/5'}`}>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-400' : 'text-gray-600'}`}>
              TikTok KOL Hunter · 智能红人采集工具
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  theme
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle: string;
  theme: 'light' | 'dark';
}) {
  const colorMap: Record<string, { bg: string; text: string; border: string; lightBg: string }> = {
    violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', lightBg: 'bg-violet-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', lightBg: 'bg-emerald-100' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', lightBg: 'bg-cyan-100' },
    fuchsia: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200', lightBg: 'bg-fuchsia-100' },
  };

  const darkColorMap: Record<string, { bg: string; text: string; border: string; lightBg: string }> = {
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', lightBg: 'bg-black/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', lightBg: 'bg/black/20' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', lightBg: 'bg/black/20' },
    fuchsia: { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/20', lightBg: 'bg/black/20' },
  };

  const c = theme === 'light' ? colorMap[color] : darkColorMap[color];

  return (
    <div className={`group relative ${c.bg} border ${c.border} rounded-2xl p-6 hover:shadow-lg transition-all`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 ${c.lightBg} rounded-xl ${c.text}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-gray-500'}`}>{subtitle}</span>
      </div>
      <div className={`text-3xl font-bold ${c.text} mb-1`}>{value}</div>
      <div className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>{title}</div>
    </div>
  );
}

// Creator Card Component
function CreatorCard({
  creator,
  index,
  copiedEmail,
  onCopyEmail,
  formatNumber,
  theme
}: {
  creator: Creator;
  index: number;
  copiedEmail: string | null;
  onCopyEmail: (email: string) => void;
  formatNumber: (num: number) => string;
  theme: 'light' | 'dark';
}) {
  return (
    <div
      className={`group rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
        theme === 'light'
          ? 'bg-white/80 backdrop-blur-xl border-slate-200/80 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50'
          : 'bg-[#12121f]/80 backdrop-blur-xl border-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-violet-500/5'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border ${
            theme === 'light'
              ? 'bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-600 border-violet-200'
              : 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-300 border-violet-500/20'
          }`}>
            {creator.unique_id[0].toUpperCase()}
          </div>
          <div>
            <a
              href={creator.profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-semibold transition-colors flex items-center gap-1 ${
                theme === 'light' ? 'text-slate-800 hover:text-violet-600' : 'text-white hover:text-fuchsia-400'
              }`}
            >
              @{creator.unique_id}
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-gray-500'}`}>{creator.nickname || '暂无昵称'}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          theme === 'light'
            ? 'bg-violet-50 border border-violet-200 text-violet-700'
            : 'bg-violet-500/10 border border-violet-500/20 text-violet-300'
        }`}>
          {creator.search_keyword}
        </span>
      </div>

      {/* Bio */}
      <p className={`text-sm mb-4 line-clamp-2 min-h-[2.5rem] ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
        {creator.bio || '暂无简介'}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={`rounded-xl p-3 ${
          theme === 'light' ? 'bg-slate-50 border border-slate-100' : 'bg-white/5 border border-white/5'
        }`}>
          <div className={`flex items-center gap-1.5 text-xs mb-1 ${theme === 'light' ? 'text-slate-500' : 'text-gray-500'}`}>
            <Users className="w-3 h-3" />
            粉丝
          </div>
          <div className={`text-sm font-semibold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{formatNumber(creator.follower_count)}</div>
        </div>
        <div className={`rounded-xl p-3 ${
          theme === 'light' ? 'bg-slate-50 border border-slate-100' : 'bg-white/5 border border-white/5'
        }`}>
          <div className={`flex items-center gap-1.5 text-xs mb-1 ${theme === 'light' ? 'text-slate-500' : 'text-gray-500'}`}>
            <Play className="w-3 h-3" />
            最高播放
          </div>
          <div className={`text-sm font-semibold ${theme === 'light' ? 'text-cyan-600' : 'text-cyan-400'}`}>{formatNumber(creator.best_video_plays)}</div>
        </div>
      </div>

      {/* Email */}
      <div className={`pt-4 ${theme === 'light' ? 'border-t border-slate-100' : 'border-t border-white/5'}`}>
        {creator.email ? (
          <button
            onClick={() => onCopyEmail(creator.email!)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              copiedEmail === creator.email
                ? theme === 'light'
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : theme === 'light'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
            }`}
          >
            {copiedEmail === creator.email ? (
              <>
                <Check className="w-4 h-4" />
                已复制到剪贴板
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                {creator.email}
              </>
            )}
          </button>
        ) : (
          <div className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm ${
            theme === 'light'
              ? 'bg-slate-100 border border-slate-200 text-slate-400'
              : 'bg-gray-500/5 border border-gray-500/10 text-gray-500'
          }`}>
            <MailX className="w-4 h-4" />
            未找到邮箱
          </div>
        )}
      </div>
    </div>
  );
}