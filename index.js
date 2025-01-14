import Router from "./03/router03.js"
import Simulator from "./simulator/simulator.js"

var router = new Router()
var users = new Router()
var logger = (req, res, next) => {
  console.log(req)
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
var sim = new Simulator(router)

globalThis.sim = sim