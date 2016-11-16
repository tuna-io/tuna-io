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
   *         `/api` ROUTER
   *------------------------------------*/
  api := r.PathPrefix("/api").Subrouter()

  /*-------------------------------------
   *     `/api/isalive` TEST ROUTE
   *------------------------------------*/
  t := api.Path("/isalive").Subrouter()
  t.Methods("GET").HandlerFunc(routes.IsAlive)

  /*-------------------------------------
   *      `/api/videos` SUB-ROUTER
   *------------------------------------*/
  v := api.PathPrefix("/videos").Subrouter()
  v.Methods("POST").HandlerFunc(routes.CreateVideo)
  v.Methods("POST").Path("/process").HandlerFunc(routes.ProcessVideo)
  v.Methods("GET").Path("/{hash}").HandlerFunc(routes.GetVideo)

  /*-------------------------------------
   *      `/api/s3` SUB-ROUTER
   *------------------------------------*/
  s := api.PathPrefix("/s3").Subrouter()
  s.Methods("OPTIONS").HandlerFunc(routes.AllowAccess)
  s.Methods("POST").HandlerFunc(routes.SignVideo)

  /*-------------------------------------
   *      `/` STATIC FILE SERVER
   *------------------------------------*/
  r.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("./doc/"))))

  // Start up server and error log
  log.Println("Listening at port 3000")
  log.Fatal(http.ListenAndServe(":3000", r))
}
