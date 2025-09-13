export type GlobalThis = typeof globalThis;
export type ProcessArgv = NodeJS.Process['argv'];
export type ProcessEnv = NodeJS.ProcessEnv;


/**
 * globalThis object - in case of prehistoric node <12; uses
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
 * @see {@link https://docs.deno.com/api/node/process/~/Process#property_argv|process.argv - Deno}
 */
export const ARGV: NodeJS.Process['argv'] = /* @__PURE__ */ (() =>
  typeof process === 'undefined'
    /** quickJs {@link https://bellard.org/quickjs/quickjs.html#Global-objects} */
    ? typeof scriptArgs !== 'undefined'
      ? scriptArgs
      : []
    : ((globalThis as never)?.['Deno']
      // if --allow-all is used, no args (like --allow-env), use default
      // @ts-expect-error deno uses 'args' rather than 'argv'
      ? (globalThis as never)?.['Deno']?.argv (process['args']?.length ? process['args'] : process['argv'])
      : process['argv']
    ) ?? []
)();


/**
 * process environment (ENV) variables
 * @see {@link https://nodejs.org/api/process.html#processenv|process.env - Node.js}
 * @see {@link https://docs.deno.com/runtime/reference/env_variables/#built-in-deno.env|env - Deno}
 * @see {@link https://bellard.org/quickjs/quickjs.html#Global-objects|getenviron - QuickJS}
 * @see {@link https://quickjs-ng.github.io/quickjs/stdlib#getenviron|getenviron - QuickJS-NG}
 */
export const ENV = /* @__PURE__ */ (() => typeof process === 'undefined'
  ? typeof getenviron === 'function'
    ? getenviron()
    : {}
  : (!(globalThis as never)?.['Deno']
    ? process['env']
    // deno requires permission to access env: --allow-env
    : (() => {
      try {
        // if --allow-all is used, no toObject (like --allow-env), use default
        // @ts-expect-error deno perms
        return (globalThis as never)?.['Deno']?.env?.toObject?.() ?? process['env']?.toObject ? process['env']?.toObject() : process['env'];
      } catch (_err) { /* ignore */ }
      return {};
    })())
)() as ProcessEnv;
