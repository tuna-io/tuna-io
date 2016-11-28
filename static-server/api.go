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

// API endpoints use httprouter syntax to define parameters
func (s *Server) DefineEndpoints() {
	// check basic info about server
	s.Endpoint("version", API_GET|API_POST, VersionEndpoint)
	s.Endpoint("isalive", API_GET, routes.IsAlive)

	// handle upload of local video and youtube video
	s.Endpoint("videos", API_POST, routes.CreateVideo)
	s.Endpoint("videos/youtube", API_POST, routes.DownloadVideo)	

	// get desired videos
	s.Endpoint("videos/latest", API_GET, routes.GetLatestVideos)
	s.Endpoint("videos/get/:hash", API_GET, routes.GetVideo)

	// get information about one video
	s.Endpoint("videos/metadata/:url", API_GET, routes.GetVideoMetadata)
	s.Endpoint("videos/search/:hash/:query", API_GET, routes.SearchVideo)

	// sign aws upload link
	s.Endpoint("s3", API_POST, routes.SignVideo)

	// support user information
	s.Endpoint("users/login", API_POST, routes.LoginUser)
	s.Endpoint("users/logout", API_GET, routes.LogoutUser)
	s.Endpoint("users/register", API_POST, routes.RegisterUser)
	s.Endpoint("users/authenticate", API_GET, routes.AuthenticateUser)
}

// set server version
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
