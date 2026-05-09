import 'dotenv/config';

const TIKHUB_API_KEY = process.env.TIKHUB_API_KEY || 'oatYGeA5/Fez3UeuBbXNxkTsaReyfpt7zhT3uRWZbaK3lw29AHyCWgWzFQ==';

export interface ScrapeOptions {
  followerRanges: string[];
  sortBy: 'views' | 'latest' | 'random' | 'hasEmail';
  limit: number;
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
      case '100k-1m': return followers >= 100000 && followers < 1000000;
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

  // Phase 2: 补全
  await enrichProfiles(allCreators);

  // Phase 3: 筛选和补充
  let filtered = Array.from(allCreators.values());
  const originalRanges = [...followerRanges];

  // 3.1 按粉丝区间筛选
  if (followerRanges.length > 0) {
    filtered = filtered.filter((c) => matchesFollowerRange(c.follower_count, followerRanges));
    console.log(`\n📊 粉丝筛选后：${filtered.length} 位`);
  }

  // 3.2 如果结果不足 limit，自动放宽条件
  if (filtered.length < targetLimit) {
    console.log(`\n⚠️ 结果不足 ${targetLimit}，自动放宽筛选条件...`);

    // 尝试扩大粉丝区间范围
    const allRanges = ['under1k', '1k-10k', '100k-1m', '1m-5m', 'over5m'];

    // 添加更多未选中的粉丝区间
    const additionalRanges = allRanges.filter((r) => !originalRanges.includes(r));

    // 如果还有更多区间可选
    if (additionalRanges.length > 0 && filtered.length < targetLimit) {
      const newRanges = [...followerRanges, ...additionalRanges.slice(0, 2)];
      filtered = Array.from(allCreators.values()).filter((c) =>
        matchesFollowerRange(c.follower_count, newRanges)
      );
      console.log(`📊 放宽粉丝区间后：${filtered.length} 位`);
    }

    // 如果还是不够，直接返回所有已采集的
    if (filtered.length < targetLimit) {
      filtered = Array.from(allCreators.values());
      console.log(`📊 移除粉丝限制，返回全部：${filtered.length} 位`);
    }
  }

  // Phase 4: 排序
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
  }

  const finalResult = filtered.slice(0, targetLimit);
  console.log(`\n✅ 最终结果：${finalResult.length} 位博主`);

  return finalResult;
}
