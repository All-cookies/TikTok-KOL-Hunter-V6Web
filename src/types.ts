export type Theme = 'light' | 'dark';
export type ActiveTab = 'search' | 'saved' | 'analytics';
export type ViewMode = 'grid' | 'list';
export type GradeFilter = 'all' | 'A' | 'B' | 'C';

export interface KolScore {
  total: number;
  grade: 'A' | 'B' | 'C';
  breakdown: {
    hasEmail: number;        // +30
    sizeMatch: number;       // +20
    bioCategory: number;     // +15
    competitorSource: number; // +15
    activeCreator: number;   // +10
    sceneSource: number;     // +10
    collabSignal: number;     // +10
    hasBioLink: number;      // +5
    viralVideo: number;      // +5
  };
}

export interface Creator {
  unique_id: string;
  nickname: string;
  follower_count: number;
  video_count: number;
  best_video_plays: number;
  email?: string;
  bio?: string;
  profile_url: string;
  avatar_url?: string;
  search_keyword?: string;
  score?: KolScore;
  video_titles?: string[];
  best_video_likes?: number;
  video_create_time?: number;
}

export interface SavedCreator extends Creator {
  saved_at: number;
  tags: string[];
  notes: string;
}

export interface CreatorWithScore extends Creator {
  score: KolScore;
}