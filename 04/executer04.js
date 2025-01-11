import { isDefined, isEmpty, trytocatch } from "../utils.js"

export default class Executer {
  constructor(path, handler, options) {
    this.path = path || "/"
    this.handler = handler
    this.route
  }

  handle(err, req, res, next) {
    var len = this.handler.length
    var error

    if (len === 4 && isDefined(err)) {
      [error] = trytocatch(this.handler, err, req, res, next)
    } else if (len < 4 && isEmpty(err)) {
      [error] = trytocatch(this.handler, req, res, next)
    }

    if (isDefined(error)) {
      next(error)
    }
  }
  handleRequest(req, res, next) {
    var [error] = trytocatch(this.handler, req, res, next)

    if (isDefined(error)) {
      next(error)
    }
  }
  handleError(err, req, res, next) {
    var [error] = trytocatch(this.handler, err, req, res, next)

    if (isDefined(error)) {
      next(error)
    }
  }
}