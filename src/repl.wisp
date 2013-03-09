(import repl "repl")
(import vm "vm")
(import transpile "./engine/node")
(import [read push-back-reader] "./reader")
(import [subs =] "./runtime")
(import [count list] "./sequence")
(import [compile compile-program] "./compiler")
(import [pr-str] "./ast")

(defn evaluate-code
  "Evaluates some text from REPL input. If multiple forms are
  present, evaluates in sequence until one throws an error
  or the last form is reached. The result from the last
  evaluated form is returned. *1, *2, *3, and *e are updated
  appropriately."
  [code uri context]
  (if context.*debug* (.log console "INPUT:" (pr-str code)))
  (let [reader (push-back-reader code uri)]
    (loop [last-output nil]
      (let [output (evaluate-next-form reader context)
            error (:error output)]
        (if (not (:finished output))
          (if error
            (do (set! context.*e error)
                output)
            (recur output))
          (do (set! context.*3 context.*2)
              (set! context.*2 context.*1)
              (set! context.*1 (:value last-output))
              last-output))))))

(defn evaluate-next-form
  "Evaluates next clojure form in reader. Returns a map, containing
  either resulting value and emitted javascript, or an error
  object, or {:finished true}."
  [reader context]
  (try
    (let [uri (.-uri reader)
          form (read reader false :finished-reading)]
      (if (= form :finished-reading)
        {:finished true}
        (let [_ (if context.*debug* (.log console "READ:" (pr-str form)))
              ;env (assoc (ana/empty-env) :context :expr)
              ;body (ana/analyze env form)
              ;_ (when *debug* (println "ANALYZED:" (pr-str (:form body))))
              body form
              code (compile-program (list body))
              _ (if context.*debug* (.log console "EMITTED:" (pr-str code)))
              value (.run-in-this-context vm code uri)]
          {:value value :js code})))
    (catch error
      {:error error})))

(def evaluate
     (let [input nil
           output nil]
      (fn evaluate [code context file callback]
        (if (not (identical? input code))
          (do
            (set! input (subs code 1 (- (count code) 1)))
            (set! output (evaluate-code input file context))
            (callback (:error output) (:value output)))
          (callback (:error output))))))

(defn start
  "Starts repl"
  []
  (.start repl {
          :writer pr-str
          :prompt "=> "
          :ignoreUndefined true
          :useGlobal true
          :eval evaluate}))

(export start)
