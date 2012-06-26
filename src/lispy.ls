;; The lispy command script

(var fs (require "fs"))
(var ls (require (+ __dirname "/ls")))
(var repl (require (+ __dirname "/repl")))

(var readFileSyncOrExit
  (function (file)
    (try
      (fs.readFileSync file)
      (function (err)
        (console.log (+ "Cannot open file " file))
        (process.exit 1)))))

(var writeFileSyncOrExit
  (function (file str)
    (try
      (fs.writeFileSync file str)
      (function (err)
        (console.log (+ "Cannot write file " file))
        (process.exit 1)))))
      
(var compile 
  (function (infile outfile)
    (var source (readFileSyncOrExit infile))
    (var out
      (try
        (ls._compile source infile)
        (function (err)
          (console.log err)
          (process.exit 1))))
    (writeFileSyncOrExit outfile out)))

(set exports.run
  (function ()
    (if (= process.argv.length 2)
      (repl.runrepl)
      (if (= process.argv.length 3)
        (do
          (var i (get 2 process.argv))
          (var o (i.replace ".ls" ".js"))
          (if (= i o)
            (console.log "Input file must have extension '.ls'")
            (compile i o)))
        (compile (get 2 process.argv) (get 3 process.argv))))))
