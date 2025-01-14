import { METHODS } from "./const.js"
import Regex from "../lib/path-to-regex/index.js"
import { assert, defaultParam, isFunction, isString, mixin, pathname } from "./utils.js"
import Layer from "./layer.js"
import Route from "./route.js"

/**
 * @typedef { (err: Error) => void } next
 */

/**
 * @typedef { <request, response>(
 * req: request,
 * res: response,
 * done: next,
 * ) => void } routerhandler
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

/**
 * @param {{ }} options
 */
export default function Router(options) {
  /** @type {routerhandler} */
  function router(req, res, done) {
    router.handle(req, res, done)
  }

  options = defaultParam(options, {})

  mixin(router, proto, true)
  router.path = options.path || "/"
  /** @type {Layer[]} */
  router.stack = []

  return router
}

const proto = {
  /** @type {routerhandler} */
  handle(req, res, done) {
    assert(isFunction(done), "argument callback is required")

    const stack = this.stack
    var index = 0

    req.params = defaultParam(req.params, {})
    req.app = defaultParam(
      req.app,
      mixin(
        Object.create(null),
        {
          path: pathname(req.url),
          url: req.url,
          method: req.method.toLowerCase()
        },
        true
      )
    )

    function next(err) {
      var layer = stack[index++]

      if (!layer) {
        return done(err)
      }

      var path = req.app.path
      var match = layer.match(path)

      if (match) {
        mixin(req.params, match, true)

        layer.handle(err, req, res, next)
      } else next(err)
    }

    next()
  },

  /**
   * @param {string} path
   * @param {routerhandler & {handle: routerhandler}} target
   */
  mount(path, target) {
    assert(isFunction(target.handle), "argument target must be have handle function")

    path = pathname(path + "/:mountpath(.*)")

    target.parent = this
    target.mounted = true
    target.path = path

    var regex = target.regex = new Regex(path)

    function mounted_handler(req, res, next) {
      var cachePath = req.app.path
      var match = regex.match(req.app.path)

      req.app.mounted = true
      req.app.path = match.mountpath || "/"

      mixin(req.params, match, true)

      function restore(err) {
        req.app.path = cachePath

        next(err)
      }

      target.handle(req, res, restore)
    }

    var layer = new Layer(path, mounted_handler, { slash: true })
    layer.route = undefined
    this.stack.push(layer)

    return this
  },

  /**
   * @param {string} path
   */
  route(path) {
    path = pathname(path)

    function handle(req, res, next) {
      route.dispatch(req, res, next)
    }

    var layer = new Layer(path, handle, { end: true })
    var route = (layer.route = new Route(path))
    this.stack.push(layer)

    return route
  },

  /**
   * @param {string} path
   * @param  {...(requesthandler | errorhandler)} handlers
   */
  use(path, ...handlers) {
    if (isFunction(path)) {
      handlers.unshift(path)
      path = "/"
    }

    path = pathname(path)

    for (const fn of handlers) {
      assert(isFunction(fn), "argument handler must be a function")

      if (isFunction(fn.handle)) {
        this.mount(path, fn)
        continue
      }

      var layer = new Layer(path, fn, { slash: true })
      layer.route = undefined
      this.stack.push(layer)
    }
  },

  /**
   * @param {string} method
   * @param {string} path
   * @param  {...(requesthandler | errorhandler)} handlers
   */
  add(method, path, ...handlers) {
    assert(isString(method), "argument method must be a string")

    var route = this.route(path)
    route[method].apply(route, handlers)
    return this
  },

  /**
   * @param {string} path
   * @param  {...(requesthandler | errorhandler)} handlers
   */
  all(path, ...handlers) {
    var route = this.route(path)
    route.all(...handlers)
    return this
  },

  /**
   * @param {string} path
   * @param  {...(requesthandler | errorhandler)} handlers
   */
  get(path, ...handlers) {
    var route = this.route(path)
    route.get(...handlers)
    return this
  },

  /**
   * @param {string} path
   * @param  {...(requesthandler | errorhandler)} handlers
   */
  post(path, ...handlers) {
    var route = this.route(path)
    route.post(...handlers)
    return this
  },
}

METHODS.forEach((method) => {
  proto[method] = function (path, ...handlers) {
    var route = this.route(path)
    route[method].apply(route, handlers)
    return this
  }
})
