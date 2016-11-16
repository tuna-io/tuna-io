package routes

import (
  "net/http"
  "github.com/gorilla/mux"
  "fmt"
  "db"
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

/**
* @api {post} /api/videos Create and store a new video
* @apiName CreateVideo
* @apiGroup Videos
*
* @apiParam {String} title Title of video
* @apiParam {String} url Link to CDN URL where video is stored
* @apiParam {String} hash Hashed path to URL (for client routing)
* @apiParam {Number} author_id Unique ID of video uploader
* @apiParam {Boolean} private True/False, whether the video is private
*
* @apiSuccessExample Success-Response:
*   HTTP/1.1 200 OK
*   OK
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

  status, err := db.CreateVideo(*video)
  w.Header().Set("Content-Type", "application/json")

  if (err != nil) {
    w.WriteHeader(http.StatusNotFound)
    fmt.Fprintln(w, err)
  } else {
    w.WriteHeader(http.StatusOK)
    fmt.Fprintln(w, status)
  }
}

/**
* @api {get} /api/videos/{url} Retrieve a stored video
* @apiName GetVideo
* @apiGroup Videos
*
* @apiParam {String} url Link to CDN URL where video is stored
*
* @apiSuccessExample Success-Response:
*   HTTP/1.1 200 OK
*   {
*     "title": "Sample Title",
*     "url": "https://amazoncdn.com/bucketname/videotitle.webm",
*     "hash": "a1b2c3d4-e5f6g7h8",
*     "author_id": 1,
*     "timestamp": "2016-11-12T17:17:19.308362547-08:00",
*     "private": true,
*     "likes": null,
*     "dislikes": null
*   }
* 
* @apiErrorExample Error-Response:
*   HTTP/1.1 404 Not Found
*   redigo: nil return
*/
func GetVideo(w http.ResponseWriter, req *http.Request) {
  url := mux.Vars(req)["url"]

  video, err := db.GetVideo(url)
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
* @api {post} /api/videos/process Processes a video and returns the transcript
* @apiName ProcessVideo
* @apiGroup Videos
*
* @apiParam {String} url Link to CDN URL where video is stored
*
* @apiSuccessExample Success-Response:
*   HTTP/1.1 200 OK
*   (truncated for brevity)
*   [
*     {word start_time end_time confidence},
*     {word start_time end_time confidence}, ...
*   ]
* 
* @apiErrorExample Error-Response:
*   HTTP/1.1 404 Not Found
*   exit status 1 (Note that this error typically means that ffmpeg has failed)
*   Watson says, "not authorized" (signifies IBM Watson authorization error)
*/
func ProcessVideo(w http.ResponseWriter, req *http.Request) {
  url := req.FormValue("url")
  applicationName := "ffmpeg"
  arg0 := "-i"
  destination := strings.Split(strings.Split(url, "/")[4], ".")[0] + ".wav"

  cmd := exec.Command(applicationName, arg0, url, destination)
  out, err := cmd.Output()

  w.Header().Set("Content-Type", "application/json")

  if err != nil {
    w.WriteHeader(http.StatusNotFound)
    fmt.Fprintf(w, err.Error())
    return
  } else {
    t := TranscribeAudio(destination)
    w.WriteHeader(http.StatusOK)
    fmt.Fprintln(w, t)
  }

  cmd = exec.Command("rm", destination)
  out, err = cmd.Output()

  if err != nil {
    fmt.Println("error deleting file", err)
  } else {
    fmt.Println("successfully deleted file", out)
  }

  // TODO: thought process error: we should not be returning the transcript
  // to client. rather, there should be a database process that writes 
  // the transcript to the database for a given video (work in db/models)
}

/*-------------------------------------
 *      AUDIO FILE TRANSCRIPTION
 *------------------------------------*/

type Configuration struct {
  User string
  Pass string
}

type Word struct {
  Token string
  Begin float64
  End float64
  Confidence float64
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

/**
* @api {POST} /api/s3 Generate a signed url for uploading to s3
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
      ?X-Amz-Algorithm=AWS4-HMAC-SHA256
      &X-Amz-Credential=NOT_FOR_OTHERS_TO_SEEus-west-1%2Fs3%2Faws4_request
      &X-Amz-Date=20161115T202301Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host
      &X-Amz-Signature=SUPER_SECRET"
    }
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

  var v = new(Vidfile)
  err := decoder.Decode(&v)

  if err != nil {
    panic(err)
  }
  // fmt.Println("got something", v, v.Filename, v.Filetype)

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

  // fmt.Println("The URL is", urlStr)
  w.Header().Set("Access-Control-Allow-Origin", "*")
  w.Header().Set("Content-Type", "application/json")
  w.Write(j)
}


/**
* @api {OPTIONS} /api/s3 Allow cross-origin requests
* @apiName AllowAccess
* @apiGroup s3
*
*
* @apiSuccessExample Success-Response:
*   HTTP/1.1 200 OK
*   {
*     "Access-Control-Allow-Origin": "*"
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE"
      "Access-Control-Allow-Headers":
      "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization"
    }
* 
* @apiErrorExample Error-Response:
*   HTTP/1.1 404 Not Found
*/
func AllowAccess(rw http.ResponseWriter, req *http.Request) {
    rw.Header().Set("Access-Control-Allow-Origin", "*")
    rw.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
    rw.Header().Set("Access-Control-Allow-Headers",
        "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
  // Stop here if its Preflighted OPTIONS request
    return
}