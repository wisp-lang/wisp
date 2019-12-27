(ns wisp.test.reader
  (:require [wisp.test.util :refer [is thrown?]]
            [wisp.src.ast :refer [symbol quote deref name namespace keyword
                                  unquote meta dictionary pr-str]]
            [wisp.src.runtime :refer [dictionary nil? str =]]
            [wisp.src.reader :refer [read-from-string]]
            [wisp.src.sequence :refer [list reduce]]))

(def read-string read-from-string)


(is (identical? (name (read-string ":foo")) "foo")
    "name of :foo is foo")
(is (identical? (name (read-string ":foo/bar")) "bar")
    "name of :foo/bar is bar")
(is (identical? (namespace (read-string ":foo/bar")) "foo")
    "namespace of :foo/bar is foo")
(is (identical? (name (read-string "foo")) "foo")
    "name of foo is foo")
(is (identical? (namespace (read-string "foo")) nil)
    "namespace of foo is nil")
(is (identical? (name (read-string "foo/bar")) "bar")
    "name of foo/bar is bar")
(is (identical? (namespace (read-string "foo/bar")) "foo")
    "namespace of foo/bar is foo")
(is (= (name (read-string "\"foo\"")) "foo")
    "name of \"foo\" is foo")


(is (= (read-string "(foo bar)")
       '(foo bar))
    "(foo bar) -> (foo bar)")


(is (= (read-string "(foo, bar)")
       '(foo bar))
    "(foo, bar) -> (foo bar)")


(is (= (read-string "(+ 1 2 0)")
       '(+ 1 2 0))
    "(+ 1 2 0) -> (+ 1 2 0)")

(is (= (read-string "(foo :bar)")
       '(foo :bar))
    "(foo :bar) -> (foo :bar)")

(is (= (read-string "'(foo bar)")
       '(quote (foo bar)))
    "'(foo bar) -> (quote (foo bar))")

(is (= (read-string "(foo [bar :baz 2])")
       '(foo [bar :baz 2]))
    "(foo [bar :baz 2]) -> (foo [bar :baz 2])")


(is (= (read-string "(true false nil)")
       '(true false nil))
    "(true false nil) -> (true false nil)")

(is (= (read-string "(\\x \\y \\z)")
       '("x" "y" "z"))
    "(\\x \\y \\z) -> (\"x\" \"y\" \"z\")")

(is (= (read-string "(\"hello world\" \"hi \\n there\")")
       '("hello world" "hi \n there"))
    "strings are read precisely")

(is (= (read-string "(+ @foo 2)")
       '(+ (deref foo) 2))
    "(+ @foo 2) -> (+ (deref foo) 2)")


(is (= (read-string "(~foo ~@bar ~(baz))")
       '((unquote foo)
         (unquote-splicing bar)
         (unquote (baz))))
    "(~foo ~@bar ~(baz)) -> ((unquote foo) (unquote-splicing bar) (unquote (baz))")


(is (= (read-string "(~@(foo bar))")
       '((unquote-splicing (foo bar))))
    "(~@(foo bar)) -> ((unquote-splicing (foo bar)))")


(is (= (read-string "(defn List
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


(is (= (read-string "#(apply sum %&)")
           '(fn [& %&] (apply sum %&))))

(is (= (read-string "#(list 1 2 3)")
           '(fn [] (list 1 2 3))))

(is (= (read-string "(map #(inc %) [1 2 3])")
       '(map (fn [%1] (inc %1)) [1 2 3])))

(is (= (read-string "#(+ %1 % %& %5 %2)")
       '(fn [%1 %2 %3 %4 %5 & %&] (+ %1 %1 %& %5 %2))))

(is (= (read-string "; comment
                         (program)")
       '(program))
    "comments are ignored")

(is (= (read-string "(hello ;; world\n you)")
       '(hello you)))


(is (= (read-string "1") 1))
(is (= (read-string "#_nope 2") 2))
(is (= (read-string "-1") -1))
(is (= (read-string "-1.5") -1.5))
(is (= (read-string "[3 4]") [3 4]))
(is (= (read-string "\"foo\"") "foo"))
(is (= (read-string ":hello") ':hello))
(is (= (read-string "goodbye") 'goodbye))
(is (= (read-string "#{1 2 3}") '#{1 2 3}))
(is (= (read-string "(7 8 9)") '(7 8 9)))
(is (= (read-string "@foo") '(deref foo)))
(is (= (read-string "'bar") '(quote bar)))

;; TODO: Implement `namespace` fn and proper namespace support ?
;;(assert (= 'foo/bar (read-string "foo/bar")))
;;(assert (= ':foo/bar (read-string ":foo/bar")))
(is (= (read-string "\\a") \a))
(is (= (:tag (meta (read-string "^String {:a 1}")))
       'String))
;; TODO: In quoted sets both keys and values should remain quoted
;; (assert (= [:a 'b '#{c {:d [:e :f :g]}}]
;;            (read-string "[:a b #{c {:d [:e :f :g]}}]")))
(is (= (read-string "nil") nil))
(is (= (read-string "true") true))
(is (= (read-string "false") false))
(is (= (read-string "\"string\"") "string"))
(is (= (read-string "\"escape chars \\t \\r \\n \\\\ \\\" \\b \\f\"")
       "escape chars \t \r \n \\ \" \b \f"))


;; queue literals
(is (= (read-string "#queue []")
       '(PersistentQueue. [])))
(is (= (read-string "#queue [1]")
       '(PersistentQueue. [1])))
(is (= (read-string "#queue [1 2]")
       '(PersistentQueue. [1 2])))

;; uuid literals
(is (= (read-string "#uuid \"550e8400-e29b-41d4-a716-446655440000\"")
       '(UUID. "550e8400-e29b-41d4-a716-446655440000")))

;; date literals
(is (= (read-string "#inst \"2019-11-20T13:58:43.755Z\"")
       '(Date. "2019-11-20T13:58:43.755Z")))
(is (= (read-string "#inst \"2019-11-20T13:58:43.755-00:00\"")
       '(Date. "2019-11-20T13:58:43.755-00:00")))

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
  (reduce (fn [unicode]
            (let [input (pr-str unicode)]
              (is (= (read-string input) unicode)
                  (str "Failed to read-string \"" unicode "\" from: " input))))
          nil
          assets))


; unicode error cases
(let [unicode-errors
      ["\"abc \\ua\"" ; truncated
       "\"abc \\x0z ...etc\"" ; incorrect code
       "\"abc \\u0g00 ..etc\"" ; incorrect code
       ]]
  (reduce
   (fn [_ unicode-error]
     (is
      (= (try
           (read-string unicode-error)
           :failed-to-throw
           (catch e :threw))
         :threw)
      (str "Failed to throw reader error for: " unicode-error)))
   nil
   unicode-errors))
