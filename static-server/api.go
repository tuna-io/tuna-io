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

	s.Endpoint("s3", API_POST, routes.SignVideo)

	s.Endpoint("users/register", API_POST, routes.RegisterUser)
	s.Endpoint("users/login", API_POST, routes.LoginUser)
	s.Endpoint("users/logout", API_GET, routes.LogoutUser)
	s.Endpoint("users/authenticate", API_GET, routes.AuthenticateUser)
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
