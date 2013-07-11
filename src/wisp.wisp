(ns wisp.wisp
  "Wisp program that reads wisp code from stdin and prints
  compiled javascript code into stdout"
  (:require [fs :refer [read-file-sync write-file-sync]]
            [path :refer [basename dirname join resolve]]
            [module :refer [Module]]

            [wisp.string :refer [split join upper-case replace]]
            [wisp.sequence :refer [first second last count reduce
                                   conj partition]]

            [wisp.repl :refer [start]]
            [wisp.engine.node]
            [wisp.runtime :refer [str subs =]]
            [wisp.compiler :refer [compile]]))


(defn flag?
  [param]
  (identical? "--" (subs param 0 2)))

;; Just mungle all the `--param value` pairs into global *env* hash.
(set! global.*env*
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


(defn timeout-stdio
  [task]
  (setTimeout (fn []
                (if (identical? process.stdin.bytes-read 0)
                  (do
                    (.removeAllListeners process.stdin :data)
                    (.removeAllListeners process.stdin :end)
                    (task))))
              20))

(defn compile-stdio
  "Attach the appropriate listeners to compile scripts incoming
  over stdin, and write them back to stdout."
  []
  (let [stdin process.stdin
        stdout process.stdout
        source ""]
    (.resume stdin)
    (.setEncoding stdin :utf8)
    (.on stdin :data #(set! source (str source %)))
    (.on stdin :end (fn []
                      (let [output (compile source)]
                        (if (:error output)
                          (throw (:error output))
                          (.write stdout (:code output))))))))

(defn stdio-or-repl
  []
  (compile-stdio)
  (timeout-stdio start))

(defn compile-file
  [path options]
  (let [source (read-file-sync path {:encoding :utf-8})
        output (compile source (conj {:source-uri path} options))]
    (write-file-sync (:output-uri output) (:code output))
    (if (:source-map-uri output)
      (write-file-sync (:source-map-uri output)
                       (:source-map output)))))

(defn run
  [path]
  ;; Loading module as main one, same way as nodejs does it:
  ;; https://github.com/joyent/node/blob/master/lib/module.js#L489-493
  (Module._load (resolve path) null true))

(defn main
  []
  (cond (< (count process.argv) 3) (stdio-or-repl)
        (and (= (count process.argv) 3)
             (not (flag? (last process.argv)))) (run (last process.argv))
        (:compile *env*) (compile-file (:compile *env*) *env*)
        (:repl *env*) (repl)
        (:stdio *env*) (compile-stdio)))