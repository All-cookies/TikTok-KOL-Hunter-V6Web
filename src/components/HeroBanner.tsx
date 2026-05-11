'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Zap, ArrowRight, Search, TrendingUp } from 'lucide-react';
import { Theme } from '../types';

interface HeroBannerProps {
  theme: Theme;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ theme }) => {
  return (
    <div className="relative mb-24 mt-8">
      <div className={`relative overflow-hidden rounded-[3rem] min-h-[600px] flex flex-col items-center justify-center text-center transition-all duration-700 ${
        theme === 'light'
          ? 'bg-white border border-zinc-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)]'
          : 'bg-zinc-900 border border-white/5 shadow-2xl'
      }`}>

        {/* Decorative Curvy Lines (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 dark:opacity-10" viewBox="0 0 800 600" fill="none">
          <motion.path
            d="M-50,200 Q200,100 400,300 T850,200"
            stroke="currentColor"
            strokeWidth="1.5"
            className={theme === 'light' ? 'text-emerald-200' : 'text-emerald-500'}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.path
            d="M-50,400 Q150,500 350,300 T850,400"
            stroke="currentColor"
            strokeWidth="1.5"
            className={theme === 'light' ? 'text-rose-200' : 'text-rose-500'}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 1 }}
          />
        </svg>

        {/* Abstract Floating Shapes */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [45, 50, 45] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-16 h-8 bg-emerald-400/30 rounded-t-full rotate-45"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/4 w-12 h-12 bg-rose-400/20 rounded-full blur-sm"
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 left-10 w-20 h-10 bg-amber-400/15 rounded-b-full -rotate-12"
        />
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-20 w-24 h-24 bg-emerald-900/10 dark:bg-emerald-500/5 rounded-tr-[50px]"
        />

        {/* Content Section */}
        <div className="relative z-10 max-w-4xl px-8 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm ${
              theme === 'light' ? 'bg-zinc-50 border-zinc-100 text-zinc-500' : 'bg-white/5 border-white/10 text-zinc-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Efficiency Engine V3.0</span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-6xl lg:text-8xl font-black tracking-tight leading-none ${
                theme === 'light' ? 'text-zinc-950' : 'text-white'
              }`}
            >
              TikTok <span className="relative inline-block">
                KOL Finder
                <span className="absolute -inset-x-4 -inset-y-2 bg-rose-500/10 -rotate-2 rounded-2xl -z-10" />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg lg:text-xl font-medium text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed"
            >
              整合全球实时数据抓取 · 智能数据清洗引擎
              <br className="hidden lg:block" />
              助力品牌在 TikTok 生态中精准锁定并捕捉极具潜力的达人资源
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-6"
          >
            <button className={`flex items-center gap-2 px-10 py-5 rounded-3xl font-black transition-all active:scale-95 shadow-2xl ${
              theme === 'light'
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-emerald-200/50'
                : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-emerald-500/20'
            }`}>
              立即开启挖掘 <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* Bottom Feature Bar */}
        <div className={`absolute bottom-0 left-0 right-0 py-8 px-16 border-t flex items-center justify-between transition-all ${
          theme === 'light' ? 'bg-zinc-50/50 border-zinc-100' : 'bg-black/20 border-white/5'
        }`}>
          <FeatureItem icon={Search} text="Real-time Mining" color="bg-rose-100 text-rose-600" />
          <FeatureItem icon={Zap} text="Precision Leads" color="bg-amber-100 text-amber-600" />
          <FeatureItem icon={TrendingUp} text="Content Intelligence" color="bg-emerald-100 text-emerald-600" />
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon: Icon, text, color }: { icon: any; text: string; color: string }) => (
  <div className="flex items-center gap-3 group">
    <div className={`p-2.5 rounded-2xl ${color} transition-transform group-hover:scale-110 shadow-sm`}>
      <Icon className="w-4 h-4" />
    </div>
    <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 group-hover:text-zinc-600 transition-colors">
      {text}
    </span>
  </div>
);

export default HeroBanner;