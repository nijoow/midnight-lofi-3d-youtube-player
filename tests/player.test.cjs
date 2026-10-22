const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText, filename);
}
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { decodeTitle, nextIndex, removeFromQueue } = require('../src/app/_lib/youtube.ts');
const { YouTubeControlModal } = require('../src/app/_components/ui/YouTubeControlModal.tsx');
const { GET } = require('../src/app/api/youtube/search/route.ts');

test('titles decode once, handle Unicode and invalid entities without HTML execution', () => {
  assert.equal(decodeTitle('A &amp; B &#39; &#x1F3B5;'), "A & B ' 🎵");
  assert.equal(decodeTitle('&amp;lt;img&amp;gt;'), '&lt;img&gt;');
  assert.equal(decodeTitle('&#0;&#xD800;&#1114112;'), '\ufffd\ufffd\ufffd');
  const hostile = '&lt;img src=x onerror=alert(1)&gt;';
  const markup = renderToStaticMarkup(React.createElement(YouTubeControlModal, {
    isOpen: true, onClose() {}, playlist: [{ id: 'W6eCLgTC-64', title: hostile }],
    currentIndex: 0, onAddVideo() {}, onPlayVideo() {}, onRemoveVideo() {},
  }));
  assert.ok(markup.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(!markup.includes('<img src="x"'));
  assert.ok(!markup.includes('<script'));
});

test('queue deletion preserves active track, selects its successor, and handles empty queues', () => {
  const tracks = ['a','b','c'].map(id => ({id, title:id}));
  assert.deepEqual(removeFromQueue({tracks, index:1},0), {tracks:tracks.slice(1), index:0});
  assert.deepEqual(removeFromQueue({tracks, index:1},1), {tracks:[tracks[0],tracks[2]], index:1});
  assert.deepEqual(removeFromQueue({tracks, index:2},2), {tracks:tracks.slice(0,2), index:1});
  assert.deepEqual(removeFromQueue({tracks:tracks.slice(0,1), index:0},0), {tracks:[], index:0});
  assert.equal(nextIndex(0,2),1);
  assert.equal(nextIndex(1,2),null);
  assert.equal(nextIndex(0,0),null);
});

test('search route validates, encodes pagination, filters invalid items and masks upstream failure', async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.YOUTUBE_API_KEY;
  let calls = [];
  let upstream = { status:200, body:{ items:[
    {id:{videoId:'W6eCLgTC-64'},snippet:{title:'&lt;img&gt;', channelTitle:'A &amp; B'}},
    {id:{videoId:'bad'},snippet:{title:'invalid'}},
  ],nextPageToken:'NEXT'} };
  global.fetch = async (url, options) => {
    calls.push({url:new URL(url), options});
    return new Response(JSON.stringify(upstream.body),{status:upstream.status});
  };
  const get = query => GET({nextUrl:new URL('https://test.invalid/api/youtube/search'+query)});
  try {
    delete process.env.YOUTUBE_API_KEY;
    assert.equal((await get('?q=%20')).status,400);
    assert.equal((await get('?q=lofi')).status,503);
    assert.equal(calls.length,0);
    process.env.YOUTUBE_API_KEY='test-only-not-a-secret';
    let response=await get('?q=lofi&pageToken='+encodeURIComponent('page&key=wrong'));
    assert.equal(response.status,200);
    let body=await response.json();
    assert.equal(body.items.length,1);
    assert.equal(body.items[0].title,'&lt;img&gt;');
    assert.equal(calls[0].url.searchParams.get('pageToken'),'page&key=wrong');
    assert.equal(calls[0].url.searchParams.get('key'),'test-only-not-a-secret');
    assert.equal(calls[0].url.searchParams.get('videoEmbeddable'),'true');
    assert.ok(calls[0].options.signal instanceof AbortSignal);
    upstream={status:403,body:{error:{message:'private upstream diagnostic'}}};
    response=await get('?q=lofi');
    assert.equal(response.status,502);
    assert.ok(!(await response.text()).includes('private upstream'));
    upstream={status:200,body:{items:null}};
    assert.equal((await get('?q=lofi')).status,502);
    assert.equal((await get('?q='+ 'x'.repeat(201))).status,400);
  } finally {
    global.fetch=originalFetch;
    if(originalKey===undefined) delete process.env.YOUTUBE_API_KEY;
    else process.env.YOUTUBE_API_KEY=originalKey;
  }
});
