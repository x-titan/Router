import { defaultTrailingSlash } from "../const.js"
import normalize from "../lib/normalize-path/index.js"
import { assert, isFunction, pathname } from "../utils.js"
import Layer from "./layer05.js"

//
// var example = Router()
// example.route("home/section1/page1")
// example.route("home/section1")
// example.route("home/newtree2")
// example.route("home/foobar3")
// example.route("home")
//
// example
// ->Route: "home"
//   ->Route: "section1"
//     ->Route: "page1"
//   ->Route: "newtree2"
//   ->Route: "foobar3"
//

export default class Route {
  constructor(path, options) {
    // this.fullPath = options.fullPath || path
    this.path = path
    this.methods = {}
    this.methodsAll = false
    /**
     * @type {{ "path": Route }}
     */
    this.routes = Object.create(null)
    /**
     * @type {Layer[]}
     */
    this.stack = []
  }

  handle(req, res, done) {
    assert(isFunction(done), "argument done must be a function")

    var route = this
    const stack = this.stack
    var index = 0


    function next(err) {

    }
  }


  dispatch(req, res, done) {
    assert(isFunction(done), "argument done must be a function")

    const stack = this.stack
    var index = 0

    function next(err) {
      var layer = stack[index++]

      if (!layer) {
        return done(err)
      }

      var match = layer.match()

      if (match) {
        layer.handle(err, req, res, next)
      } else { next(err) }
    }

    next()
  }

  /**
   * @param {string} path 
   * @return {this}
   */
  route(path) {
    path = pathname("/" + path)
    path = normalize(path)

    var { route, leftPath, rightPath, fullPath } = findRoute(path, this)

    if (rightPath !== "") {
      if (!keychanger(rightPath, this)) {
        console.log("route", route, rightPath)
        route = route.routes[rightPath] = new Route(rightPath)
      }
    }

    return route
  }

  all(path, ...handlers) {
    assert(handlers.length > 0, "handlers undefined")

    var route = this.route(path || "/")
    route.methods["_all"] = true
    route.methodsAll = true

    for (const handler of handlers) {
      assert(isFunction(handler), "handler must be a function")

      var layer = new Layer(route.path, handlers)
      layer.method = undefined

      route.stack.push(layer)
    }

    return this
  }

  add(method, path, ...handlers) {
    assert(handlers.length > 0, "handlers undefined")

    var route = this.route(path || "/")
    route.methods[method] = true

    for (const handler of handlers) {
      assert(isFunction(handler), "handler must be a function")

      var layer = new Layer(route.path, handlers)
      layer.method = method

      route.stack.push(layer)
    }

    return this
  }

  get(path, ...handlers) {
    assert(handlers.length > 0, "handlers undefined")

    var route = this.route(path || "/")
    route.methods.get = true

    for (const handler of handlers) {
      assert(isFunction(handler), "handler must be a function")

      var layer = new Layer(route.path, handlers)
      layer.method = "get"

      route.stack.push(layer)
    }

    return this
  }

  post(path, ...handlers) {
    assert(handlers.length > 0, "handlers undefined")

    var route = this.route(path || "/")
    route.methods.post = true

    for (const handler of handlers) {
      assert(isFunction(handler), "handler must be a function")

      var layer = new Layer(route.path, handlers)
      layer.method = "get"

      route.stack.push(layer)
    }

    return this
  }
}

/**
 * @param {string} path
 * @param {Route} route
 * @return {boolean}
 */
function keychanger(path, route) {
  var keys = Reflect.ownKeys(route.routes)
  var keychanged = false

  for (const key of keys) {
    if (key.startsWith(path + "/")) {
      keychanged = true

      var child = new Route(path)
      var childPath = route.routes[key].path = key.slice(path.length + 1)

      child.routes[childPath] = route.routes[key]
      route.routes[path] = child
      delete route.routes[key]
      route = child
    }
  }

  return keychanged
}

function findRoute(path, route) {
  var fullPath = []
  var leftPath = ""
  var rightPath = ""

  var right = path.split("/").filter(Boolean)
  let start = 0
  let end = 0

  if (path === "") {
    return { leftPath, rightPath, route, fullPath }
  }

  do {
    rightPath = right.slice(start, ++end).join("/")

    if (route.routes[rightPath]) {
      start = end
      leftPath = rightPath
      route = route.routes[rightPath]
      rightPath = ""
      fullPath.push(leftPath)
    }

  } while (end <= right.length);

  return { leftPath, rightPath, route, fullPath }
}

// class Route1 {
//   constructor(path) {
//     this.path = path
//     this.routes = {}
//   }
//   route(path) {

//     var { route, leftPath, rightPath, fullPath } = findRoute(path, this)

//     if (rightPath !== "") {
//       var keys = Reflect.ownKeys(route)
//       console.log(keys.some((new RegExp("^" + rightPath)).test))

//       route.routes[rightPath] = new Route(rightPath)
//       route = route.routes[rightPath]
//     }

//     return route
//   }
// }

var mystack = new Route("mystack")
// mystack.route("home/page").route("route")
mystack.route("section/foo/bar")
// mystack.route("contact").route("page1").route("page2").route("page3")
// mystack.route("about").route("wow")
console.log(mystack)
console.log(mystack.route("section"))