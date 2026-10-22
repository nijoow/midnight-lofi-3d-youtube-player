import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface SearchItem {
  id?: { videoId?: string };
  snippet?: { title?: string; channelTitle?: string };
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim();
  const pageToken = request.nextUrl.searchParams.get('pageToken');
  if (!query || query.length > 200 || (pageToken?.length ?? 0) > 512) {
    return NextResponse.json({ error: '검색어를 1~200자로 입력해 주세요.' }, { status: 400 });
  }
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: '지금 검색을 사용할 수 없어요. 잠시 후 다시 시도해 주세요.' }, { status: 503 });
  }
  const params = new URLSearchParams({
    part: 'snippet', type: 'video', q: query, maxResults: '10',
    videoEmbeddable: 'true', videoSyndicated: 'true', key: apiKey,
  });
  if (pageToken) params.set('pageToken', pageToken);

  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      // Do not log provider payloads or URLs: they may contain credentials.
      return NextResponse.json({ error: 'YouTube 검색을 사용할 수 없어요. 잠시 후 다시 시도해 주세요.' }, { status: 502 });
    }
    const data = await response.json();
    if (!Array.isArray(data.items)) throw new Error('Invalid search response');
    const items = (data.items as SearchItem[]).flatMap(item => {
      const id = item.id?.videoId;
      const title = item.snippet?.title;
      if (!id || !/^[\w-]{11}$/.test(id) || typeof title !== 'string') return [];
      return [{ id, title, thumbnail: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
        channelTitle: typeof item.snippet?.channelTitle === 'string' ? item.snippet.channelTitle : '' }];
    });
    return NextResponse.json({ items, nextPageToken: typeof data.nextPageToken === 'string' ? data.nextPageToken : null });
  } catch {
    return NextResponse.json({ error: '검색 연결이 지연되고 있어요. 다시 시도해 주세요.' }, { status: 502 });
  }
}
