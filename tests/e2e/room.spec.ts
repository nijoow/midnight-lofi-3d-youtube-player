import { test, expect, type Page } from '@playwright/test';
import {
  DEFAULT_ROOM,
  STORAGE_KEY,
  type SavedRoom,
} from '../../src/app/_lib/room';
const initial = {
  ...DEFAULT_ROOM,
  preferences: {
    ...DEFAULT_ROOM.preferences,
    mode: '2d' as const,
    repeat: 'off' as const,
  },
};
async function seed(page: Page, room: SavedRoom = initial) {
  await page.addInitScript(
    ({ key, saved }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(saved));
    },
    { key: STORAGE_KEY, saved: room },
  );
}
async function mockYouTube(page: Page) {
  await page.addInitScript(() => {
    type EventHandler = (event: { target: Player; data?: number }) => void;
    const host = window as unknown as {
      YT: unknown;
      __player: Player;
      __calls: string[];
    };
    host.__calls = [];
    class Player {
      state = -1;
      volume = 40;
      muted = false;
      frame: HTMLIFrameElement;
      constructor(
        element: HTMLElement,
        public options: {
          videoId: string;
          events: Record<string, EventHandler>;
        },
      ) {
        this.frame = document.createElement('iframe');
        this.frame.title = 'Test player';
        element.append(this.frame);
        host.__player = this;
        setTimeout(() => options.events.onReady({ target: this }), 10);
      }
      playVideo() {
        this.state = 1;
        host.__calls.push('play:' + this.options.videoId);
        this.options.events.onStateChange({ target: this, data: 1 });
      }
      pauseVideo() {
        this.state = 2;
        host.__calls.push('pause');
        this.options.events.onStateChange({ target: this, data: 2 });
      }
      setVolume(value: number) {
        this.volume = value;
      }
      mute() {
        this.muted = true;
      }
      unMute() {
        this.muted = false;
      }
      getIframe() {
        return this.frame;
      }
      getPlayerState() {
        return this.state;
      }
      destroy() {
        this.frame.remove();
      }
      stopVideo() {
        this.state = 0;
      }
      loadVideoById(options: {videoId: string}) {
        this.options.videoId = options.videoId;
        this.playVideo();
      }
      cueVideoById(options: {videoId: string}) {
        this.options.videoId = options.videoId;
        this.state = 5;
        this.options.events.onStateChange({ target: this, data: 5 });
      }
      finish() {
        this.state = 0;
        this.options.events.onStateChange({ target: this, data: 0 });
      }
      fail() {
        this.options.events.onError({ target: this, data: 150 });
      }
    }
    host.YT = { Player, PlayerState: { ENDED: 0, PLAYING: 1, PAUSED: 2 } };
  });
}
async function openMusic(page: Page) {
  await page.getByRole('button', { name: '음악 고르기', exact: true }).click();
}
test('saves mood, volume and view without autoplay, and restores them after refresh', async ({
  page,
}) => {
  await seed(page);
  await page.goto('/');
  await page.getByRole('button', { name: '노을 지는 방', exact: true }).click();
  await page.getByRole('slider', { name: '음악 볼륨' }).fill('65');
  await expect(page.locator('.midnight-app')).toHaveAttribute(
    'data-mood',
    'sunset',
  );
  await page.reload();
  await expect(page.locator('.midnight-app')).toHaveAttribute(
    'data-mood',
    'sunset',
  );
  await expect(page.getByRole('slider', { name: '음악 볼륨' })).toHaveValue(
    '65',
  );
  await expect(page.getByRole('img', { name: /노을 지는 방/ })).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
});
test('re-selecting a paused track resumes playback and the last track ending clears playing state', async ({
  page,
}) => {
  await seed(page);
  await mockYouTube(page);
  await page.goto('/');
  await page.getByRole('button', { name: '음악 재생', exact: true }).click();
  await expect(page.getByText('재생 중', { exact: true })).toBeVisible();
  await page
    .getByRole('button', { name: '음악 일시정지', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: '음악 재생', exact: true }),
  ).toBeVisible();
  await openMusic(page);
  await page.getByRole('tab', { name: /내 목록/ }).click();
  await page
    .getByRole('button', {
      name: DEFAULT_ROOM.playlist[0].title + ' 재생',
      exact: true,
    })
    .click();
  await expect(page.getByText('재생 중', { exact: true })).toBeVisible();
  await page.evaluate(() =>
    (
      window as unknown as { __player: { finish: () => void } }
    ).__player.finish(),
  );
  await expect(page.getByText('재생 종료')).toBeVisible();
  await expect(
    page.getByRole('button', { name: '음악 재생', exact: true }),
  ).toBeVisible();
});
test('empty queue stops the player and accepts a new URL without duplicate tracks', async ({
  page,
}) => {
  await seed(page);
  await mockYouTube(page);
  await page.goto('/');
  await page.getByRole('button', { name: '음악 재생', exact: true }).click();
  await expect(page.getByText('재생 중', { exact: true })).toBeVisible();
  await openMusic(page);
  await page.getByRole('tab', { name: /내 목록/ }).click();
  await page
    .getByRole('button', { name: DEFAULT_ROOM.playlist[0].title + ' 삭제' })
    .click();
  await expect(
    page.getByText('목록이 비어 있어요.', { exact: false }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: '음악 재생', exact: true }),
  ).toBeDisabled();
  await openMusic(page);
  await page
    .getByLabel('내 음악 링크로 담기')
    .fill('https://youtu.be/abcdefghijk');
  await page.getByRole('button', { name: 'YouTube 링크 추가' }).click();
  await expect(page.getByRole('tab', { name: '내 목록 · 1' })).toBeVisible();
  await page
    .getByLabel('내 음악 링크로 담기')
    .fill('https://youtube.com/watch?v=abcdefghijk');
  await page.getByRole('button', { name: 'YouTube 링크 추가' }).click();
  await expect(page.getByText('이미 담겨 있는 음악이에요.')).toBeVisible();
});
test('search pagination stays attached to its submitted query and stale responses cannot replace new results', async ({
  page,
}) => {
  await seed(page);
  const requests: string[] = [];
  await page.route('**/api/youtube/search?*', async route => {
    const url = new URL(route.request().url()),
      q = url.searchParams.get('q');
    requests.push(url.search);
    if (q === 'slow') await new Promise(r => setTimeout(r, 400));
    await route.fulfill({
      json: {
        items: [
          {
            id: url.searchParams.has('pageToken')
              ? 'lmnopqrstuv'
              : 'abcdefghijk',
            title: q + ' result',
            channelTitle: 'Test',
          },
        ],
        nextPageToken:
          q === 'alpha' && !url.searchParams.has('pageToken')
            ? 'TOKEN_ALPHA'
            : null,
      },
    });
  });
  await page.goto('/');
  await openMusic(page);
  await page.getByRole('tab', { name: 'YouTube 검색' }).click();
  const search = page.getByRole('textbox', { name: 'YouTube 검색어' });
  await search.fill('alpha');
  await search.press('Enter');
  await expect(
    page.getByRole('button', { name: 'alpha result 재생' }),
  ).toBeVisible();
  await search.fill('beta');
  await page.getByRole('button', { name: '결과 더 보기' }).click();
  await expect
    .poll(() => requests.at(-1))
    .toBe('?q=alpha&pageToken=TOKEN_ALPHA');
  await search.fill('slow');
  await search.press('Enter');
  await expect.poll(() => requests.at(-1)).toBe('?q=slow');
  await search.fill('fast');
  await search.press('Enter');
  await expect(
    page.getByRole('button', { name: 'fast result 재생' }),
  ).toBeVisible();
  await page.waitForTimeout(500);
  await expect(
    page.getByRole('button', { name: 'slow result 재생' }),
  ).toHaveCount(0);
});
test('mobile long queues keep search accessible and dialogs close with Escape and restore focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const playlist = Array.from({ length: 18 }, (_, i) => ({
    id: 'track' + String(i).padStart(6, '0'),
    title: '테스트 음악 ' + i,
  }));
  await seed(page, { ...initial, playlist, currentId: playlist[0].id });
  await page.goto('/');
  await openMusic(page);
  await page.getByRole('tab', { name: /내 목록/ }).click();
  await expect(
    page.getByRole('button', { name: '테스트 음악 0 재생' }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'YouTube 검색' }).click();
  await expect(
    page.getByRole('textbox', { name: 'YouTube 검색어' }),
  ).toBeInViewport();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBe(390);
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('button', { name: '음악 고르기', exact: true }),
  ).toBeFocused();
});
test('focus timer survives refresh, pauses accurately, and completes only once after a long background interval', async ({
  page,
}) => {
  await seed(page);
  await page.clock.install({ time: new Date('2026-10-10T10:00:00Z') });
  await page.goto('/');
  if (
    (await page
      .getByRole('button', { name: '집중 타이머', exact: true })
      .getAttribute('aria-expanded')) === 'false'
  )
    await page
      .getByRole('button', { name: '집중 타이머', exact: true })
      .click();
  await page.getByRole('button', { name: '집중 시작', exact: true }).click();
  await page.clock.fastForward(25000);
  await expect(page.getByRole('timer')).toContainText('24:35');
  await page.reload();
  await page.getByRole('button', { name: '집중 타이머', exact: true }).click();
  await expect(page.getByRole('timer')).toContainText(/24:3[0-5]/);
  await page.getByRole('button', { name: '잠시 멈추기', exact: true }).click();
  const pausedTime = (await page.getByRole('timer').textContent()) || '';
  await page.clock.fastForward(60000);
  await expect(page.getByRole('timer')).toHaveText(pausedTime);
  if (
    (await page
      .getByRole('button', { name: '집중 타이머', exact: true })
      .getAttribute('aria-expanded')) === 'false'
  )
    await page
      .getByRole('button', { name: '집중 타이머', exact: true })
      .click();
  await page.getByRole('button', { name: '집중 시작', exact: true }).click();
  await page.clock.fastForward(25 * 60000);
  await expect(
    page.getByRole('button', { name: '휴식 시작', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('이 탭에서 1회 완료')).toBeVisible();
  await page.clock.fastForward(10 * 60000);
  await expect(page.getByRole('timer')).toContainText('05:00');
});
test('playback errors are recoverable and do not stop focus controls', async ({
  page,
}) => {
  await seed(page);
  await mockYouTube(page);
  await page.goto('/');
  await page.getByRole('button', { name: '음악 재생', exact: true }).click();
  await expect(page.getByText('재생 중', { exact: true })).toBeVisible();
  await page.evaluate(() =>
    (window as unknown as { __player: { fail: () => void } }).__player.fail(),
  );
  await expect(
    page.getByText('이 영상은 여기에서 재생할 수 없어요.', { exact: false }),
  ).toBeVisible();
  if (
    (await page
      .getByRole('button', { name: '집중 타이머', exact: true })
      .getAttribute('aria-expanded')) === 'false'
  )
    await page
      .getByRole('button', { name: '집중 타이머', exact: true })
      .click();
  await page.getByRole('button', { name: '집중 시작', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '잠시 멈추기', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: '다시 시도', exact: true }).click();
  await expect(page.getByText('재생 중', { exact: true })).toBeVisible();
});
test('sleep timer pauses music after the selected duration', async ({
  page,
}) => {
  await seed(page);
  await mockYouTube(page);
  await page.clock.install();
  await page.goto('/');
  await page.getByRole('button', { name: '음악 재생', exact: true }).click();
  await expect(page.getByText('재생 중', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '방 설정', exact: true }).click();
  await page.getByLabel('음악을 멈출 시간').selectOption('30');
  await page.keyboard.press('Escape');
  await page.clock.fastForward(30 * 60000);
  await expect(
    page.getByRole('button', { name: '음악 재생', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('취침 예약 시간이 되어 음악을 멈췄어요.', { exact: false }),
  ).toBeVisible();
});

test('the original CRT keeps the same playing iframe through camera and 2D fallback changes', async ({
  page,
}) => {
  test.setTimeout(60000);
  await seed(page, {
    ...initial,
    preferences: { ...initial.preferences, mode: '3d', quality: 'low' },
  });
  await mockYouTube(page);
  const model = page.waitForResponse(response =>
    response.url().endsWith('/3D/vintage-television.glb'),
  );
  await page.goto('/');
  expect((await model).ok()).toBe(true);
  const screen = page.locator('.tv-screen');
  await expect(screen).toHaveAttribute('data-projected', 'true', {
    timeout: 20000,
  });
  await page.getByRole('button', { name: '음악 켜기', exact: true }).click();
  await expect(page.getByText('재생 중', { exact: true })).toBeVisible();
  await page.evaluate(() => {
    (window as unknown as { __originalFrame: Element | null }).__originalFrame =
      document.querySelector('iframe');
  });
  const originalTransform = await screen.evaluate(
    element => element.style.transform,
  );
  await page.getByRole('button', { name: 'TV 정면', exact: true }).click();
  await expect
    .poll(() => screen.evaluate(element => element.style.transform))
    .not.toBe(originalTransform);
  await page
    .getByRole('button', { name: '2D 보기로 전환', exact: true })
    .click();
  await expect(page.getByRole('img', { name: /빈티지 TV/ })).toBeVisible();
  await page
    .getByRole('button', { name: '3D 보기로 전환', exact: true })
    .click();
  await expect(screen).toHaveAttribute('data-projected', 'true');
  await page
    .locator('canvas')
    .evaluate(canvas =>
      canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })),
    );
  await expect(page.getByRole('img', { name: /빈티지 TV/ })).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.querySelector('iframe') ===
        (window as unknown as { __originalFrame: Element }).__originalFrame,
    ),
  ).toBe(true);
  await expect(page.locator('iframe')).toHaveCount(1);
  await expect(page.getByText('재생 중', { exact: true })).toBeVisible();
});


test('natural end keeps the iframe and starts the next queued track', async ({ page }) => {
  const tracks = [
    { id: 'abcdefghijk', title: 'First' },
    { id: 'lmnopqrstuv', title: 'Second' },
  ];
  await seed(page, {
    ...initial,
    preferences: { ...initial.preferences, repeat: 'all' },
    playlist: tracks,
    currentId: tracks[0].id,
  });
  await mockYouTube(page);
  await page.goto('/');
  await page.getByRole('button', { name: '음악 재생', exact: true }).click();
  await expect(page.getByText('재생 중', { exact: true })).toBeVisible();
  await page.locator('iframe').evaluate(frame => frame.setAttribute('data-original', 'true'));
  await page.evaluate(() => (window as unknown as {__player: {finish(): void}}).__player.finish());
  await expect(page.getByRole('heading', {name: 'Second', exact: true})).toBeVisible();
  await expect(page.getByText('재생 중', { exact: true })).toBeVisible();
  await expect(page.locator('iframe')).toHaveAttribute('data-original', 'true');
  await expect.poll(() => page.evaluate(() => (window as unknown as {__calls: string[]}).__calls.at(-1))).toBe('play:lmnopqrstuv');
  await page.evaluate(() => (window as unknown as {__player: {finish(): void}}).__player.finish());
  await expect(page.getByRole('heading', {name: 'First', exact: true})).toBeVisible();
  await expect(page.getByText('재생 중', { exact: true })).toBeVisible();
  await expect(page.locator('iframe')).toHaveAttribute('data-original', 'true');
  await expect.poll(() => page.evaluate(() => (window as unknown as {__calls: string[]}).__calls.at(-1))).toBe('play:abcdefghijk');
  await page.getByRole('slider', {name: '음악 볼륨'}).fill('23');
  await expect.poll(() => page.evaluate(() => (window as unknown as {__player: {volume: number}}).__player.volume)).toBe(23);
  await page.getByRole('button', {name: '음악 일시정지', exact: true}).click();
  await expect(page.getByText('일시정지', {exact: true})).toBeVisible();
});
