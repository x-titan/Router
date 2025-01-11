import normalize from "../lib/normalize-path/index.js"
import { assert, defaultParam, isFunction, mixin, pathname } from "../utils.js"
import { METHODS } from "../const.js"
import Layer from "./layer03.js"
import Route from "./route03.js"

export default class Router {
  constructor(options) {
    this.path = "/"
    /** @type {Layer[]} */
    this.stack = []
  }

  handle(req, res, callback) {
    assert(isFunction(callback), "argument callback is required")

    let index = 0
    let stack = this.stack

    req.params = defaultParam(req.params, {})
    req.app = defaultParam(req.app, {
      url: req.url,
      pathname: pathname(req.url),
      normUrl: normalize(req.url),
      methods: req.method.toLowerCase()
    })

    function next(err) {
      var layer = stack[index++]

      if (!layer) {
        return callback(err)
      }

      // var route = layer.route
      var pathname = req.app.pathname
      // var method = req.app.method
      var match = layer.match(pathname)

      // if (!route) {
      //   return next(err)
      // }

      // var hasMethod = route.hasMethod(method)

      if (match) {
        mixin(req.params, match)

        layer.handle(err, req, res, next)
      } else next(err)
    }

    next()
  }

  use(path, ...handlers) {
    if (isFunction(path)) {
      handlers.unshift(path)
      path = "/"
    }

    path = normalize(path)
    path = pathname(path)

    for (const fn of handlers) {
      assert(isFunction(fn), "argument handler must be a function")

      var layer = new Layer(path, fn, { end: false })
      layer.route = undefined
      this.stack.push(layer)
    }

    return this
  }

  route(path) {
    path = normalize(path)
    path = pathname(path)

    function handle(req, res, next) {
      route.dispatch(req, res, next)
    }

    // Layer for router
    var layer = new Layer(path, handle, { end: true })
    // route no have layer
    var route = (layer.route = new Route(path))

    this.stack.push(layer)

    return route
  }

  add(method, path, ...handlers) {
    var route = this.route(path)
    route[method].apply(route, handlers)
    return this
  }

  all(path, ...handlers) {
    var route = this.route(path)
    route.all(...handlers)
    return this
  }

  // get(path, ...handlers) {
  //   var route = this.route(path)
  //   route.get(...handlers)
  //   return this
  // }

  // post(path, ...handlers) {
  //   var route = this.route(path)
  //   route.post(...handlers)
  //   return this
  // }
}

// declare methods: GET, POST, HEAD, ...
METHODS.forEach((method) => {
  Router.prototype[method] = function (path, ...handlers) {
    var route = this.route(path)
    route[method].apply(route, handlers)
    return this
  }
})
