package main

import (
	"net/http"
	"encoding/json"
	log "github.com/Sirupsen/logrus"
	"github.com/julienschmidt/httprouter"
)

const (
	VERSION = 1
)

// Add api endpoints in here, you are allowed to use httprouter syntax to define parameters
func (s *Server) DefineEndpoints() {
	s.Endpoint("version", API_GET|API_POST, VersionEndpoint)
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
