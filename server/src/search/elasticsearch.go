package search

import (
  "os"
  "db"
  "fmt"
  "strings"
  // "strconv"
  // "reflect"
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

// type Video struct {
//   Title       string      `json:"title"`
//   Url         string      `json:"url"`
//   Hash        string      `json:"hash"`
//   Creator     string      `json:"creator"`
//   Extension   string      `json:"extension"`
//   Description string      `json:"description"`
//   Timestamp   time.Time   `json:"timestamp"`
//   Private     bool        `json:"private"`
//   Views       int         `json:"views"`
//   Likes       []string    `json:"likes"`
//   Dislikes    []string    `json:"dislikes"`
//   Comments    []int       `json:"comments"`
//   Transcript  Transcript  `json:"transcript"`
// }

// type Videos []Video

// type Word struct {
//   Token       string    `json:"Token"`
//   Begin       float64   `json:"Begin"`
//   End         float64   `json:"End"`
//   Confidence  float64   `json:"Confidence"`
// }

// type Transcript struct {
//   Words []Word  `json:"Words"`
// }

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

func CRUDVideo(hash string) {
  v, err := db.GetVideo(hash)
  HandleError(err)
  // t, err := json.Marshal(v)
  // HandleError(err)
  cv := strings.Replace(v, "\\", "", -1)
  fmt.Println(cv)
}
