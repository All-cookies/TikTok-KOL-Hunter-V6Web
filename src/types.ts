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
}

export type Theme = 'light' | 'dark';
export type ViewMode = 'grid' | 'list';