(defn List
  "List type"
  [head tail]
  (set! this.head head)
  (set! this.tail tail)
  (set! this.length (+ (.-length tail) 1))
  this)

(set! List.prototype.length 0)
(set! List.prototype.tail (Object.create List.prototype))
(set! List.prototype.toString
      (fn []
        (loop [result ""
               list this]
          (if (empty? list)
            (str "(" (.substr result 1) ")")
            (recur
             (str result
                  " "
                  (if (vector? (first list))
                    (str "[" (.join (first list) " ") "]")
                    (if (nil? (first list))
                      "nil"
                      (if (string? (first list))
                        (.stringify JSON (first list))
                        (if (number? (first list))
                          (.stringify JSON (first list))
                          (first list))))))
             (rest list))))))

(defn list?
  "Returns true if list"
  [value]
  (.prototype-of? List.prototype value))

(defn count
  "Returns number of elements in list"
  [list]
  (.-length list))

(defn empty?
  "Returns true if list is empty"
  [list]
  (= (count list) 0))

(defn first
  "Return first item in a list"
  [list]
  (.-head list))

(defn second
  "Returns second item of the list"
  [list]
  (first (rest list)))

(defn third
  "Returns third item of the list"
  [list]
  (first (rest (rest list))))

(defn rest
  "Returns list of all items except first one"
  [list]
  (.-tail list))

(defn cons
  "Creates list with `head` as first item and `tail` as rest"
  [head tail]
  (new List head tail))

(defn list
  "Creates list of the given items"
  []
  (if (= (.-length arguments) 0)
    (Object.create List.prototype)
    (.reduce-right (.call Array.prototype.slice arguments)
                   (fn [tail head] (cons head tail))
                   (list))))

(defn reverse
  "Reverse order of items in the list"
  [source]
  (loop [items (array)
         source source]
    (if (empty? source)
      (.apply list list items)
      (recur (.concat (array (first source)) items)
             (rest source)))))

(defn map-list
  "Maps list by applying `f` to each item"
  [source f]
  (if (empty? source) source
      (cons (f (first source))
            (map-list (rest source) f))))

(defn reduce-list
  [form f initial]
  (loop [result (if (nil? initial) (first form) initial)
         items (if (nil? initial) (rest form) form)]
    (if (empty? items)
      result
      (recur (f result (first items)) (rest items)))))


(defn concat-list
  "Returns list representing the concatenation of the elements in the
  supplied lists."
  [left right]
  (loop [result right
         prefix (reverse left)]
    (if (empty? prefix)
      result
      (recur (cons (first prefix) result)
             (rest prefix)))))

(defn list-to-vector [source]
  (loop [result (Array)
         list source]
    (if (empty? list)
      result
      (recur
        (do (.push result (first list)) result)
        (rest list)))))

(defn sort-list
  "Returns a sorted sequence of the items in coll.
  If no comparator is supplied, uses compare."
  [items f]
  (apply
   list
   (.sort (list-to-vector items)
          (if (nil? f)
            f
            (fn [a b] (if (f a b) 0 1))))))

(export empty? count list? first second third
        rest cons list reverse reduce-list
        map-list list-to-vector concat-list
        sort-list)
