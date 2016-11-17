package db

import (
  "time"
  "github.com/garyburd/redigo/redis"
  "encoding/json"
  "github.com/mediawen/watson-go-sdk"
  "fmt"
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
  Token       string    `json:"token"`
  Begin       float64   `json:"begin"`
  End         float64   `json:"end"`
  Confidence  float64   `json:"confidence"`
}

type Transcript struct {
  Words []Word  `json:"words"`
}

/*-------------------------------------
 *      USER MODEL STRUCTURE
 *------------------------------------*/

type User struct {
  Username        string     `json:"username"`
  Password        string     `json:"password"`
  Email           string     `json:"email"`
  Videos          []string   `json:"videos"`
  Subscriptions   []string   `json:"subscriptions"`
  LikedVideos     []string   `json:"liked_videos"`
  Timestamp       time.Time  `json:"timestamp"`
}

type Users []User

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

  t, _ := json.Marshal(transcript)

  reply, err := redis.StringMap(conn.Do("HSET", "video:" + hash, "transcript", t))

  rep, _ := json.Marshal(reply)

  return string(rep), err
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


/*-------------------------------------
 *        USER DB CONTROLLERS
 *------------------------------------*/

func CreateUser(username string, email string, password string) ([]interface{}, error) {
  conn := Pool.Get()
  defer conn.Close()

  h := md5.New()
  io.WriteString(h, password)
  digest := fmt.Sprintf("%x", h.Sum(nil))
  fmt.Println(digest)

  conn.Send("MULTI")
  conn.Send("HSETNX", "user:" + username, "username", username)
  conn.Send("HSETNX", "user:" + username, "email", email)
  conn.Send("HSETNX", "user:" + username, "password", digest)
  conn.Send("HSETNX", "user:" + username, "videos", []string{})
  conn.Send("HSETNX", "user:" + username, "subscriptions", []string{})
  conn.Send("HSETNX", "user:" + username, "liked_videos", []string{})
  conn.Send("HSETNX", "user:" + username, "timestamp", time.Now())

  reply, err := redis.Values(conn.Do("EXEC"))

  return reply, err
}

// For testing purposes only
func RetrieveUser(username string) (map[string]string, error) {
  conn := Pool.Get()
  defer conn.Close()

  reply, err := redis.StringMap(conn.Do("HGETALL", "user:" + username))

  // rep, _ := json.Marshal(reply)

  return reply, err
}
