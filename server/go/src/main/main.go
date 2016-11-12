package main

import (
  "fmt" // Formatting library
  "net/http" // HTTP request handler
  "github.com/julienschmidt/httprouter" // Third-party routing middleware
)

func main() {

  // Instantiate a new router
  r := httprouter.New()

  // `/test` GET route for testing
  r.GET("/test", func(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
    fmt.Fprint(w, "Welcome!\n")
  })

  http.ListenAndServe("localhost:3000", r)
}
