package routes

import (
  "net/http"
  "github.com/gorilla/mux"
  "fmt"
  "db"
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

func UserHandler(w http.ResponseWriter, req *http.Request) {
  w.Write([]byte("Test User Endpoint"))
}

func CreateVideo(w http.ResponseWriter, req *http.Request) {
  videos.CreateVideo(videos.Video {
    Title: "Test2",
    Url: "test2",
    Hash: "test2",
    Author_id: 1,
    Private: true,
  })
  w.Write([]byte("Creating Video"))
}

func GetVideo(w http.ResponseWriter, req *http.Request) {
  id := mux.Vars(req)["id"]
  fmt.Fprintln(w, "showing post", id)
}

func main() {
}
