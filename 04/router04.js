import { mixin } from "../utils"

export default function Router(options) {
  function router(req, res, out) {
    return router.handle(req, res, out)
  }

  mixin(router, proto)
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

  handle(req, res, out) {
    var routes = this.routes
    let index = 0

    function next(err) {

      var route = routes[index++]

      if (!route) {
        return out(err)
      }
    }
  },

  use(handle) { },

  add(method, handle) { },

  get(path, handle) {

  },

  post(path, handle) {

  },

  route(path) {

  }

}