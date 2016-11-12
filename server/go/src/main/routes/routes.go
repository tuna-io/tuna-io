package routes

import (
  "net/http"
)

func IsAlive(w http.ResponseWriter, req *http.Request) {
  w.Write([]byte("I'm Alive"))
}

func main() {
}
