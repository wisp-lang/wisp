((.listen
  ((.createServer (require "http"))
    (function (req res)
      (res.writeHead 200 {'Content-Type': 'text/plain'})
      (res.end "Hello World\n")))) 1337 "127.0.0.1")
(console.log "Server running at http://127.0.0.1:1337/")