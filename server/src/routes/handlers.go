package routes

import (
  "net/http"
  "github.com/gorilla/mux"
  "fmt"
  "db"
  "github.com/gorilla/schema"
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

func CreateVideo(w http.ResponseWriter, req *http.Request) {
  err := req.ParseForm()
  video := new(videos.Video)
  decoder := schema.NewDecoder()
  err = decoder.Decode(video, req.Form)
  if err != nil {
    panic(err)
  }

  videos.CreateVideo(*video)
  // TODO: write reply instead of generic text (e.g. 200 OK)
  w.Write([]byte("Creating Video"))
}

func GetVideo(w http.ResponseWriter, req *http.Request) {
  id := mux.Vars(req)["id"]
  fmt.Fprintln(w, "showing post", id)
}
