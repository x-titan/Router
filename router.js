import normalize from "./lib/normalize-path/index.js"
import Regex from "./lib/path-to-regex/index.js"
import { call, defaultParam, isDefined, isEmpty, isFunction } from "./utils.js"
import Route from "./route.js"

export default function Router(options) {
  function router(req, res, out) {
    return router.handle(req, res, out)
  }

  // Object.assign(router, Emitter)
  Object.assign(router, proto)
  router.init()
  return router
}

const proto = {
  init() {
    this.mount = false
    this.path = "/"
    this.stack = []
  },

  //#region Private
  _path(path) {
    path = normalize(path)

    if (isEmpty(path) || path === "" || path === "*") {
      path = Route.defaultAllPath
    }
    return path
  },
  _isEmptyMethod(method) {
    return (
      isEmpty(method) ||
      method === "" ||
      method === "*" ||
      method === "all"
    )
  },

  _route(path, callback) {
    path = this._path(path)
    var fn = callback

    if (isDefined(callback) && isFunction(callback.handle)) {
      var app = callback
      app.path = path
      app.mount = this

      path = normalize(path + "/" + Route.defaultAllPath)

      fn = function (req, res, next) {
        var storePath = req.app.path

        req.app.path = res.params.path || "/"

        function restore(err) {
          req.app.path = storePath

          return next(err)
        }

        return app.handle(req, res, restore)
      }
    }

    var route = new Route(path, fn)

    return route
  },
  //#endregion

  route(path) {
    var route = new Route(path)
    this.stack.push(route)
    return route
  },

  add(method, path, callback) {
    var route = this._route(path, callback)

    if (this._isEmptyMethod(method)) {
      route.all = true
    } else {
      route.method = method
    }

    this.stack.push(route)

    return this
  },

  use(path, callback) {
    if (isFunction(path)) {
      for (const fn of arguments) {
        this.use(Route.defaultAllPath, fn)
      }

      return this
    }

    var route = this._route(path, callback)
    route.all = true

    this.stack.push(route)

    return this
  },

  handle(req, res, out) {
    var self = this
    var stack = this.stack
    let index = 0

    req.app = defaultParam(
      req.app,
      {
        method: req.method.toLowerCase(),
        path: req.url,
      }
    )

    res.params = defaultParam(res.params, {})

    function next(err) {
      var route = stack[index++]

      if (!route) {
        return out(err)
      }

      var method = req.app.method
      var path = req.app.path
      var match = route.match(method, path)

      if (match) {
        match = route.matchParams(path)
        Object.assign(res.params, match)

        return route.dispatch(req, res, next)
      }

      next(err)
    }
    next()
  },

  all(path, callback) {
    return this.add("all", path, callback)
  },

  get(path, callback) {
    return this.add("get", path, callback)
  },

  post(path, callback) {
    return this.add("get", path, callback)
  },
}
