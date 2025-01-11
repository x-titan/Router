import normalize from "../lib/normalize-path/index.js"
import Regex from "../lib/path-to-regex/index.js"
import { defer, isDefined, isEmpty, trytocatch } from "../utils.js"

const defaultAllPath = ":path(.*)"

export default class Route {
  constructor(path, handle) {
    if (isEmpty(path) || path === "" || path === "*") {
      path = defaultAllPath
    }

    path = normalize(path || "/")

    this.all = false
    this.method = undefined
    this.path = path
    this.regex = new Regex(path)
    this.handlers = [handle]
  }

  pushHandle(handle) {
    this.handlers.push(handle)
    return this
  }

  hasMethod(method) {
    if (this.all) {
      return true
    }

    method = method.toLowerCase()

    if (method === "head" && this.method === "get") {
      method = "get"
    }

    return this.method === method
  }

  match(method, path) {
    return (
      this.hasMethod(method) &&
      this.matchParams(path)
    )
  }

  matchParams(path) {
    path = normalize(path)

    var matches = this.regex.match(path)

    if (matches) {
      return matches
    }

    return false
  }

  dispatch(req, res, out) {
    // var self = this
    var handlers = this.handlers
    var index = 0

    function next(err) {
      var fn = handlers[index++]

      if (!fn) {
        return out(err)
      }

      call(fn, err, req, res, next)
    }

    next()
  }

  static defaultAllPath = defaultAllPath
}

function call(fn, err, req, res, next) {
  var length = fn.length
  var error

  if (length === 4 && isDefined(err)) {
    [error] = trytocatch(fn, err, req, res, next)
  } else if (length < 4 && isEmpty(err)) {
    [error] = trytocatch(fn, req, res, next)
  }

  if (isDefined(error)) next(error)
}
