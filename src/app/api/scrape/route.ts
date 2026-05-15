import { NextRequest, NextResponse } from 'next/server';
import { scrape, ScrapeOptions, calculateKolScore, KolScore } from '@/lib/scraper';

export async function POST(req: NextRequest) {
  console.log('=== API /api/scrape 被调用 ===');
  try {
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body));
    const { keywords, followerRanges, sortBy, limit } = body;

    if (!keywords || typeof keywords !== 'string') {
      return NextResponse.json({ error: '请输入关键词' }, { status: 400 });
    }

    const keywordList = keywords.split(',').map((k: string) => k.trim()).filter(Boolean);

    if (keywordList.length === 0) {
      return NextResponse.json({ error: '请输入有效的关键词' }, { status: 400 });
    }

    const options: ScrapeOptions = {
      followerRanges: followerRanges || [],
      sortBy: sortBy || 'views',
      limit: limit || 20,
    };

    const creators = await scrape(keywordList, options);

    console.log('API 返回 creators 数量:', creators.length);
    if (creators.length > 0) {
      console.log('第一个 creator follower_count:', creators[0].follower_count);
    }

    // 为每个 creator 计算评分
    const creatorsWithScores = creators.map((creator) => {
      const score = calculateKolScore(creator, followerRanges || [], keywordList);
      return { ...creator, score };
    });

    return NextResponse.json({ creators: creatorsWithScores, total: creatorsWithScores.length });
  } catch (error) {
    console.error('Scrape error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'unknown');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '采集失败' },
      { status: 500 }
    );
  }
}
