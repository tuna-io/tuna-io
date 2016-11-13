package videos

import (
  "time"
  "github.com/garyburd/redigo/redis"
  "encoding/json"
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
