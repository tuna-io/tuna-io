package main

import (
	"os"
	"path"
	"net/http"
	"io/ioutil"
	"html/template"
	log "github.com/Sirupsen/logrus"
	"github.com/julienschmidt/httprouter"
)

const (
	API_GET = 1 << iota
	API_POST
	API_BOTH = 0xF
)

type defaultApp struct {
	template *template.Template
	data     map[string]interface{}
}

func (r defaultApp) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	log.Infoln(req.RemoteAddr, req.Method, req.RequestURI)
	// no file match, let client take care of routing
	if err := r.template.Execute(w, r.data); err != nil {
		log.Errorln("tpl exec", err)
		http.Error(w, err.Error(), 500)
		return
	}
}

func (s *Server) mapRoutes() {
	r := s.router

	cwd, err := os.Getwd()
	if err != nil {
		log.Fatalln(err)
	}

	staticPath := path.Join(cwd, s.config.static)
	var staticURL string
	var staticBundleURL string
	if s.config.hot {
		// create the prefix necessary to load bundles from hmr server
		staticBundleURL = s.config.hmr
		staticURL = s.config.serve
	} else {
		// ensure bundles exist if not hot reloading
		ensureBundles(s.config.js, s.config.style, staticPath)
		staticBundleURL = s.config.serve
		staticURL = s.config.serve
	}
	staticBundleURL = path.Join(staticBundleURL, s.config.static)
	staticURL = path.Join(staticURL, s.config.static)
	app := defaultApp{}
	app.data = map[string]interface{}{
		"Js":     path.Join(staticBundleURL, s.config.js),
		"Style":  path.Join(staticBundleURL, s.config.js),
		"Static": staticURL,
		"Hot":    s.config.hot,
	}

	// create the default app (the route used to serve the client app)
	// load template
	f, err := os.Open(s.config.template)
	if err != nil {
		log.Errorln("Tpl err", err)
		os.Exit(1)
	}
	defer f.Close()
	b, err := ioutil.ReadAll(f)
	if err != nil {
		log.Errorln("Tpl read err", err)
		os.Exit(1)
	}
	tpl, err := template.New("app").Parse(string(b))
	if err != nil {
		log.Errorln("Tpl parse err", err)
		os.Exit(1)
	}

	log.Warnln(app.data)
	app.template = tpl

	// httprouter fileserver
	r.ServeFiles(path.Join(base(s.config.static), "*filepath"), http.Dir(staticPath))
	// if it's not an api call then we use the app, after first checking
	// if there's a file matching the route
	r.NotFound = app
}

// Adds an api endpoint
func (s *Server) Endpoint(pattern string, opts int, h httprouter.Handle) {
	log.Debugln("adding endpoint", pattern)
	fpat := path.Join(base(s.config.api), base(pattern))
	if opts&API_GET == API_GET {
		s.router.GET(fpat, h)
	}
	if opts&API_POST == API_POST {
		s.router.POST(fpat, h)
	}
}

func ensureBundles(js, style, dir string) {
	f0, err := os.Open(path.Join(dir, js))
	if err != nil {
		log.Errorln("Js bundle", err)
		os.Exit(1)
	}
	defer f0.Close()
	f1, err := os.Open(path.Join(dir, style))
	if err != nil {
		log.Errorln("Css bundle", err)
		os.Exit(1)
	}
	defer f1.Close()
}

func base(s string) string {
	return path.Join("/", s)
}
