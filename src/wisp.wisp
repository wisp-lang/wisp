(ns wisp.wisp
  "Wisp program that reads wisp code from stdin and prints
  compiled javascript code into stdout"
  (:require [fs :refer [createReadStream]]
            [path :refer [basename dirname join resolve]]
            [module :refer [Module]]
            [commander]
            [wisp.package :refer [version]]

            [wisp.string :refer [split join upper-case replace]]
            [wisp.sequence :refer [first second last count reduce rest
                                   conj partition assoc drop empty?]]

            [wisp.repl :refer [start] :rename {start start-repl}]
            [wisp.engine.node]
            [wisp.runtime :refer [str subs = nil?]]
            [wisp.ast :refer [pr-str name]]
            [wisp.compiler :refer [compile]]))

(defn compile-stdin
  [options]
  (with-stream-content process.stdin
                       compile-string
                       (conj {} options)))
;; (conj {:source-uri options}) causes segfault for some reason

(defn compile-file
  [path options]
  (with-stream-content (createReadStream path)
                       compile-string
                       (conj {:source-uri path} options)))

(defn compile-string
  [source options]
  (let [channel (or (:print options) :code)
        output (compile source options)
        content (cond
                  (= channel :code) (:code output)
                  (= channel :expansion) (:expansion output)
                  :else (JSON.stringify (get output channel) 2 2))]
      (.write process.stdout (or content "nil"))
    (if (:error output) (throw (.-error output)))))

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

(defmacro ->
  [& operations]
  (reduce
   (fn [form operation]
     (cons (first operation)
           (cons form (rest operation))))
   (first operations)
   (rest operations)))

(defn parse-params
  [params]
  (let [options (-> commander
                    (.version version)
                    (.usage "[options] <file ...>")
                    (.option "-r, --run"
                             "compile and execute the file (same as wisp path/to/file.wisp)")
                    (.option "-c, --compile"
                             "compile given file and prints to stdout")
                    (.option "-i, --interactive"
                             "run an interactive wisp REPL (same as wisp with no params)")
                    (.option "--print <format>"
                             "use custom print output `expansion`,`forms`, `ast`, `js-ast` or (default) `code`"
                             (fn [x _] (str x))
                             "code")
                    (.option "--no-map"
                             "disable source map generation")
                    (.option "--source-uri <uri>"
                             "uri input will be associated with in source maps")
                    (.option "--output-uri <uri>"
                             "uri output will be associated with in source maps")
                    (.parse params))]
    (conj {:no-map (not (:map options))}
          options)))

(defn main
  []
  (let [options (parse-params process.argv)
        path (aget options.args 0)]
    (cond options.run (run path)
          (not process.stdin.isTTY) (compile-stdin options)
          options.interactive (start-repl)
          options.compile (compile-file path options)
          path (run path)
          :else (start-repl))))
