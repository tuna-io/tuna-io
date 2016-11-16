package db

import (
  "time"
  "github.com/garyburd/redigo/redis"
  "encoding/json"
  "fmt"
  "github.com/mediawen/watson-go-sdk"
)

/*-------------------------------------
 *      VIDEO MODEL STRUCTURE
 *------------------------------------*/

type Video struct {
  Title       string      `json:"title"`
  Url         string      `json:"url"`
  Hash        string      `json:"hash"`
  Creator     string      `json:"creator"`
  Timestamp   time.Time   `json:"timestamp"`
  Private     bool        `json:"private"`
  Views       int         `json:"views"`
  Likes       []string    `json:"likes"`
  Dislikes    []string    `json:"dislikes"`
  Comments    []int       `json:"comments"`
  Transcript  Transcript  `json:"transcript"`
}

type Videos []Video

type Word struct {
  Token string
  Begin float64
  End float64
  Confidence float64
}

type Transcript struct {
  Words []Word
}

/*-------------------------------------
 *     REDIGO POOL INSTANTIATION
 *------------------------------------*/

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

/*-------------------------------------
 *        VIDEO DB CONTROLLERS
 *------------------------------------*/

func CreateVideo(v Video) (string, error) {
  conn := Pool.Get()
  defer conn.Close()

  v.Timestamp = time.Now()

  // b, err := json.Marshal(v)
  // HandleError(err)

  // TODO: when CDN links are defined, set video's key
  // as the hash identifier rather than entire url
  conn.Send("MULTI")
  conn.Send("HSET", "video:" + v.Hash, "title", v.Title)
  conn.Send("HSET", "video:" + v.Hash, "url", v.Url)
  conn.Send("HSET", "video:" + v.Hash, "hash", v.Hash)
  conn.Send("HSET", "video:" + v.Hash, "creator", v.Creator)
  conn.Send("HSET", "video:" + v.Hash, "timestamp", v.Timestamp)
  conn.Send("HSET", "video:" + v.Hash, "private", v.Private)
  conn.Send("HSET", "video:" + v.Hash, "views", 0)
  conn.Send("HSET", "video:" + v.Hash, "likes", []string{})
  conn.Send("HSET", "video:" + v.Hash, "dislikes", []string{})
  conn.Send("HSET", "video:" + v.Hash, "comments", []int{})

  reply, err := redis.Values(conn.Do("EXEC"))

  rep, _ := json.Marshal(reply)

  return string(rep), err
}

func GetVideo(hash string) (string, error) {
  conn := Pool.Get()
  defer conn.Close()

  reply, err := redis.StringMap(conn.Do("HGETALL", "video:" + hash))

  rep, _ := json.Marshal(reply)

  return string(rep), err
}

func AddTranscript(hash string, transcript *watson.Text) (string, error) {
  conn := Pool.Get()
  defer conn.Close()

  // do something with transcript

  reply, err := redis.StringMap(conn.Do("HSET", "video:" + hash, "transcript", transcript))

  rep, _ := json.Marshal(reply)

  return string(rep), err
}

func main() {
  conn := Pool.Get()
  defer conn.Close()

  reply, err := redis.String(conn.Do("TYPE", "video:http://www.mp4point.com/downloads/dc97d920c931.mp4"))
  // reply, err := redis.String(conn.Do("HSET", "video:http://www.mp4point.com/downloads/dc97d920c931.mp4", "title", "HELL YES"))

  fmt.Println("reply", reply)
  fmt.Println("err:", err)
}
