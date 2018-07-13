(ns wisp.repl
  (:require [repl :as repl]
            [vm :as vm]
            [wisp.runtime :refer [subs = keys]]
            [wisp.sequence :refer [count list conj cons vec last]]
            [wisp.compiler :refer [compile read-forms analyze-forms generate]]
            [wisp.ast :refer [pr-str]]
            [base64-encode :as btoa]))

(defn evaluate-code
  "Evaluates some text from REPL input. If multiple forms are
  present, evaluates in sequence until one throws an error
  or the last form is reached. The result from the last
  evaluated form is returned. *1, *2, *3, and *e are updated
  appropriately."
  [source uri context]
  (let [source-uri (str "data:application/wisp;charset=utf-8;base64,"
                        (btoa source))
        forms (read-forms source source-uri)
        nodes (if (:forms forms) (analyze-forms (:forms forms)))
        input (if (:ast nodes)
                (try              ;; TODO: Remove this
                                  ;; Old compiler has incorrect apply.
                  (apply generate (vec (cons {:source-uri source-uri}
                                             (:ast nodes))))
                  (catch error {:error error})))
        output (if (:code input)
                 (try
                   {:value (.run-in-context vm (:code input) context uri)}
                   (catch error {:error error})))
        result (conj forms nodes input output {:error (or (:error output)
                                                          (:error input)
                                                          (:error nodes)
                                                          (:error forms))})]
    (set! context.*3 context.*2)
    (set! context.*2 context.*1)
    (set! context.*1 result)))

(def evaluate
  (let [input nil
        output nil]
    (fn evaluate [code context file callback]
      (if (not (identical? input code))
        (do
          (set! input
            (if (not (identical? (last code) "\n"))
              (subs code 0 (- (count code) 1))
              code))
          (set! output (evaluate-code input file context))
          (callback (:error output) (:value output)))
        (callback (:error output))))))

(defn start
  "Starts repl"
  []
  (let [session (.start repl
                        {:writer pr-str
                         :prompt "=> "
                         :ignoreUndefined true
                         :useGlobal false
                         :eval evaluate})
        context (.-context session)]
    ; hoist wisp builtins into the repl
    (.map ["runtime" "sequence" "string"]
          (fn [n]
            (let [f (require (str "./src/" n ".wisp"))]
              (.map (keys f)
                    (fn [k] (set! (get context k) (get f k)))))))
    (set! context.exports {})
    session))
