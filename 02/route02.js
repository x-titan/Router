import { assert, isFunction, pathname } from "../utils.js"
import Layer from "./layer02.js"

export default class Route {
  constructor(path = "/") {
    this.path = pathname(path)
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
    // var route = this
    var stack = this.stack
    let index = 0
    var method = req.app.method

    method = escapeHeadMethod(method, this.methods)

    function next(err) {
      var layer = stack[index++]

      if (!layer) {
        out(err)
      }

      if (layer.matchMethod(method)) {
        layer.handle(err, req, res, next)
      } else next(err)
    }

    next()
  }

  all(handler) {
    for (const fn of [...arguments].flat(Infinity)) {
      assert(isFunction(fn), "argument handler must be a function")

      var layer = newLayer("/", "*", fn)
      this.stack.push(layer)
    }

    if (handler) {
      this.methods._all = true
    }

    return this
  }

  get(handler) {
    for (const fn of [...arguments].flat(Infinity)) {
      assert(isFunction(fn), "argument handler must be a function")

      var layer = newLayer("/", "get", fn)
      this.stack.push(layer)
    }

    return this
  }

  post(handler) {
    for (const fn of [...arguments].flat(Infinity)) {
      assert(isFunction(fn), "argument handler must be a function")

      var layer = newLayer("/", "post", fn)
      this.stack.push(layer)
    }

    return this
  }
}

function escapeHeadMethod(method, methods) {
  if (method === "head" && !this.methods.head) {
    method = 'get'
  }

  return (
    (method === "head" && !this.methods.head)
      ? "get"
      : method
  )
}

function newLayer(path, method, handler) {
  var layer = new Layer(path, handler)
  layer.method = method || "*"
  return layer
}