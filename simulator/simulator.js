import { mixin } from "../utils.js"

export default function Simulator(app, options) {
  if (!(this instanceof Simulator)) {
    return new new Simulator(app, options)
  }

  this.app = app

  mixin(this, simulatorProto, true)
}

const simulatorProto = {
  handle(req, res, out) {
    return this.app.handle(req, res, out)
  },

  $(path, options) {
    options = options || {}
    options.method = "GET"
    options.url = path || "/"
    var { req, res, out } = newRequest(options)

    return this.app.handle(req, res, out)
  },

  use(...args) {
    this.app.use(...args)
  },
}

function newRequest(options) {

  var req = {
    method: options.method || "GET",
    url: options.url || "/",
    ...options.req,
  }

  var res = {
    end: options.end || function (body) {
      console.log("[response]", body)
    },
    ...options.res,
  }

  var out = (
    options?.finalhandler?.call(req, res, options.finalhandlerOpts) ||
    options.out ||
    function (err) {
      console.error(err)
      res.end("[404]")
    }
  )

  return { req, res, out }
}