export interface Creator {
  unique_id: string;
  nickname: string;
  follower_count: number;
  video_count: number;
  bio: string;
  email: string | null;
  profile_url: string;
  best_video_plays: number;
  search_keyword: string;
  // 视频标题（用于内容相关性分析）
  video_titles?: string[];
}

export interface KolScore {
  total: number;
  grade: 'A' | 'B' | 'C';
  breakdown: {
    contentRelevance: number;
    contactable: number;
    sizeMatch: number;
    viralPotential: number;
    activity: number;
  };
}

export interface CreatorWithScore extends Creator {
  score: KolScore;
}

export interface SavedCreator extends Creator {
  savedAt: number;
  tags: string[];
  notes: string;
  score?: KolScore;
}

export type Theme = 'light' | 'dark';
export type ViewMode = 'grid' | 'list';
export type ActiveTab = 'search' | 'saved' | 'analytics';
export type GradeFilter = 'all' | 'A' | 'B' | 'C';