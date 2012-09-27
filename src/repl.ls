(import repl "repl")
(import vm "vm")
(import transpile "./engine/node")

(defn evaluate [code context file callback]
  (try
    (callback null
              (.run-in-this-context
               vm
               ;; Strip out first and last chars since node repl module
               ;; wraps code passed to eval function '()'.
               (transpile (.substring code 1 (- (.-length code) 2)) file)
               file))
    (catch error (callback error))))

(defn start
  "Starts repl"
  []
  (.start repl {
          :prompt "=> "
          :ignoreUndefined true
          :useGlobal true
          :eval evaluate}))

(export start)
