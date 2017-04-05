(ns wisp.string
  (:require [wisp.runtime :refer [str subs re-matches nil? string? re-pattern?]]
            [wisp.sequence :refer [vec empty?]]))

(defn split
  "Splits string on a regular expression.  Optional argument limit is
  the maximum number of splits. Not lazy. Returns vector of the splits."
  [string pattern limit]
  (.split string pattern limit))

(defn split-lines
  "Splits s on \n or \r\n."
  [s]
  (split s #"\n|\r\n"))

(defn join
  "Returns a string of all elements in coll, as returned by (seq coll),
   separated by an optional separator."
  ([coll]
     (apply str (vec coll)))
  ([separator coll]
     (.join (vec coll) separator)))

(defn upper-case
  "Converts string to all upper-case."
  [string]
  (.toUpperCase string))

(defn lower-case
  "Converts string to all lower-case."
  [string]
  (.toLowerCase string))

(defn ^String capitalize
  "Converts first character of the string to upper-case, all other
  characters to lower-case."
  [s]
  (if (< (count s) 2)
      (upper-case s)
      (str (upper-case (subs s 0 1))
           (lower-case (subs s 1)))))

(def ^:private ESCAPE_PATTERN
  (RegExp. "([-()\\[\\]{}+?*.$\\^|,:#<!\\\\])" "g"))

(defn pattern-escape
  [source]
  (.replace (.replace source ESCAPE_PATTERN "\\$1")
            (RegExp. "\\x08" "g"), "\\x08"))

(defn replace-first
  "Replaces the first instance of match with replacement in s.
  match/replacement can be:

  string / string
  pattern / (string or function of match)."
  [string match replacement]
  (.replace string match replacement))

(defn replace
  "Replaces all instance of match with replacement in s.

   match/replacement can be:

   string / string
   char / char
   pattern / (string or function of match).

   See also replace-first."
  [string match replacement]
  (cond (string? match)
        (.replace string (RegExp. (pattern-escape match) "g") replacement)

        (re-pattern? match)
        (.replace string (RegExp. (.-source match) "g") replacement)

        :else
        (throw (str "Invalid match arg: " match))))


;(def **WHITESPACE** (str "[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000"
;                          "\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008"
;                          "\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]"))
;(def **LEFT-SPACES** (re-pattern (str "^" **WHITESPACE** **WHITESPACE** "*")))
;(def **RIGHT-SPACES** (re-pattern (str **WHITESPACE** **WHITESPACE** "*$")))
;(def **SPACES** (re-pattern (str "^" **WHITESPACE** "*$")))


(def **LEFT-SPACES** #"^\s\s*")
(def **RIGHT-SPACES** #"\s\s*$")
(def **SPACES** #"^\s\s*$")


(def
  ^{:tag string
    :doc "Removes whitespace from the left side of string."}
  triml
  (if (nil? (.-trimLeft ""))
    (fn [string] (.replace string **LEFT-SPACES** ""))
    (fn [string] (.trimLeft string))))

(def
  ^{:tag string
    :doc "Removes whitespace from the right side of string."}
  trimr
  (if (nil? (.-trimRight ""))
    (fn [string] (.replace string **RIGHT-SPACES** ""))
    (fn [string] (.trimRight string))))

(def
  ^{:tag string
    :doc "Removes whitespace from both ends of string."}
  trim
  (if (nil? (.-trim ""))
    (fn [string] (.replace (.replace string **LEFT-SPACES**) **RIGHT-SPACES**))
    (fn [string] (.trim string))))

(defn blank?
  "True if s is nil, empty, or contains only whitespace."
  [string]
  (or (nil? string)
      (empty? string)
      (re-matches **SPACES** string)))

(defn reverse
  "Returns s with its characters reversed."
  [string]
  (join "" (.reverse (.split string #""))))
