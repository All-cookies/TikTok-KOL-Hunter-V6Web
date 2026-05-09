import { NextRequest, NextResponse } from 'next/server';
import { scrape, ScrapeOptions } from '@/lib/scraper';

export async function POST(req: NextRequest) {
  try {
    const { keywords, followerRanges, sortBy, limit } = await req.json();

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

    return NextResponse.json({ creators, total: creators.length });
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '采集失败' },
      { status: 500 }
    );
  }
}
