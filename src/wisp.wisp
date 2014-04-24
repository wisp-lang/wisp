(ns wisp.wisp
  "Wisp program that reads wisp code from stdin and prints
  compiled javascript code into stdout"
  (:require [fs :refer [createReadStream]]
            [path :refer [basename dirname join resolve]]
            [module :refer [Module]]
            [commander]

            [wisp.string :refer [split join upper-case replace]]
            [wisp.sequence :refer [first second last count reduce rest map
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
  (map (fn [file] (with-stream-content
                       (createReadStream file)
                       compile-string
                       (conj {:source-uri file} options))) path))

(defn compile-string
  [source options]
  (let [channel (or (:print options) :code)
        output (compile source options)
        content (if (= channel :code)
                  (:code output)
                  (JSON.stringify (get output channel) 2 2))]
    (if (:ast options) (map (fn [item]
                              (.write process.stdout
                                      (str (pr-str item.form) "\n")))
                              output.ast))
    (if (:js-ast options) (.write process.stdout
                                      (str (pr-str (:body (:js-ast output))) "\n")))
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
  (Module._load (resolve (get path 0)) null true))

(defmacro ->
  [& operations]
  (reduce
   (fn [form operation]
     (cons (first operation)
           (cons form (rest operation))))
   (first operations)
   (rest operations)))

(defn main
  []
  (let [options commander]
    (-> options
      (.usage "[options] <file ...>")
      (.option "-r, --run"           "Compile and execute the file")
      (.option "-c, --compile"       "Compile to JavaScript and save as .js files")
      (.option "-i, --interactive"   "Run an interactive wisp REPL")
      (.option "-p, --print"         "Print compiled JavaScript")
      (.option "-o, --output <dir>"  "Output to specified directory")
      (.option "--no-map"            "Disable source map generation")
      (.option "--ast"               "Print the wisp AST produced by the reader")
      (.option "--js-ast"            "Print the JavaScript AST produced by the compiler")
      (.parse process.argv))
    (set! (aget options "no-map") (aget options "noMap")) ;; commander auto translates to camelCase
    (set! (aget options "js-ast") (aget options "jsAst"))
    (cond options.run (run options.args)
          (not process.stdin.isTTY) (compile-stdin options)
          options.interactive (start-repl)
          options.compile (compile-file options.args options)
          options.args (run options.args)
          :else (start-repl)
   )))
