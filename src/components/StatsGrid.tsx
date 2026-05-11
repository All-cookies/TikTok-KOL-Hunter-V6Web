'use client';

import React from 'react';
import { Users, Mail, TrendingUp, Play } from 'lucide-react';
import { Theme } from '../types';

interface StatsGridProps {
  stats: {
    total: number;
    emailCount: number;
    emailRate: number;
    avgFollowers: number;
    totalPlays: number;
  };
  theme: Theme;
  formatNumber: (n: number) => string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, theme, formatNumber }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="累计采集总数"
        value={stats.total}
        icon={Users}
        color="zinc"
        subtitle="已去重达人记录"
        theme={theme}
      />
      <StatCard
        title="已获取邮箱"
        value={stats.emailCount}
        icon={Mail}
        color="emerald"
        subtitle={`触达转化率: ${stats.emailRate}%`}
        theme={theme}
      />
      <StatCard
        title="平均粉丝量"
        value={formatNumber(stats.avgFollowers)}
        icon={TrendingUp}
        color="zinc"
        subtitle="全库样本统计"
        theme={theme}
      />
      <StatCard
        title="最大覆盖范围"
        value={formatNumber(stats.totalPlays)}
        icon={Play}
        color="emerald"
        subtitle="视频总播放数"
        theme={theme}
      />
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, subtitle, theme }: any) => {
  const accentColors: any = {
    zinc: 'bg-zinc-500',
    emerald: 'bg-emerald-500',
  };

  return (
    <div className={`p-6 rounded-2xl border ${
      theme === 'light' ? 'bg-white border-zinc-100 text-zinc-900 shadow-sm' : 'bg-zinc-900/40 border-white/5 text-white'
    } group transition-all duration-300 hover:shadow-xl hover:border-emerald-500/20 relative overflow-hidden`}>
      {/* Decorative accent for card */}
      <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-30 ${accentColors[color] || 'bg-emerald-500'}`} />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className={`p-2.5 rounded-xl ${theme === 'light' ? 'bg-zinc-50 text-zinc-400' : 'bg-zinc-950 text-zinc-500'} group-hover:text-emerald-500 border border-transparent group-hover:border-emerald-500/20 transition-all`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className={`text-[10px] uppercase tracking-widest font-black opacity-30 group-hover:opacity-60 transition-opacity`}>{subtitle}</span>
      </div>
      <div className="space-y-1 relative z-10">
        <h3 className={`text-3xl font-bold tracking-tight group-hover:translate-x-1 transition-transform`}>{value}</h3>
        <p className={`text-[10px] font-bold uppercase tracking-widest opacity-50`}>{title}</p>
      </div>
    </div>
  );
};