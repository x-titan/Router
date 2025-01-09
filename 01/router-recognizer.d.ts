import { IncomingMessage, ServerResponse } from "node:http";
import Regex from "../lib/path-to-regex/index.js";

declare type handler = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (err: Error) => void
) => void

class Route {
  method: string
  path: string
  regex: Regex
  handlers: handler[]
}

export default class Router {
  routes: Route[]

  use(...handlers: handler[]): this
  add(method: string, path: string, handler: handler): this
  find(method: string, path: string): { params: {}, handlers: handler[] }

  get(path: string, handler: handler): this
  post(path: string, handler: handler): this
  head(path: string, handler: handler): this
  delete(path: string, handler: handler): this
  query(path: string, handler: handler): this
  move(path: string, handler: handler): this
  source(path: string, handler: handler): this
}