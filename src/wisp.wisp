(ns wisp.wisp
  "Wisp program that reads wisp code from stdin and prints
  compiled javascript code into stdout"
  (:require [fs :refer [createReadStream]]
            [path :refer [basename dirname join resolve]]
            [module :refer [Module]]

            [wisp.string :refer [split join upper-case replace]]
            [wisp.sequence :refer [first second last count reduce
                                   conj partition]]

            [wisp.repl :refer [start] :rename {start start-repl}]
            [wisp.engine.node]
            [wisp.runtime :refer [str subs =]]
            [wisp.compiler :refer [compile]]))


(defn flag?
  [param]
  (identical? "--" (subs param 0 2)))

;; Just mungle all the `--param value` pairs into global *env* hash.
(defn parse-params
  []
  (reduce (fn [env param]
            (let [name (first param)
                  value (second param)]
              (if (flag? name)
                (set! (get env (subs name 2))
                      (if (flag? value)
                        true
                        value)))
              env))
          {}
          (partition 2 1 process.argv)))



(defn compile-stdin
  [options]
  (.resume process.stdin)
  (compile-stream process.stdin options))

(defn compile-file
  [path options]
  (compile-stream (createReadStream path)
                  (conj {:source-uri path} options)))

(defn compile-stream
  [input options]
  (let [source ""]
    (.setEncoding input "utf8")
    (.on input "data" #(set! source (str source %)))
    (.once input "end" (fn [] (compile-string source options)))))

(defn compile-string
  [source options]
  (let [output (compile source options)]
    (if (:error output)
      (throw (:error output))
      (.write process.stdout (:code output)))))


(defn run
  [path]
  ;; Loading module as main one, same way as nodejs does it:
  ;; https://github.com/joyent/node/blob/master/lib/module.js#L489-493
  (Module._load (resolve path) null true))

(defn main
  []
  (let [options (parse-params)]
    (cond (not process.stdin.isTTY) (compile-stdin options)
          (< (count process.argv) 3) (start-repl)
          (and (= (count process.argv) 3)
               (not (flag? (last process.argv)))) (run (last process.argv))
          (:compile options) (compile-file (:compile options) options))))
