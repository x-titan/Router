import { METHODS } from "../const.js"
import normalize from "../lib/normalize-path/index.js"
import Regex from "../lib/path-to-regex/index.js"
import { defaultParam, mixin } from "../utils.js"
import dispatcher from "./dispatcher.js"
import Layer from "./layer04.js"

/**
 * path and method Route
 */
export default class Route {
  constructor(path, options) {
    this = mixin(this, dispatcher, true)

    path = normalize(path)
    options = defaultParam(options, {})

    this.path = path || "/"
    this.methods = Object.create(null)
    this.allMethod = false
    this.isMW = path === "/" && options.isMW === true
    this.regex = new Regex(path)

    /** @type { Layer[] } */
    this.stack = []
  }

  _callback(target, err, req, res) {
    return target.hasMethod(req.app.method)
  }

  hasMethod(method) {
    if (this.allMethod) {
      return true
    }

    method = method.toLowerCase()
    method = escapeHeadMethod(method, this.methods)

    return (!!this.methods[method])
  }

  match(path) {
    if (this.isMW) {
      return {}
    }

    path = normalize(path)

    return this.regex.match(path) || false
  }

  all = methodDeclare("*")
  get = methodDeclare("get")
  post = methodDeclare("post")
}

METHODS.forEach((method) => {
  Route.prototype[method] = methodDeclare(method)
})

function methodDeclare(method) {
  return function (handler) {
    for (const fn of [...arguments].flat(Infinity)) {
      assert(isFunction(fn), "argument handler must be a function")

      var layer = new Layer("/", fn)
      layer.method = method
      this.stack.push(layer)
    }

    if (handler && isPassMethod(method)) {
      his.methods._all = true
    }

    return this
  }
}

function isPassMethod(method) {
  return (!method || method === "" || method === "*")
}

function escapeHeadMethod(method, methods) {
  return (
    (method === "head" && !methods.head)
      ? "get"
      : method
  )
}
