import Router from "./index.js"
import Simulator from "./simulator/index.js"

var router = Router()
var users = Router()
var log = false

var logger = (req, res, next) => {
  if (log) console.log("---middleware---", req, res)
  next()
}

router.use(logger)

router.get("/", (req, res) => {
  res.end("index page")
})

router.get("home", (req, res) => {
  res.end("home page")
})

router.get("about", (req, res, next) => {
  res.end("about page")
})

router.use("/:bar", users)

users.use(logger)

users.get("/", (req, res) => {
  res.end("users page")
})

users.get("aset", (req, res) => {
  res.end("aset page")
})

users.get("aset/:id", (req, res) => {
  res.end(`aset id ${res.params.id}`)
})

console.dir(router)
globalThis.sim = new Simulator(router)
