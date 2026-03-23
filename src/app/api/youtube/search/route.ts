import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const pageToken = searchParams.get('pageToken');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 },
    );
  }

  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    return NextResponse.json(
      { error: 'YouTube API key is missing. Please set YOUTUBE_API_KEY in your environment.' },
      { status: 500 },
    );
  }

  try {
    let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=10&key=${API_KEY}`;
    
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      const errData = await response.json();
      console.error('YouTube API Error Data:', errData);
      throw new Error(`YouTube API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    // 필요한 정보만 추출하여 반환 (기존 인터페이스 하위 호환)
    const videos = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
    }));

    return NextResponse.json({ 
      items: videos,
      nextPageToken: data.nextPageToken || null
    });
  } catch (error) {
    console.error('YouTube search error:', error);
    return NextResponse.json(
      { error: 'Failed to search YouTube videos' },
      { status: 500 },
    );
  }
}
