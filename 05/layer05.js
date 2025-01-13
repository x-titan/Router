export default class Layer {
  constructor(path, handle) {
    this.path = path
    this.method = undefined
    this.fn = handle
    this.route
  }

  match() { }
  handle() { }
  handleError() { }
  handleRequst() { }
}