(ns wisp.ast
  (:require [wisp.sequence :refer [list? sequential? first second count
                                   last map vec repeat]]
            [wisp.string :refer [split join]]
            [wisp.runtime :refer [nil? vector? number? string? boolean?
                                  object? date? re-pattern? dictionary?
                                  str inc subs =]]))

(defn with-meta
  "Returns identical value with given metadata associated to it."
  [value metadata]
  (.defineProperty Object value "metadata" {:value metadata :configurable true})
  value)

(defn meta
  "Returns the metadata of the given value or nil if there is no metadata."
  [value]
  (if (nil? value) nil (.-metadata value)))

(def **ns-separator** "\u2044")

(defn- Symbol
  "Type for the symbols"
  [namespace name]
  (set! (.-namespace this) namespace)
  (set! (.-name this) name)
  this)
(set! Symbol.type "wisp.symbol")
(set! Symbol.prototype.type Symbol.type)
(set! Symbol.prototype.to-string
      (fn []
        (let [prefix (str "\uFEFF" "'")
              ns (namespace this)]
          (if ns
            (str prefix ns "/" (name this))
            (str prefix (name this))))))

(defn symbol
  "Returns a Symbol with the given namespace and name."
  [ns id]
  (cond
   (symbol? ns) ns
   (keyword? ns) (Symbol. (namespace ns) (name ns))
   (nil? id) (Symbol. nil ns)
   :else (Symbol. ns id)))

(defn ^boolean symbol? [x]
  (or (and (string? x)
           (identical? "\uFEFF" (aget x 0))
           (identical? "'" (aget x 1)))
      (and x
           (identical? Symbol.type x.type))))

(defn ^boolean keyword? [x]
  (and (string? x)
       (> (count x) 1)
       (identical? (first x) "\uA789")))

(defn keyword
  "Returns a Keyword with the given namespace and name. Do not use :
  in the keyword strings, it will be added automatically."
  [ns id]
  (cond (keyword? ns) ns
        (symbol? ns) (str "\uA789" (name ns))
        (nil? id) (str "\uA789" ns)
        (nil? ns) (str "\uA789" id)
        :else (str "\uA789" ns **ns-separator** id)))

(defn- keyword-name
  [value]
  (last (split (subs value 1) **ns-separator**)))

(defn- symbol-name
  [value]
  (or (.-name value)
      (last (split (subs value 2) **ns-separator**))))

(defn name
  "Returns the name String of a string, symbol or keyword."
  [value]
  (cond (symbol? value) (symbol-name value)
        (keyword? value) (keyword-name value)
        (string? value) value
        :else (throw (TypeError. (str "Doesn't support name: " value)))))

(defn- keyword-namespace
  [x]
  (let [parts (split (subs x 1) **ns-separator**)]
    (if (> (count parts) 1) (aget parts 0))))

(defn- symbol-namespace
  [x]
  (let [parts (if (string? x)
                (split (subs x 1) **ns-separator**)
                [(.-namespace x) (.-name x)])]
    (if (> (count parts) 1) (aget parts 0))))

(defn namespace
  "Returns the namespace String of a symbol or keyword, or nil if not present."
  [x]
  (cond (symbol? x) (symbol-namespace x)
        (keyword? x) (keyword-namespace x)
        :else (throw (TypeError. (str "Doesn't supports namespace: " x)))))

(defn gensym
  "Returns a new symbol with a unique name. If a prefix string is
  supplied, the name is prefix# where # is some unique number. If
  prefix is not supplied, the prefix is 'G__'."
  [prefix]
  (symbol (str (if (nil? prefix) "G__" prefix)
               (set! gensym.base (+ gensym.base 1)))))
(set! gensym.base 0)


(defn ^boolean unquote?
  "Returns true if it's unquote form: ~foo"
  [form]
  (and (list? form) (= (first form) 'unquote)))

(defn ^boolean unquote-splicing?
  "Returns true if it's unquote-splicing form: ~@foo"
  [form]
  (and (list? form) (= (first form) 'unquote-splicing)))

(defn ^boolean quote?
  "Returns true if it's quote form: 'foo '(foo)"
  [form]
  (and (list? form) (= (first form) 'quote)))

(defn ^boolean syntax-quote?
  "Returns true if it's syntax quote form: `foo `(foo)"
  [form]
  (and (list? form) (= (first form) 'syntax-quote)))

(defn- normalize [n len]
  (loop [ns (str n)]
    (if (< (count ns) len)
      (recur (str "0" ns))
      ns)))

(defn quote-string
  [s]
  (set! s (join "\\\"" (split s "\"")))
  (set! s (join "\\\\" (split s "\\")))
  (set! s (join "\\b" (split s "\b")))
  (set! s (join "\\f" (split s "\f")))
  (set! s (join "\\n" (split s "\n")))
  (set! s (join "\\r" (split s "\r")))
  (set! s (join "\\t" (split s "\t")))
  (str "\"" s "\""))

(defn ^string pr-str
  [x offset]
  (let [offset (or offset 0)]
    (cond (nil? x) "nil"
          (keyword? x) (if (namespace x)
                         (str ":" (namespace x) "/" (name x))
                         (str ":" (name x)))
          (symbol? x) (if (namespace x)
                        (str (namespace x) "/" (name x))
                        (name x))
          (string? x) (quote-string x)
          (date? x) (str "#inst \""
                         (.getUTCFullYear x) "-"
                         (normalize (inc (.getUTCMonth x)) 2) "-"
                         (normalize (.getUTCDate x) 2) "T"
                         (normalize (.getUTCHours x) 2) ":"
                         (normalize (.getUTCMinutes x) 2) ":"
                         (normalize (.getUTCSeconds x) 2) "."
                         (normalize (.getUTCMilliseconds x) 3) "-"
                         "00:00\"")
          (vector? x) (str "[" (join (str "\n " (join (repeat (inc offset) " ")))
                                     (map #(pr-str % (inc offset))
                                          (vec x)))
                           "]")
          (dictionary? x) (str "{"
                               (join (str ",\n" (join (repeat (inc offset) " ")))
                                     (map (fn [pair]
                                            (let [indent (join (repeat offset " "))
                                                  key (pr-str (first pair)
                                                              (inc offset))
                                                  value (pr-str (second pair)
                                                                (+ 2 offset (count key)))]
                                              (str key " " value)))
                                          x))
                               "}")
          (sequential? x) (str "(" (join " " (map #(pr-str % (inc offset))
                                                  (vec x))) ")")
          (re-pattern? x) (str "#\"" (join "\\/" (split (.-source x) "/")) "\"")
          :else (str x))))
