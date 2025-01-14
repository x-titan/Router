import Regex from "../lib/path-to-regex/index.js"
import { defaultParam, isDefined, pathname, trytocatch } from "./utils.js"

/**
 * @typedef { (err: Error) => void } next
 */

/**
 * @typedef { <request, response>(
 * err: Error,
 * req: request,
 * res: response,
 * done: next,
 * ) => void } layerhandler
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

export default class Layer {
  /**
   * @param {string} path
   * @param {requesthandler | errorhandler} handler
   * @param {{ }} options
   */
  constructor(path, handler, options) {
    path = pathname(path)
    options = defaultParam(options, {})

    this.path = path
    this.method = undefined
    this.regex = new Regex(path)
    this.name = handler.name || "<anonymous>"
    this.handler = handler
    /** @type {Route} */
    this.route = undefined
    this.slash = path === '/' && options.slash === true
  }

  /**
   * @param {string} path
   */
  match(path) {
    if (this.slash) {
      return {}
    }

    path = pathname(path)

    return this.regex.match(path) || false
  }

  /** @type {layerhandler} */
  handle(err, req, res, next) {
    if (isDefined(err)) {
      this.handleError(err, req, res, next)
    } else {
      this.handleRequest(err, req, res, next)
    }
  }

  /** @type {errorhandler} */
  handleError(err, req, res, next) {
    var handler = this.handler

    if (handler.length !== 4) {
      return next(err)
    }

    var [error] = trytocatch(handler, err, req, res, next)

    if (error) {
      next(error)
    }
  }

  /** @type {layerhandler} */
  handleRequest(err, req, res, next) {
    var handler = this.handler

    if (handler.length > 3) {
      return next(err)
    }

    var [error] = trytocatch(handler, req, res, next)

    if (error) {
      next(error)
    }
  }
}