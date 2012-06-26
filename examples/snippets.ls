;; Some example code snippets

(var square
  (function (n)
    (* n n)))
(console.log (square 10))

(try  
  (console.log "In try")
  (throw "In catch")
  (function (err)
    (console.log err)))

(if (undefined? window)
  (console.log "Not Running on browser")
  (console.log "Running on browser"))
  
(var arr [1, 2, 3, 4, 5])
(console.log (get 2 arr))

(if (!= 1 2)
  (console.log "Nos are not equal"))
  
(if (object? console)
  (console.log "console is an object")
  (console.log "console is not an object"))
  
(if (array? console)
  (console.log "console is an array")
  (console.log "console is not an array"))

;; The example below shows the dangers of using a macro  
(macro square (x)
  (* ~x ~x))
(console.log (square 10))
;; The code above works fine. Now consider the code below
(var i 2)
(console.log (square i++))
;; Oops you got 6! An embarrassing square of a no. Thats because the macro
;; expanded to (* i++ i++) which is multiplying 2 and three!

(var _ (require 'underscore'))
(Array.prototype.forEach.call [1, 2, 3] (function (elem i list) (console.log elem)))

(macro let (args vals rest...)
  ((function ~args ~rest...) ~@vals))
  
(let (name email tel) ("John" "john@example.com" "555-555-5556")
  (console.log name) (console.log email))

(do
  (console.log "testing do")
  (console.log "test again"))

(console.log (str "Hello1" " world1"))

(var link
  (template (data)
    "<li><a href=" (.href data) ">" (.text data) "</a></li>\n"))

(var page 
  (template (title links)

"<!DOCTYPE html>
<html>
<head>
  <title>" title "</title>
</head>
<body>
<ul class='nav'>"

(reduce links (function (memo elem) (+ memo (link elem))) "")

"</ul>
</body>
</html>"))

(console.log 
  (page "My Home Page" 
    [{href:"/about", text:"About"},
     {href:"/products", text:"Products"},
     {href:"/contact", text:"Contact"}]))

