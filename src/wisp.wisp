(ns wisp.wisp
  "Wisp program that reads wisp code from stdin and prints
  compiled javascript code into stdout"
  (:require [fs :as fs]
            [path :as path]
            [module :refer [Module]]
            [wisp.repl :refer [start]]
            [wisp.runtime :refer [str]]
            [wisp.compiler :refer [compile*]]
            [wisp.reader :refer [read*]]))

(defn- exit
  "Takes care of exiting node and printing erros if encounted"
  [error]
  (if error
    (do
      (.error console error)
      (.exit process 1))
    (.exit process 0)))

(defn- compile
  "Compiles lispy from input and writes it to output"
  [input output uri]
  (def source "")
  (.on input :data
       (fn
         ^{:doc "Accumulate text form input until it ends."}
         on-chunck
         [chunck]
         (set! source (str source chunck))))
  (.on input :end
       (fn
         ^{:doc "Once input ends try to compile & write to output."}
         on-read []
         (try (.write output (compile* (read* source)))
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
             (start))))
       20))
    ;; Loading module as main one, same way as nodejs does it:
    ;; https://github.com/joyent/node/blob/master/lib/module.js#L489-493
    (Module._load (.resolve path (get process.argv 2)) null true)))
