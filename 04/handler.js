import {
  assert,
  isDefined,
  isEmpty,
  isFunction,
  trytocatch,
} from "../utils.js";

/**
 * @typedef {<request, response>(
 *   req: request,
 *   res: response,
 *   next: (err: Error) => void
 * ) => void } requestHandler
 */
/**
 * @typedef {<request, response>(
 *   err: Error,
 *   req: request,
 *   res: response,
 *   next: (err: Error) => void
 * ) => void } errorHandler
 */
export default handlerProto

const handlerProto = {
  /**
   * @type { requestHandler | errorHandler } 
   */
  _handler: null,
  /**
   * @template request, response
   * @param { request | { method: string, url: string }} req
   * @param { response | { end: Function }} res
   * @param { (err: Error) => void } next
   */
  handleRequest(req, res, next) {
    assert(isFunction(next), "argument next must be function")

    var [error] = trytocatch(this._handler, req, res, next)

    if (error) {
      next(error)
    }
  },

  /**
   * @template request, response
   * @param {Error} err
   * @param { request | { method: string, url: string }} req
   * @param { response | { end: Function }} res
   * @param { (err: Error) => void} next
   */
  handleError(err, req, res, next) {
    assert(isFunction(next), "argument next must be function")

    var [error] = trytocatch(this._handler, err, req, res, next)

    if (error) {
      next(error)
    }
  },

  invokeHandler(err, req, res, next) {
    if (isDefined(err)) {
      this.handleError(err, req, res, next)
    } else {
      this.handleRequest(req, res, next)
    }
  },
}