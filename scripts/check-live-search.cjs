// Explicit opt-in: uses existing YOUTUBE_API_KEY, never prints it or request URLs.
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');
require('@next/env').loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
if (!process.env.YOUTUBE_API_KEY) {
  console.error('YOUTUBE_API_KEY must be supplied through the existing environment.');
  process.exit(1);
}
const filename = path.resolve('src/app/api/youtube/search/route.ts');
const route = new Module(filename, module);
route.filename = filename;
route.paths = Module._nodeModulePaths(path.dirname(filename));
route._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module:ts.ModuleKind.CommonJS, target:ts.ScriptTarget.ES2020 },
}).outputText, filename);
(async () => {
  const response = await route.exports.GET({nextUrl:new URL('https://local.invalid/api/youtube/search?q=lofi%20jazz')});
  const body = await response.json();
  console.log(JSON.stringify({status:response.status, count:body.items?.length ?? 0,
    hasNextPage:Boolean(body.nextPageToken), error:body.error ?? null}, null, 2));
  if (!response.ok || !body.items?.length) process.exitCode = 1;
})().catch(() => { console.error('Live search check failed.'); process.exitCode = 1; });
