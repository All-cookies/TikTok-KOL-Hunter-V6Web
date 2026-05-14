'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Menu, X, Search, Heart, Sparkles } from 'lucide-react';
import { Theme } from '../types';

// ShinyText Component with animated gradient
const ShinyText = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <span className={`relative inline-block ${className}`}>
      <motion.span
        className="absolute inset-0 pointer-events-none"
        animate={{
          x: ['-200%', '200%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 1,
          ease: 'linear',
        }}
        style={{
          background: 'linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
        }}
      />
      <span className="relative">
        {children}
      </span>
    </span>
  );
};

export default function Home() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const navLinks = [
    { label: '首页', href: '/' },
    { label: '搜索达人', href: '/search' },
    { label: '我的收藏', href: '/search?saved=true' },
  ];

  return (
    <div className={`relative min-h-screen font-sans ${
      theme === 'light' ? 'bg-gray-50' : 'bg-zinc-950'
    }`}>
      {/* Video Background - Dark abstract pattern for TikTok KOL theme */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4"
            type="video/mp4"
          />
        </video>
        <div className={`absolute inset-0 ${theme === 'light' ? 'bg-white/80' : 'bg-zinc-950/80'}`} />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 border-b border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                theme === 'light' ? 'bg-teal-500' : 'bg-teal-600'
              }`}>
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <span className={`font-semibold text-base ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                KOL Hunter
              </span>
            </Link>

            {/* Desktop Nav - Pill style */}
            <div className="hidden lg:flex items-center">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full border ${
                theme === 'light'
                  ? 'border-gray-200 bg-white/80'
                  : 'border-white/10 bg-black/30'
              }`}>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                      theme === 'light'
                        ? 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                className={`p-2 rounded-full transition-colors ${
                  theme === 'light'
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/15'
                }`}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>

              {/* Mobile Menu Button */}
              <button
                className={`lg:hidden p-2 rounded-lg ${
                  theme === 'light' ? 'text-gray-600' : 'text-white/70'
                }`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`lg:hidden border-t ${
            theme === 'light' ? 'border-gray-200 bg-white' : 'border-white/10 bg-zinc-900'
          }`}>
            <div className="px-6 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-2.5 text-sm font-medium rounded-lg ${
                    theme === 'light'
                      ? 'text-gray-600 hover:bg-gray-50'
                      : 'text-white/70 hover:bg-white/10'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Content */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <motion.p
              className={`text-xs sm:text-sm tracking-tight mb-6 ${
                theme === 'light' ? 'text-gray-500' : 'text-white/60'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Precision Discovery for TikTok Creators
            </motion.p>

            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-normal leading-[0.9]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className={theme === 'light' ? 'text-gray-900' : 'text-white'}>
                Find Your Next
              </span>
              <br />
              <ShinyText className={theme === 'light' ? 'text-gray-900' : 'text-white'}>
                TikTok Creator.
              </ShinyText>
            </motion.h1>

            <motion.p
              className={`mt-4 text-base md:text-lg max-w-2xl mx-auto ${
                theme === 'light' ? 'text-gray-500' : 'text-white/60'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              AI 驱动的达人搜索引擎 — 实时 TikTok 数据，精准筛选并联系目标创作者
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="mt-10 flex items-center justify-center gap-4 mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Link
                href="/search"
                className={`group px-6 md:px-8 py-3 md:py-4 rounded-full font-medium flex items-center gap-2 transition-all ${
                  theme === 'light'
                    ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg shadow-teal-500/25'
                    : 'bg-teal-500 text-white hover:bg-teal-400 shadow-lg shadow-teal-500/25'
                }`}
              >
                开始搜索
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/search?saved=true"
                className={`px-6 md:px-8 py-3 md:py-4 rounded-full font-medium border transition-colors ${
                  theme === 'light'
                    ? 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    : 'border-white/20 text-white/80 hover:border-white/30 hover:bg-white/10'
                }`}
              >
                查看收藏
              </Link>
            </motion.div>
          </div>

          {/* Stats Row */}
          {/* <motion.div
            className="flex flex-wrap justify-center gap-8 md:gap-16 mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {[
              { value: '10K+', label: '活跃达人' },
              { value: '50+', label: '覆盖国家' },
              { value: '95%', label: '数据准确率' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className={`text-2xl md:text-3xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                  {stat.value}
                </p>
                <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-white/60'}`}>
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div> */}

          {/* Features Section */}
          <div className="mb-3 -mt-10">
            <h3 className={`text-center text-xs sm:text-sm font-medium uppercase tracking-widest mb-6 ${
              theme === 'light' ? 'text-gray-400' : 'text-white/40'
            }`}>
              核心功能
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className={`group p-4 md:p-6 rounded-2xl border transition-all text-center ${
                theme === 'light'
                  ? 'bg-white/80 border-gray-200 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-500/10'
                  : 'bg-black/30 border-white/10 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10'
              }`}>
                <div className={`w-12 h-12 mb-5 rounded-xl flex items-center justify-center mx-auto ${
                  theme === 'light' ? 'bg-teal-50' : 'bg-teal-500/20'
                }`}>
                  <Search className={`w-6 h-6 ${theme === 'light' ? 'text-teal-600' : 'text-teal-400'}`} />
                </div>
                <h4 className={`text-lg font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                  Smart Search <span className="font-normal text-gray-400">| 智能筛选</span>
                </h4>
                <p className={`text-sm leading-relaxed ${theme === 'light' ? 'text-gray-500' : 'text-white/60'}`}>
                  多关键词搜索 + 多维度筛选<br />
                  按粉丝量、内容领域精准定位目标达人
                </p>
              </div>

              {/* Feature 2 */}
              <div className={`group p-5 md:p-6 rounded-2xl border transition-all text-center ${
                theme === 'light'
                  ? 'bg-white/80 border-gray-200 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-500/10'
                  : 'bg-black/30 border-white/10 hover:border-rose-500/30 hover:shadow-lg hover:shadow-rose-500/10'
              }`}>
                <div className={`w-12 h-12 mb-5 rounded-xl flex items-center justify-center mx-auto ${
                  theme === 'light' ? 'bg-rose-50' : 'bg-rose-500/20'
                }`}>
                  <Heart className={`w-6 h-6 ${theme === 'light' ? 'text-rose-500' : 'text-rose-400'}`} />
                </div>
                <h4 className={`text-lg font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                  Instant Contact <span className="font-normal text-gray-400">| 便捷建联</span>
                </h4>
                <p className={`text-sm leading-relaxed ${theme === 'light' ? 'text-gray-500' : 'text-white/60'}`}>
                  自动提取达人简介中的邮箱<br />
                  一键导出 CSV，批量联系
                </p>
              </div>

              {/* Feature 3 */}
              <div className={`group p-4 md:p-6 rounded-2xl border transition-all text-center ${
                theme === 'light'
                  ? 'bg-white/80 border-gray-200 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-500/10'
                  : 'bg-black/30 border-white/10 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/10'
              }`}>
                <div className={`w-12 h-12 mb-5 rounded-xl flex items-center justify-center mx-auto ${
                  theme === 'light' ? 'bg-amber-50' : 'bg-amber-500/20'
                }`}>
                  <Sparkles className={`w-6 h-6 ${theme === 'light' ? 'text-amber-500' : 'text-amber-400'}`} />
                </div>
                <h4 className={`text-lg font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                  AI Scoring <span className="font-normal text-gray-400">| AI 评分</span>
                </h4>
                <p className={`text-sm leading-relaxed ${theme === 'light' ? 'text-gray-500' : 'text-white/60'}`}>
                  多维度达人价值评估<br />
                  内容相关性、增长潜力、活跃度综合评分
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className={`relative z-10 border-t py-8 ${
          theme === 'light' ? 'border-gray-200' : 'border-white/10'
        }`}>
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className={`text-sm ${theme === 'light' ? 'text-gray-400' : 'text-white/40'}`}>
              KOL Hunter - TikTok 达人搜索工具
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}