package main

import (
  "log"
  "net/http"
  "github.com/gorilla/mux"
)

func main() {
  r := mux.NewRouter()
  
  r.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("client"))))

  log.Println("Listening at port 3000")
  http.ListenAndServe(":3000", r)
}
