package routes

import (
  "db"
  "os"
  "fmt"
  "time"
  "strings"
  "os/exec"
  "net/http"
  "crypto/md5"
  "encoding/hex"
  "encoding/json"
  "github.com/gorilla/sessions"
  "github.com/aws/aws-sdk-go/aws"
  "github.com/mediawen/watson-go-sdk"
  "github.com/julienschmidt/httprouter"
  "github.com/aws/aws-sdk-go/service/s3"
  "github.com/aws/aws-sdk-go/aws/session"
)

func HandleError(err error) {
  if err != nil {
    panic(err)
  }
}

/**
 * @api {get} /api/isalive Check if server is running
 * @apiName IsAlivea
 * @apiGroup Miscellaneous
 *
 * @apiSuccessExample Success-Response:
 *   HTTP/1.1 200 OK
 *   "I'm Alive"
 * 
 * @apiErrorExample Error-Response:
 *   HTTP/1.1 404 Not Found
 *   Failed to connect to localhost port 3000: Connection refused
 */
func IsAlive(w http.ResponseWriter, req *http.Request, _ httprouter.Params) {
  w.Write([]byte("I'm Alive"))
}


/*-------------------------------------
 *          VIDEO HANDLERS
 *------------------------------------*/

type Response struct {
  Success     string        `json:"success"`
  Hash        string        `json:"hash"`
  Url         string        `json:"url"`
  Transcript  *watson.Text  `json:"transcript"`
}

/**
* @api {post} /api/videos Create, transcribe, and store a new video
* @apiName CreateVideo
* @apiGroup Videos
*
* @apiParam {String} title Title of video
* @apiParam {String} url Link to CDN URL where video is stored
* @apiParam {String} creator Username of video uploader
* @apiParam {Boolean} private True/False, whether the video is private
*
* @apiSuccessExample Success-Response:
*   HTTP/1.1 200 OK
*   (Response truncated for brevity)
*   {
*     "success": "Successfully uploaded and transcribed video file"
*     "hash": b12c8a16bbe30b9d79cbaab81a82151d"
*     "url": "https://s3-us-west-1.amazonaws.com/invalidmemories/bill_10s.mp4"
*     "transcript": "{
*       "Words":[
*         {"Token":"do","Begin":2.4,"End":2.47,"Confidence":0.09763},
*         {"Token":"you","Begin":2.47,"End":2.58,"Confidence":0.45060},
*         ...
*       ]
*     }"
*
* 
* @apiErrorExample Error-Response:
*   HTTP/1.1 500 Internal Server Error
*   Redigo failed to create and store the video
*/
func CreateVideo(w http.ResponseWriter, req *http.Request, _ httprouter.Params) {
  decoder := json.NewDecoder(req.Body)
  video := new(db.Video)
  err := decoder.Decode(&video)
  HandleError(err)
  
  hasher := md5.New()
  hasher.Write([]byte(video.Url))
  hash := hex.EncodeToString(hasher.Sum(nil))
  video.Hash = hash

  db.CreateVideo(*video)

  w.Header().Set("Content-Type", "application/json")

  t, err := ProcessVideo(video.Url, hash)
  HandleError(err)

  u := Response{
    Success: "Successfully uploaded and transcribed video file",
    Hash: hash,
    Url: video.Url,
    Transcript: t,
  }

  j, err := json.Marshal(u)
  HandleError(err)

  w.Header().Set("Access-Control-Allow-Origin", "*")
  w.Header().Set("Content-Type", "application/json")

  if err != nil {
    w.WriteHeader(http.StatusInternalServerError)
    fmt.Fprintln(w, err)
  } else {
    w.WriteHeader(http.StatusOK)
    fmt.Fprintln(w, string(j))
  }
}

/**
* @api {get} /api/videos/{hash} Retrieve a stored video
* @apiName GetVideo
* @apiGroup Videos
*
* @apiParam {String} hash Video hash
*
* @apiSuccessExample Success-Response:
*   HTTP/1.1 200 OK
*   {
*     "title": "Sample Title",
*     "url": "https://s3-us-west-1.amazonaws.com/invalidmemories/bill_10s.mp4",
*     "hash": "b12c8a16bbe30b9d79cbaab81a82151d",
*     "creator": "chris",
*     "timestamp": "2016-11-12T17:17:19.308362547-08:00",
*     "private": "1",
*     "likes": "[]",
*     "dislikes": "[]",
*     "comments": "[]"
*     "views": "0",
*     "transcript": (refer to example in `CreateVideo`)
*   }
* 
* @apiErrorExample Error-Response:
*   HTTP/1.1 404 Not Found
*   redigo: nil return
*/
func GetVideo(w http.ResponseWriter, req *http.Request, ps httprouter.Params) {
  hash := ps.ByName("hash")
  fmt.Println(ps.ByName("hash"))

  video, err := db.GetVideo(hash)
  w.Header().Set("Content-Type", "application/json")

  if (err != nil) {
    w.WriteHeader(http.StatusNotFound)
    fmt.Fprintln(w, err)
  } else {
    w.WriteHeader(http.StatusOK)
    fmt.Fprintln(w, video)
  }
}

/**
* @api {get} /api/videos/latest Get the 10 latest videos
* @apiName GetLatestVideos
* @apiGroup Videos
*
* @apiSuccessExample Success-Response:
*   HTTP/1.1 200 OK
* [
*   {
*     "comments": "[]",
*     "creator": "Bobby1",
*     "dislikes": "[]",
*     "hash": "b12c8a16bbe30b9d79cbaab81a82151d",
*     "likes": "[]",
*     "private": "0",
*     "timestamp": "2016-11-16 09:49:02.236181764 -0800 PST",
*     "title": "bill_11s.mp4",
*     "transcript": "null",
*     "url": "https://s3-us-west-1.amazonaws.com/invalidmemories/bill_10s.mp4",
*     "views": "0"
*   },
*   {
*     "comments": "[]",
*     "creator": "Bobby1",
*     "dislikes": "[]",
*     "hash": "083517446ac7100ef679c8f5004e810a",
*     "likes": "[]",
*     "private": "0",
*     "timestamp": "2016-11-16 11:56:26.509119987 -0800 PST",
*     "title": "test.mp4",
*     "transcript": "null",
*     "url": "https://s3-us-west-1.amazonaws.com/invalidmemories/test.mp4",
*     "views": "0"
*   }
* ]
* 
* @apiErrorExample Error-Response:
*   HTTP/1.1 500 Internal Server Error
*/
func GetLatestVideos(w http.ResponseWriter, req *http.Request, _ httprouter.Params) {
  videos, err := db.GetLatestVideos()

  if (err != nil) {
    w.WriteHeader(http.StatusInternalServerError)
    fmt.Fprintln(w, err)
  } else {
    w.WriteHeader(http.StatusOK)
    fmt.Fprintln(w, videos)
  }
}

func ProcessVideo(url string, hash string) (*watson.Text, error) {

  applicationName := "ffmpeg"
  arg0 := "-i"
  destination := strings.Split(strings.Split(url, "/")[4], ".")[0] + ".wav"
  cmd := exec.Command(applicationName, arg0, url, destination)
  _, err := cmd.Output()
  HandleError(err)

  t := TranscribeAudio(destination)
  db.AddTranscript(hash, t)

  cmd = exec.Command("rm", destination)
  _, err = cmd.Output()

  HandleError(err)

  return t, err
}

func GetVideoMetadata(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {

  // Note: ffmpeg and ffprobe does not support https protocol out of box
  // Note: passing in whole path seems to result in react router taking over
  // Note: executing command as single string seems to cause errors
  s := []string{"http://s3-us-west-1.amazonaws.com/invalidmemories/", ps.ByName("url")}
  video := strings.Join(s, "")
  cmd := exec.Command("ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration", "-of", "default=noprint_wrappers=1:nokey=1", video)
  out, err := cmd.Output()
  fmt.Println(out)
  HandleError(err)

  w.Header().Set("Content-Type", "application/json")
  w.WriteHeader(http.StatusOK)
  fmt.Fprintln(w, string(out))
}


/*-------------------------------------
 *      AUDIO FILE TRANSCRIPTION
 *------------------------------------*/

type Configuration struct {
  User string
  Pass string
}

type Word struct {
  Token       string
  Begin       float64
  End         float64
  Confidence  float64
}

type Text struct {
  Words []Word
}

func GetKeys() (string, string) {
  file, _ := os.Open("server/src/cfg/keys.json")
  decoder := json.NewDecoder(file)
  cfg := Configuration{}
  err := decoder.Decode(&cfg)
  HandleError(err)

  if (err != nil) {
    fmt.Println("err:", err)
  }

  fmt.Println(cfg.User, cfg.Pass)
  return cfg.User, cfg.Pass
}

func TranscribeAudio(audioPath string) (*watson.Text) {
  user, pass := GetKeys()
  w := watson.New(user, pass)

  is, err := os.Open(audioPath)
  HandleError(err)
  defer is.Close()

  tt, err := w.Recognize(is, "en-US_BroadbandModel", "wav")
  HandleError(err)

  return tt
}


/*-------------------------------------
 *         S3 VIDEO UPLOADING
 *------------------------------------*/

type Vidfile struct {
  Filename string `json:"filename"`
  Filetype string `json:"filetype"`
}

/**
* @api {post} /api/s3 Generate a signed url for uploading to s3
* @apiName SignVideo
* @apiGroup s3
*
* @apiParam {String} file name for upload
* @apiParam {String} file type
*
* @apiSuccessExample Success-Response:
*   HTTP/1.1 200 OK
*   {
*     "https://invalidmemories.s3-us-west-1.amazonaws.com/test4.mp4
*     ?X-Amz-Algorithm=AWS4-HMAC-SHA256
*     &X-Amz-Credential=NOT_FOR_OTHERS_TO_SEEus-west-1%2Fs3%2Faws4_request
*     &X-Amz-Date=20161115T202301Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host
*     &X-Amz-Signature=SUPER_SECRET"
*   }
* 
* @apiErrorExample Error-Response:
*   HTTP/1.1 403 Permission denied (check your credentials!)
*/
func SignVideo(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {

  decoder := json.NewDecoder(r.Body)

  v := new(Vidfile)
  err := decoder.Decode(&v)
  HandleError(err)

  // get presigned url to allow upload on client side
  svc := s3.New(session.New(&aws.Config{Region: aws.String("us-west-1")}))
  req, _ := svc.PutObjectRequest(&s3.PutObjectInput{
    Bucket: aws.String("invalidmemories"),
    Key:    aws.String(v.Filename),
    ACL:    aws.String("public-read"),
  })

  // allow upload with url for 5min
  urlStr, err := req.Presign(5 * time.Minute)
  HandleError(err)

  j, err := json.Marshal(urlStr)
  HandleError(err)

  w.Header().Set("Access-Control-Allow-Origin", "*")
  w.Header().Set("Content-Type", "application/json")
  w.Write(j)
}

/**
* @api {options} /api/s3 Allow cross-origin requests
* @apiName AllowAccess
* @apiGroup s3
*
*
* @apiSuccessExample Success-Response:
*   HTTP/1.1 200 OK
*   {
*     "Access-Control-Allow-Origin": "*"
*     "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE"
*     "Access-Control-Allow-Headers":
*       "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token,
*        Authorization"
*   }
*
*
* @apiErrorExample Error-Response:
*   HTTP/1.1 404 Not Found
*/
func AllowAccess(rw http.ResponseWriter, req *http.Request) {
  rw.Header().Set("Access-Control-Allow-Origin", "http://127.0.0.1")
  rw.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
  rw.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
  rw.Header().Set("Access-Control-Allow-Credentials", "true")
  
  return
}


/*-------------------------------------
 *       CLIENT AUTHENTICATION
 *------------------------------------*/

type AuthResponse struct {
  Success     bool        `json:"success"`
  Error       error       `json:"error"`
  Message     string      `json:"message"`
  Username    string      `json:"username"`
}

var store = sessions.NewCookieStore([]byte("something-very-secret"))

func init() {
  store.Options = &sessions.Options{
    MaxAge: 3600 * 24 * 30, // 30 days
  }
}

func SetSession(username string, w http.ResponseWriter, req *http.Request) {
  session, err := store.Get(req, "session-id")
  HandleError(err)
  session.Values["username"] = username
  sessions.Save(req, w)
}

/**
* @api {post} /api/users/register Register a new user
* @apiName RegisterUser
* @apiGroup Users
*
*
* @apiSuccessExample Success-Response:
*   HTTP/1.1 201 Created
*   User successfully created!
*
*
* @apiErrorExample Error-Response:
*   HTTP/1.1 200 OK
*   Username already exists!
*/
func RegisterUser(w http.ResponseWriter, req *http.Request, _ httprouter.Params) {

  type Registration struct {
    Username  string  `json:"username"`
    Email     string  `json:"email"`
    Password  string  `json:"password"`
  }

  decoder := json.NewDecoder(req.Body)
  u := new(Registration)
  err := decoder.Decode(&u)
  HandleError(err)

  r, err := db.CreateUser(u.Username, u.Email, u.Password)

  w.Header().Set("Content-Type", "application/json")

  if err != nil {
    ar := AuthResponse{
      Success: false,
      Error: err,
      Message: "Internal server error, please see error log",
      Username: "",
    }

    j, err := json.Marshal(ar)
    HandleError(err)

    w.WriteHeader(http.StatusInternalServerError)
    w.Write(j)
  } else if r[0] == int64(0) {
    ar := AuthResponse{
      Success: false,
      Error: nil,
      Message: "Username already exists!",
      Username: "",
    }

    j, err := json.Marshal(ar)
    HandleError(err)

    w.WriteHeader(http.StatusOK)
    w.Write(j)
  } else {
    ar := AuthResponse{
      Success: false,
      Error: nil,
      Message: "User successfully created!",
      Username: u.Username,
    }

    j, err := json.Marshal(ar)
    HandleError(err)

    SetSession(u.Username, w, req)
    w.WriteHeader(http.StatusCreated)
    w.Write(j)
  }
}

/**
* @api {post} /users/login Attempt to login a user with the given credentials
* @apiName LoginUser
* @apiGroup Users
*
*
* @apiSuccessExample Success-Response:
*   HTTP/1.1 200 OK
*   User successfully logged in!
*
*
* @apiErrorExample Error-Response:
*   HTTP/1.1 401 Unauthorized
*   Incorrect credentials provided!
*/
func LoginUser(w http.ResponseWriter, req *http.Request, _ httprouter.Params) {

  type Login struct {
    Username  string  `json:"username"`
    Password  string  `json:"password"`
  }

  decoder := json.NewDecoder(req.Body)
  u := new(Login)
  err := decoder.Decode(&u)
  HandleError(err)

  a, err := db.CheckUserCredentials(u.Username, u.Password)

  w.Header().Set("Content-Type", "application/json")

  if err != nil {
    ar := AuthResponse{
      Success: false,
      Error: err,
      Message: "Internal server error, please see error log",
      Username: "",
    }

    j, err := json.Marshal(ar)
    HandleError(err)

    w.WriteHeader(http.StatusInternalServerError)
    w.Write(j)
  } else if !a {
    ar := AuthResponse{
      Success: false,
      Error: nil,
      Message: "Incorrect credentials provided!",
      Username: "",
    }

    j, err := json.Marshal(ar)
    HandleError(err)

    w.WriteHeader(http.StatusUnauthorized)
    w.Write(j)
  } else {
    ar := AuthResponse{
      Success: true,
      Error: nil,
      Message: "User successfully logged in!",
      Username: u.Username,
    }

    j, err := json.Marshal(ar)
    HandleError(err)

    SetSession(u.Username, w, req)
    w.WriteHeader(http.StatusOK)
    w.Write(j)
  }
}

/**
* @api {get} /api/users/logout Clear a user's encrypted session cookies
* @apiName LogoutUser
* @apiGroup Users
*
*
* @apiSuccessExample Success-Response:
*   HTTP/1.1 200 OK
*   Cookies successfully cleared!
*
*/
func LogoutUser(w http.ResponseWriter, req *http.Request, _ httprouter.Params) {

  session, err := store.Get(req, "session-id")
  HandleError(err)
  delete(session.Values, "username")
  sessions.Save(req, w)

  w.Header().Set("Content-Type", "application/json")

  ar := AuthResponse{
    Success: true,
    Error: nil,
    Message: "User successfully logged out!",
    Username: "",
  }

  j, err := json.Marshal(ar)
  HandleError(err)

  w.WriteHeader(http.StatusOK)
  w.Write(j)
}

/**
* @api {get} /api/users/authenticate Verify a user's credentials and retrieve
*   their username from the encrypted session
* @apiName AuthenticateUser
* @apiGroup Users
*
*
* @apiSuccessExample Success-Response:
*   HTTP/1.1 200 OK
*   chris
*
* 
* @apiErrorExample Error-Response:
*   HTTP/1.1 401 Unauthorized
*   http: named cookie not present
*/
func AuthenticateUser(w http.ResponseWriter, req *http.Request, _ httprouter.Params) {
  session, err := store.Get(req, "session-id")
  HandleError(err)

  w.Header().Set("Content-Type", "application/json")

  if session.Values["username"] == nil {
    ar := AuthResponse{
      Success: false,
      Error: nil,
      Message: "Session-ID not valid!",
      Username: "",
    }

    j, err := json.Marshal(ar)
    HandleError(err)

    w.WriteHeader(http.StatusOK)
    w.Write(j)
  } else {
    ar := AuthResponse{
      Success: true,
      Error: nil,
      Message: "Session-ID successfully resolved!",
      Username: session.Values["username"].(string),
    }

    j, err := json.Marshal(ar)
    HandleError(err)

    w.WriteHeader(http.StatusOK)
    w.Write(j)
  }
}

func SearchVideo(w http.ResponseWriter, req *http.Request, ps httprouter.Params) {
  hash := ps.ByName("hash")
  query := ps.ByName("query")

  transcript, err := db.GetVideoTranscript(hash)

  HandleError(err)

  var words = transcript.Words
  var foundWords []int
  for i := 0; i < len(words); i++ {
    if words[i].Token == query {
      foundWords = append(foundWords, i)
    }
  }

  fmt.Println("foundWords", foundWords)

  w.Header().Set("Content-Type", "application/json")

  j, err := json.Marshal(foundWords)

  if err != nil {
    fmt.Println("error marshalling foundowrds", err)
    w.WriteHeader(http.StatusNotFound)
    w.Write([]byte("sad"))
  } else {
    w.WriteHeader(http.StatusOK)
    w.Write([]byte(j))
  }
}


