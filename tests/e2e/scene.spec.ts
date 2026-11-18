import { test, expect } from '@playwright/test';
import { DEFAULT_ROOM, STORAGE_KEY } from '../../src/app/_lib/room';
test('renders an offline 3D room and preserves controls after a lost WebGL context', async ({
  page,
}) => {
  const external: string[] = [];
  page.on('request', request => {
    if (
      new URL(request.url()).origin !== `http://127.0.0.1:${process.env.PORT || 3122}` &&
      !request.url().startsWith('data:')
    )
      external.push(request.url());
  });
  await page.addInitScript(
    ({ key, room }) => localStorage.setItem(key, JSON.stringify(room)),
    {
      key: STORAGE_KEY,
      room: {
        ...DEFAULT_ROOM,
        preferences: { ...DEFAULT_ROOM.preferences, quality: 'low' },
      },
    },
  );
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible({ timeout: 20000 });
  await expect(page.locator('.tv-screen')).toHaveAttribute(
    'data-projected',
    'true',
    { timeout: 20000 },
  );
  await page.getByRole('button', { name: '노을 지는 방', exact: true }).click();
  await expect(page.locator('.midnight-app')).toHaveAttribute(
    'data-mood',
    'sunset',
  );
  await page.getByRole('button', { name: '거실', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '거실', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page
    .locator('canvas')
    .evaluate(canvas =>
      canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })),
    );
  await expect(page.getByRole('img', { name: /노을 지는 방/ })).toBeVisible();
  await page.getByRole('button', { name: '집중 타이머', exact: true }).click();
  await page.getByRole('button', { name: '집중 시작', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '잠시 멈추기', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: '음악 고르기', exact: true }),
  ).toBeEnabled();
  expect(external).toEqual([]);
});
