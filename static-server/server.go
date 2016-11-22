package main

import (
	"os"
	"time"
	"net/http"
	"io/ioutil"
	"github.com/BurntSushi/toml"
	log "github.com/Sirupsen/logrus"
	"github.com/julienschmidt/httprouter"
)

const (
	CONFIG_FILE = "config.toml"
)

func main() {
	s := &Server{}
	s.ParseConfig()
	s.Bootstrap()
}

type config struct {
	dev      bool
	static   string
	js       string
	style    string
	template string
	address  string
	api      string
	serve    string
	hmr      string
	hot      bool
}

type Server struct {
	router *httprouter.Router
	config config
}

func (s *Server) Bootstrap() {
	log.Infoln("bootstrapping server")
	router := httprouter.New()
	s.router = router

	log.Infoln("loading routes")
	s.mapRoutes()
	log.Infoln("loading endpoints")
	s.DefineEndpoints()

	log.Infoln("serving")
	if err := http.ListenAndServe(":80", s.router); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func (c *Server) ParseConfig() {
	log.Infoln("parsing config")
	cfg := struct {
		Common struct {
			Env    string
			Js     string
			Style  string
			Api    string
			Static string
			Hmr    string
			Hot    bool
		}
		Server struct {
			Template string
			Address  string
			Serve    string
		}
	}{}
	f, err := os.Open(CONFIG_FILE)
	if err != nil {
		log.Errorln("Config open", err)
		os.Exit(1)
	}

	data, err := ioutil.ReadAll(f)
	if err != nil {
		log.Errorln("Config read", err)
		os.Exit(1)
	}

	_, err = toml.Decode(string(data), &cfg)
	if err != nil {
		log.Errorln("Config parse", err)
		os.Exit(1)
	}

	var dev bool
	if cfg.Common.Env == "development" {
		dev = true
	} else if cfg.Common.Env == "production" {
		dev = false
	} else {
		log.Errorln("Invalid env", cfg.Common.Env)
		os.Exit(1)
	}

	if cfg.Common.Hot {
		if !dev {
			log.Errorln("Hot reloading isn't supported in production")
			os.Exit(1)
		}
		if cfg.Common.Hmr == "" {
			log.Errorln("Hot reloading can't be done without HMR endpoint")
			os.Exit(1)
		}
		log.Warn("Hot reloading enabled. Don't use it in production!")
	}

	c.config = config{
		dev:      dev,
		static:   cfg.Common.Static,
		serve:    cfg.Server.Serve,
		js:       cfg.Common.Js,
		style:    cfg.Common.Style,
		api:      cfg.Common.Api,
		template: cfg.Server.Template,
		address:  cfg.Server.Address,
		hmr:      cfg.Common.Hmr,
		hot:      cfg.Common.Hot,
	}
}

func init() {
	log.SetFormatter(&log.TextFormatter{
		TimestampFormat: time.RFC822,
		FullTimestamp:   true,
	})
}
