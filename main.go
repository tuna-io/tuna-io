package main

import (
  "log"
  "routes"
  "net/http"
  "github.com/gorilla/mux"
)

func main() {

  r := mux.NewRouter().StrictSlash(true)

  /*-------------------------------------
   *         `/api` ROUTER
   *------------------------------------*/
  api := r.PathPrefix("/api").Subrouter()
  // allow access for all preflighted requests
  r.Methods("OPTIONS").HandlerFunc(routes.AllowAccess)
  /*-------------------------------------
   *     `/api/isalive` TEST ROUTE
   *------------------------------------*/
  t := api.Path("/isalive").Subrouter()
  t.Methods("GET").HandlerFunc(routes.IsAlive)

  /*-------------------------------------
   *      `/api/videos` SUB-ROUTER
   *------------------------------------*/
  v := api.PathPrefix("/videos").Subrouter()
  v.Methods("GET").Path("/latest").HandlerFunc(routes.GetLatestVideos)
  v.Methods("POST").HandlerFunc(routes.CreateVideo)
  v.Methods("GET").Path("/search/{hash}/{query}").HandlerFunc(routes.SearchVideo)
  v.Methods("GET").Path("/{hash}").HandlerFunc(routes.GetVideo)

  /*-------------------------------------
   *      `/api/s3` SUB-ROUTER
   *------------------------------------*/
  s := api.PathPrefix("/s3").Subrouter()
  s.Methods("POST").HandlerFunc(routes.SignVideo)

  /*-------------------------------------
   *      `/api/users` SUB-ROUTER
   *------------------------------------*/
  u := api.PathPrefix("/users").Subrouter()
  u.Methods("POST").Path("/register").HandlerFunc(routes.RegisterUser)
  u.Methods("POST").Path("/login").HandlerFunc(routes.LoginUser)
  u.Methods("GET").Path("/logout").HandlerFunc(routes.LogoutUser)
  u.Methods("GET").Path("/authenticate").HandlerFunc(routes.AuthenticateUser)

  /*-------------------------------------
   *      `/` STATIC FILE SERVER
   *------------------------------------*/
  r.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("./client/build"))))

  // Start up server and error log
  log.Println("Listening at port 3000")
  log.Fatal(http.ListenAndServe(":3000", r))
}
