'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { parseVideoId, type Track } from '../_lib/room';
import { decodeYouTubeText } from '../_lib/youtube-text';
export interface SearchTrack extends Track {
  thumbnail?: string;
}
export function useYouTubeSearch() {
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchTrack[]>([]);
  const [pageToken, setPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<'search' | 'more' | null>(null);
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  const sequence = useRef(0);
  useEffect(() => () => controller.current?.abort(), []);
  const search = useCallback(
    async (more = false) => {
      const term = (more ? query : draft).trim();
      if (!term || (more && (!pageToken || loading))) return;
      controller.current?.abort();
      const request = new AbortController();
      controller.current = request;
      const id = ++sequence.current;
      setLoading(more ? 'more' : 'search');
      setError('');
      if (!more) {
        setQuery(term);
        setItems([]);
        setPageToken(null);
      }
      try {
        const params = new URLSearchParams({ q: term });
        if (more && pageToken) params.set('pageToken', pageToken);
        const response = await fetch('/api/youtube/search?' + params, {
          signal: request.signal,
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(
            data.error || '검색에 실패했어요. 잠시 후 다시 시도해 주세요.',
          );
        if (id !== sequence.current) return;
        const incoming: SearchTrack[] = (
          Array.isArray(data.items) ? data.items : []
        )
          .filter(
            (item: Record<string, unknown>) =>
              typeof item.id === 'string' &&
              parseVideoId(item.id) &&
              typeof item.title === 'string',
          )
          .map(
            (item: {
              id: string;
              title: string;
              channelTitle?: string;
              thumbnail?: string;
            }) => {
              return {
                id: item.id,
                title: decodeYouTubeText(item.title).slice(0, 500),
                channel: typeof item.channelTitle === 'string'
                  ? decodeYouTubeText(item.channelTitle).slice(0, 150) : undefined,
                thumbnail:
                  typeof item.thumbnail === 'string' &&
                  item.thumbnail.startsWith('https://i.ytimg.com/')
                    ? item.thumbnail
                    : undefined,
              };
            },
          );
        setItems(prev =>
          more
            ? Array.from(
                new Map(
                  [...prev, ...incoming].map(item => [item.id, item]),
                ).values(),
              )
            : incoming,
        );
        setPageToken(
          typeof data.nextPageToken === 'string' ? data.nextPageToken : null,
        );
      } catch (cause) {
        if (request.signal.aborted || id !== sequence.current) return;
        setError(
          cause instanceof Error ? cause.message : '연결을 확인해 주세요.',
        );
      } finally {
        if (id === sequence.current) setLoading(null);
      }
    },
    [draft, query, pageToken, loading],
  );
  return { draft, setDraft, query, items, pageToken, loading, error, search };
}
