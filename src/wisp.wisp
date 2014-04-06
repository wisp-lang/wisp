(ns wisp.wisp
  "Wisp program that reads wisp code from stdin and prints
  compiled javascript code into stdout"
  (:require [fs :refer [createReadStream]]
            [path :refer [basename dirname join resolve]]
            [module :refer [Module]]

            [wisp.string :refer [split join upper-case replace]]
            [wisp.sequence :refer [first second last count reduce rest
                                   conj partition assoc drop empty?]]

            [wisp.repl :refer [start] :rename {start start-repl}]
            [wisp.engine.node]
            [wisp.runtime :refer [str subs = nil?]]
            [wisp.ast :refer [pr-str name]]
            [wisp.compiler :refer [compile]]))


(defn flag?
  [param]
  ;; HACK: Workaround for segfault #6691
  (identical? (subs param 0 2) (name :--)))

(defn flag->key
  [flag]
  (subs flag 2))

;; Just mungle all the `--param value` pairs into global *env* hash.
(defn parse-params
  [params]
  (loop [input params
         output {}]
    (if (empty? input)
      output
      (let [name (first input)
            value (second input)]
        (if (flag? name)
          (if (or (nil? value) (flag? value))
            (recur (rest input)
                   (assoc output (flag->key name) true))
            (recur (drop 2 input)
                   (assoc output (flag->key name) value)))
          (recur (rest input)
                 output))))))



(defn compile-stdin
  [options]
  (with-stream-content process.stdin
                       compile-string
                       options))

(defn compile-file
  [path options]
  (with-stream-content (createReadStream path)
                       compile-string
                       (conj {:source-uri path} options)))

(defn compile-string
  [source options]
  (let [channel (or (:print options) :code)
        output (compile source options)
        content (if (= channel :code)
                  (:code output)
                  (JSON.stringify (get output channel) 2 2))]
    (.write process.stdout (or content "nil"))
    (if (:error output) (throw (:error output)))))

(defn with-stream-content
  [input resume options]
  (let [content ""]
    (.setEncoding input "utf8")
    (.resume input)
    (.on input "data" #(set! content (str content %)))
    (.once input "end" (fn [] (resume content options)))))


(defn run
  [path]
  ;; Loading module as main one, same way as nodejs does it:
  ;; https://github.com/joyent/node/blob/master/lib/module.js#L489-493
  (Module._load (resolve path) null true))


(defn main
  []
  (let [options (parse-params (drop 2 process.argv))]
    (cond (:run options) (run (:run options))
          (not process.stdin.isTTY) (compile-stdin options)
          (< (count process.argv) 3) (start-repl)
          (and (= (count process.argv) 3)
               (not (flag? (last process.argv)))) (run (last process.argv))
          (:compile options) (compile-file (:compile options) options))))
