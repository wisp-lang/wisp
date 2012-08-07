;; The lispy command script

(require "./node")
(def fs (require "fs"))
(def path (require "path"))
(def ls (require "../lib/ls"))
(def repl (require "./repl"))
(def Module (get (require "module") "Module"))

(defn exit
  "Takes care of exiting node and printing erros if encounted"
  [error]
  (if error
    (do
      (.log console error)
      (.exit process 1))
    (.exit process 0)))

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
               (.start repl))))
         20))

      (if (= process.argv.length 3)
        ;; Loading module as main one, same way as nodejs does it:
        ;; https://github.com/joyent/node/blob/master/lib/module.js#L489-493
        (Module._load (.resolve path (get process.argv 2)) null true)
        (compile
         (.create-read-stream fs (get process.argv 2))
         (if (= (get process.argv 3) "-")
         process.stdout
         (.create-write-stream fs (get process.argv 3)))
         (.resolve path (get process.argv 2)))))))
