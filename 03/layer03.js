import normalize from "../lib/normalize-path/index.js";
import Regex from "../lib/path-to-regex/index.js";
import { defaultParam, trytocatch } from "../utils.js";
import Route from "./route03.js";

export default class Layer {
  constructor(path, handler, options) {
    path = normalize(path || "/")
    options = defaultParam(options, {})

    if (path === "/") {
      path = ":path(.*)"
    }

    this.path = path
    this.regex = new Regex(path)
    this.name = handler.name || "<anonymous>"
    this.method = "*"
    this.handler = handler
    /** @type {Route} */
    this.route = undefined
    this.slash = path === '/' && options.end === false
  }

  matchMethod(method) {
    if (this.method === undefined) {
      return true
    }

    return (method === this.method)
  }

  match(path) {
    if (this.slash) {
      return {}
    }

    return this.regex.match(path) || false
  }

  handle(err, req, res, next) {
    if (err) {
      this.handleError(err, req, res, next)
    } else {
      this.handleRequest(req, res, next)
    }
  }

  handleError(err, req, res, next) {
    var handler = this.handler

    var [error] = trytocatch(handler, err, req, res, next)

    if (error) {
      next(error)
    }
  }

  handleRequest(req, res, next) {
    var handler = this.handler

    var [error] = trytocatch(handler, req, res, next)

    if (error) {
      next(error)
    }
  }
}
