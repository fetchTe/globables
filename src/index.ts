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
