(import [object? vector? keys vals dec] "../lib/runtime")

(def to-string Object.prototype.to-string)

(defn ^boolean date?
  "Returns true if x is a date"
  [x]
  (identical? (.call to-string x) "[object Date]"))

(defn ^boolean equivalent?
  [actual expected]
  (or 
   (identical? actual expected)
   (and (= actual expected))
   (and (date? actual) 
        (date? expected)
        (= (.get-time actual)
           (.get-time expected)))
   (if (and (vector? actual) (vector? expected))
     (and (= (.-length actual)
             (.-length expected))
          (loop [index (dec (.-length actual))]
            (if (< index 0)
              true
              (if (equivalent?
                   (get actual index)
                   (get expected index))
                (recur (dec index))
                false))))
     (and (object? actual)
          (object? expected)
          (equivalent? (keys actual)
                       (keys expected))
          (equivalent? (vals actual)
                       (vals expected))))))

(export equivalent? date?)
