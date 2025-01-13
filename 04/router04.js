import { mixin } from "../utils.js"
import handlerProto from "./handler.js"
import Route from "./route04.js"

export default function Router(options) {
  function router(req, res, out) {
    return router.handle(req, res, out)
  }

  mixin(router, handlerProto, true)
  mixin(router, proto, true)
  init(router, options)

  return router
}

function init(router, options) {
  router.path = "/"
  router.routes = []
}

const proto = {
  path: "/",
  routes: [],

  _reset() {
    this.path = "/"
    this.routes = []
  },

  handle(req, res, out) {
    let index = 0

    function next(err) {
      // pass
    }
  },

  route(path) {
    var route = new Route(path)
    
  },

  use(path, ...handlers) { },

  add(method, path, ...handlers) { },

  get(path, ...handlers) {

  },

  post(path, ...handlers) {

  },

}