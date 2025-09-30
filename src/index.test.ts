import * as path from 'node:path';
import * as fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import type { SpawnSyncOptions } from 'node:child_process';
import {
  expect,
  test,
  describe,
  beforeAll,
  afterAll,
} from 'bun:test';

const DIRNAME = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../');
const DIST = path.join(DIRNAME, 'dist/index.js');
const TEST = path.join(DIRNAME, 'dist/test.js');

type CliResult = {
  ok: boolean;
  status: number;
  stdout: string;
  stderr: string;
};

const cli = (
  sargs: string,
  opts: SpawnSyncOptions = {},
  logErrs = true,
): CliResult => {
  const { status, stdout, stderr } = spawnSync(sargs, {
    encoding: 'utf8',
    stdio: 'pipe',
    ...opts,
    env: Object.assign({NO_COLOR: '1'}, process.env, opts?.env ?? {}),
    shell: true,
  });
  const res: CliResult = {
    ok    : status === 0,
    status: status ?? -1,
    stdout: (stdout ?? '').toString().trim(),
    stderr: (stderr ?? '').toString().trim(),
  };
  if (!res.ok && logErrs) {
    res.stderr.length && console.error('[CLI:FAIL:derr]\n' + res.stderr + '\n');
    res.stdout.length && console.error('[CLI:FAIL:dout]\n' + res.stdout + '\n');
    console.error('[CLI:FAIL:args]\n' + sargs + '\n');
    return res;
  }
  return res;
};

type IsIt = {
  b: number;
  d: number;
  n: number;
  q: number;
  c: number;
  v: number;
};
const toIs = (is: Partial<IsIt>) => `
IS_BUN: ${!!is.b}
IS_DENO: ${!!is.d}
IS_NODE: ${!!is.n}
IS_QUICKJS: ${!!is.q}
IS_CLOUDFLARE_WORKER: ${!!is.c}
IS_VERCEL_EDGE: ${!!is.v}
`.trim();

beforeAll(() => {
  fs.writeFileSync(
    TEST,
    fs.readFileSync(DIST).toString()
      + `
console.log(\`GLOBAL_THIS: \${!!GLOBAL_THIS.console.log}\`);
console.log(\`ENV: \${ENV['YOLO']}\`);
console.log(\`ARGV: \${ARGV.join(' ')}\`);
console.log(\`IS_BUN: \${IS_BUN}\`);
console.log(\`IS_DENO: \${IS_DENO}\`);
console.log(\`IS_NODE: \${IS_NODE}\`);
console.log(\`IS_QUICKJS: \${IS_QUICKJS}\`);
console.log(\`IS_CLOUDFLARE_WORKER: \${IS_CLOUDFLARE_WORKER}\`);
console.log(\`IS_VERCEL_EDGE: \${IS_VERCEL_EDGE}\`);
    `,
  );
});
afterAll(() => {
  fs.unlinkSync(TEST);
});


describe('sanity check', () => {
  test('maths adds maths', () => {
    expect(1 + 1).toBe(2);
  });

  test('verifies cli works, and TEST file exsits', () => {
    const res = cli(`cat ${TEST}`);
    expect(res.ok).toBe(true);
    expect(res.stdout).toInclude('console.log');
  });

});


describe('node', () => {
  test('GLOBAL_THIS works', () => {
    const res = cli(`node ${TEST}`);
    expect(res.ok).toBe(true);
    expect(res.stdout).toInclude('GLOBAL_THIS: true');
    expect(res.stdout).toInclude(toIs({n: 1}));
  });

  test('ENV works', () => {
    const res = cli(`node ${TEST}`, {env: { YOLO: 'TEST' }});
    expect(res.ok).toBe(true);
    expect(res.stdout).toInclude('ENV: TEST');
    expect(res.stdout).toInclude(toIs({n: 1}));
  });

  test('ARGV works', () => {
    const res = cli(`node ${TEST} --yolo`);
    expect(res.ok).toBe(true);
    expect(res.stdout).toInclude('--yolo');
    expect(res.stdout).toInclude(toIs({n: 1}));
  });
});


describe('bun', () => {
  test('GLOBAL_THIS works', () => {
    const res = cli(`bun run ${TEST}`);
    expect(res.ok).toBe(true);
    expect(res.stdout).toInclude('GLOBAL_THIS: true');
    expect(res.stdout).toInclude('IS_BUN: true');
    expect(res.stdout).toInclude(toIs({b: 1}));
  });

  test('ENV works', () => {
    const res = cli(`bun run ${TEST}`, {env: { YOLO: 'TEST' }});
    expect(res.ok).toBe(true);
    expect(res.stdout).toInclude('ENV: TEST');
    expect(res.stdout).toInclude(toIs({b: 1}));
  });

  test('ARGV works', () => {
    const res = cli(`bun run ${TEST} --yolo`);
    expect(res.ok).toBe(true);
    expect(res.stdout).toInclude('--yolo');
    expect(res.stdout).toInclude(toIs({b: 1}));
  });
});


describe('qjs - quickjs', () => {
  test('GLOBAL_THIS works', () => {
    const res = cli(`qjs -m ${TEST}`);
    expect(res.ok).toBe(true);
    expect(res.stdout).toInclude('GLOBAL_THIS: true');
    expect(res.stdout).toInclude(toIs({q: 1}));
  });

  test('ENV works', () => {
    const res = cli(`qjs --std -m ${TEST}`, {env: { YOLO: 'TEST' }});
    expect(res.ok).toBe(true);
    expect(res.stdout).toInclude('ENV: TEST');
    expect(res.stdout).toInclude(toIs({q: 1}));
  });

  test('ARGV works', () => {
    const res = cli(`qjs --std -m ${TEST} --yolo`);
    expect(res.ok).toBe(true);
    expect(res.stdout).toInclude('--yolo');
    expect(res.stdout).toInclude(toIs({q: 1}));
  });
});


describe('deno --allow-env', () => {
  test('GLOBAL_THIS works', () => {
    const res = cli(`deno run --allow-env ${TEST}`);
    expect(res.ok).toBe(true);
    expect(res.stdout).toInclude('GLOBAL_THIS: true');
    expect(res.stdout).toInclude(toIs({d: 1}));
  });

  test('ENV works', () => {
    const res = cli(`deno run --allow-env ${TEST}`, {env: { YOLO: 'TEST' }});
    expect(res.ok).toBe(true);
    expect(res.stdout).toInclude('ENV: TEST');
    expect(res.stdout).toInclude(toIs({d: 1}));
  });

  test('ARGV works', () => {
    const res = cli(`deno run --allow-env ${TEST} --yolo`);
    expect(res.ok).toBe(true);
    expect(res.stdout).toInclude('--yolo');
    expect(res.stdout).toInclude(toIs({d: 1}));
  });
});


describe('deno --allow-all', () => {
  test('GLOBAL_THIS works', () => {
    const res = cli(`deno run --allow-all ${TEST}`);
    expect(res.ok).toBe(true);
    expect(res.stdout).toInclude('GLOBAL_THIS: true');
    expect(res.stdout).toInclude(toIs({d: 1}));
  });

  test('ENV works', () => {
    const res = cli(`deno run --allow-all ${TEST}`, {env: { YOLO: 'TEST' }});
    expect(res.ok).toBe(true);
    expect(res.stdout).toInclude('ENV: TEST');
    expect(res.stdout).toInclude(toIs({d: 1}));
  });

  test('ARGV works', () => {
    const res = cli(`deno run --allow-all ${TEST} --yolo`);
    expect(res.ok).toBe(true);
    expect(res.stdout).toInclude('--yolo');
    expect(res.stdout).toInclude(toIs({d: 1}));
  });
});

