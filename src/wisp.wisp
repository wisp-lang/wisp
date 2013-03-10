(import fs "fs")
(import path "path")
(import [Module] "module")

(import repl "./repl")
(import [str] "./runtime")
(import transpile "./engine/node")
(import [compile-program] "./compiler")
(import [read-from-string] "./reader")

(defn exit
  "Takes care of exiting node and printing erros if encounted"
  [error]
  (if error
    (do
      (.error console error)
      (.exit process 1))
    (.exit process 0)))

(defn compile
  "Compiles lispy from input and writes it to output"
  [input output uri]
  (def source "")
  (.on input :data
       (fn on-chunck
         "Accumulate text form input until it ends."
         [chunck]
         (set! source (str source chunck))))
  (.on input :end
       (fn on-read
         "Once input ends try to compile & write to output."
         []
         (try (.write output (transpile source))
           (catch error (exit error)))))
  (.on input :error exit)
  (.on output :error exit))


(defn main []
  (if (< process.argv.length 3)
    (do
      (.resume process.stdin)
      (.set-encoding process.stdin :utf8)
      ;; Compile stdin and write it to stdout.
      (compile process.stdin process.stdout (.cwd process))
      ;; If there is nothing is written to stdin within 20ms
      ;; start repl.
      (set-timeout
       (fn []
         (if (identical? process.stdin.bytes-read 0)
           (do
             (.remove-all-listeners process.stdin :data)
             (repl))))
       20))
    ;; Loading module as main one, same way as nodejs does it:
    ;; https://github.com/joyent/node/blob/master/lib/module.js#L489-493
    (Module._load (.resolve path (get process.argv 2)) null true)))

(export main)
