package main

import (
  "log"
  "net/http"
  "github.com/gorilla/mux"
  "routes"
)

func main() {
  r := mux.NewRouter().StrictSlash(true)

		// TODO: Consider if we can refactor all API routing into a single file
  // i.e. r.HandleFunc("/api", APIHandler)
  // and abstract all the API handling to another `.go` file
  r.HandleFunc("/api/isalive", routes.IsAlive)

  r.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("client"))))


  log.Println("Listening at port 3000")
  log.Fatal(http.ListenAndServe(":3000", r))
}
