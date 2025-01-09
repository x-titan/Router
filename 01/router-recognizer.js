// Universale router

import normalize from "../lib/normalize-path/index.js"
import Regex from "../lib/path-to-regex/index.js"
import { isArray, isEmpty, isString, mixin } from "../utils.js"


const methods = [
  'acl', 'bind', 'checkout',
  'connect', 'copy', 'delete',
  'get', 'head', 'link',
  'lock', 'm-search', 'merge',
  'mkactivity', 'mkcalendar', 'mkcol',
  'move', 'notify', 'options',
  'patch', 'post', 'propfind',
  'proppatch', 'purge', 'put',
  'query', 'rebind', 'report',
  'search', 'source', 'subscribe',
  'trace', 'unbind', 'unlink',
  'unlock', 'unsubscribe'
]

class Route {
  constructor(method, path, handlers) {
    this.method = method || ""
    this.path = normalize(path || "/")
    this.handlers = handlers || []
    this.regex = new Regex(path)
  }

  match(method, path) {
    if (method === "head" && this.method === "get") {
      method = "head"
    }

    var matches = this.regex.match(path)

    if (isEmpty(matches) || method !== this.method) {
      return false
    }

    return matches
  }
}

export default class Router {
  constructor(path) {
    /** @type {Route[]} */
    this.routes = []
  }

  use(...callbacks) {
    var path = ""
    var fns = callbacks

    if (isArray(arguments[0])) {
      for (const path_ of arguments[0]) {
        this.use(path_, ...callbacks)
      }

      return this
    }

    if (isString(arguments[0])) { // path
      path = arguments[0]
    }

    if (isArray(arguments[1])) { // callbacks
      fns = arguments[1]
    }

    this.add("", path, fns)

    return this
  }

  add(method, path, ...callbacks) {
    var route = new Route(method, normalize(path), callbacks)
    this.routes.push(route)

    return this
  }

  find(method, path) {
    var routes = this.routes
    var handlers = []
    var params = {}

    path = normalize(path)
    method = method.toLowerCase()


    for (const route of routes) {
      var matches = route.match(method, path)

      if (matches) {
        handlers.concat(route.handlers)

        mixin(params, matches, true)
      }
    }

    return { params, handlers }
  }
}

methods.forEach((method) => {
  Router.prototype[method] = function (path, ...callbacks) {
    return this.add(method, path, ...callbacks)
  }
})
