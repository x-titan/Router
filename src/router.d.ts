import Route from "./route.js";

type next = (err: Error) => void;

type routerhandler =
  <request, response>(
    req: request,
    res: response,
    done: next,
  ) => void;

type requesthandler =
  <request, response>(
    req: request,
    res: response,
    next: next,
  ) => void;

type errorhandler =
  <request, response>(
    err: Error,
    req: request,
    res: response,
    next: next,
  ) => void;

class routerprototype {
  handle: routerhandler

  route(path: string): Route
  mount(path: string, target: this): this

  add(method: string, path: string, ...handlers: requesthandler[]): this
  use(path: string, ...handlers: requesthandler[]): this
  use(...handlers: requesthandler[]): this

  all(path: string, ...handlers: requesthandler[]): this
  get(path: string, ...handlers: requesthandler[]): this
  post(path: string, ...handlers: requesthandler[]): this
  put(path: string, ...handlers: requesthandler[]): this
}

declare function Router() {
  return function (req, res, done) {
    // PASS
  } as routerhandler & routerprototype;
}

var a = Router()
a.a

export default Router
