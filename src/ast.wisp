(import [list? first count last] "./sequence")
(import [split] "./string")
(import [nil? vector? number? string? boolean? object? str subs] "./runtime")

(defn with-meta
  "Returns identical value with given metadata associated to it."
  [value metadata]
  (.defineProperty Object value "metadata" {:value metadata :configurable true})
  value)

(defn meta
  "Returns the metadata of the given value or nil if there is no metadata."
  [value]
  (if (object? value) (.-metadata value)))

(def **ns-separator** "\u2044")

(defn symbol
  "Returns a Symbol with the given namespace and name."
  [ns id]
  (cond
   (symbol? ns) ns
   (keyword? ns) (str "\uFEFF" (name ns))
   :else (if (nil? id)
           (str "\uFEFF" ns)
           (str "\uFEFF" ns **ns-separator** id))))

(defn ^boolean symbol? [x]
  (and (string? x)
       (> (count x) 1)
       (identical? (first x) "\uFEFF")))


(defn ^boolean keyword? [x]
  (and (string? x)
       (> (count x) 1)
       (identical? (first x) "\uA789")))

(defn keyword
  "Returns a Keyword with the given namespace and name. Do not use :
  in the keyword strings, it will be added automatically."
  [ns id]
  (cond
   (keyword? ns) ns
   (symbol? ns) (str "\uA789" (name ns))
   (nil? id) (str "\uA789" ns)
   (nil? ns) (str "\uA789" id)
   :else (str "\uA789" ns **ns-separator** id)))


(defn name
  "Returns the name String of a string, symbol or keyword."
  [value]
  (let [named (or (keyword? value) (symbol? value))
        parts (if named (split (subs value 1) **ns-separator**))]
    (cond named (last parts)
          ;; Needs to be after keyword? and symbol? because keywords and
          ;; symbols are strings.
          (string? value) value
          :else (throw (TypeError. (str "Doesn't support name: " value))))))


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
  (and (list? form) (identical? (first form) 'unquote)))

(defn ^boolean unquote-splicing?
  "Returns true if it's unquote-splicing form: ~@foo"
  [form]
  (and (list? form) (identical? (first form) 'unquote-splicing)))

(defn ^boolean quote?
  "Returns true if it's quote form: 'foo '(foo)"
  [form]
  (and (list? form) (identical? (first form) 'quote)))

(defn ^boolean syntax-quote?
  "Returns true if it's syntax quote form: `foo `(foo)"
  [form]
  (and (list? form) (identical? (first form) 'syntax-quote)))



(export meta with-meta
        symbol? symbol
        keyword? keyword
        gensym name
        unquote?
        unquote-splicing?
        quote?
        syntax-quote?)
