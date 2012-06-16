# yyyy
(console.log "starting tests..")
(var square
  (function (n)
    (* n n)))
(console.log (square 10))
(try   #ppppppppp pp
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
(if (object? "ss")
  (console.log "This is an ob1")
  (console.log "Not an obj"))
(if (array? console)
  (console.log "This is an array")
  (console.log "Not an array"))
(macro square (x)
  (* ~x ~x))
(console.log (square 10))
(var i 2)
(console.log (square i++))
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

(var title "TITLE")
(console.log
  (str
    "<!DOCTYPE html>\n"
    "<html>\n"
    "<head>\n"
    "  <title>" title "</title>\n"     
    "</head>\n"
    "<body>\n"
      "Hello World\n"
    "</body>\n"
    "</html>\n"))
    
(include "test1.ls")

