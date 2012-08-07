;; A very simple REPL written in LispyScript

(require "./node")
(def repl (require "repl"))
(def vm (require "vm"))
(def ls (require "../lib/ls"))

(defn dictionary []
  (loop [key-values (.call Array.prototype.slice arguments)
         result {}]
    (if (.-length key-values)
      (do
        (set! (get result (get key-values 0))
              (get key-values 1))
        (recur (.slice key-values 2) result))
      result)))

(defn evaluate [code context file callback]
  (try
    (callback
     null
     (.run-in-this-context
      vm
      ;; Strip out first and last chars since node repl module
      ;; wraps code passed to eval function '()'.
      (._compile ls (.substring code 1 (- (.-length code) 2)) file)
      file))
    (catch Error error (callback error))))

(defn start
  "Starts lispyscipt repl"
  []
  (.log console (str "LispyScript REPL v" ls.version))
  (.start repl (dictionary
                :prompt "lispy> "
                :ignoreUndefined true
                :useGlobal true
                :eval evaluate
                )))

(set! exports.start start)
