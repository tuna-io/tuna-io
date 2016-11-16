package videos

import (
  "time"
  "github.com/garyburd/redigo/redis"
  "encoding/json"
  "fmt"
)

type Video struct {
  Title     string    `json:"title"`
  Url       string    `json:"url"`
  Hash      string    `json:"hash"`
  Author_id int       `json:"author_id"`
  Timestamp time.Time `json:"timestamp"`
  Private   bool      `json:"private"`
  Likes     []int     `json:"likes"`
  Dislikes  []int     `json:"dislikes"`
}

type Videos []Video

var Pool = newPool()

func newPool() *redis.Pool {
  return &redis.Pool{
    MaxIdle: 80, 
    MaxActive: 12000,
    Dial: func() (redis.Conn, error) {
      return redis.Dial("tcp", ":6379")
    },
  }
}

func HandleError(err error) {
  if err != nil {
    panic(err)
  }
}

func CreateVideo(v Video) (string, error) {
  conn := Pool.Get()
  defer conn.Close()

  var init []int

  v.Timestamp = time.Now()
  v.Likes = init
  v.Dislikes = init

  b, err := json.Marshal(v)
  HandleError(err)

  // TODO: when CDN links are defined, set video's key
  // as the hash identifier rather than entire url
  reply, err := redis.String(conn.Do("SET", "video:" + v.Url, b))

  return reply, err
}

func GetVideo(url string) (string, error) {
  conn := Pool.Get()
  defer conn.Close()

  reply, err := redis.String(conn.Do("GET", "video:" + url))

  return reply, err
}

func GetLatestVideos() (string, error) {
  conn := Pool.Get()
  defer conn.Close()

  // Get all the video-specific keys within the array.
  keys, err := redis.Strings(conn.Do("KEYS", "video:*"))
  if err != nil {
    fmt.Println("Error getting all the video keys:", err)
  }

  // Create an array of map of string => string to store video hash information
  var resultData []map[string]string

  for _, key := range keys {
    // Get all key-value pairs within a hash and store as a map of string => string
    keyValueMap, err := redis.StringMap(conn.Do("HGETALL", key))
    if err != nil {
      fmt.Println("Error getting hash information for", key, err)
    }

    resultData = append(resultData, keyValueMap)
  }

  // TODO sort by latest results eventually: https://golang.org/pkg/sort/

  // Marshal the results array and cast to string before sending back
  results, _ := json.Marshal(resultData) 

  return string(results), err
}
