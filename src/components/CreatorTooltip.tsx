'use client';

import React, { useState, useRef } from 'react';
import { ExternalLink, Heart } from 'lucide-react';
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

interface ScoreBarProps {
  label: string;
  value: number;
  max: number;
  theme: Theme;
}

function ScoreBar({ label, value, max, theme }: ScoreBarProps) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className={`text-[10px] w-16 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
        {label}
      </span>
      <div className={`flex-1 h-1.5 rounded-full ${theme === 'light' ? 'bg-gray-200' : 'bg-white/10'}`}>
        <div
          className={`h-full rounded-full transition-all ${
            pct >= 80 ? 'bg-teal-500' : pct >= 50 ? 'bg-amber-500' : 'bg-gray-400'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-[10px] font-medium w-8 text-right ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
        {value}/{max}
      </span>
    </div>
  );
}

export const CreatorTooltip: React.FC<CreatorTooltipProps> = ({
  creator, theme, children, copiedEmail, onCopyEmail, formatNumber,
  isSaved, onToggleSave, score
}) => {
  const [show, setShow] = useState(false);
  const [positioned, setPositioned] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDark = theme === 'dark';

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
      {show && score && (
        <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-72 rounded-lg border shadow-lg p-3 ${
          theme === 'light'
            ? 'bg-white border-gray-200 shadow-gray-200/50'
            : 'bg-zinc-800 border-white/10 shadow-black/50'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
              达人评分
            </span>
            <span className={`text-sm font-bold ${theme === 'light' ? 'text-teal-600' : 'text-teal-400'}`}>
              {score.total} 分 · {score.grade}级
            </span>
          </div>

          {/* 可联系性 */}
          <div className="mb-3">
            <div className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              可联系性 (45)
            </div>
            <div className="space-y-1.5">
              <ScoreBar label="有邮箱" value={score.breakdown.hasEmail} max={30} theme={theme} />
              <ScoreBar label="建联信号" value={score.breakdown.collabSignal} max={10} theme={theme} />
              <ScoreBar label="有落地页" value={score.breakdown.hasBioLink} max={5} theme={theme} />
            </div>
          </div>

          {/* 规模匹配 */}
          <div className="mb-3">
            <div className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              规模匹配 (20)
            </div>
            <div className="space-y-1.5">
              <ScoreBar label="粉丝区间" value={score.breakdown.sizeMatch} max={20} theme={theme} />
            </div>
          </div>

          {/* 品类相关性 */}
          <div className="mb-3">
            <div className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              品类相关性 (25)
            </div>
            <div className="space-y-1.5">
              <ScoreBar label="Bio品类匹配" value={score.breakdown.bioCategory} max={15} theme={theme} />
              <ScoreBar label="场景词来源" value={score.breakdown.sceneSource} max={10} theme={theme} />
            </div>
          </div>

          {/* 商业经验 */}
          <div className="mb-3">
            <div className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              商业经验 (15)
            </div>
            <div className="space-y-1.5">
              <ScoreBar label="竞品词来源" value={score.breakdown.competitorSource} max={15} theme={theme} />
            </div>
          </div>

          {/* 内容能力 */}
          <div>
            <div className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              内容能力 (15)
            </div>
            <div className="space-y-1.5">
              <ScoreBar label="活跃创作者" value={score.breakdown.activeCreator} max={10} theme={theme} />
              <ScoreBar label="爆款视频" value={score.breakdown.viralVideo} max={5} theme={theme} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};