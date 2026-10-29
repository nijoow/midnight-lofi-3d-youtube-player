import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { decodeYouTubeText } from '../../src/app/_lib/youtube-text';

test('YouTube entity titles decode once as text including Unicode and invalid code points', () => {
  assert.equal(decodeYouTubeText('A &amp; B &#39; &#x1F3B5;'), "A & B ' 🎵");
  assert.equal(decodeYouTubeText('&amp;lt;img&amp;gt;'), '&lt;img&gt;');
  assert.equal(decodeYouTubeText('&#0;&#xD800;&#1114112;'), '\ufffd\ufffd\ufffd');
});

test('decoded hostile titles remain escaped when rendered by React', () => {
  const title = decodeYouTubeText('&lt;img src=x onerror=alert(1)&gt;&lt;script&gt;alert(1)&lt;/script&gt;');
  const html = renderToStaticMarkup(createElement('strong', null, title));
  assert.ok(html.includes('&lt;img'));
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('<script'));
});
