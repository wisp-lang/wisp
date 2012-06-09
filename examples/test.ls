
(console.log "starting tests..")
(var square
  (function (n)
    (* n n)))
(console.log (square 10))
(try
  (console.log "In try")
  (throw "In catch")
  (function (err)
    (console.log err)))
(if (object? window)
  (console.log "Running on browser")
  (console.log "Not Running on browser"))