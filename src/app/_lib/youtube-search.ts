import { NextRequest, NextResponse } from 'next/server';
interface VideoResult {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}
interface SearchResult {
  items: VideoResult[];
  nextPageToken: string | null;
}
interface YouTubeResponse {
  items?: {
    id?: { videoId?: string };
    snippet?: {
      title?: string;
      channelTitle?: string;
      thumbnails?: { medium?: { url?: string } };
    };
  }[];
  nextPageToken?: string;
  error?: { errors?: { reason?: string }[] };
}
class SearchError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfter?: string,
  ) {
    super(message);
  }
}
export function createSearchHandler({
  fetcher = fetch,
  now = Date.now,
  getApiKey = () => process.env.YOUTUBE_API_KEY,
}: {
  fetcher?: typeof fetch;
  now?: () => number;
  getApiKey?: () => string | undefined;
} = {}) {
  // Bounded, public search cache and budget for this server instance.
  // Use a shared limiter/cache at the gateway when deploying multiple instances.
  const cache = new Map<string, { until: number; result: SearchResult }>();
  const pending = new Map<string, Promise<SearchResult>>();
  let windowStart = 0,
    requests = 0;
  return async function search(request: NextRequest) {
    const q = request.nextUrl.searchParams.get('q')?.trim() || '';
    const token = request.nextUrl.searchParams.get('pageToken') || '';
    if (
      !q ||
      q.length > 120 ||
      (token && !/^[a-zA-Z0-9_=-]{1,256}$/.test(token))
    ) {
      return NextResponse.json(
        {
          error:
            '검색어는 1~120자로 입력해 주세요. 검색 페이지 정보도 확인해 주세요.',
        },
        { status: 400 },
      );
    }
    const key = JSON.stringify([q.toLowerCase(), token]),
      time = now();
    const existing = cache.get(key);
    if (existing && existing.until > time)
      return NextResponse.json(existing.result, {
        headers: { 'Cache-Control': 'private, max-age=60' },
      });
    if (existing) cache.delete(key);
    const apiKey = getApiKey();
    if (!apiKey)
      return NextResponse.json(
        {
          error:
            '검색을 잠시 사용할 수 없어요. 추천 음악이나 YouTube 링크로 음악을 담아주세요.',
        },
        { status: 503 },
      );
    if (time - windowStart >= 60000) {
      windowStart = time;
      requests = 0;
    }
    let work = pending.get(key);
    if (!work && requests >= 20)
      return NextResponse.json(
        { error: '검색 요청이 많아요. 잠시 쉬었다가 다시 검색해 주세요.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.max(1, Math.ceil((60000 - time + windowStart) / 1000)),
            ),
          },
        },
      );
    if (!work) {
      requests++;
      work = (async () => {
        const params = new URLSearchParams({
          part: 'snippet',
          type: 'video',
          q,
          maxResults: '10',
          key: apiKey,
          videoEmbeddable: 'true',
          videoSyndicated: 'true',
        });
        if (token) params.set('pageToken', token);
        const response = await fetcher(
          'https://www.googleapis.com/youtube/v3/search?' + params,
          { signal: AbortSignal.timeout(8000), cache: 'no-store' },
        );
        const data: YouTubeResponse = await response.json();
        if (!response.ok) {
          const quota = data.error?.errors?.some(e =>
            [
              'quotaExceeded',
              'dailyLimitExceeded',
              'rateLimitExceeded',
            ].includes(e.reason || ''),
          );
          throw new SearchError(
            quota
              ? '지금은 검색 이용량이 많아요. 저장한 음악이나 영상 링크를 이용해 주세요.'
              : 'YouTube 검색에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.',
            quota ? 429 : 502,
            quota ? '3600' : undefined,
          );
        }
        if (!Array.isArray(data.items))
          throw new SearchError(
            '검색 결과를 읽지 못했어요. 다시 시도해 주세요.',
            502,
          );
        const items: VideoResult[] = data.items.flatMap(item => {
          const id = item.id?.videoId,
            title = item.snippet?.title;
          if (
            !id ||
            !/^[a-zA-Z0-9_-]{11}$/.test(id) ||
            typeof title !== 'string'
          )
            return [];
          return [
            {
              id,
              title: title.slice(0, 500),
              thumbnail: item.snippet?.thumbnails?.medium?.url || '',
              channelTitle: item.snippet?.channelTitle?.slice(0, 150) || '',
            },
          ];
        });
        const result = {
          items,
          nextPageToken:
            typeof data.nextPageToken === 'string' ? data.nextPageToken : null,
        };
        if (cache.size >= 100) cache.delete(cache.keys().next().value!);
        cache.set(key, { until: now() + 5 * 60000, result });
        return result;
      })();
      pending.set(key, work);
    }
    try {
      const result = await work;
      return NextResponse.json(result, {
        headers: { 'Cache-Control': 'private, max-age=60' },
      });
    } catch (cause) {
      if (cause instanceof SearchError)
        return NextResponse.json(
          { error: cause.message },
          {
            status: cause.status,
            headers: cause.retryAfter
              ? { 'Retry-After': cause.retryAfter }
              : {},
          },
        );
      const timeout =
        cause instanceof Error &&
        ['TimeoutError', 'AbortError'].includes(cause.name);
      // Do not log request URLs: the upstream URL contains the API key.
      console.warn(
        'YouTube search unavailable:',
        timeout ? 'timeout' : 'upstream connection or response',
      );
      return NextResponse.json(
        {
          error: timeout
            ? '검색 연결이 늦어지고 있어요. 잠시 후 다시 시도해 주세요.'
            : '검색에 연결하지 못했어요. 연결을 확인하거나 영상 링크로 추가해 주세요.',
        },
        { status: timeout ? 504 : 502 },
      );
    } finally {
      if (pending.get(key) === work) pending.delete(key);
    }
  };
}
