import 'dotenv/config';

const TIKHUB_API_KEY = process.env.TIKHUB_API_KEY || 'oatYGeA5/Fez3UeuBbXNxkTsaReyfpt7zhT3uRWZbaK3lw29AHyCWgWzFQ==';

export interface ScrapeOptions {
  followerRanges: string[];
  sortBy: 'views' | 'latest' | 'random' | 'hasEmail' | 'score';
  limit: number;
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

interface Creator {
  unique_id: string;
  nickname: string;
  follower_count: number;
  video_count: number;
  bio: string;
  email: string | null;
  profile_url: string;
  best_video_plays: number;
  best_video_likes: number;
  video_create_time?: number;
  search_keyword: string;
  video_titles?: string[];
}

const MAX_PAGES = 4;

async function tikhubFetch(endpoint: string, params: Record<string, string | number>) {
  const url = new URL(`https://api.tikhub.io${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${TIKHUB_API_KEY}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }

  return res.json();
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractEmail(text: string): string | null {
  if (!text) return null;
  const normalized = text
    .replace(/\[at\]/gi, '@')
    .replace(/\(at\)/gi, '@')
    .replace(/ at /gi, '@')
    .replace(/\[dot\]/gi, '.')
    .replace(/\(dot\)/gi, '.')
    .replace(/ dot /gi, '.');

  const m = normalized.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return m ? m[0].toLowerCase() : null;
}

function matchesFollowerRange(followers: number, ranges: string[]): boolean {
  if (!ranges || ranges.length === 0) return true;

  return ranges.some((range) => {
    switch (range) {
      case 'under1k': return followers < 1000;
      case '1k-10k': return followers >= 1000 && followers < 10000;
      case '10k-50k': return followers >= 10000 && followers < 50000;
      case '50k-100k': return followers >= 50000 && followers < 100000;
      case '100k-300k': return followers >= 100000 && followers < 300000;
      case '300k-500k': return followers >= 300000 && followers < 500000;
      case '500k-1m': return followers >= 500000 && followers < 1000000;
      case '1m-5m': return followers >= 1000000 && followers < 5000000;
      case 'over5m': return followers >= 5000000;
      default: return true;
    }
  });
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 内容相关性词库（简化版）
const CONTENT_KEYWORDS: Record<string, string[]> = {
  beauty: ['makeup', 'skincare', 'cosmetic', 'tutorial', 'routine', 'review', 'haul', 'beauty'],
  tech: ['review', 'unboxing', 'tech', 'gadget', 'setup', 'device', 'phone', 'laptop'],
  fashion: ['outfit', 'fashion', 'ootd', 'style', 'clothing', 'dress', 'streetwear'],
  fitness: ['workout', 'fitness', 'gym', 'exercise', 'training', 'health', 'body'],
  food: ['recipe', 'cooking', 'food', 'eat', 'meal', 'kitchen', 'chef', 'yummy'],
  travel: ['travel', 'trip', 'vacation', 'destination', 'explore', 'adventure'],
  gaming: ['game', 'gaming', 'play', 'stream', 'twitch', 'xbox', 'ps5'],
  lifestyle: ['vlog', 'daily', 'routine', 'life', 'home', 'decor'],
  ai: ['ai', 'chatgpt', 'tool', 'productivity', 'software', 'app', 'automation'],
};

// 计算内容相关性分数
function calculateContentRelevance(videoTitles: string[], searchKeyword: string): number {
  if (!videoTitles || videoTitles.length === 0) return 0;

  const keyword = searchKeyword.toLowerCase();
  const relatedTerms = CONTENT_KEYWORDS[keyword] || [keyword];

  let matches = 0;
  for (const title of videoTitles) {
    const lower = title.toLowerCase();
    if (relatedTerms.some(term => lower.includes(term))) {
      matches++;
    }
  }

  return Math.min(30, matches * 10);
}

// 计算达人评分
export function calculateKolScore(
  creator: Creator,
  followerRanges: string[],
  searchKeywords: string[]
): KolScore {
  // 1. 内容相关性 (0-30)
  const contentRelevance = calculateContentRelevance(creator.video_titles || [], searchKeywords[0] || '');

  // 2. 可联系 (0-25)
  const contactable = creator.email ? 25 : 0;

  // 3. 规模匹配 (0-20)
  const sizeMatch = matchesFollowerRange(creator.follower_count, followerRanges) ? 20 : 0;

  // 4. 爆款潜力 (0-15)
  let viralPotential = 0;
  if (creator.follower_count > 0) {
    const ratio = creator.best_video_plays / creator.follower_count;
    if (ratio > 0.5) viralPotential = 15;
    else if (ratio > 0.2) viralPotential = 10;
    else if (ratio > 0.05) viralPotential = 5;
  }

  // 5. 创作活跃度 (0-10)
  let activity = 0;
  if (creator.video_count > 30) activity = 10;
  else if (creator.video_count > 10) activity = 5;

  const total = contentRelevance + contactable + sizeMatch + viralPotential + activity;

  let grade: 'A' | 'B' | 'C';
  if (total >= 70) grade = 'A';
  else if (total >= 40) grade = 'B';
  else grade = 'C';

  return {
    total,
    grade,
    breakdown: { contentRelevance, contactable, sizeMatch, viralPotential, activity }
  };
}

async function searchByKeyword(keyword: string): Promise<Map<string, Creator>> {
  const creatorMap = new Map<string, Creator>();

  console.log(`🔍 搜索: "${keyword}"`);

  let offset = 0;
  for (let page = 0; page < MAX_PAGES; page++) {
    try {
      const data = await tikhubFetch('/api/v1/tiktok/app/v3/fetch_general_search_result', {
        keyword,
        offset,
        count: 20,
        search_type: 1,
      });

      const items: any[] = data?.data?.data || [];
      if (!items.length) break;

      let added = 0;
      for (const item of items) {
        const aweme = item?.aweme_info;
        if (!aweme) continue;

        const a = aweme.author;
        if (!a?.unique_id) continue;

        const uid = String(a.unique_id);
        const followers = Number(a.follower_count || 0);
        const videoTitle = String(aweme.desc || aweme.title || '');

        const plays = Number(aweme.statistics?.play_count || 0);
        const likes = Number(aweme.statistics?.digg_count || 0);
        const createTime = Number(aweme.create_time || 0);
        const bio = String(a.signature || '');

        const existing = creatorMap.get(uid);
        if (existing) {
          if (plays > existing.best_video_plays) {
            existing.best_video_plays = plays;
            existing.best_video_likes = likes;
            existing.video_create_time = createTime;
            existing.video_titles = existing.video_titles || [];
            if (videoTitle && !existing.video_titles.includes(videoTitle)) {
              existing.video_titles.push(videoTitle);
            }
          }
        } else {
          creatorMap.set(uid, {
            unique_id: uid,
            nickname: String(a.nickname || ''),
            follower_count: followers,
            video_count: Number(a.aweme_count || 0),
            bio,
            email: extractEmail(bio),
            profile_url: `https://www.tiktok.com/@${uid}`,
            best_video_plays: plays,
            best_video_likes: likes,
            video_create_time: createTime,
            search_keyword: keyword,
            video_titles: videoTitle ? [videoTitle] : [],
          });
          added++;
        }
      }

      console.log(`  页${page + 1}: +${added}位，累计${creatorMap.size}位`);

      if (!data?.data?.has_more) break;
      offset += items.length;
      await sleep(1000);
    } catch (e) {
      console.error(`  错误:`, e);
      break;
    }
  }

  return creatorMap;
}

async function enrichProfiles(creatorMap: Map<string, Creator>): Promise<void> {
  const creators = Array.from(creatorMap.values());
  console.log(`\n📋 补全 ${creators.length} 位博主 Profile...`);

  let emailFound = 0;

  for (let i = 0; i < creators.length; i++) {
    const c = creators[i];
    try {
      const data = await tikhubFetch('/api/v1/tiktok/web/fetch_user_profile', {
        uniqueId: c.unique_id,
      });

      const user = data?.data?.userInfo?.user;
      if (!user) continue;

      const fullBio = String(user.signature || '');
      const email = extractEmail(fullBio);

      c.bio = fullBio || c.bio;
      c.nickname = user.nickname || c.nickname;
      c.follower_count = user.followerCount ?? c.follower_count;
      c.video_count = user.videoCount ?? c.video_count;

      // 补全阶段：如果发现新邮箱，更新它
      if (email && !c.email) {
        c.email = email;
        emailFound++;
      }

      if ((i + 1) % 10 === 0) {
        process.stdout.write(`  进度: ${i + 1}/${creators.length}，邮箱+${emailFound}\n`);
      }

      await sleep(150);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('429') || msg.includes('limit')) {
        console.log('  ⚠️  API 限速，暂停 10 秒...');
        await sleep(10000);
      }
    }
  }

  console.log(`  ✅ 补全完成，邮箱+${emailFound}`);
}

export async function scrape(keywords: string[], options: ScrapeOptions): Promise<Creator[]> {
  const { followerRanges, sortBy, limit } = options;
  let { limit: targetLimit } = options;

  // 确保至少采集足够的原始数据
  const collectMultiplier = 3;
  let collectTarget = targetLimit * collectMultiplier;

  const allCreators = new Map<string, Creator>();

  // Phase 1: 搜索（根据目标数量动态调整搜索量）
  for (const keyword of keywords) {
    if (allCreators.size >= collectTarget) break;
    const map = await searchByKeyword(keyword);
    map.forEach((v, k) => {
      if (!allCreators.has(k)) allCreators.set(k, v);
    });
  }

  console.log(`\n📊 Phase 1 完成：去重后 ${allCreators.size} 位博主`);

  // Phase 2: 先筛选和排序（不补全，快速筛选）
  let filtered = Array.from(allCreators.values());
  const originalRanges = [...followerRanges];

  // 2.1 按粉丝区间筛选
  if (followerRanges.length > 0) {
    filtered = filtered.filter((c) => matchesFollowerRange(c.follower_count, followerRanges));
    console.log(`📊 粉丝筛选后：${filtered.length} 位`);
  }

  // 2.2 如果结果不足 limit，自动放宽条件
  if (filtered.length < targetLimit) {
    console.log(`⚠️ 结果不足 ${targetLimit}，自动放宽筛选条件...`);

    const allRanges = ['under1k', '1k-10k', '10k-50k', '50k-100k', '100k-300k', '300k-500k', '500k-1m', '1m-5m', 'over5m'];
    const additionalRanges = allRanges.filter((r) => !originalRanges.includes(r));

    if (additionalRanges.length > 0 && filtered.length < targetLimit) {
      const newRanges = [...followerRanges, ...additionalRanges.slice(0, 2)];
      filtered = Array.from(allCreators.values()).filter((c) =>
        matchesFollowerRange(c.follower_count, newRanges)
      );
      console.log(`📊 放宽粉丝区间后：${filtered.length} 位`);
    }

    if (filtered.length < targetLimit) {
      filtered = Array.from(allCreators.values());
      console.log(`📊 移除粉丝限制，返回全部：${filtered.length} 位`);
    }
  }

  // 2.3 排序
  switch (sortBy) {
    case 'views':
      filtered.sort((a, b) => b.best_video_plays - a.best_video_plays);
      break;
    case 'latest':
      filtered.sort((a, b) => (b.video_create_time || 0) - (a.video_create_time || 0));
      break;
    case 'random':
      filtered = shuffleArray(filtered);
      break;
    case 'hasEmail':
      filtered.sort((a, b) => {
        if (a.email && !b.email) return -1;
        if (!a.email && b.email) return 1;
        return b.best_video_plays - a.best_video_plays;
      });
      break;
    case 'score':
      // 按评分排序（A级在前，同级按分数降序）
      filtered.sort((a, b) => {
        const scoreA = calculateKolScore(a, followerRanges, keywords);
        const scoreB = calculateKolScore(b, followerRanges, keywords);
        if (scoreA.grade !== scoreB.grade) {
          const gradeOrder = { A: 0, B: 1, C: 2 };
          return gradeOrder[scoreA.grade] - gradeOrder[scoreB.grade];
        }
        return scoreB.total - scoreA.total;
      });
      break;
  }

  // 2.4 只取目标数量
  const candidates = filtered.slice(0, targetLimit);
  console.log(`📊 候选博主：${candidates.length} 位`);

  // Phase 3: 只对最终候选进行补全（优化：减少 API 调用）
  const candidateMap = new Map<string, Creator>();
  candidates.forEach(c => candidateMap.set(c.unique_id, c));
  await enrichProfiles(candidateMap);

  // 更新排序（补全后有邮箱优先或评分排序）
  if (sortBy === 'hasEmail' || sortBy === 'score') {
    candidateMap.forEach((c) => {
      if (c.email) candidateMap.get(c.unique_id)!.email = c.email;
    });
    const arr = Array.from(candidateMap.values());
    arr.sort((a, b) => {
      if (sortBy === 'score') {
        const scoreA = calculateKolScore(a, followerRanges, keywords);
        const scoreB = calculateKolScore(b, followerRanges, keywords);
        if (scoreA.grade !== scoreB.grade) {
          const gradeOrder = { A: 0, B: 1, C: 2 };
          return gradeOrder[scoreA.grade] - gradeOrder[scoreB.grade];
        }
        return scoreB.total - scoreA.total;
      }
      if (a.email && !b.email) return -1;
      if (!a.email && b.email) return 1;
      return b.best_video_plays - a.best_video_plays;
    });
    candidateMap.clear();
    arr.forEach(c => candidateMap.set(c.unique_id, c));
  }

  const finalResult = Array.from(candidateMap.values());
  console.log(`\n✅ 最终结果：${finalResult.length} 位博主`);

  return finalResult;
}
