package videosSchema

import "time"

type Video struct {
  Id        int       `json:"id"`
  Title     string    `json:"title"`
  Url       string    `json:"url"`
  Hash      string    `json:"hash"`
  Author_id int       `json:"author_id"`
  Timestamp time.Time `json:"timestamp"`
  Private   bool      `json:"private"`
  Likes     []int     `json:"likes"`
  Dislikes  []int     `json:"dislikes"`
}

type Videos []Video

