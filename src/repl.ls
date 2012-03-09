(var readline (require "readline"))
(var ls (require (+ __dirname "/ls")))

(var prefix "lispy> ")
    
(set exports.runrepl
  (function ()
    (var rl (readline.createInterface process.stdin process.stdout))
    (rl.on 'line'
      (function (line)
        (console.log line)
        (rl.setPrompt prefix prefix.length)
        (rl.prompt)))
    (rl.on 'close'
      (function ()
        (console.log "Bye!")
        (process.exit 0)))
    (console.log (+ (+ prefix 'LispyScript REPL v') ls.version))
    (rl.setPrompt prefix prefix.length)
    (rl.prompt)))

