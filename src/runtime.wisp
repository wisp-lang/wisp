(ns wisp.runtime
  "Core primitives required for runtime")

(defn identity
  "Returns its argument."
  [x] x)

(defn complement
  "Takes a fn f and returns a fn that takes the same arguments as f,
  has the same effects, if any, and returns the opposite truth value."
  [f] (fn 
        ([] (not (f)))
        ([x] (not (f x)))
        ([x y] (not (f x y)))
        ([x y & zs] (not (apply f x y zs)))))

(defn ^boolean odd? [n]
  (identical? (mod n 2) 1))

(defn ^boolean even? [n]
  (identical? (mod n 2) 0))

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
  [& pairs]
  ; TODO: We should convert keywords to names to make sure that keys are not
  ; used in their keyword form.
  (loop [key-values pairs
         result {}]
    (if (.-length key-values)
      (do
        (set! (aget result (aget key-values 0))
              (aget key-values 1))
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

(defn key-values
  [dictionary]
  (.map (keys dictionary)
        (fn [key] [key (get dictionary key)])))

(defn merge
  "Returns a dictionary that consists of the rest of the maps conj-ed onto
  the first. If a key occurs in more than one map, the mapping from
  the latter (left-to-right) will be the mapping in the result."
  []
  (Object.create
   Object.prototype
   (.reduce
    (.call Array.prototype.slice arguments)
    (fn [descriptor dictionary]
      (if (object? dictionary)
        (.for-each
         (Object.keys dictionary)
         (fn [key]
           (set!
            (get descriptor key)
            (Object.get-own-property-descriptor dictionary key)))))
      descriptor)
    (Object.create Object.prototype))))


(defn ^boolean satisfies?
  "Returns true if x satisfies the protocol"
  [protocol x]
  (or (.-wisp_core$IProtocol$_ protocol)
      (cond (identical? x nil)
            (or (.-wisp_core$IProtocol$nil protocol) false)

            (identical? x null)
            (or (.-wisp_core$IProtocol$nil protocol) false)

            :else (or (aget x (aget protocol 'wisp_core$IProtocol$id))
                      (aget protocol
                            (str "wisp_core$IProtocol$"
                                 (.replace (.replace (.call Object.prototype.toString x)
                                                     "[object " "")
                                           #"\]$" "")))
                      false))))

(defn ^boolean contains-vector?
  "Returns true if vector contains given element"
  [vector element]
  (>= (.index-of vector element) 0))


(defn map-dictionary
  "Maps dictionary values by applying `f` to each one"
  [source f]
  (.reduce (.keys Object source)
           (fn [target key]
              (set! (get target key) (f (get source key)))
              target) {}))

(def to-string Object.prototype.to-string)

(def
  ^{:tag boolean
    :doc "Returns true if x is a function"}
  fn?
  (if (identical? (typeof #".") "function")
    (fn
      [x]
      (identical? (.call to-string x) "[object Function]"))
    (fn
      [x]
      (identical? (typeof x) "function"))))

(defn ^boolean error?
  "Returns true if x is of error type"
  [x]
  (or (instance? Error x)
      (identical? (.call to-string x) "[object Error]")))

(defn ^boolean string?
  "Return true if x is a string"
  [x]
  (or (identical? (typeof x) "string")
      (identical? (.call to-string x) "[object String]")))

(defn ^boolean number?
  "Return true if x is a number"
  [x]
  (or (identical? (typeof x) "number")
      (identical? (.call to-string x) "[object Number]")))

(def
  ^{:tag boolean
    :doc "Returns true if x is a vector"}
  vector?
  (if (fn? Array.isArray)
    Array.isArray
    (fn [x] (identical? (.call to-string x) "[object Array]"))))

(defn ^boolean date?
  "Returns true if x is a date"
  [x]
  (identical? (.call to-string x) "[object Date]"))

(defn ^boolean boolean?
  "Returns true if x is a boolean"
  [x]
  (or (identical? x true)
      (identical? x false)
      (identical? (.call to-string x) "[object Boolean]")))

(defn ^boolean re-pattern?
  "Returns true if x is a regular expression"
  [x]
  (identical? (.call to-string x) "[object RegExp]"))


(defn ^boolean object?
  "Returns true if x is an object"
  [x]
  (and x (identical? (typeof x) "object")))

(defn ^boolean nil?
  "Returns true if x is undefined or null"
  [x]
  (or (identical? x nil)
      (identical? x null)))

(defn ^boolean true?
  "Returns true if x is true"
  [x]
  (identical? x true))

(defn ^boolean false?
  "Returns true if x is false"
  [x]
  (identical? x false))

(defn re-find
  "Returns the first regex match, if any, of s to re, using
  re.exec(s). Returns a vector, containing first the matching
  substring, then any capturing groups if the regular expression contains
  capturing groups."
  [re s]
  (let [matches (.exec re s)]
    (if (not (nil? matches))
      (if (identical? (.-length matches) 1)
        (get matches 0)
        matches))))

(defn re-matches
  [pattern source]
  (let [matches (.exec pattern source)]
    (if (and (not (nil? matches))
             (identical? (get matches 0) source))
      (if (identical? (.-length matches) 1)
        (get matches 0)
        matches))))

(defn re-pattern
  "Returns an instance of RegExp which has compiled the provided string."
  [s]
  (let [match (re-find #"^(?:\(\?([idmsux]*)\))?(.*)" s)]
    (new RegExp (get match 2) (get match 1))))

(defn inc
  [x]
  (+ x 1))

(defn dec
  [x]
  (- x 1))

(defn str
  "With no args, returns the empty string. With one arg x, returns
  x.toString().  (str nil) returns the empty string. With more than
  one arg, returns the concatenation of the str values of the args."
  []
  (.apply String.prototype.concat "" arguments))

(defn char
  "Coerce to char"
  [code]
  (.fromCharCode String code))


(defn int
  "Coerce to int by stripping decimal places."
  [x]
  (if (number? x)
    (if (>= x 0)
      (.floor Math x)
      (.floor Math x))
    (.charCodeAt x 0)))

(defn subs
  "Returns the substring of s beginning at start inclusive, and ending
  at end (defaults to length of string), exclusive."
  {:added "1.0"
   :static true}
   [string start end]
   (.substring string start end))

(defn- ^boolean pattern-equal?
  [x y]
  (and (re-pattern? x)
       (re-pattern? y)
       (identical? (.-source x) (.-source y))
       (identical? (.-global x) (.-global y))
       (identical? (.-multiline x) (.-multiline y))
       (identical? (.-ignoreCase x) (.-ignoreCase y))))

(defn- ^boolean date-equal?
  [x y]
  (and (date? x)
       (date? y)
       (identical? (Number x) (Number y))))


(defn- ^boolean dictionary-equal?
  [x y]
  (and (object? x)
       (object? y)
       (let [x-keys (keys x)
             y-keys (keys y)
             x-count (.-length x-keys)
             y-count (.-length y-keys)]
         (and (identical? x-count y-count)
              (loop [index 0
                     count x-count
                     keys x-keys]
                (if (< index count)
                  (if (equivalent? (get x (get keys index))
                                   (get y (get keys index)))
                    (recur (inc index) count keys)
                    false)
                  true))))))

(defn- ^boolean vector-equal?
  [x y]
  (and (vector? x)
       (vector? y)
       (identical? (.-length x) (.-length y))
       (loop [xs x
              ys y
              index 0
              count (.-length x)]
        (if (< index count)
          (if (equivalent? (get xs index) (get ys index))
              (recur xs ys (inc index) count)
              false)
          true))))

(defn- ^boolean equivalent?
  "Equality. Returns true if x equals y, false if not. Compares
  numbers and collections in a type-independent manner. Clojure's
  immutable data structures define -equiv (and thus =) as a value,
  not an identity, comparison."
  ([x] true)
  ([x y] (or (identical? x y)
             (cond (nil? x) (nil? y)
                   (nil? y) (nil? x)
                   (string? x) (and (string? y) (identical? (.toString x)
                                                            (.toString y)))
                   (number? x) (and (number? y) (identical? (.valueOf x)
                                                            (.valueOf y)))
                   (fn? x) false
                   (boolean? x) false
                   (date? x) (date-equal? x y)
                   (vector? x) (vector-equal? x y [] [])
                   (re-pattern? x) (pattern-equal? x y)
                   :else (dictionary-equal? x y))))
  ([x y & more]
   (loop [previous x
          current y
          index 0
          count (.-length more)]
    (and (equivalent? previous current)
         (if (< index count)
          (recur current
                 (get more index)
                 (inc index)
                 count)
          true)))))

(def = equivalent?)

(defn ^boolean ==
  "Equality. Returns true if x equals y, false if not. Compares
  numbers and collections in a type-independent manner. Clojure's
  immutable data structures define -equiv (and thus =) as a value,
  not an identity, comparison."
  ([x] true)
  ([x y] (identical? x y))
  ([x y & more]
   (loop [previous x
          current y
          index 0
          count (.-length more)]
    (and (== previous current)
         (if (< index count)
          (recur current
                 (get more index)
                 (inc index)
                 count)
          true)))))


(defn ^boolean >
  "Returns non-nil if nums are in monotonically decreasing order,
  otherwise false."
  ([x] true)
  ([x y] (> x y))
  ([x y & more]
   (loop [previous x
          current y
          index 0
          count (.-length more)]
    (and (> previous current)
         (if (< index count)
          (recur current
                 (get more index)
                 (inc index)
                 count)
          true)))))

(defn ^boolean >=
  "Returns non-nil if nums are in monotonically decreasing order,
  otherwise false."
  ([x] true)
  ([x y] (>= x y))
  ([x y & more]
   (loop [previous x
          current y
          index 0
          count (.-length more)]
    (and (>= previous current)
         (if (< index count)
          (recur current
                 (get more index)
                 (inc index)
                 count)
          true)))))


(defn ^boolean <
  "Returns non-nil if nums are in monotonically decreasing order,
  otherwise false."
  ([x] true)
  ([x y] (< x y))
  ([x y & more]
   (loop [previous x
          current y
          index 0
          count (.-length more)]
    (and (< previous current)
         (if (< index count)
          (recur current
                 (get more index)
                 (inc index)
                 count)
          true)))))


(defn ^boolean <=
  "Returns non-nil if nums are in monotonically decreasing order,
  otherwise false."
  ([x] true)
  ([x y] (<= x y))
  ([x y & more]
   (loop [previous x
          current y
          index 0
          count (.-length more)]
    (and (<= previous current)
         (if (< index count)
          (recur current
                 (get more index)
                 (inc index)
                 count)
          true)))))

(defn ^boolean +
  ([] 0)
  ([a] a)
  ([a b] (+ a b))
  ([a b c] (+ a b c))
  ([a b c d] (+ a b c d))
  ([a b c d e] (+ a b c d e))
  ([a b c d e f] (+ a b c d e f))
  ([a b c d e f & more]
   (loop [value (+ a b c d e f)
          index 0
          count (.-length more)]
     (if (< index count)
       (recur (+ value (get more index))
              (inc index)
              count)
       value))))

(defn ^boolean -
  ([] (throw (TypeError "Wrong number of args passed to: -")))
  ([a] (- 0 a))
  ([a b] (- a b))
  ([a b c] (- a b c))
  ([a b c d] (- a b c d))
  ([a b c d e] (- a b c d e))
  ([a b c d e f] (- a b c d e f))
  ([a b c d e f & more]
   (loop [value (- a b c d e f)
          index 0
          count (.-length more)]
     (if (< index count)
       (recur (- value (get more index))
              (inc index)
              count)
       value))))

(defn ^boolean /
  ([] (throw (TypeError "Wrong number of args passed to: /")))
  ([a] (/ 1 a))
  ([a b] (/ a b))
  ([a b c] (/ a b c))
  ([a b c d] (/ a b c d))
  ([a b c d e] (/ a b c d e))
  ([a b c d e f] (/ a b c d e f))
  ([a b c d e f & more]
   (loop [value (/ a b c d e f)
          index 0
          count (.-length more)]
     (if (< index count)
       (recur (/ value (get more index))
              (inc index)
              count)
       value))))

(defn ^boolean *
  ([] 1)
  ([a] a)
  ([a b] (* a b))
  ([a b c] (* a b c))
  ([a b c d] (* a b c d))
  ([a b c d e] (* a b c d e))
  ([a b c d e f] (* a b c d e f))
  ([a b c d e f & more]
   (loop [value (* a b c d e f)
          index 0
          count (.-length more)]
     (if (< index count)
       (recur (* value (get more index))
              (inc index)
              count)
       value))))

(defn ^boolean and
  ([] true)
  ([a] a)
  ([a b] (and a b))
  ([a b c] (and a b c))
  ([a b c d] (and a b c d))
  ([a b c d e] (and a b c d e))
  ([a b c d e f] (and a b c d e f))
  ([a b c d e f & more]
   (loop [value (and a b c d e f)
          index 0
          count (.-length more)]
     (if (< index count)
       (recur (and value (get more index))
              (inc index)
              count)
       value))))

(defn ^boolean or
  ([] nil)
  ([a] a)
  ([a b] (or a b))
  ([a b c] (or a b c))
  ([a b c d] (or a b c d))
  ([a b c d e] (or a b c d e))
  ([a b c d e f] (or a b c d e f))
  ([a b c d e f & more]
   (loop [value (or a b c d e f)
          index 0
          count (.-length more)]
     (if (< index count)
       (recur (or value (get more index))
              (inc index)
              count)
       value))))

(defn print
  [& more]
  (apply console.log more))

(def max Math.max)
(def min Math.min)
(def nan? isNaN)
