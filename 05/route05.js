import { defaultTrailingSlash } from "../const.js"
import normalize from "../lib/normalize-path/index.js"
import { pathname } from "../utils.js"
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

  /**
   * @param {string} path 
   * @return {this}
   */
  route(path) {
    path = pathname("/" + path)
    path = normalize(path)

    var { route, leftPath, rightPath, fullPath } = findStack(path, this)
    var child = null
    if (rightPath !== "") {
      var keys = Reflect.ownKeys(route.routes)
      keys.forEach((key) => {
        if ((new RegExp("^" + rightPath + "/")).test(key)) {
          var segments = key.split("/")
          for (let i = 0; i < segments.length; i++) {

            if (segments.slice(0, i).join("/") === rightPath) {
              console.log(rightPath, key)
              child = route.routes[key]
              child.path = segments.slice(i).join("/")
              delete route.routes[key]
            }
          }
        }
      })

      route.routes[rightPath] = new Route(rightPath)
      if (child) {

        route.routes[rightPath].routes[child.path] = child
      }
      route = route.routes[rightPath]
    }

    return route
  }

  all(path, ...handlers) {

  }

  add(method, path, ...handlers) {

  }

  get(path, ...handlers) {
    var route = this.route(path || "/")
    route.methods.get = true

    route.stack
  }

  post(path, ...handlers) {
    this.methods.post = true

  }
}



function findStack(path, route) {
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

//     var { route, leftPath, rightPath, fullPath } = findStack(path, this)

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