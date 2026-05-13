'use client';

import React, { useState, useRef } from 'react';
import { ExternalLink, Mail, MailX, Heart, Star, Users, Play, Video } from 'lucide-react';
import { Creator, Theme, SavedCreator, KolScore } from '../types';

interface CreatorTooltipProps {
  creator: Creator | SavedCreator;
  theme: Theme;
  children: React.ReactNode;
  copiedEmail: string | null;
  onCopyEmail: (email: string) => void;
  formatNumber: (n: number) => string;
  isSaved?: boolean;
  onToggleSave?: (uniqueId: string) => void;
  score?: KolScore;
}

const GRADE_STYLES = {
  A: { bg: 'bg-teal-600', text: 'text-white' },
  B: { bg: 'bg-slate-500', text: 'text-white' },
  C: { bg: 'bg-slate-300', text: 'text-slate-700' },
};

export const CreatorTooltip: React.FC<CreatorTooltipProps> = ({
  creator, theme, children, copiedEmail, onCopyEmail, formatNumber,
  isSaved, onToggleSave, score
}) => {
  const [show, setShow] = useState(false);
  const [ positioned, setPositioned] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShow(true);
      setPositioned(true);
    }, 250);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShow(false);
    setPositioned(false);
  };

  const savedCreator = creator as SavedCreator;
  const gradeStyle = score ? GRADE_STYLES[score.grade] : null;

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-block"
    >
      {children}

      {/* Tooltip */}
      {show && (
        <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-72 rounded-lg border shadow-lg overflow-hidden transition-opacity duration-150 ${
          theme === 'light'
            ? 'bg-white border-gray-200 shadow-gray-200/50'
            : 'bg-zinc-800 border-white/10 shadow-black/50'
        }`}>
          {/* Header */}
          <div className="p-3 flex items-start gap-3 border-b border-gray-100 dark:border-white/10">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold ${
              theme === 'light' ? 'bg-teal-50 text-teal-600' : 'bg-teal-500/20 text-teal-400'
            }`}>
              {creator.unique_id[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className={`font-medium text-sm truncate ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                  @{creator.unique_id}
                </h4>
                {score && gradeStyle && (
                  <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-semibold ${gradeStyle.bg} ${gradeStyle.text}`}>
                    <Star className="w-2.5 h-2.5" />
                    {score.grade}
                  </span>
                )}
              </div>
              <p className={`text-xs truncate ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                {creator.nickname || '匿名作者'}
              </p>
            </div>
          </div>

          {/* Bio */}
          {creator.bio && (
            <div className={`px-3 py-2 text-xs line-clamp-2 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
              {creator.bio}
            </div>
          )}

          {/* Stats */}
          <div className={`px-3 py-2 grid grid-cols-3 gap-2 ${
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
              <p className={`text-[10px] ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>最高播放</p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2 flex items-center gap-2">
            {creator.email ? (
              <button
                onClick={() => onCopyEmail(creator.email!)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-medium transition-colors duration-150 ${
                  copiedEmail === creator.email
                    ? 'bg-teal-500 text-white'
                    : theme === 'light'
                      ? 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                      : 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30'
                }`}
              >
                {copiedEmail === creator.email ? <span>已复制</span> : <><Mail className="w-3 h-3" /> {creator.email}</>}
              </button>
            ) : (
              <div className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs ${
                theme === 'light' ? 'bg-gray-50 text-gray-400' : 'bg-white/5 text-gray-500'
              }`}>
                <MailX className="w-3 h-3" />
                暂无邮箱
              </div>
            )}
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(creator.unique_id)}
                className={`p-2 rounded transition-colors duration-150 ${
                  isSaved
                    ? 'text-rose-500 bg-rose-50'
                    : theme === 'light'
                      ? 'text-gray-400 hover:text-rose-500 hover:bg-rose-50'
                      : 'text-gray-500 hover:text-rose-500 hover:bg-rose-500/10'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}
            <a
              href={creator.profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded transition-colors duration-150 ${
                theme === 'light'
                  ? 'text-gray-400 hover:text-teal-600 hover:bg-teal-50'
                  : 'text-gray-500 hover:text-teal-400 hover:bg-teal-500/10'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};