import Regex from "./lib/path-to-regex/index.js";
import Router from "./router.js";

var router = Router()
var users = Router()
var logger = (req,res,next)=>{
  console.log("---middleware---")
  next()
}
router.use(logger)

router.get("/", (req, res) => {
  res.end("index page")
})

router.get("home", (req, res) => {
  res.end("home page")
})

router.get("about", (req, res) => {
  res.end("about page")
})

router.get("/:bar", users)

router.use(logger)

users.get("/",(req,res)=>{
  res.end("users page")
})

users.get("aset", (req, res) => {
  res.end("aset page")
})

users.get("aset/:id", (req, res) => {
  res.end(`aset id ${res.params.id}`)
})


var a = new Regex("/:d/:path(.*)")
console.log(a.regexp.test("/"))
console.log(a.match("/d"))

// Imitate handle

globalThis.get = function (path) {
  var requst = {
    method: "GET",
    url: path,
  }

  var response = {
    end(body) {
      console.log(`--- response end: [${body}]`)
      return body
    },
    body: "",
  }

  var final = (err) => {
    console.log(router.stack)
    console.log("err", err)
    response.end("final")
    return "final"
  }

  return router(
    requst,
    response,
    final
  )
}