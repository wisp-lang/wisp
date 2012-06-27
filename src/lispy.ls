;; The lispy command script

(var fs (require "fs"))
(var ls (require "./ls"))
(var repl (require "./repl"))

(var exit
  (function (error)
    (if error
      (do
        (console.log error)
        (process.exit 1))
      (process.exit 0))))

(var compileFiles
  (function (input output)
    (compile
      (fs.createReadStream input)
      (fs.createWriteStream output))))

(var compile
  (function (input output uri)
    (var source "")
    ;; Accumulate text form input until it ends.
    (input.on "data"
      (function (chunck)
        (set source (+ source (chunck.toString)))))
    ;; Once input ends try to compile & write to output.
    (input.on "end"
      (function ()
        (var jscode
             (try
              (output.write (ls._compile source uri))
              exit))))

    (input.on "error" exit)
    (output.on "error" exit)))

(set exports.run
  (function ()
    (if (= process.argv.length 2)
      (do
        (process.stdin.resume)
        (process.stdin.setEncoding "utf8")
        (compile process.stdin process.stdout)
        (setTimeout
          (function ()
            (if (= process.stdin.bytesRead 0)
              (do
                (process.stdin.removeAllListeners "data")
                (repl.runrepl)))) 20))

      (if (= process.argv.length 3)
        (do
          (var i (get 2 process.argv))
          (var o (i.replace ".ls" ".js"))
          (if (= i o)
            (console.log "Input file must have extension '.ls'")
            (compileFiles i o)))
        (compileFiles (get 2 process.argv) (get 3 process.argv))))))
