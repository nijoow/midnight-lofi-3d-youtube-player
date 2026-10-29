'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { parseSearchResults, type SearchTrack } from '../_lib/search-results';
export type { SearchTrack } from '../_lib/search-results';
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
        const data: unknown = await response.json();
        if (!response.ok)
          throw new Error(
            data &&
            typeof data === 'object' &&
            'error' in data &&
            typeof data.error === 'string'
              ? data.error
              : '검색에 실패했어요. 잠시 후 다시 시도해 주세요.',
          );
        if (id !== sequence.current) return;
        const { items: incoming, pageToken: nextPageToken } =
          parseSearchResults(data);
        setItems(prev =>
          more
            ? Array.from(
                new Map(
                  [...prev, ...incoming].map(item => [item.id, item]),
                ).values(),
              )
            : incoming,
        );
        setPageToken(nextPageToken);
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
