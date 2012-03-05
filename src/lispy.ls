(var fs (require "fs"))
(var path (require "path"))
(var ls (require (+ __dirname "/ls")))

(var compile 
  (function (infile outfile)
    (var macrofile (+ (path.join __dirname "../src") "/macros.ls"))
    (var macros (fs.readFileSync macrofile))
    (var source (fs.readFileSync infile))
    (ls._compile macros)
    (fs.writeFileSync outfile (ls._compile source))))

(set this.run
  (function ()
    (if (= process.argv.length 2)
      (console.log "LispyScript repl not implemented yet!")
      (if (= process.argv.length 3)
        (do
          (var i (get 2 process.argv))
          (var o (i.replace ".ls" ".js"))
          (if (= i o)
            (console.log "Input file must have extension '.ls'")
            (compile i o)))
        (compile (get 2 process.argv) (get 3 process.argv))))))
