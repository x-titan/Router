import normalize from "../lib/normalize-path/index.js"
import Regex from "../lib/path-to-regex/index.js"

export default class Route {
  constructor(path, options) {
    path = normalize(path)
    this.path = path || "/"
    this.regex = new Regex(path)
    this.stack = []
  }

  dispatch(req, res, out) {

  }

  hasMethod(method){
    
  }

  matchPath(path) {
    path = normalize(path)
    if (this.path === "*") {
      return true
    }
  }

  use() {

  }

  add() {

  }
}