package search

import (
  "os"
  "db"
  "fmt"
  "context"
  "encoding/json"
  elastic "gopkg.in/olivere/elastic.v5"
)


/*-------------------------------------
 *       CONFIGURATION CONSTANTS
 *------------------------------------*/

const ElasticCloud string = "https://80e85ae743dc1b19dad959655738362f.us-west-1.aws.found.io:9243"


/*-------------------------------------
 *        GLOBAL FUNCTIONALITY
 *------------------------------------*/
func HandleError(err error) {
  if err != nil {
    panic(err)
  }
}


/*-------------------------------------
 *       STRUCTS (FOR DECODING)
 *------------------------------------*/
type Configuration struct {
  User        string
  Pass        string
  ElasticUser string
  ElasticPass string
}

// NOTE: tech debt, it appears data is all of type `string` when retrieved
// ...Timestamp, Private, Views, Likes, Dislikes, Comments, Transcript
// ...should not be of type `string` but this is a short-term hack for
// ...data extraction.
type Video struct {
  Title         string    `json:"title"`
  Url           string    `json:"url"`
  Hash          string    `json:"hash"`
  Creator       string    `json:"creator"`
  Extension     string    `json:"extension"`
  Description   string    `json:"description"`
  Timestamp     string    `json:"timestamp"`
  Private       string    `json:"private"`
  Views         string    `json:"views"`
  Likes         string    `json:"likes"`
  Dislikes      string    `json:"dislikes"`
  Comments      string    `json:"comments"`
  Transcript    string    `json:"transcript"`
  Thumbnail     string    `json:"thumbnail"`
  SimilarVideos string    `json:"similar_videos"`
}

type Videos []Video

type Word struct {
  Token       string    `json:"Token"`
  Begin       float64   `json:"Begin"`
  End         float64   `json:"End"`
  Confidence  float64   `json:"Confidence"`
}

type Transcript struct {
  Words []Word  `json:"Words"`
}


/*-------------------------------------
 *      ELASTIC SEARCH CONNECTION
 *------------------------------------*/

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


/*-------------------------------------
 *      ELASTIC SEARCH HANDLERS
 *------------------------------------*/
func GetVersion() (string) {
  esversion, err := client.ElasticsearchVersion(ElasticCloud)
  HandleError(err)

  out := fmt.Sprintf("Elasticsearch version %s", esversion)

  return out
}

func CRUDVideo(hash string) (string) {
  v, err := db.GetVideo(hash)
  HandleError(err)

  // Decode the entire hash into a `Video` struct
  var video Video
  err = json.Unmarshal([]byte(v), &video)
  HandleError(err)

  // Decode the stringified transcript into a `Transcript` struct
  var transcript Transcript
  err = json.Unmarshal([]byte(video.Transcript), &transcript)
  HandleError(err)

  // Extract the individual tokens to minimize noise
  var result string
  var words = transcript.Words
  for i := 0; i < len(words); i++ {
    result += " " + words[i].Token
  }

  video.Transcript = result

  put, err := client.Index().
    Index("videos").
    Type("public").
    Id(hash).
    BodyJson(video).
    Do(context.Background())
  HandleError(err)


  // Flushing triggers a lucene commit, which ensures that incremental
  // ...updates occur after a document is written
  _, err = client.Flush().Index("videos").Do(context.Background())
  HandleError(err)

  out := fmt.Sprintf("Indexed metadata for video: %s to index %s, type %s\n", put.Id, put.Index, put.Type)

  return out
}

// `dfs_query_then_fetch` looks across all shards in our `elastic.co` instance
// ...(5 of them) before re-scoring all documents on query term
func SearchTranscripts(query string) ([]byte) {
  termQuery := elastic.NewTermQuery("transcript", query)
  searchResult, err := client.Search().
    Index("videos").
    Query(termQuery).
    SearchType("dfs_query_then_fetch").
    Pretty(true).
    Do(context.Background())
  HandleError(err)

  out, err := json.Marshal(searchResult)

  return out
}
