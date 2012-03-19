(macro nodeServer (host port rest...)
  (do
    (var http (require "http"))
    (var server
      (http.createServer 
        (function (request response)
          ~@rest...)))
    (server.listen ~port ~host)
    (console.log (str "Server running at http://" ~host ":" ~port "/"))))
  
(nodeServer "127.0.0.1" 1337
  (response.writeHead 200 {'Content-Type': 'text/plain'})
  (response.end "Hello World\n"))
  
