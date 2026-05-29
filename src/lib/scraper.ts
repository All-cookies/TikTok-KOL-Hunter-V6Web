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

interface Creator {
  unique_id: string;
  nickname: string;
  follower_count: number;
  video_count: number;
  bio: string;
  email: string | null;
  profile_url: string;
  avatar_url?: string;
  best_video_plays: number;
  best_video_likes: number;
  video_create_time?: number;
  search_keyword: string;
  video_titles?: string[];
  has_bio_link?: boolean;
  bio_link?: string | null;
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
  // 支持多种邮箱格式
  const normalized = text
    .replace(/\[at\]/gi, '@')
    .replace(/\(at\)/gi, '@')
    .replace(/ at /gi, '@')
    .replace(/\[dot\]/gi, '.')
    .replace(/\(dot\)/gi, '.')
    .replace(/ dot /gi, '.')
    .replace(/✉/g, '@')
    .replace(/📧/g, '')
    .replace(/联系我[:：]/gi, '')
    .replace(/商务[:：]/gi, '')
    .replace(/合作[:：]/gi, '')
    .replace(/email[:：\s]/gi, '')
    .replace(/mail[:：\s]/gi, '')
    .replace(/联系我/g, '')
    .replace(/商务合作/g, '')
    .replace(/发送邮件/g, '');

  // 增强正则：支持更多变体
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
  const m = normalized.match(emailRegex);
  return m ? m[0].toLowerCase() : null;
}

// 从 video titles 提取邮箱（有些博主在视频描述留邮箱）
function extractEmailFromTitles(videoTitles: string[]): string | null {
  if (!videoTitles || videoTitles.length === 0) return null;
  for (const title of videoTitles) {
    const email = extractEmail(title);
    if (email) return email;
  }
  return null;
}

// 从落地页链接推断是否有商务联系方式（但不直接提取，只加分）
function hasBusinessLink(bioLink: string | null): boolean {
  if (!bioLink) return false;
  const businessDomains = ['linktree', 'linkinbio', 'beacons', 'carrd', 'about', 'contact'];
  const lower = bioLink.toLowerCase();
  return businessDomains.some(d => lower.includes(d)) || lower.includes('.com');
}

function matchesFollowerRange(followers: number, ranges: string[]): boolean {
  if (!ranges || ranges.length === 0) return true;

  return ranges.some((range) => {
    // Handle FilterBar format: '0-10000', '10000-50000', etc.
    if (range.includes('-')) {
      const [minStr, maxStr] = range.split('-');
      const min = parseInt(minStr);
      const max = maxStr === 'inf' ? Infinity : parseInt(maxStr);
      return followers >= min && followers < max;
    }
    // Handle scraper format: 'under1k', '1k-10k', etc.
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

// 内容相关性词库（扩展版）
const CONTENT_KEYWORDS: Record<string, string[]> = {
  beauty: [
    'makeup', 'skincare', 'cosmetic', 'tutorial', 'routine', 'review', 'haul', 'beauty',
    'lipstick', 'mascara', 'foundation', 'concealer', 'primer', 'blush', 'highlighter', 'contour',
    'facial', 'serum', 'moisturizer', 'sunscreen', 'cleanser', 'toner', 'mask', 'exfoliate',
    'nail', 'hair', 'styling', 'salon', 'aesthetic', 'glow', 'skintitude', 'wellness',
  ],
  tech: [
    'review', 'unboxing', 'tech', 'gadget', 'setup', 'device', 'phone', 'laptop',
    'computer', 'tablet', 'camera', 'speaker', 'headphone', 'smartwatch', 'drone', 'robot',
    'software', 'app', 'ai', 'chatgpt', 'coding', 'programming', 'developer', 'techreview',
    '开箱', '测评', '科技', '数码', '手机', '电脑', '平板',
  ],
  fashion: [
    'outfit', 'fashion', 'ootd', 'style', 'clothing', 'dress', 'streetwear', 'wear',
    'sneaker', 'shoe', 'bag', 'accessory', 'luxury', 'brand', 'designer', 'trend',
    '穿搭', '时尚', '潮流', '衣服', '裙子', '裤子',
  ],
  fitness: [
    'workout', 'fitness', 'gym', 'exercise', 'training', 'health', 'body', 'sport',
    'yoga', 'pilates', 'running', 'cardio', 'muscle', 'weight', 'diet', 'protein',
    '增肌', '减脂', '健身', '塑形', '跑步', '力量训练',
  ],
  food: [
    'recipe', 'cooking', 'food', 'eat', 'meal', 'kitchen', 'chef', 'yummy', 'delicious',
    'baking', 'dessert', 'cake', 'bread', 'pasta', 'healthy', 'vegan', 'organic',
    '美食', '烹饪', '食谱', '烘焙', '甜点', '厨房', '好吃',
  ],
  travel: [
    'travel', 'trip', 'vacation', 'destination', 'explore', 'adventure', 'tourism', 'hotel',
    'flight', 'backpack', 'beach', 'mountain', 'city', 'country', 'itinerary', 'guide',
    '旅行', '旅游', '度假', '攻略', '景点', '酒店', '机票',
  ],
  gaming: [
    'game', 'gaming', 'play', 'stream', 'twitch', 'xbox', 'ps5', 'nintendo', 'switch',
    'pcgaming', 'minecraft', 'fortnite', 'valorant', 'roblox', 'esports', 'gameplay', 'walkthrough',
    '游戏', '电竞', '直播', '手游', '端游',
  ],
  lifestyle: [
    'vlog', 'daily', 'routine', 'life', 'home', 'decor', 'interior', 'organization',
    'selfcare', 'mindset', 'motivation', 'productivity', 'study', 'work', 'minimalism',
    '生活', '日常', 'vlog', '家居', '收纳', '自我提升',
  ],
  ai: [
    'ai', 'chatgpt', 'tool', 'productivity', 'software', 'app', 'automation', 'prompt',
    'midjourney', 'stable', 'gpt', 'llm', 'neural', 'machine learning', 'automation',
    '人工智能', 'AI工具', '效率', '自动化', '提示词',
  ],
  makeup: [
    'makeup', 'mua', 'artist', 'palette', 'eyeshadow', 'lip', 'beauty', 'glam',
    '化妆', '美妆', '眼影', '口红', '妆容', '新娘妆',
  ],
  parenting: [
    'mom', 'dad', 'parent', 'baby', 'kid', 'child', 'family', 'mother', 'father',
    'pregnancy', 'newborn', 'toddler', 'nursing', 'parenting',
    '妈妈', '宝宝', '育儿', '亲子', '怀孕', '备孕',
  ],
  business: [
    'business', 'entrepreneur', 'startup', 'marketing', 'sales', 'branding', 'ceo', 'founder',
    'investment', 'stock', 'crypto', 'side hustle', 'income', 'money',
    '创业', '商业', '营销', '投资', '副业', '赚钱',
  ],
  sports: [
    'sports', 'football', 'basketball', 'soccer', 'tennis', 'baseball', 'golf', 'swimming',
    'nba', 'nfl', 'f1', 'racing', 'athlete', 'championship',
    '体育', '足球', '篮球', '网球', '运动',
  ],
  music: [
    'music', 'song', 'singer', 'rapper', 'album', 'playlist', 'spotify', 'concert', 'live',
    '音乐', '歌曲', '歌手', '演唱会', '弹唱', '吉他', '钢琴',
  ],
  pet: [
    'pet', 'dog', 'cat', 'puppy', 'kitten', 'animal', 'fur', 'cute', 'vet',
    '宠物', '狗狗', '猫猫', '猫咪', '萌宠', '铲屎官',
  ],
};

// 同义词映射（用于模糊匹配扩展）
const SYNONYMS: Record<string, string[]> = {
  review: ['review', 'unbox', 'unboxing', 'test', '测评', '评测', '体验'],
  tutorial: ['tutorial', 'howto', 'guide', '教', '教程', '学习', '教学'],
  vlog: ['vlog', 'daily', 'vlog', '博客', '日常', '记录'],
  recipe: ['recipe', 'cook', 'recipe', '食谱', '菜谱', '做饭'],
  workout: ['workout', 'exercise', 'training', '健身', '锻炼', '运动'],
  travel: ['travel', 'trip', 'tourism', '旅行', '旅游', '出游'],
  fashion: ['fashion', 'style', 'outfit', '穿搭', '时尚', '搭配'],
  beauty: ['beauty', 'beauty', '美容', '美妆', '护肤'],
  tech: ['tech', 'digital', '科技', '数码', '电子'],
  gaming: ['gaming', 'game', '游戏', '电竞', '玩游戏'],
};

// 词根映射（用于模糊匹配）
const WORD_ROOTS: Record<string, string[]> = {
  beauti: ['beauty', 'beautiful', 'beautician', 'beautify', 'beauties'],
  makeup: ['makeup', 'make-up', 'makeup artistry'],
  skincare: ['skincare', 'skin care', 'skincare'],
  fitness: ['fitness', 'fitness', 'fit', 'fitted'],
  travel: ['travel', 'traveler', 'traveling', 'travelling', 'travels'],
  cooking: ['cooking', 'cook', 'cookery', 'cuisine'],
  gaming: ['gaming', 'game', 'gamer', 'games'],
  tech: ['tech', 'technology', 'technique', 'technical'],
};

// 计算内容相关性分数（改进版：扩展词库 + 模糊匹配 + 同义词扩展，支持多关键词）
function calculateContentRelevance(videoTitles: string[], searchKeywords: string[]): number {
  if (!videoTitles || videoTitles.length === 0) return 0;
  if (!searchKeywords || searchKeywords.length === 0) return 0;

  // 收集所有关键词的匹配词
  const allMatchTerms = new Set<string>();

  for (const keyword of searchKeywords) {
    const kw = keyword.toLowerCase().trim();
    if (!kw) continue;

    // 1. 加入原始关键词
    allMatchTerms.add(kw);

    // 2. 加入预定义词库中的扩展词
    if (CONTENT_KEYWORDS[kw]) {
      CONTENT_KEYWORDS[kw].forEach(term => allMatchTerms.add(term));
    }

    // 3. 加入同义词扩展
    if (SYNONYMS[kw]) {
      SYNONYMS[kw].forEach(term => allMatchTerms.add(term));
    }

    // 4. 词根匹配
    Object.entries(WORD_ROOTS).forEach(([root, variants]) => {
      if (kw.includes(root) || root.includes(kw)) {
        variants.forEach(v => allMatchTerms.add(v));
      }
      variants.forEach(variant => {
        if (variant.includes(kw) || kw.includes(variant)) {
          allMatchTerms.add(root);
          variants.forEach(v => allMatchTerms.add(v));
        }
      });
    });

    // 5. 中文单字扩展
    const cnTerms: Record<string, string[]> = {
      '美': ['美', '美容', '美妆', '美丽', '审美'],
      '科': ['科技', '科学', '数码', '技术'],
      '健': ['健身', '健康', '运动', '体育'],
      '游': ['旅游', '旅行', '游戏', '游玩'],
      '烹': ['烹饪', '厨师', '厨房', '美食'],
      '时': ['时尚', '潮流', '时间', '穿搭'],
      '育': ['育儿', '教育', '培训', '学习'],
      '投': ['投资', '理财', '金融', '股票'],
      '乐': ['音乐', '快乐', '娱乐', '游戏'],
      '宠': ['宠物', '萌宠', '猫狗', '动物'],
    };
    Object.entries(cnTerms).forEach(([char, terms]) => {
      if (kw.includes(char)) {
        terms.forEach(t => allMatchTerms.add(t));
      }
    });
  }

  // 遍历视频标题，计算匹配数
  let matches = 0;
  for (const title of videoTitles) {
    const lower = title.toLowerCase();
    const matched = Array.from(allMatchTerms).some(term => {
      if (lower.includes(term)) return true;
      const termLower = term.toLowerCase();
      if (termLower.length >= 4 && lower.includes(termLower.substring(0, 4))) return true;
      if (term.length === 1 && lower.includes(term)) return true;
      return false;
    });
    if (matched) matches++;
  }

  return Math.min(30, matches * 10);
}

// 通用信号词（与关键词无关，任何品类都适用）
const COLLAB_SIGNALS = [
  'pr', 'collab', 'collaboration', 'business', 'contact', 'email',
  'sponsorship', 'partnership', 'brand', '广告', '合作', '商务',
  '推广', '投放', '合作请私信',
];
const LINK_PATTERNS = ['link', 'bio', 'website', 'shop', 'store', 'youtube', 'instagram'];

// 从搜索关键词动态生成词库（用于 bio 匹配）
function buildBioMatchWords(searchKeywords: string[]): Set<string> {
  const words = new Set<string>();
  for (const kw of searchKeywords) {
    const lower = kw.toLowerCase().trim();
    if (!lower) continue;
    words.add(lower);
    // 空格分割子词（"cat litter" -> "cat", "litter"）
    lower.split(/\s+/).forEach(part => {
      if (part.length >= 2) words.add(part);
    });
    // 移除常见停用词后的有意义子词
    const stopWords = new Set(['the', 'and', 'for', 'with', 'best', 'top', 'how']);
    lower.split(/\s+/).forEach(part => {
      if (part.length >= 4 && !stopWords.has(part)) words.add(part);
    });
  }
  return words;
}

// 从搜索关键词提取场景词（描述使用场景的词）
function extractSceneWords(searchKeywords: string[]): Set<string> {
  const sceneWords = new Set<string>();
  const sceneIndicators = [
    'care', 'routine', 'daily', 'life', 'home', 'family', 'tips',
    'guide', 'how', 'review', 'test', 'setup', 'tour', 'vlog',
    '使用', '日常', '教程', '测评', '体验', '生活',
  ];
  for (const kw of searchKeywords) {
    const lower = kw.toLowerCase();
    const parts = lower.split(/\s+/);
    for (const part of parts) {
      if (sceneIndicators.includes(part) || part.length >= 4) {
        sceneWords.add(part);
      }
    }
  }
  return sceneWords;
}

// 解析粉丝区间格式
function parseFollowerRange(range: string): { min: number; max: number } | null {
  // 处理 FilterBar 格式: '0-10000'
  if (range.includes('-') && !range.includes('k') && !range.includes('m')) {
    const [minStr, maxStr] = range.split('-');
    const min = parseInt(minStr);
    const max = maxStr === 'inf' ? Infinity : parseInt(maxStr);
    if (!isNaN(min) && !isNaN(max)) return { min, max };
  }
  // 处理 scraper 格式: 'under1k', '1k-10k', etc.
  const rangeMap: Record<string, { min: number; max: number }> = {
    'under1k': { min: 0, max: 1000 },
    '1k-10k': { min: 1000, max: 10000 },
    '10k-50k': { min: 10000, max: 50000 },
    '50k-100k': { min: 50000, max: 100000 },
    '100k-300k': { min: 100000, max: 300000 },
    '300k-500k': { min: 300000, max: 500000 },
    '500k-1m': { min: 500000, max: 1000000 },
    '1m-5m': { min: 1000000, max: 5000000 },
    'over5m': { min: 5000000, max: Infinity },
  };
  return rangeMap[range] || null;
}

// 粉丝区间评分
function scoreSize(followerCount: number, followerRanges: string[]): number {
  if (followerRanges.length === 0) {
    return (followerCount >= 5000 && followerCount < 5000000) ? 20 : 0;
  }
  return followerRanges.some(range => {
    const parsed = parseFollowerRange(range);
    return parsed && followerCount >= parsed.min && followerCount < parsed.max;
  }) ? 20 : 0;
}

// 动态评分函数
function scoreBioMatch(bio: string, searchKeywords: string[]): number {
  if (!bio || searchKeywords.length === 0) return 0;
  const matchWords = buildBioMatchWords(searchKeywords);
  const lowerBio = bio.toLowerCase();
  for (const word of matchWords) {
    if (lowerBio.includes(word)) return 15;
  }
  return 0;
}

function scoreCompetitorSource(creator: Creator, searchKeywords: string[]): number {
  // 搜索关键词本身就是竞品/产品词
  if (!creator.search_keyword || searchKeywords.length === 0) return 0;
  const lowerSearch = creator.search_keyword.toLowerCase();
  for (const kw of searchKeywords) {
    if (lowerSearch.includes(kw.toLowerCase())) return 15;
  }
  return 0;
}

function scoreSceneMatch(creator: Creator, searchKeywords: string[]): number {
  // 场景词：描述使用场景的词（如 care, routine, how, vlog）
  if (!creator.search_keyword || searchKeywords.length === 0) return 0;
  const sceneWords = extractSceneWords(searchKeywords);
  if (sceneWords.size === 0) return 0;
  const lowerSearch = creator.search_keyword.toLowerCase();
  for (const word of sceneWords) {
    if (lowerSearch.includes(word)) return 10;
  }
  return 0;
}

// 计算达人评分（9维度动态评分）
export function calculateKolScore(
  creator: Creator,
  followerRanges: string[],
  searchKeywords: string[]
): KolScore {
  // 各维度得分
  const hasEmail = creator.email ? 30 : 0;
  const sizeMatch = scoreSize(creator.follower_count, followerRanges);
  const bioCategory = scoreBioMatch(creator.bio || '', searchKeywords);
  const competitorSource = scoreCompetitorSource(creator, searchKeywords);
  const activeCreator = creator.video_count > 30 ? 10 : 0;
  const sceneSource = scoreSceneMatch(creator, searchKeywords);
  const collabSignal = COLLAB_SIGNALS.some(sig => (creator.bio || '').toLowerCase().includes(sig)) ? 10 : 0;
  const hasBioLink = LINK_PATTERNS.some(p => (creator.bio || '').toLowerCase().includes(p)) ? 5 : 0;
  const viralVideo = creator.best_video_plays > 100000 ? 5 : 0;

  const total = hasEmail + sizeMatch + bioCategory + competitorSource +
                 activeCreator + sceneSource + collabSignal + hasBioLink + viralVideo;

  // 分层标准（满分120）
  let grade: 'A' | 'B' | 'C';
  if (total >= 90) grade = 'A';      // ≥75%
  else if (total >= 60) grade = 'B'; // ≥50%
  else grade = 'C';                  // <50%

  return {
    total,
    grade,
    breakdown: {
      hasEmail,
      sizeMatch,
      bioCategory,
      competitorSource,
      activeCreator,
      sceneSource,
      collabSignal,
      hasBioLink,
      viralVideo,
    }
  };
}

async function searchByKeyword(keyword: string): Promise<Map<string, Creator>> {
  const creatorMap = new Map<string, Creator>();

  console.log(`🔍 搜索: "${keyword}"`);

  let offset = 0;
  for (let page = 0; page < MAX_PAGES; page++) {
    try {
      console.log(`  调用 API, offset=${offset}`);
      const data = await tikhubFetch('/api/v1/tiktok/app/v3/fetch_general_search_result', {
        keyword,
        offset,
        count: 20,
        search_type: 1,
      });
      console.log(`  API 返回 data 结构:`, JSON.stringify(data).slice(0, 200));

      const items: any[] = data?.data?.data || [];
      console.log(`页${page + 1} 返回 ${items.length} 条数据`);
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
          // Debug: 打印 author 对象的 key
          if (added === 0) {
            console.log('  author 对象可用字段:', Object.keys(a).join(', '));
            console.log('  author.avatarUri:', a.avatarUri);
            console.log('  author.avatar_url:', a.avatar_url);
            console.log('  author.avatarThumb:', a.avatarThumb);
          }

          creatorMap.set(uid, {
            unique_id: uid,
            nickname: String(a.nickname || ''),
            follower_count: followers,
            video_count: Number(a.aweme_count || 0),
            bio,
            email: extractEmail(bio),
            profile_url: `https://www.tiktok.com/@${uid}`,
            avatar_url: a.avatarUri || a.avatar_url || a.avatarThumb?.url_list?.[0] || null,
            best_video_plays: plays,
            best_video_likes: likes,
            video_create_time: createTime,
            search_keyword: keyword,
            video_titles: videoTitle ? [videoTitle] : [],
          });
          added++;
          if (added <= 2) {
            console.log(`  首个博主: @${uid}, 粉丝=${followers}, 播放=${plays}, 点赞=${likes}`);
          }
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
  console.log(`\n📋 Phase 2: 补全 ${creators.length} 位博主的 Profile...`);

  let enriched = 0;
  let emailFound = 0;
  let bioLinkFound = 0;

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
      const bioLink = user.bioLink?.link ? String(user.bioLink.link) : null;

      // 更新数据
      c.bio = fullBio || c.bio;
      c.nickname = user.nickname || c.nickname;
      c.follower_count = user.followerCount ?? c.follower_count;
      c.video_count = user.videoCount ?? c.video_count;
      c.bio_link = bioLink;

      // 尝试从 video_titles 提取邮箱（有些博主在视频描述留邮箱）
      let foundEmail = email;
      if (!foundEmail && c.video_titles) {
        foundEmail = extractEmailFromTitles(c.video_titles);
      }

      if (foundEmail && !c.email) {
        c.email = foundEmail;
        emailFound++;
      }
      if (bioLink) bioLinkFound++;
      enriched++;

      if ((i + 1) % 10 === 0) {
        process.stdout.write(`  进度: ${i + 1}/${creators.length}，邮箱+${emailFound}，链接+${bioLinkFound}\n`);
      }

      await sleep(150);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('429') || msg.includes('limit')) {
        console.log(`  ⚠️  触发 API 限速，暂停 10 秒...`);
        await sleep(10000);
      }
      // 单个失败不中断整体流程
    }
  }

  console.log(`  ✅ 补全完成：${enriched} 位，邮箱 ${emailFound} 个，bioLink ${bioLinkFound} 个`);
}

export async function scrape(keywords: string[], options: ScrapeOptions): Promise<Creator[]> {
  const { followerRanges, sortBy, limit } = options;
  let { limit: targetLimit } = options;

  console.log('scrape called with:', { keywords, followerRanges, sortBy, limit });

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
  console.log('粉丝区间筛选前:', filtered.length, '区间:', followerRanges);
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
