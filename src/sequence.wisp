(ns wisp.sequence
  (:require [wisp.runtime :refer [nil? vector? fn? number? string? dictionary? set?
                                  key-values str int dec inc min merge dictionary
                                  iterable? = complement identity]]))

;; Implementation of list

(defn- seq->string [lparen rparen]
  (fn []
    (loop [list this, result ""]
      (if (empty? list)
        (str lparen (.substr result 1) rparen)
        (recur (rest list)
               (str result
                    " "
                    (let [x (first list)]
                      (cond (vector? x) (str "[" (.join x " ") "]")
                            (nil?    x) "nil"
                            (string? x) (.stringify JSON x)
                            (number? x) (.stringify JSON x)
                            :else       x))))))))

(defn- List
  "List type"
  [head tail]
  (set! this.head head)
  (set! this.tail (or tail (list)))
  (set! this.length
    (if (or (nil? this.tail) (dictionary? this.tail) (number? (.-length this.tail)))
      (inc (count this.tail))))
  this)

(set! List.prototype.length 0)
(set! List.type "wisp.list")
(set! List.prototype.type List.type)
(set! List.prototype.tail (Object.create List.prototype))
(set! List.prototype.to-string (seq->string "(" ")"))

(defn- lazy-seq-value [lazy-seq]
  (if (.-realized lazy-seq)
    (.-x lazy-seq)
    (let [x (.x lazy-seq)]
      (set! (.-realized lazy-seq) true)
      (if (empty? x)
        (set! (.-length lazy-seq) 0))
      (set! (.-x lazy-seq) x))))

(defn- LazySeq [realized x]
  (set! (.-realized this) (or realized false))
  (set! (.-x this) x)
  this)
(set! LazySeq.type "wisp.lazy.seq")
(set! LazySeq.prototype.type LazySeq.type)

(defn lazy-seq
  [realized body]
  (LazySeq. realized body))

(defn- clone-proto-props! [from to]
  (apply Object.assign to
         (.map (Object.get-own-property-names from.__proto__)
               #(let [x (aget from %)]
                  (dictionary % (if (fn? x) (.bind x from) x))))))

(defn identity-set [& items]
  (let [js-set (Set. items)
        f      (fn get [x y] (if (js-set.has x) x y))]
    (clone-proto-props! js-set f)
    (set! f.to-string (seq->string "#{" "}"))
    (set! f.__proto__ js-set)
    (Object.define-property f :length {:value f.size})
    (aset f Symbol.iterator f.values)
    (aset f :type identity-set.type)
    f))
(set! identity-set.type "wisp.identity-set")
(def set identity-set)

(defn lazy-seq?
  [value]
  (and value (identical? LazySeq.type value.type)))

(defn identity-set?
  [value]
  (and value (identical? identity-set.type value.type)))

(defn list?
  "Returns true if list"
  [value]
  (and value (identical? List.type value.type)))

(defn list
  "Creates list of the given items"
  []
  (if (identical? (.-length arguments) 0)
    (Object.create List.prototype)
    (.reduce-right (.call Array.prototype.slice arguments)
                   (fn [tail head] (cons head tail))
                   (list))))

(defn cons
  "Creates list with `head` as first item and `tail` as rest"
  [head tail]
  (new List head tail))

(defn ^boolean sequential?
  "Returns true if coll satisfies ISequential"
  [x] (or (list? x)
          (vector? x)
          (lazy-seq? x)
          (dictionary? x)
          (set? x)
          (string? x)))

(defn- ^boolean native? [sequence]
  (or (vector? sequence) (string? sequence) (dictionary? sequence)))


(defn reverse
  "Reverse order of items in the sequence"
  [sequence]
  (if (vector? sequence)
    (.reverse (vec sequence))
    (into nil sequence)))

(defn range
  "Returns a vector of nums from start (inclusive) to end
  (exclusive), by step, where start defaults to 0 and step to 1."
  ([end]            (range 0 end 1))
  ([start end]      (range start end 1))
  ([start end step] (if (< step 0)
                      (.map (range (- start) (- end) (- step)) #(- %))
                      (Array.from {:length (-> (+ end step) (- start 1) (/ step))}
                                  (fn [_ i] (+ start (* i step)))))))

(defn mapv
  "Returns a vector consisting of the result of applying `f` to the
  first items, followed by applying f to the second items, until one of
  sequences is exhausted."
  [f & sequences]
  (let [vectors (.map sequences vec),  n (apply min (.map vectors count))]
    (.map (range n) (fn [i] (apply f (.map vectors #(aget % i)))))))

(defn map
  "Returns a sequence consisting of the result of applying `f` to the
  first items, followed by applying f to the second items, until one of
  sequences is exhausted."
  [f & sequences]
  (let [result (apply mapv f sequences)]
    (if (native? (first sequences)) result (apply list result))))

(defn map-indexed
  "Returns a sequence consisting of the result of applying `f` to 0 and
  the first items, followed by applying f to 1 and the second items,
  until one of sequences is exhausted."
  [f & sequences]
  (let [sequence (first sequences),  n (count sequence),  indices (range n)]
    (apply map f (if (native? sequence) indices (apply list indices)) sequences)))

(defn filter
  "Returns a sequence of the items in coll for which (f? item) returns true.
  f? must be free of side-effects."
  [f? sequence]
  (cond (vector? sequence) (.filter sequence #(f? %))
        (list? sequence) (filter-list f? sequence)
        (nil? sequence) '()
        (lazy-seq? sequence) (filter-list f? sequence)
        :else (filter f? (seq sequence))))

(defn- filter-list
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

(defn filterv [f? sequence]
  (vec (filter f? sequence)))

(defn reduce
  [f & params]
  (let [has-initial (>= (count params) 2)
        initial     (if has-initial (first params))
        sequence    (if has-initial (second params) (first params))]
    (if has-initial
      (.reduce (vec sequence) f initial)
      (.reduce (vec sequence) f))))

(defn count
  "Returns number of elements in list"
  [sequence]
  (if (and sequence (number? (.-length sequence)))
    (.-length sequence)
    (let [it (seq sequence)]
      (cond (nil? it)      0
            (lazy-seq? it) (count (vec it))
            :else          (.-length it)))))

(defn empty?
  "Returns true if list is empty"
  [sequence]
  (let [it (seq sequence)]
    (identical? 0 (if-not (lazy-seq? it)
                    (count it)
                    (do (first it)             ; forcing evaluation
                        (.-length it))))))

(defn first
  "Return first item in a list"
  [sequence]
  (cond (nil? sequence) nil
        (list? sequence) (.-head sequence)
        (or (vector? sequence) (string? sequence)) (get sequence 0)
        (lazy-seq? sequence) (first (lazy-seq-value sequence))
        :else (first (seq sequence))))

(defn second
  "Returns second item of the list"
  [sequence]
  (cond (nil? sequence) nil
        (list? sequence) (first (rest sequence))
        (or (vector? sequence) (string? sequence)) (get sequence 1)
        (lazy-seq? sequence) (second (lazy-seq-value sequence))
        :else (first (rest (seq sequence)))))

(defn third
  "Returns third item of the list"
  [sequence]
  (cond (nil? sequence) nil
        (list? sequence) (first (rest (rest sequence)))
        (or (vector? sequence) (string? sequence)) (get sequence 2)
        (lazy-seq? sequence) (third (lazy-seq-value sequence))
        :else (second (rest (seq sequence)))))

(defn rest
  "Returns list of all items except first one"
  [sequence]
  (cond (nil? sequence) '()
        (list? sequence) (.-tail sequence)
        (or (vector? sequence) (string? sequence)) (.slice sequence 1)
        (lazy-seq? sequence) (rest (lazy-seq-value sequence))
        :else (rest (seq sequence))))

(defn- last-of-list
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
        (lazy-seq? sequence) (last (lazy-seq-value sequence))
        :else (last (seq sequence))))

(defn butlast
  "Return a seq of all but the last item in coll, in linear time"
  [sequence]
  (let [items (cond (nil? sequence) nil
                    (string? sequence) (subs sequence 0 (dec (count sequence)))
                    (vector? sequence) (.slice sequence 0 (dec (count sequence)))
                    (list? sequence) (apply list (butlast (vec sequence)))
                    (lazy-seq? sequence) (butlast (lazy-seq-value sequence))
                    :else (butlast (seq sequence)))]
    (if-not (empty? items) items)))

(defn take
  "Returns a sequence of the first `n` items, or all items if
  there are fewer than `n`."
  [n sequence]
  (cond (nil? sequence) '()
        (vector? sequence) (take-from-vector n sequence)
        (list? sequence) (take-from-list n sequence)
        (lazy-seq? sequence) (if (> n 0) (take n (lazy-seq-value sequence)))
        :else (take n (seq sequence))))

(defn take-while
  [predicate sequence]
  (loop [items sequence, result []]
    (let [head (first items), tail (rest items)]
      (if (and (not (empty? items))
               (predicate head))
        (recur tail (conj result head))
        (if (native? sequence) result (apply list result))))))


(defn- take-from-vector
  "Like take but optimized for vectors"
  [n vector]
  (.slice vector 0 n))

(defn- take-from-list
  "Like take but for lists"
  [n sequence]
  (loop [taken '()
         items sequence
         n     (or (int n) 0)]
    (if (or (<= n 0) (empty? items))
      (reverse taken)
      (recur (cons (first items) taken)
             (rest items)
             (dec n)))))




(defn- drop-from-list [n sequence]
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
          (lazy-seq? sequence) (drop n (lazy-seq-value sequence))
          :else (drop n (seq sequence)))))

(defn drop-while
  [predicate sequence]
  (loop [items (seq sequence)]
    (if (or (empty? items) (not (predicate (first items))))
      items
      (recur (rest items)))))


(defn- conj-list
  [sequence items]
  (reduce (fn [result item] (cons item result)) sequence items))

(defn- ensure-dictionary [x]
  (if-not (vector? x)
    x
    (dictionary (first x) (second x))))

(defn conj
  [sequence & items]
  (cond (vector? sequence) (.concat sequence items)
        (string? sequence) (str sequence (apply str items))
        (nil? sequence) (apply list (reverse items))
        (or (list? sequence)
            (lazy-seq? sequence)) (conj-list sequence items)
        (dictionary? sequence) (merge sequence (apply merge (mapv ensure-dictionary items)))
        (set? sequence) (apply identity-set (into (vec sequence) items))
        :else (throw (TypeError (str "Type can't be conjoined " sequence)))))

(defn disj
  [coll & ks]
  (let [predicate (complement (apply identity-set ks))]
    (cond (empty? ks)        coll
          (set? coll)        (apply identity-set (filterv predicate coll))
          (dictionary? coll) (into {} (filter #(predicate (first %)) coll))
          :else              (throw (TypeError (str "Type can't be disjoined " coll))))))

(defn into
  [to from]
  (apply conj to (vec from)))

(defn assoc
  [source & key-values]
  ;(assert (even? (count key-values)) "Wrong number of arguments")
  ;(assert (and (not (seq? source))
  ;             (not (vector? source))
  ;             (object? source)) "Can only assoc on dictionaries")
  (conj source (apply dictionary key-values)))

(defn dissoc
  [coll & ks]
  (if (dictionary? coll)
    (apply disj coll ks)
    (throw (TypeError (str "Can only dissoc on dictionaries")))))

(defn concat
  "Returns list representing the concatenation of the elements in the
  supplied lists."
  [& sequences]
  (reduce #(conj-list %1 (reverse %2))
          (let [tail (last sequences)]
            (if (lazy-seq? tail) tail (apply list (vec tail))))
          (rest (reverse sequences))))

(defn mapcat [f & colls]
  (apply concat (apply mapv f colls)))

(defn empty
  "Produces empty sequence of the same type as argument."
  [sequence]
  (cond (list? sequence)       '()
        (vector? sequence)     []
        (string? sequence)     ""
        (dictionary? sequence) {}
        (set? sequence)        #{}))

(defn seq [sequence]
  (cond (nil? sequence) nil
        (or (vector? sequence) (list? sequence) (lazy-seq? sequence)) sequence
        (string? sequence) (.call Array.prototype.slice sequence)
        (dictionary? sequence) (key-values sequence)
        (iterable? sequence) (iterator->lseq ((get sequence Symbol.iterator)))
        :default (throw (TypeError (str "Can not seq " sequence)))))

(defn seq? [sequence]
  (or (list? sequence)
      (lazy-seq? sequence)))

(defn- iterator->lseq [iterator]
  (unfold #(let [x (.next %)]
             (if-not (.-done x) [(.-value x) %]))
          iterator))

(defn- list->vector [source]
  (loop [result []
         list source]
    (if (empty? list)
      result
      (recur
        (do (.push result (first list)) result)
        (rest list)))))

(defn vec
  "Creates a new vector containing the contents of sequence"
  [sequence]
  (cond (nil? sequence) []
        (vector? sequence) (Array.from sequence)
        (list? sequence) (list->vector sequence)
        (lazy-seq? sequence) (let [xs (list->vector sequence)]          ; optimizing count
                               (set! (.-length sequence) (.-length xs))
                               xs)
        :else (vec (seq sequence))))

(defn vector [& sequence] sequence)

(def ^{:private true}
  sort-comparator
  (if (= [1 2 3] (.sort [2 1 3] (fn [a b] (if (< a b) 0 1))))
    #(fn [a b] (if (% b a)  1 0))       ; quicksort (Chrome, Node), mergesort (Firefox)
    #(fn [a b] (if (% a b) -1 0))))     ; timsort (Chrome 70+, Node 11+)

(defn sort
  "Returns a sorted sequence of the items in coll.
  If no comparator is supplied, uses compare."
  [f items]
  (let [has-comparator (fn? f)
        items          (if (and (not has-comparator) (nil? items)) f items)
        compare        (if has-comparator (sort-comparator f))
        result         (.sort (vec items) compare)]
    (cond (nil? items)    '()
          (vector? items) result
          :else           (apply list result))))


(defn repeat
  "Returns a vector of given `n` length with of given `x`
  items. Not compatible with clojure as it's not a lazy
  and only finite repeats are supported"
  [n x]
  (loop [n      (int n)
         result []]
    (if (<= n 0)
      result
      (recur (dec n)
             (conj result x)))))

(defn every?
  [predicate sequence]
  (.every (vec sequence) #(predicate %)))

(defn some
  "Returns the first logical true value of (pred x) for any x in coll,
  else nil.  One common idiom is to use a set as pred, for example
  this will return :fred if :fred is in the sequence, otherwise nil:
  (some #{:fred} coll)"
  [pred coll]
  (loop [items (seq coll)]
    (if-not (empty? items)
      (or (pred (first items)) (recur (rest items))))))


(defn partition
  ([n coll] (partition n n coll))
  ([n step coll] (partition n step [] coll))
  ([n step pad coll]
   (loop [result []
          items (seq coll)]
     (let [chunk (take n items)
           size (count chunk)]
       (cond (identical? size n) (recur (conj result chunk)
                                        (drop step items))
             (identical? 0 size) result
             (> n (+ size (count pad))) result
             :else (conj result
                         (take n (vec (concat chunk
                                              pad)))))))))

(defn interleave [& sequences]
  (if (empty? sequences)
    []
    (loop [result []
           sequences sequences]
      (if (some empty? sequences)
        (vec result)
        (recur (concat result (map first sequences))
               (map rest sequences))))))

(defn nth
  "Returns nth item of the sequence"
  [sequence index not-found]
  (cond (nil? sequence) not-found
        (list? sequence) (if (< index (count sequence))
                           (first (drop index sequence))
                           not-found)
        (or (vector? sequence)
            (string? sequence)) (if (< index (count sequence))
                                  (aget sequence index)
                                  not-found)
        (lazy-seq? sequence) (nth (lazy-seq-value sequence) index not-found)
        :else (throw (TypeError "Unsupported type"))))


(defn contains?
  "Returns true if key is present in the given collection, otherwise
  returns false.  Note that for numerically indexed collections like
  vectors and strings, this tests if the numeric key is within the
  range of indexes. 'contains?' operates constant or logarithmic time;
  it will not perform a linear search for a value.  See also 'some'."
  [coll v]
  (cond (set? coll)                                           (.has coll v)
        (or (dictionary? coll) (vector? coll) (string? coll)) (.has-own-property coll v)
        :else                                                 false))

(defn union
  "Return a set that is the union of the input sets"
  [& sets]
  (into #{} (apply concat sets)))

(defn difference
  "Return a set that is the first set without elements of the remaining sets"
  [s1 & sets]
  (into #{} (filter (complement (apply union sets))
                    s1)))

(defn intersection
  "Return a set that is the intersection of the input sets"
  [& sets]
  (let [sets     (mapv #(into #{} %) sets)
        in-each? (fn [x] (every? #(.has % x) sets))
        min-size (apply min (mapv count sets))
        smallest (.find sets #(= min-size (count %)))]
    (into #{} (filter in-each? smallest))))

(defn subset?
  "Is set1 a subset of set2?"
  [set1 set2]
  (if (set? set2)
    (every? #(.has set2 %) set1)
    (subset? set1 (into #{} set2))))

(defn superset?
  "Is set1 a superset of set2?"
  [set1 set2]
  (subset? set2 set1))


(defn unfold
  "Returns a lazy sequence; (f x) is expected to return either nil (signifying end of sequence)
  or [y x1] (where y is next sequence item, and x1 is next value of x)"
  [f x]
  (lazy-seq (if-let [next (f x)]
              (cons (first next) (unfold f (second next))))))

(defn iterate
  "Returns a lazy sequence of x, (f x), (f (f x)) etc. f must be free of side-effects"
  [f x]
  (lazy-seq (cons x (iterate f (f x)))))

(defn cycle
  "Returns a lazy (infinite!) sequence of repetitions of the items in coll."
  [coll]
  (lazy-seq (if-not (empty? coll)
              (concat coll (cycle coll)))))

(defn infinite-range
  ([] (infinite-range 0))
  ([n] (iterate inc n))
  ([n step] (iterate #(+ % step) n)))

(defn lazy-map [f & sequences]
  (unfold #(if-not (some empty? %)
             [(apply f (mapv first %)) (mapv rest %)])
          sequences))

(defn lazy-filter [f sequence]
  (unfold #(loop [xs %]
             (cond (empty? xs)    nil
                   (f (first xs)) [(first xs) (rest xs)]
                   :else          (recur (rest xs))))
          (seq sequence)))

(defn lazy-concat [& sequences]
  (if-not (empty? sequences)
    ((fn iter [xs]
       (lazy-seq (if (empty? xs)
                   (apply lazy-concat (rest sequences))
                   (cons (first xs) (iter (rest xs))))))
     (seq (first sequences)))))

(defn lazy-partition
  ([n coll] (lazy-partition n n coll))
  ([n step coll] (lazy-partition n step [] coll))
  ([n step pad coll]
    (unfold #(let [chunk (take n (concat (take n %) pad))]
               (if (and (not (empty? %)) (identical? n (count chunk)))
                 [chunk (drop step %)]))
            coll)))


(defn run!
  "Runs the supplied procedure (via reduce), for purposes of side
  effects, on successive items in the collection. Returns nil"
  [proc coll]
  (reduce (fn [_ x] (proc x) nil) nil coll))

(defn dorun
  "When lazy sequences are produced via functions that have side
  effects, any effects other than those needed to produce the first
  element in the seq do not occur until the seq is consumed. dorun can
  be used to force any effects. Walks through the successive nexts of
  the seq, does not retain the head and returns nil."
  ([coll] (dorun Infinity coll))
  ([n coll] (run! identity (take n coll))))

(defn doall
  "When lazy sequences are produced via functions that have side
  effects, any effects other than those needed to produce the first
  element in the seq do not occur until the seq is consumed. dorun can
  be used to force any effects. Walks through the successive nexts of
  the seq, retains the head and returns it, thus causing the entire
  seq to reside in memory at one time."
  ([coll] (doall Infinity coll))
  ([n coll] (dorun n coll) coll))
