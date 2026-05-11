'use client';

import React from 'react';
import { Search, BarChart3, Users, Zap, Sparkles } from 'lucide-react';
import { Theme } from '../types';

interface SidebarProps {
  theme: Theme;
}

export const Sidebar: React.FC<SidebarProps> = ({ theme }) => {
  return (
    <aside className={`fixed left-0 top-0 h-full w-64 z-40 hidden lg:block shadow-sm transition-colors duration-300 ${
      theme === 'light' ? 'bg-white border-r border-slate-100' : 'bg-zinc-950 border-r border-white/5'
    }`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className={`font-bold text-lg tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>KOL Hunter</h1>
            <p className={`text-[10px] uppercase tracking-widest font-bold ${theme === 'light' ? 'text-slate-400' : 'text-zinc-500'}`}>专业版</p>
          </div>
        </div>

        <nav className="space-y-1">
          <SidebarItem icon={Search} label="高效采集搜索" active theme={theme} />
          <SidebarItem icon={Users} label="红人资产库" theme={theme} />
          <SidebarItem icon={BarChart3} label="深度市场分析" theme={theme} />
        </nav>

        <div className="absolute bottom-10 left-6 right-6">
          <div className={`rounded-2xl p-5 border transition-all duration-300 ${
            theme === 'light'
              ? 'bg-zinc-50 border-zinc-100'
              : 'bg-emerald-500/5 border-emerald-500/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span className={`text-sm font-bold ${theme === 'light' ? 'text-zinc-900' : 'text-emerald-100'}`}>AI 智慧引擎</span>
            </div>
            <p className={`text-xs mb-4 leading-relaxed ${theme === 'light' ? 'text-zinc-500' : 'text-emerald-200/60'}`}>基于实时数据的社交网络深度解析，精准定位流量高地。</p>
            <button className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
              theme === 'light'
                ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                : 'bg-zinc-100 text-zinc-950 hover:bg-white'
            }`}>
              立即探索
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

const SidebarItem = ({ icon: Icon, label, active, theme }: { icon: any; label: string; active?: boolean; theme: Theme }) => (
  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group ${
    active
      ? theme === 'light'
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm shadow-emerald-100/20'
        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      : theme === 'light'
        ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
        : 'text-zinc-500 hover:text-zinc-100 hover:bg-white/5'
  }`}>
    <Icon className={`w-4 h-4 transition-colors ${active ? 'text-emerald-500' : 'text-zinc-500 group-hover:text-emerald-400'}`} />
    {label}
  </button>
);