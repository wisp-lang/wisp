(import [nil? vector? number? string? str] "./runtime")

(defn List
  "List type"
  [head tail]
  (set! this.head head)
  (set! this.tail tail)
  (set! this.length (+ (.-length tail) 1))
  this)

(set! List.prototype.length 0)
(set! List.prototype.tail (Object.create List.prototype))
(set! List.prototype.to-string
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
  [sequence]
  (.-length sequence))

(defn empty?
  "Returns true if list is empty"
  [sequence]
  (= (count sequence) 0))

(defn first
  "Return first item in a list"
  [sequence]
  (if (list? sequence)
    (.-head sequence)
    (get sequence 0)))

(defn second
  "Returns second item of the list"
  [sequence]
  (if (list? sequence)
    (first (rest sequence))
    (get sequence 1)))

(defn third
  "Returns third item of the list"
  [sequence]
  (if (list? sequence)
    (first (rest (rest sequence)))
    (get sequence 2)))

(defn rest
  "Returns list of all items except first one"
  [sequence]
  (if (list? sequence)
    (.-tail sequence)
    (.slice sequence 1)))

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
  [sequence]
  (if (list? sequence)
    (loop [items []
           source sequence]
      (if (empty? source)
        (apply list items)
        (recur (.concat [(first source)] items)
               (rest source))))
    (.reverse sequence)))

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
  [& sequences]
  (reverse
    (.reduce sequences
             (fn [result sequence]
              (reduce-list sequence
                           (fn [result item] (cons item result))
                           result))
           '())))

(defn list-to-vector [source]
  (loop [result []
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
