(import [list list? first count] "./list")
(import [nil? vector? number? string? boolean? object? str] "./runtime")

(defn with-meta
  "Returns identical value with given metadata associated to it."
  [value metadata]
  (set! value.metadata metadata)
  value)

(defn meta
  "Returns the metadata of the given value or nil if there is no metadata."
  [value]
  (if (object? value) (.-metadata value)))


(defn symbol
  "Returns a Symbol with the given namespace and name."
  [ns id]
  (cond
   (symbol? ns) ns
   (keyword? ns) (.concat "\uFEFF" (name ns))
   :else (if (nil? id)
           (.concat "\uFEFF" ns)
           (.concat "\uFEFF" ns "/" id))))

(defn ^boolean symbol? [x]
  (and (string? x)
       (> (count x) 1)
       (identical? (.char-at x 0) "\uFEFF")))


(defn ^boolean keyword? [x]
  (and (string? x)
       (> (count x) 1)
       (identical? (.char-at x 0) "\uA789")))

(defn keyword
  "Returns a Keyword with the given namespace and name. Do not use :
  in the keyword strings, it will be added automatically."
  [ns id]
  (cond
   (keyword? ns) ns
   (symbol? ns) (.concat "\uA789" (name ns))
   :else (if (nil? id)
           (.concat "\uA789" ns)
           (.concat "\uA789" ns "/" id))))


(defn name
  "Returns the name String of a string, symbol or keyword."
  [value]
  (cond
    (or (keyword? value) (symbol? value))
      (if (and (> (.-length value) 2)
               (>= (.index-of value "/") 0))
        (.substr value (+ (.index-of value "/") 1))
        (.substr value 1))
    (string? value) value))


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
