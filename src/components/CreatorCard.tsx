'use client';

import React from 'react';
import { ExternalLink, Users, Play, Mail, MailX, Check } from 'lucide-react';
import { Creator, Theme } from '../types';

interface CreatorCardProps {
  creator: Creator;
  theme: Theme;
  copiedEmail: string | null;
  onCopyEmail: (email: string) => void;
  formatNumber: (n: number) => string;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({ creator, theme, copiedEmail, onCopyEmail, formatNumber }) => {
  return (
    <div className={`group rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1.5 ${
      theme === 'light'
        ? 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-2xl shadow-sm'
        : 'bg-zinc-900 border-white/5 hover:border-white/20 hover:shadow-2xl shadow-black'
    }`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold border ${
              theme === 'light'
                ? 'bg-slate-50 text-slate-900 border-slate-200 shadow-inner'
                : 'bg-zinc-950 text-white border-white/10 shadow-xl'
            }`}>
              {creator.unique_id[0].toUpperCase()}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full shadow-sm`} />
          </div>
          <div>
            <h4 className={`font-bold transition-colors flex items-center gap-1.5 ${theme === 'light' ? 'text-zinc-900 group-hover:text-emerald-600' : 'text-zinc-100 group-hover:text-emerald-400'}`}>
              @{creator.unique_id}
              <a href={creator.profile_url} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </h4>
            <p className={`text-xs font-bold uppercase tracking-wider ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'}`}>{creator.nickname || '匿名作者'}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${
          theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-zinc-400'
        }`}>
          {creator.search_keyword}
        </span>
      </div>

      <div className={`text-sm mb-6 line-clamp-2 min-h-[2.5rem] leading-relaxed font-medium ${theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>
        {creator.bio || '该博主暂无个人简介。建议查看其实时主页以获取最新创作趋势。'}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatItem icon={Users} label="粉丝总数" value={formatNumber(creator.follower_count)} theme={theme} />
        <StatItem icon={Play} label="爆款视频播放" value={formatNumber(creator.best_video_plays)} theme={theme} color="blue" />
      </div>

      <div className={`pt-5 border-t ${theme === 'light' ? 'border-slate-100' : 'border-white/5'}`}>
        {creator.email ? (
          <button
            onClick={() => onCopyEmail(creator.email!)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              copiedEmail === creator.email
                ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/10'
                : theme === 'light'
                  ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                  : 'bg-zinc-100 text-zinc-950 hover:bg-white'
            }`}
          >
            {copiedEmail === creator.email ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            {copiedEmail === creator.email ? '邮箱已复制' : creator.email}
          </button>
        ) : (
          <div className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border ${
            theme === 'light' ? 'bg-zinc-50 border-zinc-100 text-zinc-400' : 'bg-transparent border-white/5 text-zinc-600'
          }`}>
            <MailX className="w-4 h-4" />
            暂无公开邮箱
          </div>
        )}
      </div>
    </div>
  );
};

const StatItem = ({ icon: Icon, label, value, theme, color }: any) => (
  <div className={`p-3 rounded-xl border transition-all duration-300 ${
    theme === 'light'
      ? 'bg-zinc-50 border-zinc-100 group-hover:border-emerald-100 group-hover:bg-emerald-50/50 shadow-sm'
      : 'bg-zinc-950 border-white/5 group-hover:border-emerald-500/20 group-hover:bg-emerald-500/5'
  }`}>
    <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold mb-1 transition-colors ${
      theme === 'light' ? 'text-zinc-400 group-hover:text-emerald-400' : 'text-zinc-500 group-hover:text-emerald-400'
    }`}>
      <Icon className="w-3 h-3" />
      {label}
    </div>
    <div className={`text-sm font-bold transition-colors ${
      color === 'blue'
        ? (theme === 'light' ? 'text-emerald-600' : 'text-emerald-400')
        : (theme === 'light' ? 'text-zinc-900 group-hover:text-emerald-600' : 'text-zinc-100 group-hover:text-emerald-300')
    }`}>
      {value}
    </div>
  </div>
);