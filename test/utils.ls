(import [object? vector? keys vals dec] "../lib/runtime")

(defn ^boolean date?
  "Returns true if x is a date"
  [x]
  (identical? (.call to-string x) "[object Date]"))

(defn ^boolean equivalent?
  [actual expected]
  (or 
   ; 7.1 All identical values are equivalent, as determined by ===.
   (identical? actual expected)
   ; 7.2. If the expected value is a Date object, the actual value is
   ; equivalent if it is also a Date object that refers to the same time.
   (and (date? actual) 
        (date? expected)
        (= (.get-time actual)
           (.get-time expected)))
   ; 7.3. Other pairs that do not both pass typeof value == "object",
   ; equivalence is determined by ==.
   (and (not (object? actual))
        (not (object? expected))
        (= actual expected))
   ; 7.4. For all other Object pairs, including Array objects, equivalence is
   ; determined by having the same number of owned properties (as verified
   ; with Object.prototype.hasOwnProperty.call), the same set of keys
   ; (although not necessarily the same order), equivalent values for every
   ; corresponding key, and an identical "prototype" property. Note: this
   ; accounts for both named and indexed properties on Arrays.
   (and (vector? actual)
        (vector? expected)
        (= (.-length actual) (.-length expected))
        (loop [index (.-length actual)]
          (if (< index 0)
            true
            (if (equivalent?
                 (get actual index)
                 (get expected index))
              (recur (dec index))
              false))))
   (and (equivalent? (keys actual)
                     (keys expected))
        (equivalent? (vals actual)
                     (vals expected))
        (equivalent? (.-prototype actual)
                     (.-prototype expected)))))

(export equivalent? date?)
