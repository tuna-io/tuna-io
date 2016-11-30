package search

import (
  "os"
  "fmt"
  "encoding/json"
  elastic "gopkg.in/olivere/elastic.v5"
)

const ElasticCloud string = "https://80e85ae743dc1b19dad959655738362f.us-west-1.aws.found.io:9243"

func HandleError(err error) {
  if err != nil {
    panic(err)
  }
}

type Configuration struct {
  User        string
  Pass        string
  ElasticUser string
  ElasticPass string
}

func GetKeys() (string, string) {
  file, _ := os.Open("server/src/cfg/keys.json")
  decoder := json.NewDecoder(file)
  cfg := Configuration{}
  err := decoder.Decode(&cfg)
  HandleError(err)

  return cfg.ElasticUser, cfg.ElasticPass
}

var user, pass = GetKeys()

var client, err = elastic.NewClient(
  elastic.SetURL(ElasticCloud),
  elastic.SetMaxRetries(10),
  elastic.SetSniff(false),
  elastic.SetBasicAuth(user, pass))

func GetVersion() (string) {
  esversion, err := client.ElasticsearchVersion(ElasticCloud)
  HandleError(err)

  out := fmt.Sprintf("Elasticsearch version %s", esversion)

  return out
}
