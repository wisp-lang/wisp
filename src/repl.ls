(var readline (require "readline"))
(var ls (require (+ __dirname "/ls")))

(var handleLine
  (function (line)
    (console.log line)))
    
(var handleClose
  (function ()
    (console.log "Bye!")
    (process.exit 0)))

(set exports.runrepl
  (function ()
    (var rl (readline.createInterface process.stdin process.stdout))
    (rl.on 'line' handleLine)
    (rl.on 'close' handleClose)
    (var prefix "lispy> ")
    (console.log (+ (+ prefix 'LispyScript REPL v') ls.version))
    (rl.setPrompt prefix prefix.length)
    (rl.prompt)))

