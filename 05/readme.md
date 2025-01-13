pseudo radix node router


```
var example = Router()
example.route("home/section1/page1")

example
->Route: "home/section1/page1"


```




```
var example = Router()
example.route("home/section1/page1")
example.route("home/section1")

example
->Route: "home/section1"
  ->Route: "page1"

```




```
var example = Router()
example.route("home/section1/page1")
example.route("home/section1")
example.route("home")

example
->Route: "home"
  ->Route: "section1"
    ->Route: "page1"

```




```
var example = Router()
example.route("home/section1/page1")
example.route("home/section1")
example.route("home/newtree2")
example.route("home/foobar3")
example.route("home")

example
->Route: "home"
  ->Route: "section1"
    ->Route: "page1"
  ->Route: "newtree2"
  ->Route: "foobar3"

```
