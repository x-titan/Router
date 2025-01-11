import normalize from "../lib/normalize-path/index.js"
import Regex from "../lib/path-to-regex/index.js"
import {
  isDefined,
  isEmpty,
  mixin,
  trytocatch,
} from "../utils.js"
import handlerProto from "./handler.js"

/**
 * method Layer
 */
export default class Layer {
  constructor(path, handler, options) {
    path = normalize(path || "/")

    this.path = path
    this.method = undefined
    this.regex = new Regex(path)
    this._handler = handler
    this.route
    mixin(this, handlerProto, true)
  }

  hasMethod(method) {
    if (isPassMethod(method)) {
      return true
    }

    return (method === this.method)
  }
}

function isPassMethod(method) {
  return (!method || method === "" || method === "*")
}
