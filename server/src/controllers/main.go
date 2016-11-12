package main 

import (
  "github.com/garyburd/redigo/redis"
  "net/http"
)

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

func connect(res http.ResponseWriter, req *http.Request) {
  conn := Pool.Get()
  defer conn.Close()

  pong, _ := redis.Bytes(conn.Do("PING"))
  res.Write(pong)
}

func main() {
  // conn, err := redis.Dial("tcp", ":6379")
  // if err != nil {
  //   panic(err.Error())
  // }
  // defer conn.Close()

  // pong, _ := conn.Do("PING")
  // fmt.Println(pong)

  // ok, _ := conn.Do("SET", "occupation", "billybob")
  // fmt.Println(ok)

  // name, _ := redis.String(conn.Do("GET", "occupation"))
  // fmt.Println(name)

  // user1 := videoSchema.User{"John", 22}
  // encoded, _ := json.Marshal(user1)
  // conn.Do("LPUSH", "users", encoded)

  // var unencoded *videoSchema.User

  // users, _ := redis.Strings(conn.Do("LRANGE", "users", 0, -1))
  // json.Unmarshal([]byte(users[0]), &unencoded)
  // fmt.Println(unencoded.Name)
  http.HandleFunc("/", connect)
  http.ListenAndServe(":8080", nil)

}