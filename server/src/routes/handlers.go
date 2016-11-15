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
)

/**
 * @api {get} /api/isalive Check if server is running
 * @apiName IsAlive
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
  video := new(videos.Video)
  decoder := schema.NewDecoder()
  err = decoder.Decode(video, req.Form)
  if err != nil {
    panic(err)
  }

  status, err := videos.CreateVideo(*video)
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

  video, err := videos.GetVideo(url)
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
* @api {post} /api/videos/convert Convert a video file to a .mp3 file
* @apiName ConvertVideo
* @apiGroup Videos
*
* @apiParam {String} url Link to CDN URL where video is stored
*
* @apiSuccessExample Success-Response:
*   HTTP/1.1 200 OK
*   samplevideo1.mp3
* 
* @apiErrorExample Error-Response:
*   HTTP/1.1 404 Not Found
*   exit status 1
*/
func ConvertVideo(w http.ResponseWriter, req *http.Request) {
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
    TranscribeAudio("test.wav")
    w.WriteHeader(http.StatusOK)
    fmt.Fprintf(w, string(out) + destination)
  }

  // TODO: at some future point (i.e. after we get the transcript),
  // we should delete this temporary .mp3 file (space constraints)
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
    fmt.Println("error:", err)
  }

  fmt.Println(cfg.User, cfg.Pass)
  return cfg.User, cfg.Pass
}

func TranscribeAudio(audioPath string) {
  user, pass := GetKeys()
  w := watson.New(user, pass)

  is, err := os.Open(audioPath)
  if err != nil {
    log.Fatal(err)
  }
  defer is.Close()

  tt, err := w.Recognize(is, "en-US_BroadbandModel", "wav")
  if err != nil {
    log.Fatal(err)
  }

  fmt.Println(tt)
  // for _, w := range tt.Words {
  //   // TODO return object
  //   fmt.Printf("%v\n", w)
  // }
}
