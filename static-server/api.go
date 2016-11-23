package main

import (
	"net/http"
	"encoding/json"
	log "github.com/Sirupsen/logrus"
	"github.com/julienschmidt/httprouter"
	"routes"
)

const (
	VERSION = 1
)

// Add api endpoints in here, you are allowed to use httprouter syntax to define parameters
func (s *Server) DefineEndpoints() {
	s.Endpoint("version", API_GET|API_POST, VersionEndpoint)
	s.Endpoint("isalive", API_GET, routes.IsAlive)
	s.Endpoint("videos/search/:hash/:query", API_GET, routes.SearchVideo)
	s.Endpoint("videos/latest", API_GET, routes.GetLatestVideos)
	s.Endpoint("videos/get/:hash", API_GET, routes.GetVideo)
	s.Endpoint("videos", API_POST, routes.CreateVideo)




}

func VersionEndpoint(w http.ResponseWriter, req *http.Request, _ httprouter.Params) {
	ver := struct {
		Version float64 `json:"ver"`
	}{
		VERSION,
	}
	log.Infoln(req.RemoteAddr, req.Method, "version api")
	data, _ := json.Marshal(ver)

	w.Write(data)
}

// api := r.PathPrefix("/api").Subrouter()
// // allow access for all preflighted requests
// r.Methods("OPTIONS").HandlerFunc(routes.AllowAccess)
// /*-------------------------------------
//  *     `/api/isalive` TEST ROUTE
//  *------------------------------------*/
// t := api.Path("/isalive").Subrouter()
// t.Methods("GET").HandlerFunc(routes.IsAlive)

// /*-------------------------------------
//  *      `/api/videos` SUB-ROUTER
//  *------------------------------------*/
// v := api.PathPrefix("/videos").Subrouter()
// v.Methods("GET").Path("/latest").HandlerFunc(routes.GetLatestVideos)
// v.Methods("POST").HandlerFunc(routes.CreateVideo)
// v.Methods("GET").Path("/search/{hash}/{query}").HandlerFunc(routes.SearchVideo)
// v.Methods("GET").Path("/{hash}").HandlerFunc(routes.GetVideo)

// -------------------------------------
//  *      `/api/s3` SUB-ROUTER
//  *------------------------------------
// s := api.PathPrefix("/s3").Subrouter()
// s.Methods("POST").HandlerFunc(routes.SignVideo)

// /*-------------------------------------
//  *      `/api/users` SUB-ROUTER
//  *------------------------------------*/
// u := api.PathPrefix("/users").Subrouter()
// u.Methods("POST").Path("/register").HandlerFunc(routes.RegisterUser)
// u.Methods("POST").Path("/login").HandlerFunc(routes.LoginUser)
// u.Methods("GET").Path("/logout").HandlerFunc(routes.LogoutUser)
// u.Methods("GET").Path("/authenticate").HandlerFunc(routes.AuthenticateUser)

// /*-------------------------------------
//  *      `/` STATIC FILE SERVER
//  *------------------------------------*/
// r.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("./client/build"))))

// // Start up server and error log
// log.Println("Listening at port 3000")
// log.Fatal(http.ListenAndServe(":3000", r))