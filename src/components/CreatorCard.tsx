'use client';

import React from 'react';
import { ExternalLink, Mail, MailX, Heart, Star } from 'lucide-react';
import { Creator, Theme, SavedCreator, KolScore } from '../types';

interface CreatorCardProps {
  creator: Creator | SavedCreator;
  theme: Theme;
  copiedEmail: string | null;
  onCopyEmail: (email: string) => void;
  formatNumber: (n: number) => string;
  isSaved?: boolean;
  onToggleSave?: (uniqueId: string) => void;
  onClick?: (creator: Creator | SavedCreator) => void;
  score?: KolScore;
}

const GRADE_STYLES = {
  A: { bg: 'bg-teal-500', text: 'text-white' },
  B: { bg: 'bg-slate-400', text: 'text-white' },
  C: { bg: 'bg-slate-200', text: 'text-slate-600' },
};

export const CreatorCard: React.FC<CreatorCardProps> = ({
  creator, theme, copiedEmail, onCopyEmail, formatNumber,
  isSaved, onToggleSave, onClick, score
}) => {
  const savedCreator = creator as SavedCreator;
  const gradeStyle = score ? GRADE_STYLES[score.grade] : null;

  return (
    <div
      onClick={() => onClick && onClick(creator)}
      className={`group rounded-lg border bg-white transition-colors duration-150 cursor-pointer ${
        theme === 'light'
          ? 'border-gray-200 hover:border-teal-300 hover:shadow-sm'
          : 'border-white/10 hover:border-teal-500/30 hover:shadow-lg'
      }`}
    >
      <div className="p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold ${
              theme === 'light' ? 'bg-teal-50 text-teal-600' : 'bg-teal-500/20 text-teal-400'
            }`}>
              {creator.unique_id[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className={`font-medium text-sm ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                  @{creator.unique_id}
                </h4>
                {score && gradeStyle && (
                  <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${gradeStyle.bg} ${gradeStyle.text}`}>
                    <Star className="w-2.5 h-2.5" />
                    {score.grade}
                  </span>
                )}
              </div>
              <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                {creator.nickname || '匿名作者'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {onToggleSave && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(creator.unique_id);
                }}
                className={`p-1.5 rounded transition-colors duration-150 ${
                  isSaved
                    ? 'text-rose-500'
                    : theme === 'light'
                      ? 'text-gray-300 hover:text-rose-500'
                      : 'text-gray-600 hover:text-rose-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}
            <a
              href={creator.profile_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`p-1.5 rounded transition-colors duration-150 ${
                theme === 'light'
                  ? 'text-gray-300 hover:text-teal-600'
                  : 'text-gray-600 hover:text-teal-400'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Bio */}
        {creator.bio && (
          <p className={`text-xs mb-3 line-clamp-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
            {creator.bio}
          </p>
        )}

        {/* Stats Grid */}
        <div className={`grid grid-cols-3 gap-2 mb-3 py-2 px-3 rounded-lg ${
          theme === 'light' ? 'bg-gray-50' : 'bg-white/5'
        }`}>
          <div className="text-center">
            <p className={`text-sm font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
              {formatNumber(creator.follower_count)}
            </p>
            <p className={`text-[10px] ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>粉丝</p>
          </div>
          <div className="text-center">
            <p className={`text-sm font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
              {creator.video_count}
            </p>
            <p className={`text-[10px] ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>视频</p>
          </div>
          <div className="text-center">
            <p className={`text-sm font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
              {formatNumber(creator.best_video_plays)}
            </p>
            <p className={`text-[10px] ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>播放</p>
          </div>
        </div>

        {/* Tags (for saved creators) */}
        {savedCreator.tags && savedCreator.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {savedCreator.tags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  theme === 'light' ? 'bg-gray-100 text-gray-500' : 'bg-white/10 text-gray-400'
                }`}
              >
                {tag}
              </span>
            ))}
            {savedCreator.tags.length > 2 && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                theme === 'light' ? 'bg-gray-100 text-gray-400' : 'bg-white/10 text-gray-500'
              }`}>
                +{savedCreator.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Email Button */}
        <div>
          {creator.email ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopyEmail(creator.email!);
              }}
              className={`w-full flex items-center justify-center gap-1.5 py-2 rounded text-xs font-medium transition-colors duration-150 ${
                copiedEmail === creator.email
                  ? 'bg-teal-500 text-white'
                  : theme === 'light'
                    ? 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                    : 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30'
              }`}
            >
              {copiedEmail === creator.email ? (
                <>已复制</>
              ) : (
                <>
                  <Mail className="w-3 h-3" />
                  {creator.email}
                </>
              )}
            </button>
          ) : (
            <div className={`w-full flex items-center justify-center gap-1.5 py-2 rounded text-xs ${
              theme === 'light' ? 'bg-gray-50 text-gray-400' : 'bg-white/5 text-gray-500'
            }`}>
              <MailX className="w-3 h-3" />
              暂无邮箱
            </div>
          )}
        </div>
      </div>
    </div>
  );
};