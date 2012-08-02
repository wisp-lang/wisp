;; A very simple REPL written in LispyScript

(require "./node")
(def readline (require "readline"))
(def ls (require "../lib/ls"))

(def prefix "lispy> ")

(defn run-repl
  "Starts lispyscipt repl"
  []
  (def rl
    (.create-interface readline process.stdin process.stdout))

  (.on rl :line
       (fn [line]
         (try
           (.log console (eval (ls._compile line)))
           (catch Error error (.error console error)))

         (.set-prompt rl prefix prefix.length)
         (.prompt rl)))

  (.on rl :close
       (fn []
        (.log console "Bye!")
        (.exit process 0)))

  (.log console (str prefix "LispyScript REPL v" ls.version))
  (.set-prompt rl prefix prefix.length)
  (.prompt rl))

(set! exports.run-repl run-repl)
