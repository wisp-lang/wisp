(import (symbol) "./ast")

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

(defn gensym
  "Returns a new symbol with a unique name. If a prefix string is
  supplied, the name is prefix# where # is some unique number. If
  prefix is not supplied, the prefix is 'G__'."
  [prefix]
  (symbol (str (if (nil? prefix) "G__" prefix)
               (set! gensym.base (+ gensym.base 1)))))
(set! gensym.base 0)


;; Define alias for the clojures alength.
(defn ^boolean odd? [n]
  (identical? (% n 2) 1))

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


(export
  dictionary merge
  odd? gensym)

