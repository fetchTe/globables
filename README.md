# GlobAbles

CLI/ENV constants for Node.js-like runtimes, supports: [Node.js](https://nodejs.org/), [Deno](https://deno.com/), [Bun](https://bun.sh/), [QuickJS](https://bellard.org/quickjs/), and [QuickJS-NG](https://quickjs-ng.github.io/quickjs/)

```ts
import {
  ARGV,
  ENV,
  GLOBAL_THIS,
}  from 'globables';

GLOBAL_THIS.console.log(`Shellin with ${ENV['SHELL']} and commandin ${ARGV.join(', ')}`);
```
> ╸`ARGV` - [command-line arguments](https://nodejs.org/api/process.html#processargv)<br/>
> ╸`ENV` - [process environment](https://nodejs.org/api/process.html#processenv) <br/>
> ╸`GLOBAL_THIS` - [`globalThis`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis) object; pollyfill'ed if missing, such as prehistoric node <12 versions<br/>
> ╸ All Runtimes/Globals Tested -> [./src/index.test.ts](https://github.com/fetchTe/globables/blob/master/src/index.test.ts)<br/>


<br/>


#### ▎INSTALL

```sh
# pick your poison
npm install globables
bun  add globables
pnpm add globables
yarn add globables
```



## Development/Contributing

Contributions, pull requests, and suggestions are appreciated. The following runtimes must be installed for you to test any changes and/or add additional tests: [Node.js](https://nodejs.org/), [Bun](https://bun.sh), [Deno](https://deno.com), [QuickJS-NG](https://quickjs-ng.github.io/quickjs/) and [Make](https://www.gnu.org/software/make/manual/make.html)


### ▎PULL REQUEST STEPS

1. Clone repository
2. Create and switch to a new branch for your work
3. Make and commit changes
4. Run `make release` to clean, setup, build, lint, and test
5. If everything checks out, push branch to repository and submit pull request


#### ▎MAKEFILE REFERENCE

```
# USAGE
   make [flags...] <target>

# TARGET
  -------------------
   run                   executes entry-point (./src/index.ts) via 'bun run'
   release               clean, setup, build, lint, test, aok (everything but the kitchen sink)
  -------------------
   build                 builds the .{js,d.ts} (skips: lint, test, and .min.* build)
   build_cjs             builds the .cjs export
   build_esm             builds the .js (esm) export
   build_declarations    builds typescript .d.{ts,mts,cts} declarations
  -------------------
   install               installs dependencies via bun
   update                updates dependencies
   update_dry            lists dependencies that would be updated via 'make update'
  -------------------
   lint                  lints via tsc & eslint
   lint_eslint           lints via eslint
   lint_eslint_fix       lints and auto-fixes via eslint --fix
   lint_tsc              lints via tsc
   lint_watch            lints via eslint & tsc with fs.watch to continuously lint on change
  -------------------
   test                  runs bun test(s)
   test_watch            runs bun test(s) in watch mode
   test_update           runs bun test --update-snapshots
  -------------------
   help                  displays (this) help screen

# FLAGS
  -------------------
   BUN                   [? ] bun build flag(s) (e.g: make BUN="--banner='// bake until golden brown'")
  -------------------
   CJS                   [?1] builds the cjs (CommonJS) target on 'make release'
   EXE                   [?js|mjs] default esm build extension
   TAR                   [?0] build target env (-1=bun, 0=node, 1=dom, 2=dom+iife, 3=dom+iife+userscript)
   MIN                   [?1] builds minified (*.min.{mjs,cjs,js}) targets on 'make release'
  -------------------
   BAIL                  [?1] fail fast (bail) on the first test or lint error
   ENV                   [?DEV|PROD|TEST] sets the 'ENV' & 'IS_*' static build variables (else auto-set)
   TEST                  [?0] sets the 'IS_TEST' static build variable (always 1 if test target)
   WATCH                 [?0] sets the '--watch' flag for bun/tsc (e.g: WATCH=1 make test)
  -------------------
   DEBUG                 [?0] enables verbose logging and sets the 'IS_DEBUG' static build variable
   QUIET                 [?0] disables pretty-printed/log target (INIT/DONE) info
   NO_COLOR              [?0] disables color logging/ANSI codes
```
