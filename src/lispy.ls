;; The lispy command script

(require "./node")
(def fs (require "fs"))
(def path (require "path"))
(def ls (require "../lib/ls"))
(def repl (require "./repl"))

(defn exit
  "Takes care of exiting node and printing erros if encounted"
  [error]
  (if error
    (do
      (.log console error)
      (.exit process 1))
    (.exit process 0)))

(defn compile-files
  "Compiles input file to an output file"
  [input output]
  (compile
   (.create-read-stream fs input)
   (.create-write-stream fs output)
   (.resolve path input)))

(defn compile
  "Compiles lispy from input and writes it to output"
  [input output uri]
  (def source "")
  ;; Accumulate text form input until it ends.
  (.on input :data
       (fn [chunck]
         (set! source (str source (.to-string chunck)))))

  ;; Once input ends try to compile & write to output.
  (.on input :end
       (fn []
         (try (.write output (ls._compile source uri))
           (catch Error e (exit e)))))

  (.on input :error exit)
  (.on output :error exit))

(set! exports.run
  (fn []
    (if (= process.argv.length 2)
      (do
        (.resume process.stdin)
        (.set-encoding process.stdin :utf8)
        (compile process.stdin process.stdout (.cwd process))
        (setTimeout
         (fn ()
           (if (= process.stdin.bytes-read 0)
             (do
               (.remove-all-listeners process.stdin :data)
               (.run-repl repl))))
         20))

      (if (= process.argv.length 3)
        (let [i (get process.argv 2)
              o (.replace i ".ls" ".js")]
          (if (= i o)
            (.log console "Input file must have extension '.ls'")
            (compile-files i o)))
        (compile-files (get process.argv 2) (get process.argv 3))))))
