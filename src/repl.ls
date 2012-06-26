;; A very simple REPL written in LispyScript

(var readline (require "readline"))
(var ls (require (+ __dirname "/ls")))

(var prefix "lispy> ")

(set exports.runrepl
  (function ()
    (var rl (readline.createInterface process.stdin process.stdout))
    (rl.on 'line'
      (function (line)
        (try
          (var l (ls._compile line))
          (console.log (eval l))
          (function (err)
            (console.log err)))
        (rl.setPrompt prefix prefix.length)
        (rl.prompt)))
    (rl.on 'close'
      (function ()
        (console.log "Bye!")
        (process.exit 0)))
    (console.log (str prefix 'LispyScript REPL v' ls.version))
    (rl.setPrompt prefix prefix.length)
    (rl.prompt)))

