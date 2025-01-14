import normalize from "../lib/normalize-path/index.js"

/**
 * @param {boolean} condition
 * @param {string} message
 * @throws {Error}
 */
export function assert(condition, message) {
  if (!condition) throw Error(message)
}

/**
 * @param {unknown} value 
 * @param {"undefined" | "number" | "string" | "function" | "object"} type 
 */
export function isTypeOf(value, type) {
  return ((typeof value) === type)
}

/** @return {value is unknown} */
export function isDefined(value) {
  return (value !== null) && (value !== void 0)
}

/** @return {value is void | null} */
export function isEmpty(value) {
  return (value === undefined) || (value === null)
}

/** @return {value is null} */
export function isNull(value) {
  return (value === null)
}

/** @return {value is void} */
export function isUndefined(value) {
  return (value === (void 0))
}
/** @return {value is number} */
export function isNumber(value) {
  return ((typeof value) === "number") && isFinite(value)
}

/** @return {value is string} */
export function isString(value) {
  return (typeof value) === "string"
}

/** @return {value is (...args: unknown[]) => unknown} */
export function isFunction(value) {
  return ((typeof value) === "function")
}

/** @return {value is object} */
export function isObject(value) {
  return (value !== null) && ((typeof value) === "object")
}

/** @return {value is Array<unknown>} */
export function isArray(value) {
  return Array.isArray(value)
}

/** @return {value is Promise<unknown>} */
export function isPromise(value) {
  return value instanceof Promise
}

/** @return {value is Error} */
export function isError(value) {
  return (value instanceof Error)
}

/** @return {value is RegExp} */
export function isRegExp(value) {
  return (value instanceof RegExp)
}

/**
 * @template T
 * @param {T} value
 * @return {value}
 */
export function defaultParam(value, defaultValue) {
  return isDefined(value) ? value : defaultValue
}

/**
 * @template T
 * @param {() => T} fn
 * @param  {...any} args
 * @return {[Error | null, T]}
 */
export function trytocatch(fn, ...args) {
  assert(isFunction(fn), "First argument must be a function.")

  try {
    return [null, fn(...args)]
  } catch (error) {
    return [error]
  }
}

/**
 * @template T, U
 * @param {T} target
 * @param {U} source
 * @param {boolean} mutate
 * @return {T & U}
 */
export function mixin(target, source, mutate = false) {
  if (!!mutate) {
    return Object.assign(target, source)
  }

  return { ...target, ...source }
}

export function defer(fn, ...args) {
  setTimeout(fn.bind(fn, ...args), 50)
}

/**
 * @param {Function} fn
 * @param {(err:Error) => void} next
 */
export function call(fn, err, req, res, next) {
  var length = fn.length
  var error

  if (length === 4 && isDefined(err)) {
    [error] = trytocatch(fn, err, req, res, next)
  } else if (length < 4 && isEmpty(err)) {
    [error] = trytocatch(fn, req, res, next)
  } else next(err)

  if (isDefined(error)) next(error)
}

/**
 * @param {string} url
 */
export function pathname(url) {
  assert(typeof url === "string", "argument must be a string")

  if (!url.startsWith("/")) {
    url = "/" + url
  }

  return normalize(url).trim()
    .replace(/[\?|#].*$/, '')
    .replace(/^(?:https?\:)\/\//, '')
    .replace(/^.*?(\/.*)/, '$1')
}
