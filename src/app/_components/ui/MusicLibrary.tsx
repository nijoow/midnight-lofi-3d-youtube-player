'use client';
import { useState } from 'react';
import { RECOMMENDATIONS, parseVideoId, type Track } from '../../_lib/room';
import { useYouTubeSearch } from '../../_hooks/useYouTubeSearch';
import { Dialog } from './Dialog';
import { Icon } from './Icon';
export function MusicLibrary({
  open,
  onClose,
  playlist,
  currentId,
  onAdd,
  onSelect,
  onRemove,
  onMove,
}: {
  open: boolean;
  onClose: () => void;
  playlist: Track[];
  currentId: string | null;
  onAdd: (track: Track) => boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
}) {
  const [tab, setTab] = useState<'discover' | 'queue' | 'search'>('discover');
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');
  const search = useYouTubeSearch();
  const add = (track: Track) =>
    setMessage(
      onAdd(track)
        ? '내 재생목록에 담았어요.'
        : playlist.some(t => t.id === track.id)
          ? '이미 담겨 있는 음악이에요.'
          : '재생목록에는 최대 200개까지 담을 수 있어요.',
    );
  const tracks =
    tab === 'discover'
      ? RECOMMENDATIONS
      : tab === 'queue'
        ? playlist
        : search.items;
  return (
    <Dialog open={open} onClose={onClose} title="음악">
      <div className="library-tabs" role="tablist" aria-label="음악 목록">
        {(
          [
            { id: 'discover', label: '추천 음악' },
            { id: 'queue', label: '내 목록 · ' + playlist.length },
            { id: 'search', label: 'YouTube 검색' },
          ] as const
        ).map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls="library-content"
            onClick={() => {
              setTab(t.id);
              setMessage('');
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        className="library-body"
        id="library-content"
        role="tabpanel"
        aria-label={
          tab === 'queue'
            ? '내 재생목록'
            : tab === 'search'
              ? 'YouTube 검색 결과'
              : '추천 음악'
        }
      >
        {tab === 'discover' && (
          <p className="library-intro">
            곡을 눌러 재생하거나 + 버튼으로 목록에 추가하세요.
          </p>
        )}
        {tab === 'search' && (
          <form
            className="search-form"
            onSubmit={e => {
              e.preventDefault();
              void search.search();
            }}
          >
            <label className="sr-only" htmlFor="music-search">
              YouTube 검색어
            </label>
            <div className="input-with-icon">
              <Icon name="search" size={18} />
              <input
                id="music-search"
                type="text"
                value={search.draft}
                onChange={e => search.setDraft(e.target.value)}
                placeholder="아티스트, 음악, 플레이리스트"
                maxLength={120}
              />
            </div>
            <button
              className="primary-button"
              type="submit"
              disabled={!search.draft.trim()}
            >
              검색
            </button>
          </form>
        )}
        {tab === 'search' && search.error && (
          <p className="inline-error" role="alert">
            {search.error}
          </p>
        )}
        {tab === 'search' && search.query && (
          <p className="subtle-text">“{search.query}” 검색 결과</p>
        )}
        {tab === 'search' && search.loading === 'search' && (
          <p className="empty-state" role="status">
            음악을 찾고 있어요…
          </p>
        )}
        {tab === 'search' && !search.query && (
          <p className="empty-state">
            듣고 싶은 음악을 검색해 보세요.
            <br />
            YouTube 링크로 바로 추가할 수도 있어요.
          </p>
        )}
        {tab === 'search' &&
          search.query &&
          !search.loading &&
          !search.error &&
          !tracks.length && (
            <p className="empty-state">
              검색 결과가 없어요. 다른 검색어를 사용해 보세요.
            </p>
          )}
        {tab === 'queue' && !tracks.length && (
          <p className="empty-state">
            <Icon name="music" size={30} />
            목록이 비어 있어요.
            <br />
            추천 음악이나 YouTube 링크로 추가해 주세요.
          </p>
        )}
        <ol className="track-list">
          {tracks.map((track, index) => {
            const added = playlist.some(t => t.id === track.id);
            return (
              <li
                key={track.id}
                className={currentId === track.id ? 'current-track' : ''}
              >
                <span className="track-number">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <button
                  className="track-title"
                  onClick={() => {
                    if (added || onAdd(track)) {
                      onSelect(track.id);
                      onClose();
                    } else
                      setMessage(
                        '목록에서 음악을 하나 비운 뒤 다시 담아주세요.',
                      );
                  }}
                  aria-label={track.title + ' 재생'}
                >
                  <strong>{track.title}</strong>
                  <span>
                    {track.channel || 'YouTube'}
                    {tab === 'queue' && currentId === track.id
                      ? ' · 선택한 음악'
                      : ''}
                  </span>
                </button>
                {tab === 'queue' ? (
                  <div className="queue-actions">
                    <button
                      className="small-icon-button"
                      aria-label={track.title + ' 위로 이동'}
                      disabled={index === 0}
                      onClick={() => onMove(track.id, -1)}
                    >
                      <Icon name="up" size={14} />
                    </button>
                    <button
                      className="small-icon-button"
                      aria-label={track.title + ' 아래로 이동'}
                      disabled={index === tracks.length - 1}
                      onClick={() => onMove(track.id, 1)}
                    >
                      <Icon name="down" size={14} />
                    </button>
                    <button
                      className="small-icon-button"
                      aria-label={track.title + ' 삭제'}
                      onClick={() => onRemove(track.id)}
                    >
                      <Icon name="close" size={15} />
                    </button>
                  </div>
                ) : (
                  <button
                    className="small-icon-button add-track"
                    aria-label={
                      track.title + (added ? ' 이미 담김' : ' 목록에 담기')
                    }
                    disabled={added}
                    onClick={() => add(track)}
                  >
                    <Icon name={added ? 'check' : 'plus'} size={18} />
                  </button>
                )}
              </li>
            );
          })}
        </ol>
        {tab === 'search' && search.pageToken && !search.error && (
          <button
            className="secondary-button load-more"
            onClick={() => void search.search(true)}
            disabled={!!search.loading}
          >
            {search.loading === 'more' ? '불러오는 중…' : '결과 더 보기'}
          </button>
        )}
        <form
          className="url-form"
          onSubmit={event => {
            event.preventDefault();
            const id = parseVideoId(url);
            if (!id) {
              setMessage('올바른 YouTube 영상 링크를 입력해 주세요.');
              return;
            }
            add({
              id,
              title: 'YouTube · ' + id,
              channel: '링크로 추가한 음악',
            });
            setUrl('');
          }}
        >
          <label htmlFor="youtube-url">
            <Icon name="link" size={15} /> 내 음악 링크로 담기
          </label>
          <div>
            <input
              id="youtube-url"
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="youtube.com/watch?v=…"
              maxLength={2048}
            />
            <button
              className="icon-button"
              type="submit"
              aria-label="YouTube 링크 추가"
              disabled={!url.trim()}
            >
              <Icon name="plus" />
            </button>
          </div>
        </form>
      </div>
      <footer className="library-footer" role="status">
        {message || '음악과 목록은 이 브라우저에 저장돼요.'}
      </footer>
    </Dialog>
  );
}
