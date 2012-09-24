;; Macros

(defmacro apply
  ([ f ] `(.apply ~f ~f))
  ([ f args ] `(.apply ~f ~f ~args)))

(defmacro declare
  "defs the supplied var names with no bindings,
  useful for making forward declarations."
  ([name] `(def ~name))
  ([name & names] `(statements* (declare ~name) (declare ~@names))))

(defmacro cond
  "Takes a set of test/expr pairs. It evaluates each test one at a
  time.  If a test returns logical true, cond evaluates and returns
  the value of the corresponding expr and doesn't evaluate any of the
  other tests or exprs."
  ([] (void))
  ([condition then]
   `(cond ~condition ~then (void)))
  ([condition then else]
   `(js* "~{} ? (~{}) :\n~{}" ~condition ~then ~else))
  ([condition then & rest]
   (cond ~condition ~then (cond ~@rest))))

;; Define alias that is being used by clojure to
;; returns the value at the given index.
(def-macro-alias get aget)
(def-macro-alias array? vector?)

(defmacro alength [source]
  `(.-length ~source))


;; Functions

;; Define alias for the clojures alength.
(defn ^boolean odd? [n]
  (identical? (% n 2) 1))

(defn ^boolean dictionary?
  "Returns true if dictionary"
  [form]
  (and (object? form)
       ;; Inherits right form Object.prototype
       (object? (.get-prototype-of Object form))
       (nil? (.get-prototype-of Object (.get-prototype-of Object form)))))

(defn dictionary
  "Creates dictionary of given arguments. Odd indexed arguments
  are used for keys and evens for values"
  []
  (loop [key-values (.call Array.prototype.slice arguments)
         result {}]
    (if (.-length key-values)
      (do
        (set! (get result (get key-values 0))
              (get key-values 1))
        (recur (.slice key-values 2) result))
      result)))

(defn keys
  "Returns a sequence of the map's keys"
  [dictionary]
  (.keys Object dictionary))

(defn vals
  "Returns a sequence of the map's values."
  [dictionary]
  (.map (keys dictionary)
        (fn [key] (get dictionary key))))

(defn merge
  "Returns a dictionary that consists of the rest of the maps conj-ed onto
  the first. If a key occurs in more than one map, the mapping from
  the latter (left-to-right) will be the mapping in the result."
  []
  (Object.create
   Object.prototype
   (reduce
    arguments
    (fn [descriptor dictionary]
      (if (object? dictionary)
      	(each
       	(Object.keys dictionary)
         (fn [name]
           (set!
            (get descriptor name)
            (Object.get-own-property-descriptor dictionary name)))))
      descriptor)
    (Object.create Object.prototype))))

(defn ^boolean vector?
  "Returns true if vector"
  [form]
  (array? form))

(defn ^boolean contains-vector?
  "Returns true if vector contains given element"
  [vector element]
  (>= (.index-of vector element) 0))


(defn map-dictionary
  "Maps dictionary values by applying `f` to each one"
  [source f]
  (dictionary
    (reduce (.keys Object source)
            (fn [target key]
                (set! (get target key) (f (get source key))))
            {})))

(export dictionary? dictionary merge odd? vector?
        map-dictionary contains-vector? keys vals)

