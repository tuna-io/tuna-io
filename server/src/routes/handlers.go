package routes

import (
  "net/http"
  "github.com/gorilla/mux"
  "fmt"
  "dbModel" 
  "videosModel"
  "github.com/gorilla/schema"
  "strings"
  "os/exec"
  "github.com/mediawen/watson-go-sdk"
  "os"
  "log"
  "encoding/json"
  "github.com/aws/aws-sdk-go/aws"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/aws/aws-sdk-go/service/s3"
  "time"
  "crypto/md5"
  "encoding/hex"
)

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
func IsAlive(w http.ResponseWriter, req *http.Request) {
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
*   HTTP/1.1 404 Not Found
*   Redigo failed to create and store the video
*/
func CreateVideo(w http.ResponseWriter, req *http.Request) {
  err := req.ParseForm()
  video := new(db.Video)
  decoder := schema.NewDecoder()
  err = decoder.Decode(video, req.Form)

  if err != nil {
    panic(err)
  }

  hasher := md5.New()
  hasher.Write([]byte(video.Url))
  hash := hex.EncodeToString(hasher.Sum(nil))
  video.Hash = hash

  fmt.Println("Generating hash for video:", hash)

  db.CreateVideo(*video)

  w.Header().Set("Content-Type", "application/json")

  t, err := ProcessVideo(video.Url, hash)

  u := Response{
    Success: "Successfully uploaded and transcribed video file",
    Hash: hash,
    Url: video.Url,
    Transcript: t,
  }

  j, err := json.Marshal(u)

  if err != nil {
    w.WriteHeader(http.StatusNotFound)
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
func GetVideo(w http.ResponseWriter, req *http.Request) {
  hash := mux.Vars(req)["hash"]

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
*   HTTP/1.1 404 Not Found
*/
func GetLatestVideos(w http.ResponseWriter, req *http.Request) {
  videos, err := videos.GetLatestVideos()
  w.Header().Set("Content-Type", "application/json")


  if (err != nil) {
    w.WriteHeader(http.StatusNotFound)
    fmt.Fprintln(w, err)
  } else {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Content-Type", "application/json")
    fmt.Fprintln(w, videos)
  }
}

func ProcessVideo(url string, hash string) (*watson.Text, error) {
  applicationName := "ffmpeg"
  arg0 := "-i"
  destination := strings.Split(strings.Split(url, "/")[4], ".")[0] + ".wav"

  cmd := exec.Command(applicationName, arg0, url, destination)
  out, err := cmd.Output()

  t := TranscribeAudio(destination)
  db.AddTranscript(hash, t)

  cmd = exec.Command("rm", destination)
  out, err = cmd.Output()

  if err != nil {
    fmt.Println("error deleting file", err)
  } else {
    fmt.Println("successfully deleted file", out)
  }

  return t, err
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
  if err != nil {
    log.Fatal(err)
  }
  defer is.Close()

  tt, err := w.Recognize(is, "en-US_BroadbandModel", "wav")
  if err != nil {
    fmt.Println("err:", err)
  }

  return tt
}


/*-------------------------------------
 *         S3 VIDEO UPLOADING
 *------------------------------------*/

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
func SignVideo(w http.ResponseWriter, r *http.Request) {

  // create new video object from given request json
  decoder := json.NewDecoder(r.Body)

  type Vidfile struct {
    Filename string `json:"filename"`
    Filetype string `json:"filetype"`
  }

  v := new(Vidfile)
  err := decoder.Decode(&v)
  if err != nil {
    panic(err)
  }

  // get presigned url to allow upload on client side
  svc := s3.New(session.New(&aws.Config{Region: aws.String("us-west-1")}))
  req, _ := svc.PutObjectRequest(&s3.PutObjectInput{
    Bucket: aws.String("invalidmemories"),
    Key:    aws.String(v.Filename),
  })

  // allow upload with url for 5min
  urlStr, err := req.Presign(5 * time.Minute)
  if err != nil {
    fmt.Println("Failed to sign r", err)
  }
  
  j, err := json.Marshal(urlStr)
  if err != nil {
    fmt.Println("failed to convert to json", err)
  }

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
* @apiErrorExample Error-Response:
*   HTTP/1.1 404 Not Found
*/
func AllowAccess(rw http.ResponseWriter, req *http.Request) {
  rw.Header().Set("Access-Control-Allow-Origin", "*")
  rw.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
  rw.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
  
  return
}
