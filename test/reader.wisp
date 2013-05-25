(ns wisp.test.reader
  (:require [wisp.src.ast :refer [symbol quote deref name keyword
                                  unquote meta dictionary pr-str]]
            [wisp.src.runtime :refer [dictionary nil? str =]]
            [wisp.src.reader :refer [read-from-string]]
            [wisp.src.sequence :refer [list]]))

(def read-string read-from-string)

(print "name fn")

(assert (identical? (name (read-string ":foo")) "foo")
        "name of :foo is foo")
(assert (identical? (name (read-string ":foo/bar")) "bar")
        "name of :foo/bar is bar")
(assert (identical? (name (read-string "foo")) "foo")
        "name of foo is foo")
(assert (identical? (name (read-string "foo/bar")) "bar")
        "name of foo/bar is bar")
(assert (identical? (name (read-string "\"foo\"")) "foo")
        "name of \"foo\" is foo")

(print "read simple list")

(assert (= (read-string "(foo bar)")
           '(foo bar))
        "(foo bar) -> (foo bar)")

(print "read comma is a whitespace")

(assert (= (read-string "(foo, bar)")
           '(foo bar))
        "(foo, bar) -> (foo bar)")

(print "read numbers")

(assert (= (read-string "(+ 1 2 0)")
           '(+ 1 2 0))
        "(+ 1 2 0) -> (+ 1 2 0)")

(print "read keywords")
(assert (= (read-string "(foo :bar)")
           '(foo :bar))
        "(foo :bar) -> (foo :bar)")

(print "read quoted list")
(assert (= (read-string "'(foo bar)")
           '(quote (foo bar)))
        "'(foo bar) -> (quote (foo bar))")

(print "read vector")
(assert (= (read-string "(foo [bar :baz 2])")
           '(foo [bar :baz 2]))
        "(foo [bar :baz 2]) -> (foo [bar :baz 2])")

(print "read special symbols")
(assert (= (read-string "(true false nil)")
           '(true false nil))
        "(true false nil) -> (true false nil)")

(print "read chars")
(assert (= (read-string "(\\x \\y \\z)")
           '("x" "y" "z"))
        "(\\x \\y \\z) -> (\"x\" \"y\" \"z\")")

(print "read strings")
(assert (= (read-string "(\"hello world\" \"hi \\n there\")")
           '("hello world" "hi \n there"))
        "strings are read precisely")

(print "read deref")
(assert (= (read-string "(+ @foo 2)")
           '(+ (deref foo) 2))
        "(+ @foo 2) -> (+ (deref foo) 2)")

(print "read unquote")

(assert (= (read-string "(~foo ~@bar ~(baz))")
           '((unquote foo)
             (unquote-splicing bar)
             (unquote (baz))))
        "(~foo ~@bar ~(baz)) -> ((unquote foo) (unquote-splicing bar) (unquote (baz))")


(assert (= (read-string "(~@(foo bar))")
           '((unquote-splicing (foo bar))))
        "(~@(foo bar)) -> ((unquote-splicing (foo bar)))")

(print "read function")

(assert (= (read-string "(defn List
                        \"List type\"
                        [head tail]
                        (set! this.head head)
                        (set! this.tail tail)
                        (set! this.length (+ (.-length tail) 1))
                        this)")
           '(defn List
              "List type"
               [head tail]
               (set! this.head head)
               (set! this.tail tail)
               (set! this.length (+ (.-length tail) 1))
               this))
        "function read correctly")

(print "lambda syntax")

(assert (= (read-string "#(apply sum %&)")
           '(fn [& %&] (apply sum %&))))

(assert (= (read-string "(map #(inc %) [1 2 3])")
           '(map (fn [%1] (inc %1)) [1 2 3])))

(assert (= (read-string "#(+ %1 % %& %5 %2)")
           '(fn [%1 %2 %3 %4 %5 & %&] (+ %1 %1 %& %5 %2))))

(print "read comments")
(assert (= (read-string "; comment
                         (program)")
           '(program))
        "comments are ignored")

(assert (= (read-string "(hello ;; world\n you)")
           '(hello you)))

(print "clojurescript")

(assert (= 1 (reader/read-string "1")))
(assert (= 2 (reader/read-string "#_nope 2")))
(assert (= -1 (reader/read-string "-1")))
(assert (= -1.5 (reader/read-string "-1.5")))
(assert (= [3 4] (reader/read-string "[3 4]")))
(assert (= "foo" (reader/read-string "\"foo\"")))
(assert (= ':hello (reader/read-string ":hello")))
(assert (= 'goodbye (reader/read-string "goodbye")))
(assert (= '#{1 2 3} (reader/read-string "#{1 2 3}")))
(assert (= '(7 8 9) (reader/read-string "(7 8 9)")))
(assert (= '(deref foo) (reader/read-string "@foo")))
(assert (= '(quote bar) (reader/read-string "'bar")))

;; TODO: Implement `namespace` fn and proper namespace support ?
;;(assert (= 'foo/bar (reader/read-string "foo/bar")))
;;(assert (= ':foo/bar (reader/read-string ":foo/bar")))
(assert (= \a (reader/read-string "\\a")))
(assert (= 'String
            (:tag (meta (reader/read-string "^String {:a 1}")))))
;; TODO: In quoted sets both keys and values should remain quoted
;; (assert (= [:a 'b '#{c {:d [:e :f :g]}}]
;;            (reader/read-string "[:a b #{c {:d [:e :f :g]}}]")))
(assert (= nil (reader/read-string "nil")))
(assert (= true (reader/read-string "true")))
(assert (= false (reader/read-string "false")))
(assert (= "string" (reader/read-string "\"string\"")))
(assert (= "escape chars \t \r \n \\ \" \b \f"
           (reader/read-string "\"escape chars \\t \\r \\n \\\\ \\\" \\b \\f\"")))

(print "tagged literals")


;; queue literals
(assert (= '(PersistentQueue. [])
            (reader/read-string "#queue []")))
(assert (= '(PersistentQueue. [1])
            (reader/read-string "#queue [1]")))
(assert (= '(PersistentQueue. [1 2])
            (reader/read-string "#queue [1 2]")))

;; uuid literals
(assert (= '(UUID. "550e8400-e29b-41d4-a716-446655440000")
           (reader/read-string "#uuid \"550e8400-e29b-41d4-a716-446655440000\"")))

(print "read unicode")

(let [assets
      ["اختبار" ; arabic
       "ทดสอบ" ; thai
       "こんにちは" ; japanese hiragana
       "你好" ; chinese traditional
       "אַ גוט יאָר" ; yiddish
       "cześć" ; polish
       "привет" ; russian
       "გამარჯობა" ; georgian

       ;; RTL languages skipped below because tricky to insert
       ;; ' and : at the "start"

       'ทดสอบ
       'こんにちは
       '你好
       'cześć
       'привет
       'გამარჯობა

       :ทดสอบ
       :こんにちは
       :你好
       :cześć
       :привет
       :გამარჯობა

       ;compound data
       {:привет :ru "你好" :cn}
       ]]
  (.for-each assets
             (fn [unicode]
              (let [input (pr-str unicode)
                    read (read-string input)]
                (assert (= unicode read)
                        (str "Failed to read-string \"" unicode "\" from: " input))))))

(print "unicode error cases")

; unicode error cases
(let [unicode-errors
      ["\"abc \\ua\"" ; truncated
       "\"abc \\x0z ...etc\"" ; incorrect code
       "\"abc \\u0g00 ..etc\"" ; incorrect code
       ]]
  (.for-each
   unicode-errors
   (fn [unicode-error]
     (assert
      (= :threw
         (try
           (reader/read-string unicode-error)
           :failed-to-throw
           (catch e :threw)))
      (str "Failed to throw reader error for: " unicode-error)))))
