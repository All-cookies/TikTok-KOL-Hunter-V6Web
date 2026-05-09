'use client';

import { useState } from 'react';

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
  { value: 'under1k', label: '1k以下' },
  { value: '1k-10k', label: '1K-10K' },
  { value: '100k-1m', label: '1万-10万' },
  { value: '1m-5m', label: '10万-50万' },
  { value: 'over5m', label: '50万+' },
];

const SORT_OPTIONS = [
  { value: 'views', label: '播放量最高' },
  { value: 'latest', label: '最新' },
  { value: 'random', label: '随机' },
  { value: 'hasEmail', label: '有邮箱优先' },
];

const LIMIT_OPTIONS = [10, 20, 30, 50];

export default function Home() {
  const [keywords, setKeywords] = useState('');
  const [followerRanges, setFollowerRanges] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('views');
  const [limit, setLimit] = useState(20);
  const [results, setResults] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const emailCount = results.filter((r) => r.email).length;
  const emailRate = results.length > 0 ? Math.round((emailCount / results.length) * 100) : 0;

  // Sort results based on selected sort option
  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'hasEmail') {
      if (a.email && !b.email) return -1;
      if (!a.email && b.email) return 1;
      return b.best_video_plays - a.best_video_plays;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-fuchsia-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-300">TikTok KOL 采集</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              TikTok KOL 采集工具
            </span>
          </h1>
          <p className="text-gray-400 text-lg">输入关键词，自动采集 TikTok 博主联系方式</p>
        </div>

        {/* Search Box */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 mb-6 border border-white/10 shadow-2xl shadow-violet-500/10">
          <label className="block text-sm text-gray-300 mb-3 font-medium">
            输入关键词（用逗号分隔多个）
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="例如: tech review, gadget, smartphone"
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !keywords.trim()}
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-2xl font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:shadow-violet-500/40 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  采集中...
                </span>
              ) : (
                '开始采集'
              )}
            </button>
          </div>

          {/* Advanced Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="mt-4 flex items-center gap-2 text-sm text-gray-400 hover:text-violet-400 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            高级筛选选项
          </button>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="mt-6 pt-6 border-t border-white/10 space-y-6">
              {/* Follower Ranges */}
              <div>
                <label className="block text-sm text-gray-300 mb-3">粉丝区间（可多选）</label>
                <div className="flex flex-wrap gap-2">
                  {FOLLOWER_RANGES.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => handleRangeToggle(range.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        followerRanges.includes(range.value)
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25'
                          : 'bg-white/5 border border-white/10 text-gray-400 hover:border-violet-500/50'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
                {followerRanges.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">未选择则不限制粉丝数量</p>
                )}
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm text-gray-300 mb-3">排序方式</label>
                <div className="flex gap-2">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        sortBy === option.value
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                          : 'bg-white/5 border border-white/10 text-gray-400 hover:border-cyan-500/50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Limit */}
              <div>
                <label className="block text-sm text-gray-300 mb-3">采集数量</label>
                <div className="flex gap-2">
                  {LIMIT_OPTIONS.map((num) => (
                    <button
                      key={num}
                      onClick={() => setLimit(num)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        limit === num
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                          : 'bg-white/5 border border-white/10 text-gray-400 hover:border-emerald-500/50'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-8 text-red-400 backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {searched && !loading && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="group relative bg-gradient-to-br from-violet-500/10 to-violet-600/5 rounded-2xl p-6 border border-violet-500/20 hover:border-violet-500/40 transition-all hover:shadow-lg hover:shadow-violet-500/10">
                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all" />
                <div className="relative">
                  <div className="text-4xl font-bold text-white mb-1">{results.length}</div>
                  <div className="text-gray-400 text-sm">采集博主数</div>
                </div>
              </div>
              <div className="group relative bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-2xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover:shadow-lg hover:shadow-emerald-500/10">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                <div className="relative">
                  <div className="text-4xl font-bold text-emerald-400 mb-1">{emailCount}</div>
                  <div className="text-gray-400 text-sm">有邮箱数量</div>
                </div>
              </div>
              <div className="group relative bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-2xl p-6 border border-cyan-500/20 hover:border-cyan-500/40 transition-all hover:shadow-lg hover:shadow-cyan-500/10">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
                <div className="relative">
                  <div className="text-4xl font-bold text-cyan-400 mb-1">{emailRate}%</div>
                  <div className="text-gray-400 text-sm">邮箱覆盖率</div>
                </div>
              </div>
            </div>

            {/* Results Table */}
            {sortedResults.length > 0 ? (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 bg-black/20">
                        <th className="text-left p-5 text-gray-300 font-medium text-sm">博主信息</th>
                        <th className="text-left p-5 text-gray-300 font-medium text-sm">粉丝数</th>
                        <th className="text-left p-5 text-gray-300 font-medium text-sm">最高播放</th>
                        <th className="text-left p-5 text-gray-300 font-medium text-sm">联系方式</th>
                        <th className="text-left p-5 text-gray-300 font-medium text-sm">来源</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedResults.map((creator, i) => (
                        <tr
                          key={creator.unique_id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-5">
                            <a
                              href={creator.profile_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-lg font-semibold text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
                            >
                              @{creator.unique_id}
                            </a>
                            <div className="text-gray-500 text-sm mt-1">{creator.nickname || '暂无昵称'}</div>
                            <div className="text-gray-600 text-xs mt-1 max-w-xs truncate">{creator.bio || '暂无简介'}</div>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">
                                {(creator.follower_count / 1000).toFixed(1)}K
                              </span>
                              <span className="text-xs text-gray-500">粉丝</span>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-2">
                              <span className="text-cyan-400 font-medium">
                                {creator.best_video_plays >= 1000000
                                  ? (creator.best_video_plays / 1000000).toFixed(1) + 'M'
                                  : (creator.best_video_plays / 1000).toFixed(0) + 'K'}
                              </span>
                              <span className="text-xs text-gray-500">播放</span>
                            </div>
                          </td>
                          <td className="p-5">
                            {creator.email ? (
                              <a
                                href={`mailto:${creator.email}`}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm hover:bg-emerald-500/20 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {creator.email}
                              </a>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-500/10 border border-gray-500/20 rounded-full text-gray-500 text-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                无邮箱
                              </span>
                            )}
                          </td>
                          <td className="p-5">
                            <span className="inline-block px-3 py-1.5 bg-violet-500/10 border border-violet-500/30 rounded-full text-violet-300 text-xs">
                              {creator.search_keyword}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="text-6xl mb-4">🔍</div>
                <div className="text-gray-400">未找到博主，请尝试其他筛选条件或关键词</div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600 text-sm">
          <p>全品类通用 · 输入关键词即可开始采集</p>
        </div>
      </div>
    </div>
  );
}
