(import [nil? vector? fn? number? string? dictionary?
         key-values str dec inc merge] "./runtime")

(defn List
  "List type"
  [head tail]
  (set! this.head head)
  (set! this.tail (or tail (list)))
  (set! this.length (inc (count this.tail)))
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

(defn list
  "Creates list of the given items"
  []
  (if (= (.-length arguments) 0)
    (Object.create List.prototype)
    (.reduce-right (.call Array.prototype.slice arguments)
                   (fn [tail head] (cons head tail))
                   (list))))

(defn cons
  "Creates list with `head` as first item and `tail` as rest"
  [head tail]
  (new List head tail))

(defn reverse-list
  [sequence]
  (loop [items []
           source sequence]
      (if (empty? source)
        (apply list items)
        (recur (.concat [(first source)] items)
               (rest source)))))

(defn reverse
  "Reverse order of items in the sequence"
  [sequence]
  (cond (list? sequence) (reverse-list sequence)
        (vector? sequence) (.reverse sequence)
        (nil? sequence) '()
        :else (reverse (seq sequence))))

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
  (cond (vector? sequence) (.filter sequence f?)
        (list? sequence) (filter-list f? sequence)
        (nil? sequence) '()
        :else (filter f? (seq sequence))))

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

(defn reduce
  [f & params]
  (let [has-initial (>= (count params) 2)
        initial (if has-initial (first params))
        sequence (if has-initial (second params) (first params))]
    (cond (nil? sequence) initial
          (vector? sequence) (if has-initial
                              (.reduce sequence f initial)
                              (.reduce sequence f))
          (list? sequence) (if has-initial
                            (reduce-list f initial sequence)
                            (reduce-list f (first sequence) (rest sequence)))
          :else (reduce f initial (seq sequence)))))

(defn reduce-list
  [f initial sequence]
  (loop [result initial
         items sequence]
    (if (empty? items)
      result
      (recur (f result (first items)) (rest items)))))

(defn count
  "Returns number of elements in list"
  [sequence]
  (if (nil? sequence)
    0
    (.-length (seq sequence))))

(defn empty?
  "Returns true if list is empty"
  [sequence]
  (= (count sequence) 0))

(defn first
  "Return first item in a list"
  [sequence]
  (cond (nil? sequence) nil
        (list? sequence) (.-head sequence)
        (or (vector? sequence) (string? sequence)) (get sequence 0)
        :else (first (seq sequence))))

(defn second
  "Returns second item of the list"
  [sequence]
  (cond (nil? sequence) nil
        (list? sequence) (first (rest sequence))
        (or (vector? sequence) (string? sequence)) (get sequence 1)
        :else (first (rest (seq sequence)))))

(defn third
  "Returns third item of the list"
  [sequence]
  (cond (nil? sequence) nil
        (list? sequence) (first (rest (rest sequence)))
        (or (vector? sequence) (string? sequence)) (get sequence 2)
        :else (second (rest (seq sequence)))))

(defn rest
  "Returns list of all items except first one"
  [sequence]
  (cond (nil? sequence) '()
        (list? sequence) (.-tail sequence)
        (or (vector? sequence) (string? sequence)) (.slice sequence 1)
        :else (rest (seq sequence))))

(defn last-of-list
  [list]
  (loop [item (first list)
         items (rest list)]
    (if (empty? items)
      item
      (recur (first items) (rest items)))))

(defn last
  "Return the last item in coll, in linear time"
  [sequence]
  (cond (or (vector? sequence)
            (string? sequence)) (get sequence (dec (count sequence)))
        (list? sequence) (last-of-list sequence)
        (nil? sequence) nil
        :else (last (seq sequence))))

(defn take
  "Returns a sequence of the first `n` items, or all items if
  there are fewer than `n`."
  [n sequence]
  (cond (nil? sequence) '()
        (vector? sequence) (take-from-vector n sequence)
        (list? sequence) (take-from-list n sequence)
        :else (take n (seq sequence))))

(defn take-from-vector
  "Like take but optimized for vectors"
  [n vector]
  (.slice vector 0 n))

(defn take-from-list
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




(defn drop-from-list [n sequence]
  (loop [left n
         items sequence]
    (if (or (< left 1) (empty? items))
      items
      (recur (dec left) (rest items)))))

(defn drop
  [n sequence]
  (if (<= n 0)
    sequence
    (cond (string? sequence) (.substr sequence n)
          (vector? sequence) (.slice sequence n)
          (list? sequence) (drop-from-list n sequence)
          (nil? sequence) '()
          :else (drop n (seq sequence)))))


(defn conj-list
  [sequence items]
  (reduce (fn [result item] (cons item result)) sequence items))

(defn conj
  [sequence & items]
  (cond (vector? sequence) (.concat sequence items)
        (string? sequence) (str sequence (apply str items))
        (nil? sequence) (apply list (reverse items))
        (list? sequence) (conj-list sequence items)
        (dictionary? sequence) (merge sequence (apply merge items))
        :else (throw (TypeError (str "Type can't be conjoined " sequence)))))

(defn concat
  "Returns list representing the concatenation of the elements in the
  supplied lists."
  [& sequences]
  (reverse
    (reduce
      (fn [result sequence]
        (reduce
          (fn [result item] (cons item result))
          result
          (seq sequence)))
      '()
      sequences)))

(defn seq [sequence]
  (cond (nil? sequence) nil
        (or (vector? sequence) (list? sequence)) sequence
        (string? sequence) (.call Array.prototype.slice sequence)
        (dictionary? sequence) (key-values sequence)
        :default (throw (TypeError (str "Can not seq " sequence)))))

(export map filter reduce take reverse drop concat
        empty? count first second third rest seq)

