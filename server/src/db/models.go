package db

import (
  "io"
  "fmt"
  "time"
  "strings"
  // "strconv"
  "crypto/md5"
  "encoding/json"
  "github.com/garyburd/redigo/redis"
  "github.com/mediawen/watson-go-sdk"
)

/*-------------------------------------
 *          ERROR HANDLER
 *------------------------------------*/

func HandleError(err error) {
  if err != nil {
    panic(err)
  }
}


/*-------------------------------------
 *      VIDEO MODEL STRUCTURE
 *------------------------------------*/

type Video struct {
  Title       string      `json:"title"`
  Url         string      `json:"url"`
  Hash        string      `json:"hash"`
  Creator     string      `json:"creator"`
  Extension   string      `json:"extension"`
  Description string      `json:"description"`
  Timestamp   time.Time   `json:"timestamp"`
  Private     bool        `json:"private"`
  Views       int         `json:"views"`
  Likes       []string    `json:"likes"`
  Dislikes    []string    `json:"dislikes"`
  Comments    []int       `json:"comments"`
  Transcript  Transcript  `json:"transcript"`
  Thumbnail   Thumbnail   `json:"thumbnail"`
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

type Thumbnail struct {
  DataUrl     string     `json:"DataUrl"`
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
  conn.Send("HSET", "video:" + v.Hash, "description", v.Description)
  conn.Send("HSET", "video:" + v.Hash, "extension", v.Extension)
  conn.Send("HSET", "video:" + v.Hash, "views", 0)
  conn.Send("SADD", "video_likes:" + v.Hash, "")
  conn.Send("SADD", "video_dislikes:" + v.Hash, "")
  conn.Send("SADD", "video_comments:" + v.Hash, "")

  reply, err := redis.Values(conn.Do("EXEC"))

  rep, _ := json.Marshal(reply)
  
  return string(rep), err
}

func GetVideo(hash string) (string, error) {
  conn := Pool.Get()
  defer conn.Close()

  _, err := conn.Do("HINCRBY", "video:" + hash, "views", 1)
  HandleError(err)

  // each returns type []string, redis cannot bulk convert
  // bulk would return a slice of interfaces (type: []interface{})
  // => nightmare conversion
  likes, err := redis.Strings(conn.Do("SMEMBERS", "video_likes:" + hash))
  HandleError(err)
  dislikes, err := redis.Strings(conn.Do("SMEMBERS", "video_dislikes:" + hash))
  HandleError(err)
  comments, err := redis.Strings(conn.Do("SMEMBERS", "video_comments:" + hash))
  HandleError(err)

  reply, err := redis.StringMap(conn.Do("HGETALL", "video:" + hash))

  // type []string must be type asserted to type string
  // in order to be inserted into type map[string]string
  reply["likes"] = strings.Join(likes[:], ",")
  reply["dislikes"] = strings.Join(dislikes[:], ",")
  reply["comments"] = strings.Join(comments[:], ",")
  // reply["transcript"], _ = strconv.Unquote(reply["transcript"])

  rep, err := json.Marshal(reply)

  return string(rep), err
}

func GetVideoTranscript(hash string) (watson.Text, error) {
  conn := Pool.Get()
  defer conn.Close()

  transcriptBytes, err := redis.Bytes(conn.Do("HGET", "video:" + hash, "transcript"))
  HandleError(err)

  var transcript watson.Text
  err = json.Unmarshal(transcriptBytes, &transcript)
  HandleError(err)

  return transcript, err
}

func AddTranscript(hash string, transcript *watson.Text) (string, error) {
  conn := Pool.Get()
  defer conn.Close()
  t, _ := json.Marshal(transcript)

  reply, err := redis.StringMap(conn.Do("HSET", "video:" + hash, "transcript", t))
  HandleError(err)

  rep, err := json.Marshal(reply)

  return string(rep), err
}

func UpdateTranscript(hash string, transcript *Transcript) {
  conn := Pool.Get()
  defer conn.Close()
  t, _ := json.Marshal(transcript)

  _, _ = redis.StringMap(conn.Do("HSET", "video:" + hash, "transcript", t))
}

func UpdateThumbnail(hash string, thumbnail *Thumbnail) {
  conn := Pool.Get()
  defer conn.Close()
  t, _ := json.Marshal(thumbnail)

  _, _ = redis.StringMap(conn.Do("HSET", "video:" + hash, "thumbnail", t))
}

func GetLatestVideos() (string, error) {
  conn := Pool.Get()
  defer conn.Close()

  // Get all the video-specific keys within the array.
  keys, err := redis.Strings(conn.Do("KEYS", "video:*"))
  HandleError(err)

  // Create an array of map of string => string to store video hash information
  var resultData []map[string]string

  for _, key := range keys {
    // Get all key-value pairs within a hash and store as a map of string => string
    keyValueMap, err := redis.StringMap(conn.Do("HGETALL", key))
    HandleError(err)

    resultData = append(resultData, keyValueMap)
  }

  // TODO sort by latest results eventually: https://golang.org/pkg/sort/

  // Marshal the results array and cast to string before sending back
  results, err := json.Marshal(resultData) 

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

func CheckUserCredentials(username string, password string) (bool, error) {
  conn := Pool.Get()
  defer conn.Close()

  h := md5.New()
  io.WriteString(h, password)
  digest := fmt.Sprintf("%x", h.Sum(nil))

  reply, err := redis.String(conn.Do("HGET", "user:" + username, "password"))

  if reply == digest {
    return true, err
  } 

  return false, err
}
