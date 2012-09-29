;; Define alias for the clojures alength.

(defn ^boolean odd? [n]
  (identical? (mod n 2) 1))

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
  ; TODO: We should convert keywords to names to make sure that keys are not
  ; used in their keyword form.
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


(defn ^boolean contains-vector?
  "Returns true if vector contains given element"
  [vector element]
  (>= (.index-of vector element) 0))


(defn map-dictionary
  "Maps dictionary values by applying `f` to each one"
  [source f]
  (dictionary
    (.reduce (.keys Object source)
            (fn [target key]
                (set! (get target key) (f (get source key))))
            {})))

(def to-string Object.prototype.to-string)

(defn ^boolean string?
  "Return true if x is a string"
  [x]
  (identical? (.call to-string x) "[object String]"))

(defn ^boolean number?
  "Return true if x is a number"
  [x]
  (identical? (.call to-string x) "[object Number]"))

(defn ^boolean vector?
  "Returns true if x is a vector"
  [x]
  (identical? (.call to-string x) "[object Array]"))

(defn ^boolean boolean?
  "Returns true if x is a boolean"
  [x]
  (identical? (.call to-string x) "[object Boolean]"))

(defn ^boolean re-pattern?
  "Returns true if x is a regular expression"
  [x]
  (identical? (.call to-string x) "[object RegExp]"))

(defn ^boolean fn?
  "Returns true if x is a function"
  [x]
  (identical? (typeof x) "function"))

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
  "Returns true if x is true"
  [x]
  (identical? x true))

(defn re-find
  "Returns the first regex match, if any, of s to re, using
  re.exec(s). Returns a vector, containing first the matching
  substring, then any capturing groups if the regular expression contains
  capturing groups."
  [re s]
  (let [matches (.exec re s)]
    (if (not (nil? matches))
      (if (= (.-length matches) 1)
        (first matches)
        matches))))

(defn re-matches
  [pattern source]
  (let [matches (.exec pattern source)]
    (if (and (not (nil? matches))
             (identical? (get matches 0) source))
      (if (= (.-length matches) 1)
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


(export dictionary? dictionary merge odd? vector? string? number? fn? object?
        nil? boolean? true? false? map-dictionary contains-vector? keys vals
        re-pattern re-find re-matches re-pattern? inc dec str)

