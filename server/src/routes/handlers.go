package routes

import (
  "net/http"
  "github.com/gorilla/mux"
  "fmt"
  "db"
  "github.com/gorilla/schema"
  "strings"
  "os/exec"
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
*     "title": "44413",
*     "url": "new",
*     "hash": "testhash",
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

func ConvertVideo(w http.ResponseWriter, req *http.Request) {
  url := req.FormValue("url")
  applicationName := "ffmpeg"
  arg0 := "-i"
  fmt.Println(url)
  destination := strings.Split(url, ".")[0] + ".mp3"

  fmt.Println(applicationName, arg0, url, destination)

  cmd := exec.Command(applicationName, arg0, url, "test.mp3")
  out, err := cmd.Output()

  w.Header().Set("Content-Type", "application/json")

  if err != nil {
    w.WriteHeader(http.StatusNotFound)
    fmt.Fprintf(w, err.Error())
  } else {
    w.WriteHeader(http.StatusOK)
    fmt.Fprintf(w, string(out) + destination)
  }
}
