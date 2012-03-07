(var ls (require (+ __dirname "/ls")))

(set this.run
  (function ()
    (console.log (+ "LispyScript REPL v" ls.version))
    (loop () ()
      (console.log "> "))))

