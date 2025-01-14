import { METHODS } from "../const.js"
import normalize from "../lib/normalize-path/index.js"
import { assert, isDefined, isFunction, pathname } from "../utils.js"
import Layer from "./layer03.js"

export default class Route {
  constructor(path = "/") {
    path = pathname(path)
    path = normalize(path)
    this.path = path
    /** @type {Layer[]} */
    this.stack = []
    this.methods = Object.create(null)
  }

  hasMethod(method) {
    method = method.toLowerCase()

    if (this.methods._all) {
      return true
    }

    return (!!this.methods[escapeHeadMethod(method, this.methods)])
  }

  dispatch(req, res, out) {
    var route = this
    const stack = this.stack
    let index = 0
    var method = req.app.method

    method = escapeHeadMethod(method, this.methods)

    function next(err) {
      var layer = stack[index++]

      if (!layer) {
        return out(err)
      }

      if (layer.matchMethod(method)) {
        layer.handle(err, req, res, next)
      } else next(err)
    }

    next()
  }

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

function newLayer(path, method, handler) {
  var layer = new Layer(path, handler)
  layer.method = method || undefined
  return layer
}
