import { METHODS } from "./const.js"
import { assert, isDefined, isFunction, pathname } from "./utils.js"
import Layer from "./layer.js"

/**
 * @typedef { (err: Error) => void } next
 */

/**
 * @typedef { <request, response>(
 * req: request,
 * res: response,
 * done: next,
 * ) => void } routedispatch
 */

/**
 * @typedef { <request, response>(
 * req: request,
 * res: response,
 * next: next,
 * ) => void } requesthandler
 */

/**
 * @typedef { <request, response>(
 * err: Error,
 * req: request,
 * res: response,
 * next: next,
 * ) => void } errorhandler
 */

export default class Route {
  /**
   * @param {string} path
   */
  constructor(path) {
    path = pathname(path)

    this.path = path
    /** @type {Layer[]} */
    this.stack = []
    this.methods = Object.create(null)
  }

  /**
   * @param {string} method
   */
  hasMethod(method) {
    method = method.toLowerCase()

    if (this.methods._all) {
      return true
    }

    return (!!this.methods[escapeHeadMethod(method, this.methods)])
  }

  /** @type {routedispatch} */
  dispatch(req, res, done) {
    var route = this
    const stack = this.stack
    let index = 0
    var method = req.app.method


    function next(err) {
      var layer = stack[index++]

      if (!layer) {
        return done(err)
      }

      if (!layer.method || layer.method === method) {
        layer.handle(err, req, res, next)
      } else next(err)
    }

    next()
  }

  /**
   * @param {requesthandler | errorhandler} handler
   */
  all(handler) {
    assert(isDefined(handler), "argument handler is required")

    for (const fn of arguments) {
      assert(isFunction(fn), "argument handler must be a function")

      const layer = new Layer('/', fn)
      layer.method = undefined
      this.stack.push(layer)
    }

    this.methods._all = true

    return this
  }

  /**
   * @param {requesthandler | errorhandler} handler
   */
  get(handler) {
    assert(isDefined(handler), "argument handler is required")

    for (const fn of arguments) {
      assert(isFunction(fn), "argument handler must be a function")

      const layer = new Layer('/', fn)
      layer.method = "get"
      this.stack.push(layer)
    }

    this.methods.get = true

    return this
  }

  /**
   * @param {requesthandler | errorhandler} handler
   */
  post(handler) {
    assert(isDefined(handler), "argument handler is required")

    for (const fn of arguments) {
      assert(isFunction(fn), "argument handler must be a function")

      const layer = new Layer('/', fn)
      layer.method = "post"
      this.stack.push(layer)
    }

    this.methods.post = true

    return this
  }
}

METHODS.forEach((method) => {
  Route.prototype[method] = function (handler) {
    assert(isDefined(handler), "argument handler is required")

    for (const fn of arguments) {
      assert(isFunction(fn), "argument handler must be a function")

      const layer = new Layer('/', fn)
      layer.method = method
      this.stack.push(layer)
    }

    this.methods[method] = true

    return this
  }
})

function escapeHeadMethod(method, methods) {
  return (
    (method === "head" && !methods.head)
      ? "get"
      : method
  )
}
