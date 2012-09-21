(include "./runtime")
(import [list list? count empty? first second third rest
         cons rest] "./list")
(import [odd? dictionary merge] "./runtime")
(import [symbol? symbol keyword? keyword quote syntax-quote
         unquote unquote-splicing meta with-meta name deref] "./ast")

(declare nil)

(defn PushbackReader
  "StringPushbackReader"
  [source index buffer]
  (set! this.source source)
  (set! this.index-atom index)
  (set! this.buffer-atom buffer)
  this)

(defn push-back-reader
  "Creates a StringPushbackReader from a given string"
  [source]
  (new PushbackReader source 0 ""))
(defn next-char
  "Returns next char from the Reader without reading it.
  nil if the end of stream has being reached."
  [reader]
  (if (empty? reader.buffer-atom)
    (aget reader.source reader.index-atom)
    (aget reader.buffer-atom 0)))

(defn read-char
  "Returns the next char from the Reader, nil if the end
  of stream has been reached"
  [reader]
  (if (empty? reader.buffer-atom)
    (let [index reader.index-atom]
      (set! reader.index-atom (+ index 1))
      (aget reader.source index))
    (let [buffer reader.buffer-atom]
      (set! reader.buffer-atom (.substr buffer 1))
      (get buffer 0))))


(defn unread
  "Push back a single character on to the stream"
  [reader ch]
  (if ch (set! reader.buffer-atom (.concat ch reader.buffer-atom))))


;; Predicates

(defn- ^boolean breaking-whitespace?
 "Checks if a string is all breaking whitespace."
 [ch]
 (>= (.index-of "\t\n\r " ch) 0))

(defn- ^boolean whitespace?
  "Checks whether a given character is whitespace"
  [ch]
  (or (breaking-whitespace? ch) (identical? "," ch)))

(defn- ^boolean numeric?
 "Checks whether a given character is numeric"
 [ch]
 (>= (.index-of "01234567890" ch) 0))

(defn- ^boolean comment-prefix?
  "Checks whether the character begins a comment."
  [ch]
  (identical? ";" ch))


(defn- ^boolean number-literal?
  "Checks whether the reader is at the start of a number literal"
  [reader initch]
  (or (numeric? initch)
      (and (or (identical? \+ initch)
               (identical? \- initch))
           (numeric? (let [next-ch (read-char reader)]
                       (unread reader next-ch)
                       next-ch)))))



;; read helpers

;; TODO: Line numbers
(defn reader-error
  [reader message]
  (throw (Error message)))

(defn ^boolean macro-terminating? [ch]
  (and (not (identical? ch "#"))
       (not (identical? ch "'"))
       (not (identical? ch ":"))
       (macros ch)))


(defn read-token
  "Reads out next token from the reader stream"
  [reader initch]
  (loop [buffer initch
         ch (read-char reader)]

    (if (or (nil? ch)
            (whitespace? ch)
            (macro-terminating? ch))
      (do (unread reader ch) buffer)
      (recur (.concat buffer ch)
             (read-char reader)))))

(defn skip-line
  "Advances the reader to the end of a line. Returns the reader"
  [reader _]
  (loop []
    (let [ch (read-char reader)]
      (if (or (identical? ch "\n")
              (identical? ch "\r")
              (nil? ch))
        reader
        (recur)))))

(def int-pattern (re-pattern "([-+]?)(?:(0)|([1-9][0-9]*)|0[xX]([0-9A-Fa-f]+)|0([0-7]+)|([1-9][0-9]?)[rR]([0-9A-Za-z]+)|0[0-9]+)(N)?"))
(def ratio-pattern (re-pattern "([-+]?[0-9]+)\/([0-9]+)"))
(def float-pattern (re-pattern "([-+]?[0-9]+(\\.[0-9]*)?([eE][-+]?[0-9]+)?)(M)?"))
(def symbol-pattern (re-pattern "[:]?([^0-9\/].*\/)?([^0-9\/][^\/]*)"))

(defn- re-find
  [re s]
  (let [matches (.exec re s)]
    (if (not (nil? matches))
      (if (== (alength matches) 1)
        (aget matches 0)
        matches))))

(defn- match-int
  [s]
  (let [groups (re-find int-pattern s)
        group3 (aget groups 2)]
    (if (not (or (nil? group3)
                (< (alength group3) 1)))
      0
      (let [negate (if (identical? "-" (aget groups 1)) -1 1)
            a (cond
               (aget groups 3) (array (aget groups 3) 10)
               (aget groups 4) (array (aget groups 4) 16)
               (aget groups 5) (array (aget groups 5) 8)
               (aget groups 7) (array (aget groups 7) (parse-int (aget groups 7)))
               :default (array nil nil))
            n (aget a 0)
            radix (aget a 1)]
        (if (nil? n)
          nil
          (* negate (parse-int n radix)))))))


(defn- match-ratio
  [s]
  (let [groups (re-find ratio-pattern s)
        numinator (aget groups 1)
        denominator (aget groups 2)]
    (/ (parse-int numinator) (parse-int denominator))))

(defn- match-float
  [s]
  (parse-float s))

(defn- re-matches
  [pattern source]
  (let [matches (.exec pattern source)]
    (when (and (not (nil? matches))
               (identical? (aget matches 0) source))
      (if (== (alength matches) 1)
        (aget matches 0)
        matches))))

(defn- match-number
  [s]
  (cond
   (re-matches int-pattern s) (match-int s)
   (re-matches ratio-pattern s) (match-ratio s)
   (re-matches float-pattern s) (match-float s)))

(defn escape-char-map [c]
  (cond
   (identical? c \t) "\t"
   (identical? c \r) "\r"
   (identical? c \n) "\n"
   (identical? c \\) \\
   (identical? c "\"") "\""
   (identical? c \b) "\b"
   (identical? c \f) "\f"
   :else nil))

;; unicode

(defn read-2-chars [reader]
  (.concat (read-char reader) (read-char reader)))

(defn read-4-chars [reader]
  (.concat
   (read-char reader)
   (read-char reader)
   (read-char reader)
   (read-char reader)))

(def unicode-2-pattern (re-pattern "[0-9A-Fa-f]{2}"))
(def unicode-4-pattern (re-pattern "[0-9A-Fa-f]{4}"))


(defn validate-unicode-escape
  "Validates unicode escape"
  [unicode-pattern reader escape-char unicode-str]
  (if (re-matches unicode-pattern unicode-str)
    unicode-str
    (reader-error
     reader
     (str "Unexpected unicode escape " \\ escape-char unicode-str))))


(defn make-unicode-char [code-str]
    (let [code (parseInt code-str 16)]
      (.from-char-code String code)))

(defn escape-char
  "escape char"
  [buffer reader]
  (let [ch (read-char reader)
        mapresult (escape-char-map ch)]
    (if mapresult
      mapresult
      (cond
        (identical? ch "\\x")
        (make-unicode-char
         (validate-unicode-escape
          unicode-2-pattern
          reader
          ch
          (read-2-chars reader)))
        (identical? ch "\\u")
        (make-unicode-char
          (validate-unicode-escape
           unicode-4-pattern
           reader
           ch
           (read-4-chars reader)))
        (numeric? ch)
        (.fromCharCode String ch)

        :else
        (reader-error
         reader
         (str "Unexpected unicode escape " \\ ch ))))))

(defn read-past
  "Read until first character that doesn't match pred, returning
  char."
  [predicate reader]
  (loop [ch (read-char reader)]
    (if (predicate ch)
      (recur (read-char reader))
      ch)))


;; TODO: Complete implementation
(defn read-delimited-list
  "Reads out delimited list"
  [delim rdr recursive?]
    (loop [a (array)]
      (let [ch (read-past whitespace? rdr)]
        (if (not ch) (reader-error rdr "EOF"))
        (if (identical? delim ch)
          a
          (let [macrofn (macros ch)]
            (if macrofn
              (let [mret (macrofn rdr ch)]
                (recur (if (identical? mret rdr)
                         a
                         (.concat a (array mret)))))
              (do
                (unread rdr ch)
                (let [o (read rdr true nil recursive?)]
                  (recur (if (identical? o rdr)
                           a
                           (.concat a (array o))))))))))))

;; data structure readers

(defn not-implemented
  [reader ch]
  (reader-error reader
                (.concat "Reader for " ch " not implemented yet")))


(declare maybe-read-tagged-type)


(defn read-dispatch
  [rdr _]
  (let [ch (read-char rdr)
        dm (dispatch-macros ch)]
    (if dm
      (dm rdr _)
      (let [obj (maybe-read-tagged-type rdr ch)]
        (if obj
          obj
          (reader-error rdr "No dispatch macro for " ch))))))

(defn read-unmatched-delimiter
  [rdr ch]
  (reader-error rdr "Unmached delimiter " ch))

(defn read-list
  [rdr _]
  (apply list (read-delimited-list ")" rdr true)))

(def read-comment skip-line)

(defn read-vector
  [rdr _]
  (read-delimited-list "]" rdr true))

(defn read-map
  [rdr _]
  (let [l (read-delimited-list "}" rdr true)]
    (if (odd? (.-length l))
      (reader-error
       rdr
       "Map literal must contain an even number of forms"))
    (apply dictionary l)))

(defn read-number
  [reader initch]
  (loop [buffer initch
         ch (read-char reader)]

    (if (or (nil? ch) (whitespace? ch) (macros ch))
      (do
        (unread reader ch)
        (def match (match-number buffer))
        (if (nil? match)
            (reader-error reader "Invalid number format [" buffer "]")
            match))
      (recur (.concat buffer ch) (read-char reader)))))

(defn read-string
  [reader _]
  (loop [buffer ""
         ch (read-char reader)]

    (cond
     (nil? ch)
      (reader-error reader "EOF while reading string")
     (identical? \\ ch)
      (recur (.concat buffer (escape-char buffer reader))
             (read-char reader))
     (identical? "\"" ch)
      buffer
     :default
      (recur (.concat buffer ch) (read-char reader)))))

(defn read-unquote
  "Reads unquote form ~form or ~(foo bar)"
  [reader _]
  (let [ch (read-char reader)]
    (if (not ch)
      (reader-error reader "EOF while reading character")
      (if (identical? ch "@")
        (list unquote-splicing (read reader true nil true))
        (do
          (unread reader ch)
          (list unquote (read reader true nil true)))))))


(defn special-symbols [t not-found]
  (cond
   (identical? t "nil") nil
   (identical? t "true") true
   (identical? t "false") false
   :else not-found))


(defn read-symbol
  [reader initch]
  (let [token (read-token reader initch)]
    (if (>= (.index-of token "/") 0)
      (symbol (.substr token 0 (.index-of token "/"))
              (.substr token (inc (.index-of token "/")) (.-length token)))
      (special-symbols token (symbol token)))))

(defn read-keyword
  [reader initch]
  (let [token (read-token reader (read-char reader))
        a (re-matches symbol-pattern token)
        token (aget a 0)
        ns (aget a 1)
        name (aget a 2)]
    (if (or
         (and (not (undefined? ns))
              (identical? (.substring ns
                                      (- (.-length ns) 2)
                                      (.-length ns)) ":/"))

         (identical? (aget name (dec (.-length name))) ":")
         (not (== (.indexOf token "::" 1) -1)))
      (reader-error reader "Invalid token: " token)
      (if (and (not (nil? ns)) (> (.-length ns) 0))
        (keyword (.substring ns 0 (.indexOf ns "/")) name)
        (keyword token)))))

(defn desugar-meta
  [f]
  (cond
   (symbol? f) (dictionary (keyword "tag") f)
   (string? f) (dictionary (keyword "tag") f)
   (keyword? f) (dictionary f true)
   :else f))

(defn wrapping-reader
  [sym]
  (fn [rdr _]
    (list sym (read rdr true nil true))))

(defn throwing-reader
  [msg]
  (fn [rdr _]
    (reader-error rdr msg)))

(defn read-meta
  [rdr _]
  (let [m (desugar-meta (read rdr true nil true))]
    (if (not (object? m))
      (reader-error
       rdr "Metadata must be Symbol, Keyword, String or Map"))
    (let [o (read rdr true nil true)]
      (if (object? o)
        (with-meta o (merge (meta o) m))
        (reader-error
         rdr "Metadata can only be applied to IWithMetas")))))

(defn read-set
  [rdr _]
  (apply list (.concat (array (symbol "set"))
                       (read-delimited-list "}" rdr true))))

(defn read-regex
  [rdr ch]
  ;; TODO: Switch to re-pattern instead
  (_re-pattern (read-string rdr ch)))

(defn read-discard
  "Discards next form"
  [rdr _]
  (read rdr true nil true)
  rdr)

(defn macros [c]
  (cond
   (identical? c "\"") read-string
   (identical? c "\:") read-keyword
   (identical? c "\;") not-implemented ;; never hit this
   (identical? c "\'") (wrapping-reader quote)
   (identical? c "\@") (wrapping-reader deref)
   (identical? c "\^") read-meta
   (identical? c "\`") (wrapping-reader syntax-quote)
   (identical? c "\~") read-unquote
   (identical? c "\(") read-list
   (identical? c "\)") read-unmatched-delimiter
   (identical? c "\[") read-vector
   (identical? c "\]") read-unmatched-delimiter
   (identical? c "\{") read-map
   (identical? c "\}") read-unmatched-delimiter
   (identical? c \\) read-char
   (identical? c "\%") not-implemented
   (identical? c "\#") read-dispatch
   :else nil))

(defn dispatch-macros [s]
  (cond
   (identical? s "{") read-set
   (identical? s "<") (throwing-reader "Unreadable form")
   (identical? s "\"") read-regex
   (identical? s "!") read-comment
   (identical? s "_") read-discard
   :else nil))

(defn read
  "Reads the first object from a PushbackReader.
  Returns the object read. If EOF, throws if eof-is-error is true.
  Otherwise returns sentinel."
  [reader eof-is-error sentinel is-recursive]
  (loop []
    (let [ch (read-char reader)]
      (cond
       (nil? ch) (if eof-is-error
                   (reader-error reader "EOF") sentinel)
       (whitespace? ch) (recur)
       (comment-prefix? ch) (read (read-comment reader ch)
                             eof-is-error
                             sentinel
                             is-recursive)
       :else (let [f (macros ch)
                   res (cond
                        f (f reader ch)
                        (number-literal? reader ch) (read-number
                                                     reader ch)
                        :else (read-symbol reader ch))]
               (if (identical? res reader)
                 (recur)
                 res))))))

(defn read-from-string
  "Reads one object from the string s"
  [s]
  (let [r (push-back-reader s)]
    (read r true nil false)))

(defn ^:private read-uuid
  [uuid]
  (if (string? uuid)
    (list (symbol "new") (symbol "UUID") uuid)
    (reader-error
     nil "UUID literal expects a string as its representation.")))

(defn ^:private read-queue
  [items]
  (if (vector? items)
    (list (symbol "new") (symbol  "PersistentQueue") items)
    (reader-error
     nil "Queue literal expects a vector for its elements.")))


(def __tag-table__
  (dictionary :uuid read-uuid
              :queue read-queue))

(defn maybe-read-tagged-type
  [rdr initch]
  (let [tag (read-symbol rdr initch)
        pfn (get __tag-table__ (name tag))]
    (if pfn
      (pfn (read rdr true nil false))
      (reader-error rdr
                    "Could not find tag parser for " (name tag)
                    " in " (pr-str (keys __tag-table__))))))



(export read read-from-string)
