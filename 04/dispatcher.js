import {
  isFunction,
  mixin,
} from "../utils.js"
import handlerProto from "./handler.js"

export default dispatcher

const dispatcher = {
  /** @type { handlerProto[] } */
  stack: null,
  /**
   * @type { <T, request, response>(
   *  target: T | handlerProto,
   *  err: Error,
   *  req: request,
   *  res: response
   * ) => boolean }
   */
  _callback: null,

  dispatch(req, res, done) {
    var stack = this.stack
    var _callback = this._callback
    let index = 0

    function next(err) {
      var target = stack[index++]

      if (!target) {
        return done(err)
      }

      if (_callback(target, err, req, res)) {
        target.invokeHandler(err, req, res, done)
      } else next(err)
    }

    next()
  },
}