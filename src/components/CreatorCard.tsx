import React from 'react';
import { Mail, Heart, ExternalLink, Copy, Check } from 'lucide-react';
import { Creator, Theme, KolScore } from '../types';
import Image from 'next/image';

interface CreatorCardProps {
  creator: Creator;
  theme: Theme;
  copiedEmail: string | null;
  onCopyEmail: (email: string) => void;
  formatNumber: (num: number) => string;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  score?: KolScore;
}

export function CreatorCard({
  creator,
  theme,
  copiedEmail,
  onCopyEmail,
  formatNumber,
  isSaved,
  onToggleSave,
  score
}: CreatorCardProps) {
  const isDark = theme === 'dark';

  return (
    <div className={`group relative px-4 pb-4 pt-14 rounded-2xl border transition-all duration-300 hover:shadow-xl ${
      isDark
        ? 'bg-zinc-900 border-white/10 hover:border-teal-500/30'
        : 'bg-white border-gray-100 hover:border-teal-500/30 hover:shadow-gray-200/50'
    }`}>
      {/* Grade Badge */}
      {score && (
        <div className={`absolute top-4 left-4 z-10 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase shadow-sm ${
          score.grade === 'A'
            ? 'bg-amber-500 text-white border-amber-600'
            : score.grade === 'B'
              ? 'bg-blue-500 text-white border-blue-600'
              : 'bg-gray-500 text-white border-gray-600'
        }`}>
          {score.grade}级达人
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={() => onToggleSave(creator.unique_id)}
        className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-all duration-200 ${
          isSaved
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
            : isDark
              ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-red-400'
              : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500'
        }`}
      >
        <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
      </button>

      {/* Profile Info */}
      <div className="flex items-center gap-4 mb-5">
        <div className={`relative w-16 h-16 rounded-full flex items-center justify-center border-2 shadow-md font-bold text-xl ${
          isDark
            ? 'bg-teal-500/20 border-white/20 text-teal-400'
            : 'bg-teal-100 border-teal-200 text-teal-600'
        }`}>
          {creator.nickname.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-base truncate leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {creator.nickname}
          </h3>
          <p className={`text-xs truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            @{creator.unique_id}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <a
              href={creator.profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-teal-500 hover:underline flex items-center gap-0.5"
            >
              TikTok 主页 <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-2 gap-2 p-3 rounded-xl mb-4 ${
        isDark ? 'bg-white/5' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            粉丝
          </div>
          <div className={`text-sm font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
            {formatNumber(creator.follower_count)}
          </div>
        </div>
        <div className="text-center">
          <div className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            点赞
          </div>
          <div className={`text-sm font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
            {formatNumber(creator.best_video_likes || 0)}
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className={`text-xs line-clamp-2 min-h-[2.5rem] leading-relaxed mb-4 ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {creator.bio || '此达人暂无简介'}
      </p>

      {/* Email / Contact Section */}
      <div className="mt-auto">
        {creator.email ? (
          <div className={`flex items-center justify-between p-2.5 rounded-lg border border-dashed transition-all ${
            copiedEmail === creator.email
              ? 'bg-teal-50 border-teal-200 text-teal-600'
              : isDark
                ? 'bg-teal-500/5 border-teal-500/20 text-teal-400'
                : 'bg-teal-50/50 border-teal-200/50 text-teal-600'
          }`}>
            <div className="flex items-center gap-2 overflow-hidden">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] font-medium truncate">{creator.email}</span>
            </div>
            <button
              onClick={() => onCopyEmail(creator.email!)}
              className="p-1 hover:bg-teal-500/10 rounded transition-colors"
            >
              {copiedEmail === creator.email ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          <div className={`flex items-center justify-center p-2.5 rounded-lg border border-dashed ${
            isDark ? 'bg-zinc-800 border-white/5 text-gray-500' : 'bg-gray-100 border-gray-200 text-gray-400'
          }`}>
            <span className="text-[11px] font-medium italic">暂无公开邮箱</span>
          </div>
        )}
      </div>
    </div>
  );
}