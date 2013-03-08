(import [list list? count empty? first second third rest map vec
         cons conj rest concat last butlast sort] "./sequence")
(import [odd? dictionary keys nil? inc dec vector? string? object? dictionary?
         re-pattern re-matches re-find str subs char vals = ==] "./runtime")
(import [symbol? symbol keyword? keyword meta with-meta name] "./ast")
(import [split join] "./string")

(defn PushbackReader
  "StringPushbackReader"
  [source uri index buffer]
  (set! this.source source)
  (set! this.uri uri)
  (set! this.index-atom index)
  (set! this.buffer-atom buffer)
  (set! this.column-atom 1)
  (set! this.line-atom 1)
  this)


(defn push-back-reader
  "Creates a StringPushbackReader from a given string"
  [source uri]
  (new PushbackReader source uri 0 ""))

(defn line
  "Return current line of the reader"
  [reader]
  (.-line-atom reader))

(defn column
  "Return current column of the reader"
  [reader]
  (.-column-atom reader))

(defn peek-char
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
  ;; Update line column depending on what has being read.
  (if (identical? (peek-char reader) "\n")
    (do (set! reader.line-atom (+ (line reader) 1))
        (set! reader.column-atom 1))
    (set! reader.column-atom (+ (column reader) 1)))

  (if (empty? reader.buffer-atom)
    (let [index reader.index-atom]
      (set! reader.index-atom (+ index 1))
      (aget reader.source index))
    (let [buffer reader.buffer-atom]
      (set! reader.buffer-atom (subs buffer 1))
      (aget buffer 0))))

(defn unread-char
  "Push back a single character on to the stream"
  [reader ch]
  (if ch
    (do
      (if (identical? ch "\n")
        (set! reader.line-atom (- reader.line-atom 1))
        (set! reader.column-atom (- reader.column-atom 1)))
      (set! reader.buffer-atom (str ch reader.buffer-atom)))))


;; Predicates

(defn ^boolean breaking-whitespace?
 "Checks if a string is all breaking whitespace."
 [ch]
 (or (identical? ch " ")
     (identical? ch "\t")
     (identical? ch "\n")
     (identical? ch "\r")))

(defn ^boolean whitespace?
  "Checks whether a given character is whitespace"
  [ch]
  (or (breaking-whitespace? ch) (identical? "," ch)))

(defn ^boolean numeric?
 "Checks whether a given character is numeric"
 [ch]
 (or (identical? ch \0)
     (identical? ch \1)
     (identical? ch \2)
     (identical? ch \3)
     (identical? ch \4)
     (identical? ch \5)
     (identical? ch \6)
     (identical? ch \7)
     (identical? ch \8)
     (identical? ch \9)))

(defn ^boolean comment-prefix?
  "Checks whether the character begins a comment."
  [ch]
  (identical? ";" ch))


(defn ^boolean number-literal?
  "Checks whether the reader is at the start of a number literal"
  [reader initch]
  (or (numeric? initch)
      (and (or (identical? \+ initch)
               (identical? \- initch))
           (numeric? (peek-char reader)))))



;; read helpers

(defn reader-error
  [reader message]
  (let [error (SyntaxError (str message
               "\n" "line:" (line reader)
               "\n" "column:" (column reader)))]
    (set! error.line (line reader))
    (set! error.column (column reader))
    (set! error.uri (get reader :uri))
    (throw error)))

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
      (do (unread-char reader ch) buffer)
      (recur (str buffer ch)
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

;; Note: Input begin and end matchers are used in a pattern since otherwise
;; anything begininng with `0` will match just `0` cause it's listed first.
(def int-pattern (re-pattern "^([-+]?)(?:(0)|([1-9][0-9]*)|0[xX]([0-9A-Fa-f]+)|0([0-7]+)|([1-9][0-9]?)[rR]([0-9A-Za-z]+)|0[0-9]+)(N)?$"))
(def ratio-pattern (re-pattern "([-+]?[0-9]+)/([0-9]+)"))
(def float-pattern (re-pattern "([-+]?[0-9]+(\\.[0-9]*)?([eE][-+]?[0-9]+)?)(M)?"))

(defn match-int
  [s]
  (let [groups (re-find int-pattern s)
        group3 (aget groups 2)]
    (if (not (or (nil? group3)
                 (< (count group3) 1)))
      0
      (let [negate (if (identical? "-" (aget groups 1)) -1 1)
            a (cond
               (aget groups 3) [(aget groups 3) 10]
               (aget groups 4) [(aget groups 4) 16]
               (aget groups 5) [(aget groups 5) 8]
               (aget groups 7) [(aget groups 7) (parse-int (aget groups 7))]
               :default [nil nil])
            n (aget a 0)
            radix (aget a 1)]
        (if (nil? n)
          nil
          (* negate (parse-int n radix)))))))

(defn match-ratio
  [s]
  (let [groups (re-find ratio-pattern s)
        numinator (aget groups 1)
        denominator (aget groups 2)]
    (/ (parse-int numinator) (parse-int denominator))))

(defn match-float
  [s]
  (parse-float s))


(defn match-number
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
  (str (read-char reader)
       (read-char reader)))

(defn read-4-chars [reader]
  (str (read-char reader)
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


(defn make-unicode-char
  [code-str base]
  (let [base (or base 16)
        code (parseInt code-str base)]
    (char code)))

(defn escape-char
  "escape char"
  [buffer reader]
  (let [ch (read-char reader)
        mapresult (escape-char-map ch)]
    (if mapresult
      mapresult
      (cond
        (identical? ch \x) (make-unicode-char
                            (validate-unicode-escape unicode-2-pattern
                                                     reader
                                                     ch
                                                     (read-2-chars reader)))
        (identical? ch \u) (make-unicode-char
                            (validate-unicode-escape unicode-4-pattern
                                                     reader
                                                     ch
                                                     (read-4-chars reader)))
        (numeric? ch) (char ch)
        :else (reader-error reader
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
  [delim reader recursive?]
  (loop [a []]
    (let [ch (read-past whitespace? reader)]
      (if (not ch) (reader-error reader "EOF"))
      (if (identical? delim ch)
        a
        (let [macrofn (macros ch)]
          (if macrofn
            (let [mret (macrofn reader ch)]
              (recur (if (identical? mret reader)
                       a
                       (conj a mret))))
            (do
              (unread-char reader ch)
              (let [o (read reader true nil recursive?)]
                (recur (if (identical? o reader)
                         a
                         (conj a o)))))))))))

;; data structure readers

(defn not-implemented
  [reader ch]
  (reader-error reader (str "Reader for " ch " not implemented yet")))


(defn read-dispatch
  [reader _]
  (let [ch (read-char reader)
        dm (dispatch-macros ch)]
    (if dm
      (dm reader _)
      (let [object (maybe-read-tagged-type reader ch)]
        (if object
          object
          (reader-error reader "No dispatch macro for " ch))))))

(defn read-unmatched-delimiter
  [rdr ch]
  (reader-error rdr "Unmached delimiter " ch))

(defn read-list
  [reader _]
  (let [line-number (line reader)
        column-number (column reader)
        items (read-delimited-list ")" reader true)]
    (with-meta (apply list items) {:line line-number :column column-number })))

(def read-comment skip-line)

(defn read-vector
  [reader]
  (let [line-number (line reader)
        column-number (column reader)
        items (read-delimited-list "]" reader true)]
    (with-meta items {:line line-number :column column-number })))

(defn read-map
  [reader]
  (let [line-number (line reader)
        column-number (column reader)
        items (read-delimited-list "}" reader true)]
    (if (odd? (count items))
      (reader-error reader "Map literal must contain an even number of forms")
      (with-meta (apply dictionary items)
                 {:line line-number :column column-number}))))

(defn read-set
  [reader _]
  (let [line-number (line reader)
        column-number (column reader)
        items (read-delimited-list "}" reader true)]
    (with-meta (concat ['set] items)
               {:line line-number :column column-number })))

(defn read-number
  [reader initch]
  (loop [buffer initch
         ch (read-char reader)]

    (if (or (nil? ch)
            (whitespace? ch)
            (macros ch))
      (do
        (unread-char reader ch)
        (def match (match-number buffer))
        (if (nil? match)
            (reader-error reader "Invalid number format [" buffer "]")
            match))
      (recur (str buffer ch)
             (read-char reader)))))

(defn read-string
  [reader]
  (loop [buffer ""
         ch (read-char reader)]

    (cond
     (nil? ch) (reader-error reader "EOF while reading string")
     (identical? \\ ch) (recur (str buffer (escape-char buffer reader))
                               (read-char reader))
     (identical? "\"" ch) buffer
     :default (recur (str buffer ch) (read-char reader)))))

(defn read-unquote
  "Reads unquote form ~form or ~(foo bar)"
  [reader]
  (let [ch (read-char reader)]
    (if (not ch)
      (reader-error reader "EOF while reading character")
      (if (identical? ch "@")
        (list 'unquote-splicing (read reader true nil true))
        (do
          (unread-char reader ch)
          (list 'unquote (read reader true nil true)))))))


(defn special-symbols [text not-found]
  (cond
   (identical? text "nil") nil
   (identical? text "true") true
   (identical? text "false") false
   :else not-found))


(defn read-symbol
  [reader initch]
  (let [token (read-token reader initch)
        parts (split token "/")
        has-ns (and (> (count parts) 1)
                    ;; Make sure it's not just `/`
                    (> (count token) 1))
        ns (first parts)
        name (join "/" (rest parts))]
    (if has-ns
      (symbol ns name)
      (special-symbols token (symbol token)))))

(defn read-keyword
  [reader initch]
  (let [token (read-token reader (read-char reader))
        parts (split token "/")
        name (last parts)
        ns (if (> (count parts) 1) (join "/" (butlast parts)))
        issue (cond
               (identical? (last ns) \:) "namespace can't ends with \":\""
               (identical? (last name) \:) "name can't end with \":\""
               (identical? (last name) \/) "name can't end with \"/\""
               (> (count (split token "::")) 1) "name can't contain \"::\"")]
    (if issue
      (reader-error reader "Invalid token (" issue "): " token)
      (if (and (not ns) (identical? (first name) \:))
        (keyword ;*ns-sym*
          (rest name)) ;; namespaced keyword using default
        (keyword ns name)))))

(defn desugar-meta
  [f]
  (cond
   (symbol? f) {:tag f}
   (string? f) {:tag f}
   (keyword? f) (dictionary (name f) true)
   :else f))

(defn wrapping-reader
  [prefix]
  (fn [reader]
    (list prefix (read reader true nil true))))

(defn throwing-reader
  [msg]
  (fn [reader]
    (reader-error reader msg)))

(defn read-meta
  [reader _]
  (let [line-number (line reader)
        column-number (line column)
        metadata (desugar-meta (read reader true nil true))]
    (if (not (object? metadata))
      (reader-error reader "Metadata must be Symbol, Keyword, String or Map"))
    (let [form (read reader true nil true)]
      (if (object? form)
        (with-meta form (conj metadata
                              (meta form)
                              {:line line-number :column column-number}))
        ;(reader-error
        ; reader "Metadata can only be applied to IWithMetas")

        form ; For now we don't throw errors as we can't apply metadata to
             ; symbols, so we just ignore it.
        ))))

(defn read-regex
  [reader]
  (loop [buffer ""
         ch (read-char reader)]

    (cond
     (nil? ch) (reader-error reader "EOF while reading string")
     (identical? \\ ch) (recur (str buffer ch (read-char reader))
                               (read-char reader))
     (identical? "\"" ch) (re-pattern buffer)
     :default (recur (str buffer ch) (read-char reader)))))

(defn read-param
  [reader initch]
  (let [form (read-symbol reader initch)]
    (if (= form (symbol "%")) (symbol "%1") form)))

(defn param? [form]
  (and (symbol? form) (identical? \% (first (name form)))))

(defn lambda-params-hash [form]
  (cond (param? form) (dictionary form form)
        (or (dictionary? form)
            (vector? form)
            (list? form)) (apply conj
                                 (map lambda-params-hash (vec form)))
        :else {}))

(defn lambda-params [body]
  (let [names (sort (vals (lambda-params-hash body)))
        variadic (= (first names) (symbol "%&"))
        n (if (and variadic (== (count names) 1))
              0
              (parseInt (rest (name (last names)))))
        params (loop [names []
                      i 1]
                (if (<= i n)
                  (recur (conj names (symbol (str "%" i))) (inc i))
                  names))]
    (if variadic (conj params '& '%&) names)))

(defn read-lambda
  [reader]
   (let [body (read-list reader)]
    (list 'fn (lambda-params body) body)))

(defn read-discard
  "Discards next form"
  [reader _]
  (read reader true nil true)
  reader)

(defn macros [c]
  (cond
   (identical? c "\"") read-string
   (identical? c \:) read-keyword
   (identical? c ";") read-comment
   (identical? c \') (wrapping-reader 'quote)
   (identical? c \@) (wrapping-reader 'deref)
   (identical? c \^) read-meta
   (identical? c \`) (wrapping-reader 'syntax-quote)
   (identical? c \~) read-unquote
   (identical? c \() read-list
   (identical? c \)) read-unmatched-delimiter
   (identical? c \[) read-vector
   (identical? c \]) read-unmatched-delimiter
   (identical? c \{) read-map
   (identical? c \}) read-unmatched-delimiter
   (identical? c \\) read-char
   (identical? c \%) read-param
   (identical? c \#) read-dispatch
   :else nil))


(defn dispatch-macros [s]
  (cond
   (identical? s \{) read-set
   (identical? s \() read-lambda
   (identical? s \<) (throwing-reader "Unreadable form")
   (identical? s "\"") read-regex
   (identical? s \!) read-comment
   (identical? s \_) read-discard
   :else nil))

(defn read
  "Reads the first object from a PushbackReader.
  Returns the object read. If EOF, throws if eof-is-error is true.
  Otherwise returns sentinel."
  [reader eof-is-error sentinel is-recursive]
  (loop []
    (let [ch (read-char reader)]
      (cond
       (nil? ch) (if eof-is-error (reader-error reader "EOF") sentinel)
       (whitespace? ch) (recur)
       (comment-prefix? ch) (read (read-comment reader ch)
                                  eof-is-error
                                  sentinel
                                  is-recursive)
       :else (let [f (macros ch)
                   form (cond
                        f (f reader ch)
                        (number-literal? reader ch) (read-number reader ch)
                        :else (read-symbol reader ch))]
               (if (identical? form reader)
                 (recur)
                 form))))))

(defn read-from-string
  "Reads one object from the string s"
  [source uri]
  (let [reader (push-back-reader source uri)]
    (read reader true nil false)))

(defn ^:private read-uuid
  [uuid]
  (if (string? uuid)
    `(UUID. ~uuid)
    (reader-error
     nil "UUID literal expects a string as its representation.")))

(defn ^:private read-queue
  [items]
  (if (vector? items)
    `(PersistentQueue. ~items)
    (reader-error
     nil "Queue literal expects a vector for its elements.")))


(def **tag-table**
  (dictionary :uuid read-uuid
              :queue read-queue))

(defn maybe-read-tagged-type
  [reader initch]
  (let [tag (read-symbol reader initch)
        pfn (get **tag-table** (name tag))]
    (if pfn
      (pfn (read reader true nil false))
      (reader-error reader
                    (str "Could not find tag parser for "
                         (name tag)
                         " in "
                         (str (keys **tag-table**)))))))



(export read read-from-string push-back-reader)
