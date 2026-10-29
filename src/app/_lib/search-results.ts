import { parseVideoId, type Track } from './room';
import { decodeYouTubeText } from './youtube-text';

export interface SearchTrack extends Track {
  thumbnail?: string;
}

/** Convert the search API payload into safe display data before it enters state. */
export function parseSearchResults(value: unknown): {
  items: SearchTrack[];
  pageToken: string | null;
} {
  if (
    !value ||
    typeof value !== 'object' ||
    !('items' in value) ||
    !Array.isArray(value.items)
  ) {
    throw new Error('검색 결과를 읽지 못했어요. 다시 시도해 주세요.');
  }
  const items: SearchTrack[] = value.items.flatMap((item: unknown) => {
    if (
      !item ||
      typeof item !== 'object' ||
      !('id' in item) ||
      !('title' in item) ||
      typeof item.id !== 'string' ||
      parseVideoId(item.id) !== item.id ||
      typeof item.title !== 'string'
    )
      return [];
    return [
      {
        id: item.id,
        title: decodeYouTubeText(item.title).slice(0, 500),
        channel:
          'channelTitle' in item && typeof item.channelTitle === 'string'
            ? decodeYouTubeText(item.channelTitle).slice(0, 150)
            : undefined,
        thumbnail:
          'thumbnail' in item &&
          typeof item.thumbnail === 'string' &&
          item.thumbnail.startsWith('https://i.ytimg.com/')
            ? item.thumbnail
            : undefined,
      },
    ];
  });
  return {
    items,
    pageToken:
      'nextPageToken' in value && typeof value.nextPageToken === 'string'
        ? value.nextPageToken
        : null,
  };
}
