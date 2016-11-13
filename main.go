package main

import (
  "log"
  "net/http"
  "github.com/gorilla/mux"
  "routes"
)

func main() {
  r := mux.NewRouter().StrictSlash(true)

  /*-------------------------------------
   *         `/api` router
   *------------------------------------*/
  api := r.PathPrefix("/api").Subrouter()

  /*-------------------------------------
   *     `/api/isalive` test route
   *------------------------------------*/
  t := api.Path("/isalive").Subrouter()
  t.Methods("GET").HandlerFunc(routes.IsAlive)

  /*-------------------------------------
   *      `/api/videos` sub-router
   *------------------------------------*/
  v := api.PathPrefix("/videos").Subrouter()
  v.Methods("POST").HandlerFunc(routes.CreateVideo)
  v.Methods("GET").Path("/{id}").HandlerFunc(routes.GetVideo)

  /*-------------------------------------
   *      `/` static file server
   *------------------------------------*/
  r.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("client"))))

  // Start up server and error log
  log.Println("Listening at port 3000")
  log.Fatal(http.ListenAndServe(":3000", r))
}
