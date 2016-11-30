package search

import (
  "os"
  "db"
  "fmt"
  // "strings"
  "context"
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

// Establish an ElasticSearch client
var client, _ = elastic.NewClient(
  elastic.SetURL(ElasticCloud),
  elastic.SetMaxRetries(10),
  // Sniffing (finding nodes in the same cluster) throws an error
  // ... when connecting to `elastic.co` instance
  elastic.SetSniff(false),
  elastic.SetBasicAuth(user, pass))

func GetVersion() (string) {
  esversion, err := client.ElasticsearchVersion(ElasticCloud)
  HandleError(err)

  out := fmt.Sprintf("Elasticsearch version %s", esversion)

  return out
}

func CRUDVideo(hash string) (string) {
  // exists, err := client.IndexExists("videos").Do(context.Background())
  // HandleError(err)

  // if !exists {
  //   var createIndex, err = client.CreateIndex("videos").Do(context.Background())
  //   HandleError(err)

  //   if !createIndex.Acknowledged {
  //     fmt.Println("Index creation failed")
  //   } else {
  //     fmt.Println(createIndex.Acknowledged)
  //   }
  // }

  v, err := db.GetVideo(hash)
  HandleError(err)

  // Strings need to be cleaned of '\' before indexing them
  // cv := strings.Replace(v, "\\", "", -1)
  // fmt.Println(cv)

  put, err := client.Index().
    Index("videos").
    Type("public").
    Id(hash).
    BodyJson(v).
    Do(context.Background())
  
  if err != nil {
    fmt.Println(err)
  }

  fmt.Println(put)

  // fmt.Println(put.Id, put.Index, put.Type)
  // out := fmt.Sprintf("Indexed tweet %s to index %s, type %s\n", put.Id, put.Index, put.Type)

  return "Done"
}
