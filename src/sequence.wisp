(import [nil? vector? dec string? dictionary? key-values] "./runtime")
(import [list? list cons drop-list concat-list] "./list")

(defn reverse
  "Reverse order of items in the sequence"
  [sequence]
  (if (list? sequence)
    (loop [items []
           source sequence]
      (if (empty? source)
        (apply list items)
        (recur (.concat [(first source)] items)
               (rest source))))
    (.reverse sequence)))


(defn map
  "Returns a sequence consisting of the result of applying `f` to the
  first item, followed by applying f to the second items, until sequence is
  exhausted."
  [f sequence]
  (if (vector? sequence)
    (map-vector f sequence)
    (map-list f sequence)))

(defn map-vector
  "Like map but optimized for vectors"
  [f sequence]
  (.map sequence f))


(defn map-list
  "Like map but optimized for lists"
  [f sequence]
  (loop [result '()
         items sequence]
    (if (empty? items)
      (reverse result)
      (recur (cons (f (first items)) result) (rest items)))))

(defn filter
  "Returns a sequence of the items in coll for which (f? item) returns true.
  f? must be free of side-effects."
  [f? sequence]
  (if (vector? sequence)
    (filter-vector f? sequence)
    (filter-list f? sequence)))

(defn filter-vector
  "Like filter but optimized for vectors"
  [f? vector]
  (.filter vector f?))

(defn filter-list
  "Like filter but for lists"
  [f? sequence]
  (loop [result '()
         items sequence]
    (if (empty? items)
      (reverse result)
      (recur (if (f? (first items))
              (cons (first items) result)
              result)
              (rest items)))))


(defn take
  "Returns a sequence of the first `n` items, or all items if
  there are fewer than `n`."
  [n sequence]
  (if (vector? sequence)
    (take-vector n sequence)
    (take-list n sequence)))


(defn take-vector
  "Like take but optimized for vectors"
  [n vector]
  (.slice vector 0 n))

(defn take-list
  "Like take but for lists"
  [n sequence]
  (loop [taken '()
         items sequence
         n n]
    (if (or (= n 0) (empty? items))
      (reverse taken)
      (recur (cons (first items) taken)
             (rest items)
             (dec n)))))


(defn reduce
  [f initial sequence]
  (if (nil? sequence)
    (reduce f nil sequence)
    (if (vector? sequence)
      (reduce-vector f initial sequence)
      (reduce-list f initial sequence))))

(defn reduce-vector
  [f initial sequence]
  (if (nil? initial)
    (.reduce sequence f)
    (.reduce sequence f initial)))

(defn reduce-list
  [f initial sequence]
  (loop [result (if (nil? initial) (first form) initial)
         items (if (nil? initial) (rest form) form)]
    (if (empty? items)
      result
      (recur (f result (first items)) (rest items)))))

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

(defn drop
  [n sequence]
  (cond (string? sequence) (.substr sequence n)

        (vector? sequence) (.slice sequence n)
        (list? sequence) (drop-list n sequence)))

(defn concat
  [& sequences]
  (apply concat-list (map seq sequences)))

(defn seq [sequence]
  (cond (nil? sequence) nil
        (or (vector? sequence) (list? sequence)) sequence
        (string? sequence) (.call Array.prototype.slice sequence)
        (dictionary? sequence) (key-values sequence)
        :default (throw TypeError (str "Can not seq " sequence))))

(export map filter reduce take reverse drop concat
        empty? count first second third rest seq)

