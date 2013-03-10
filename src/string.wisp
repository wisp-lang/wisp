(import [str subs re-matches nil? string?] "./runtime")
(import [vec empty?] "./sequence")

(defn split
  "Splits string on a regular expression.  Optional argument limit is
  the maximum number of splits. Not lazy. Returns vector of the splits."
  {:added "0.1"}
  [string pattern limit]
  (.split string pattern limit))

(defn ^String join
  "Returns a string of all elements in coll, as returned by (seq coll),
   separated by an optional separator."
  {:added "0.1"}
  ([coll]
     (apply str (vec coll)))
  ([separator coll]
     (.join (vec coll) separator)))

(defn ^String upper-case
  "Converts string to all upper-case."
  {:added "1.2"}
  [string]
  (.toUpperCase string))

(defn ^String upper-case
  "Converts string to all upper-case."
  {:added "1.2"}
  [^CharSequence string]
  (.toUpperCase string))

(defn ^String lower-case
  "Converts string to all lower-case."
  {:added "1.2"}
  [^CharSequence string]
  (.toLowerCase string))

(defn ^String capitalize
  "Converts first character of the string to upper-case, all other
  characters to lower-case."
  {:added "1.2"}
  [^CharSequence string]
  (if (< (count string) 2)
      (upper-case string)
      (str (upper-case (subs s 0 1))
           (lower-case (subs s 1)))))

(defn ^String replace
  "Replaces all instance of match with replacement in s.

   match/replacement can be:

   string / string
   char / char
   pattern / (string or function of match).

   See also replace-first."
  {:added "1.2"}
  [^CharSequence string match replacement]
  (.replace string match replacement))


;(def **WHITESPACE** (str "[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000"
;                          "\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008"
;                          "\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]"))
;(def **LEFT-SPACES** (re-pattern (str "^" **WHITESPACE** **WHITESPACE** "*")))
;(def **RIGHT-SPACES** (re-pattern (str **WHITESPACE** **WHITESPACE** "*$")))
;(def **SPACES** (re-pattern (str "^" **WHITESPACE** "*$")))


(def **LEFT-SPACES** #"^\s\s*")
(def **RIGHT-SPACES** #"\s\s*$")
(def **SPACES** #"^\s\s*$")


(def triml
  (if (nil? (.-trimLeft ""))
    (fn [^CharSequence string] (.replace string **LEFT-SPACES** ""))
    (fn ^String triml
      "Removes whitespace from the left side of string."
      {:added "1.2"}
      [^CharSequence string]
      (.trimLeft string))))

(def trimr
  (if (nil? (.-trimRight ""))
    (fn [^CharSequence string] (.replace string **RIGHT-SPACES** ""))
    (fn ^String trimr
      "Removes whitespace from the right side of string."
      {:added "1.2"}
      [^CharSequence string]
      (.trimRight string))))

(def trim
  (if (nil? (.-trim ""))
    (fn [^CharSequence string]
      (.replace (.replace string **LEFT-SPACES**) **RIGHT-SPACES**))
    (fn ^String trim
      "Removes whitespace from both ends of string."
      {:added "1.2"}
      [^CharSequence string]
      (.trim string))))

(defn blank?
  "True if s is nil, empty, or contains only whitespace."
  {:added "1.2"}
  [^CharSequence string]
  (or (nil? string)
      (empty? string)
      (re-matches **SPACES** string)))

(export split join lower-case upper-case capitalize
        replace trim triml trimr blank?)
