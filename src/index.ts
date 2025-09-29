export type GlobalThis = typeof globalThis;
export type ProcessArgv = NodeJS.Process['argv'];
export type ProcessEnv = NodeJS.ProcessEnv;


/**
 * globalThis object - with pollyfil in case of prehistoric node <12
 * @see {@link https://tc39.es/ecma262/multipage/global-object.html#sec-globalthis|globalThis spec - ECMAScript }
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis|globalThis docs - MDN}
 */
export const GLOBAL_THIS = /* @__PURE__ */ (() =>
  typeof globalThis === 'object'
    ? globalThis
    /**
     * globalThis pollyfill
     * @see {@link https://mathiasbynens.be/notes/globalthis}
     * @see {@link https://github.com/ungap/global-this}
     */
    : (() => {
      // @ts-expect-error - globalThis pollyfill for prehistoric node envs
      // eslint-disable-next-line
      !(function (Object) {function get() {const e = this || self; e.globalThis = e, delete Object.prototype._T_;}'object' != typeof globalThis && (this ? get() : (Object.defineProperty(Object.prototype, '_T_', {configurable:!0, get:get}), _T_));}(Object));
      // just in case
      return typeof globalThis === 'object' ? globalThis : {};
    })()
)() as GlobalThis;


/**
 * command-line arguments (pure/iffe wrapped so we can shake the tree)
 * @see {@link https://nodejs.org/api/process.html#processargv|process.argv - Node.js}
 * @see {@link https://bellard.org/quickjs/quickjs.html#Global-objects|scriptArgs - QuickJS}
 * @see {@link https://quickjs-ng.github.io/quickjs/stdlib#scriptargs|scriptArgs - QuickJS-NG}
 * @see {@link https://docs.deno.com/api/node/process/~/Process#property_argv|process.argv - Deno}
 * @see {@link https://docs.deno.com/api/deno/~/Deno.CommandOptions#property_args|Deno.args - Deno}
 */
export const ARGV: NodeJS.Process['argv'] = /* @__PURE__ */ (() =>
  typeof process === 'undefined'
    /** quickJs {@link https://bellard.org/quickjs/quickjs.html#Global-objects} */
    ? typeof scriptArgs !== 'undefined'
      ? scriptArgs
      : []
    : ((GLOBAL_THIS as never)?.['Deno']
      // @NOTE: DENO.args does not require any perm requests
      // @NOTE: if --allow-all is used, no args (like --allow-env), use default
      // @ts-expect-error deno uses 'args' rather than 'argv'
      ? (GLOBAL_THIS as never)?.['Deno']?.args
        // @ts-expect-error deno uses 'args' rather than 'argv'
        ?? (process['args']?.length ? process['args'] : process['argv'])
      : process['argv']
    ) ?? []
)();
export const ARGS = ARGV;

/**
 * process environment (ENV) variables
 * @see {@link https://nodejs.org/api/process.html#processenv|process.env - Node.js}
 * @see {@link https://docs.deno.com/runtime/reference/env_variables/#built-in-deno.env|env - Deno}
 * @see {@link https://bellard.org/quickjs/quickjs.html#Global-objects|getenviron - QuickJS}
 * @see {@link https://quickjs-ng.github.io/quickjs/stdlib#getenviron|getenviron - QuickJS-NG}
 */
export const ENV = /* @__PURE__ */ (() => typeof process === 'undefined'
  // @ts-expect-error quickjs std
  ? typeof (GLOBAL_THIS as never)?.['std']?.getenviron === 'function'
    // @ts-expect-error quickjs std
    ? ((GLOBAL_THIS as never)['std'].getenviron?.() ?? {})
    : {}
  : (!(GLOBAL_THIS as never)?.['Deno']
    ? process['env']
    : (() => {
      try {
        // @NOTE: if --allow-all is used, no toObject (like --allow-env), use default
        // @NOTE: DENO.env.toObject only requires one perm request while process requires many
        // @ts-expect-error deno perms
        // eslint-disable-next-line @stylistic/max-len
        return (GLOBAL_THIS as never)?.['Deno']?.env?.toObject?.() ?? (process['env']?.toObject ? process['env']?.toObject() : process['env']);
      } catch (_err) { /* ignore */ }
      return {};
    })())
)() as ProcessEnv;


/**
 * detects if running in the Bun runtime
 * @see {@link https://bun.sh/docs/api/globals|Bun globals}
 */
export const IS_BUN: boolean = /* @__PURE__ */ (() =>
  !!(GLOBAL_THIS as never)?.['Bun']
)();


/**
 * detects if running in the Deno runtime
 * @see {@link https://docs.deno.com/api/deno/~/Deno|Deno}
 */
export const IS_DENO: boolean = /* @__PURE__ */ (() =>
  !!(GLOBAL_THIS as never)?.['Deno']
)();


/**
 * detects if running in the QuickJs runtime
 * @see {@link https://quickjs-ng.github.io/quickjs/stdlib/#globals}
 */
export const IS_QUICKJS: boolean = /* @__PURE__ */ (() =>
  typeof scriptArgs !== 'undefined'
)();


/**
 * detects if running in Node.js
 * @see {@link https://nodejs.org/api/process.html#processversions|process.versions docs}
 */
export const IS_NODE: boolean = /* @__PURE__ */ (() =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  !!(GLOBAL_THIS as any)?.['process']?.versions?.node
)();


/**
 * detects if running inside Cloudflare Workers
 * - Workers expose 'WebSocketPair' and lack 'navigator'
 * @see {@link https://developers.cloudflare.com/workers/runtime-apis/websockets}
 */
export const IS_CLOUDFLARE_WORKER: boolean = /* @__PURE__ */ (() =>
  typeof (GLOBAL_THIS as never)?.['WebSocketPair'] === 'function'
  && typeof (GLOBAL_THIS as never)?.['navigator'] === 'undefined'
)();


/**
 * detects if running inside Vercel Edge
 * @see {@link https://vercel.com/docs/functions/runtimes/edge#check-if-you're-running-on-the-edge-runtime}
 */
export const IS_VERCEL_EDGE: boolean = /* @__PURE__ */ (() =>
  !!(GLOBAL_THIS as never)?.['EdgeRuntime']
)();
