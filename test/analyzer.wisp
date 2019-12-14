(ns wisp.test.analyzer
  (:require [wisp.test.util :refer [is thrown?]]
            [wisp.src.analyzer :refer [analyze]]
            [wisp.src.ast :refer [meta symbol pr-str]]
            [wisp.src.sequence :refer [first second third map list]]
            [wisp.src.runtime :refer [=]]))


;; repeating templates

(defn- *unresolved [name]
  {:op         :unresolved-binding
   :type       :unresolved-binding
   :start      nil
   :end        nil
   :identifier {:type :identifier
                :form name}})

(defn- *bound-var [name binding]
  {:op      :var
   :form    name
   :type    :identifier
   :start   nil
   :end     nil
   :binding binding})

(defn- *var [name]
  (*bound-var name (*unresolved name)))

(defn- *symbol [name]
  (*bound-var name nil))

(defn- *value [value]
  {:op   :constant
   :form value})

(defn- *binding [form depth name value]
  {:op     :binding
   :form   form
   :type   :binding
   :depth  depth
   :id     name
   :shadow (*unresolved name)
   :init   value})

(defn- *param [name depth shadow]
  {:op     :param
   :form   name
   :type   :parameter
   :id     name
   :depth  depth
   :start  nil
   :end    nil
   :shadow shadow})

(defn- *param1 [name depth shadow]
  (*param name 1 (*unresolved name)))

(defn- *id [name depth shadow]
  {:op     :var
   :form   name
   :type   :identifier
   :id     name
   :depth  depth
   :start  nil
   :end    nil
   :shadow shadow})

(defn- *id0 [name]
  (*id name 0 (*unresolved name)))

(defn- *aget [form computed target property]
  {:op       :member-expression
   :form     form
   :computed computed
   :start    nil
   :end      nil
   :target   target
   :property property})


;; tests

(is (= (analyze {} ':foo)
       (*value ':foo)))

(is (= (analyze {} "bar")
       (*value "bar")))

(is (= (analyze {} true)
       (*value true)))

(is (= (analyze {} false)
       (*value false)))

(is (= (analyze {} nil)
       (*value nil)))

(is (= (analyze {} 7)
       (*value 7)))

(is (= (analyze {} #"foo")
       (*value #"foo")))

(is (= (analyze {} 'foo)
       (*var 'foo)))

(is (= (analyze {} '[])
       {:op    :vector
        :form  '[]
        :items []}))

(is (= (analyze {} '[:foo bar "baz"])
       {:op    :vector
        :form  '[:foo bar "baz"],
        :items [(*value ':foo)
                (*var 'bar)
                (*value "baz")]}))

(is (= (analyze {} {})
       {:op     :dictionary
        :form   {}
        :keys   []
        :values []}))

(is (= (analyze {} {:foo 'bar})
       {:op     :dictionary
        :form   '{"foo" bar}      ; emitted keys are converted to strings...
        :keys   [(*value "foo")]
        :values [(*var 'bar)]}))

(is (= (analyze {} ())
       {:op    :list
        :form  '()
        :start nil
        :end   nil
        :items []}))

(is (= (analyze {} '(foo))
       {:op     :invoke
        :form   '(foo)
        :params []
        :callee (*var 'foo)}))


(is (= (analyze {} '(foo bar))
       {:op     :invoke
        :form   '(foo bar)
        :callee (*var 'foo)
        :params [(*var 'bar)]}))


(is (= (analyze {} '(aget foo 'bar))
       (*aget '(aget foo 'bar) false
              (*var 'foo) (*symbol 'bar))))


(is (= (analyze {} '(aget foo bar))
       (*aget '(aget foo bar) true
              (*var 'foo) (*var 'bar))))


(is (= (analyze {} '(aget foo "bar"))
       (*aget '(aget foo "bar") true
              (*var 'foo) (*value "bar"))))


(is (= (analyze {} '(aget foo :bar))
       (*aget '(aget foo :bar) true
              (*var 'foo) (*value ':bar))))


(is (= (analyze {} '(aget foo (bar baz)))
       (*aget '(aget foo (bar baz)) true
              (*var 'foo) {:op     :invoke
                           :form   '(bar baz)
                           :callee (*var 'bar)
                           :params [(*var 'baz)]})))

(is (= (analyze {} '(if x y))
       {:op         :if
        :form       '(if x y)
        :start      nil
        :end        nil
        :test       (*var 'x)
        :consequent (*var 'y)
        :alternate  (*value nil)}))

(is (= (analyze {} '(if (even? n) (inc n) (+ n 3)))
       {:op         :if
        :form       '(if (even? n) (inc n) (+ n 3))
        :start      nil
        :end        nil
        :test       {:op     :invoke
                     :form   '(even? n)
                     :callee (*var 'even?)
                     :params [(*var 'n)]}
        :consequent {:op     :invoke
                     :form   '(inc n)
                     :callee (*var 'inc)
                     :params [(*var 'n)]}
        :alternate  {:op     :invoke
                     :form   '(+ n 3)
                     :callee (*var '+)
                     :params [(*var 'n)
                              (*value 3)]}}))

(is (= (analyze {} '(throw error))
       {:op    :throw
        :form  '(throw error)
        :start nil
        :end   nil
        :throw (*var 'error)}))

(is (= (analyze {} '(throw (Error "boom!")))
       {:op    :throw
        :form  '(throw (Error "boom!"))
        :start nil
        :end   nil
        :throw {:op     :invoke
                :form   '(Error "boom!")
                :callee (*var 'Error)
                :params [(*value "boom!")]}}))

(is (= (analyze {} '(new Error "Boom!"))
       {:op          :new
        :form        '(new Error "Boom!")
        :start       nil
        :end         nil
        :constructor (*var 'Error)
        :params      [(*value "Boom!")]}))

(is (= (analyze {} '(try (read-string unicode-error)))
       {:op        :try
        :form      '(try (read-string unicode-error))
        :start     nil
        :end       nil
        :body      {:statements nil
                    :result     {:op     :invoke
                                 :form   '(read-string unicode-error)
                                 :callee (*var 'read-string)
                                 :params [(*var 'unicode-error)]}}
        :handler   nil
        :finalizer nil}))


(is (= (analyze {} '(try
                      (read-string unicode-error)
                      (catch error :throw)))

       {:op        :try
        :form      '(try (read-string unicode-error) (catch error :throw))
        :start     nil
        :end       nil
        :body      {:statements nil
                    :result     {:op     :invoke
                                 :form   '(read-string unicode-error)
                                 :callee (*var 'read-string)
                                 :params [(*var 'unicode-error)]}}
        :handler   {:name       (*var 'error)
                    :statements nil
                    :result     (*value ':throw)}
        :finalizer nil}))


(is (= (analyze {} '(try
                      (read-string unicode-error)
                      (finally :end)))

       {:op        :try
        :form      '(try
                      (read-string unicode-error)
                      (finally :end))
        :start     nil
        :end       nil
        :body      {:statements nil
                    :result     {:op     :invoke
                                 :form   '(read-string unicode-error)
                                 :callee (*var 'read-string)
                                 :params [(*var 'unicode-error)]}}
        :handler   nil
        :finalizer {:statements nil
                    :result     (*value ':end)}}))


(is (= (analyze {} '(try (read-string unicode-error)
                      (catch error
                        (print error)
                        :error)
                      (finally
                       (print "done")
                       :end)))

       {:op        :try
        :form      '(try
                      (read-string unicode-error)
                      (catch error (print error) :error)
                      (finally (print "done") :end))
        :start     nil
        :end       nil
        :body      {:statements nil
                    :result     {:op     :invoke
                                 :form   '(read-string unicode-error)
                                 :callee (*var 'read-string)
                                 :params [(*var 'unicode-error)]}}
        :handler   {:name       (*var 'error)
                    :statements [{:op     :invoke
                                  :form   '(console.log error)
                                  :callee (*aget '(aget console 'log) false
                                                 (*var 'console) (*symbol 'log))
                                  :params [(*var 'error)]}]
                    :result     (*value ':error)}
        :finalizer {:statements [{:op     :invoke
                                  :form   '(console.log "done")
                                  :callee (*aget '(aget console 'log) false
                                                 (*var 'console) (*symbol 'log))
                                  :params [(*value "done")]}]
                     :result    (*value ':end)}}))


(is (= (analyze {} '(set! foo bar))
       {:op     :set!
        :form   '(set! foo bar)
        :start  nil
        :end    nil
        :target (*var 'foo)
        :value  (*var 'bar)}))

(is (= (analyze {} '(set! *registry* {}))
       {:op     :set!
        :form   '(set! *registry* {})
        :start  nil
        :end    nil
        :target (*var '*registry*)
        :value  {:op     :dictionary
                 :form   {}
                 :keys   []
                 :values []}}))

(is (= (analyze {} '(set! (.-log console) print))
       {:op     :set!
        :form   '(set! (.-log console) print)
        :start  nil
        :end    nil
        :target (*aget '(aget console 'log) false
                       (*var 'console) (*symbol 'log))
        :value  (*var 'print)}))


(is (= (analyze {} '(do
                      (read content)
                      (print "read")
                      (write content)))

       {:op         :do
        :form       '(do (read content) (print "read") (write content))
        :start      nil
        :end        nil
        :statements [{:op     :invoke
                      :form   '(read content)
                      :callee (*var 'read)
                      :params [(*var 'content)]}
                     {:op     :invoke
                      :form   '(console.log "read")
                      :callee (*aget '(aget console 'log) false
                                     (*var 'console) (*symbol 'log))
                      :params [(*value "read")]}]
        :result     {:op     :invoke
                     :form   '(write content)
                     :callee (*var 'write)
                     :params [(*var 'content)]}}))


(is (= (analyze {} '(def x 1))
       {:op     :def
        :form   '(def x 1)
        :start  nil
        :end    nil
        :export nil
        :doc    nil
        :id     (*id0 'x)
        :init   (*value 1)}))

(is (= (analyze {:parent {}} '(def x 1))
       {:op     :def
        :form   '(def x 1)
        :start  nil
        :end    nil
        :export nil
        :doc    nil
        :id     (*id0 'x)
        :init   (*value 1)}))

(is (= (analyze {:parent {}} '(def x (foo bar)))
       {:op     :def
        :form   '(def x (foo bar))
        :start  nil
        :end    nil
        :export nil
        :doc    nil
        :id     (*id0 'x)
        :init   {:op     :invoke
                 :form   '(foo bar)
                 :callee (*var 'foo)
                 :params [(*var 'bar)]}}))


(is (= (analyze {} '(let* [x 1 y 2] (+ x y)))

       (let [*x (*binding '[x 1] 1
                          'x (*value 1))
             *y (*binding '[y 2] 1
                          'y (*value 2))]

         {:op         :let
          :form       '(let* [x 1, y 2] (+ x y))
          :start      nil
          :end        nil
          :bindings   [*x *y]
          :statements nil
          :result     {:op     :invoke
                       :form   '(+ x y)
                       :callee (*var '+)
                       :params [(*bound-var 'x *x)
                                (*bound-var 'y *y)]}})))


(is (= (analyze {} '(loop* [chars stream
                            result []]
                      (if (empty? chars)
                        :eof
                        (recur (rest chars)
                               (conj result (first chars))))))

       (let [*chars  (*binding '[chars stream] 1
                               'chars (*var 'stream))
             *result (*binding '[result []] 1
                               'result {:op    :vector
                                        :form  []
                                        :items []})]

         {:op         :loop
          :form       '(loop* [chars stream, result []]
                         (if (empty? chars)
                           :eof
                           (recur (rest chars)
                                  (conj result (first chars)))))
          :start      nil
          :end        nil
          :bindings   [*chars *result]
          :statements nil
          :result     {:op         :if
                       :form       '(if (empty? chars)
                                      :eof
                                      (recur (rest chars)
                                             (conj result (first chars))))
                       :start      nil
                       :end        nil
                       :test       {:op     :invoke
                                    :form   '(empty? chars)
                                    :callee (*var 'empty?)
                                    :params [(*bound-var 'chars *chars)]}
                       :consequent (*value ':eof)
                       :alternate  {:op     :recur
                                    :form   '(recur (rest chars) (conj result (first chars)))
                                    :start  nil
                                    :end    nil
                                    :params [{:op     :invoke
                                              :form   '(rest chars)
                                              :callee (*var 'rest)
                                              :params [(*bound-var 'chars *chars)]}
                                             {:op     :invoke
                                              :form   '(conj result (first chars))
                                              :callee (*var 'conj)
                                              :params [(*bound-var 'result *result)
                                                       {:op     :invoke
                                                        :form   '(first chars)
                                                        :callee (*var 'first)
                                                        :params [(*bound-var 'chars *chars)]}]}]}}})))



(is (= (analyze {} '(fn* [] x))
       {:op       :fn
        :form     '(fn* [] x)
        :type     :function
        :start    nil
        :end      nil
        :variadic nil
        :id       nil
        :methods  [{:op         :overload
                    :form       '([] x)
                    :arity      0
                    :variadic   nil
                    :params     []
                    :statements nil
                    :result     (*var 'x)}]}))

(is (= (analyze {} '(fn* foo [] x))
       {:op       :fn
        :form     '(fn* foo [] x)
        :type     :function
        :start    nil
        :end      nil
        :variadic nil
        :id       (*id0 'foo)
        :methods  [{:op         :overload
                    :form       '([] x)
                    :arity      0
                    :variadic   nil
                    :params     []
                    :statements nil
                    :result     (*var 'x)}]}))

(is (= (analyze {} '(fn* foo [a] x))
       {:op       :fn
        :form     '(fn* foo [a] x)
        :type     :function
        :start    nil
        :end      nil
        :variadic nil
        :id       (*id0 'foo)
        :methods  [{:op         :overload
                    :form       '([a] x)
                    :arity      1
                    :variadic   nil
                    :params     [(*param1 'a)]
                    :statements nil
                    :result     (*var 'x)}]}))

(is (= (analyze {} '(fn* ([] x)))
       {:op       :fn
        :form     '(fn* ([] x))
        :type     :function
        :start    nil
        :end      nil
        :variadic nil
        :id       nil
        :methods  [{:op         :overload
                    :form       '([] x)
                    :arity      0
                    :variadic   nil
                    :params     []
                    :statements nil
                    :result     (*var 'x)}]}))

(is (= (analyze {} '(fn* [& args] x))
       {:op       :fn
        :form     '(fn* [& args] x)
        :type     :function
        :start    nil
        :end      nil
        :variadic true
        :id       nil
        :methods  [{:op         :overload
                    :form       '([& args] x)
                    :arity      0
                    :variadic   true
                    :params     [(*param1 'args)]
                    :statements nil
                    :result     (*var 'x)}]}))

(is (= (analyze {} '(fn* ([] 0) ([x] x)))
       {:op       :fn
        :form     '(fn* ([] 0) ([x] x))
        :type     :function
        :start    nil
        :end      nil
        :variadic nil
        :id       nil
        :methods  [{:op         :overload
                    :form       '([] 0)
                    :arity      0
                    :variadic   nil
                    :params     []
                    :statements nil
                    :result     (*value 0)}
                   {:op         :overload
                    :form       '([x] x)
                    :arity      1
                    :variadic   nil
                    :params     [(*param1 'x)]
                    :statements nil
                    :result     (*bound-var 'x (*param1 'x))}]}))


(is (= (analyze {} '(fn* ([] 0) ([x] x) ([x & nums] :etc)))
       {:op       :fn
        :form     '(fn* ([] 0) ([x] x) ([x & nums] :etc))
        :type     :function
        :start    nil
        :end      nil
        :variadic true
        :id       nil
        :methods  [{:op         :overload
                    :form       '([] 0)
                    :arity      0
                    :variadic   nil
                    :params     []
                    :statements nil
                    :result     (*value 0)}
                   {:op         :overload
                    :form       '([x] x)
                    :arity      1
                    :variadic   nil
                    :params     [(*param1 'x)]
                    :statements nil
                    :result     (*bound-var 'x (*param1 'x))}
                   {:op         :overload
                    :form       '([x & nums] :etc)
                    :arity      1
                    :variadic   true
                    :params     [(*param1 'x)
                                 (*param1 'nums)]
                    :statements nil
                    :result     (*value ':etc)}]}))


(is (= (analyze {} '(ns foo.bar
                      "hello world"
                      (:require [my.lib :refer [foo bar]]
                                [foo.baz :refer [a] :rename {a b}])))
       {:op      :ns
        :form    '(ns foo.bar
                    "hello world"
                    (:require [my.lib :refer [foo bar]]
                              [foo.baz :refer [a] :rename {a b}]))
        :name    'foo.bar
        :doc     "hello world"
        :start   nil
        :end     nil
        :require [{:op    :require
                   :form  '[my.lib :refer [foo bar]]
                   :ns    'my.lib
                   :alias nil
                   :refer [{:op     :refer
                            :form   'foo
                            :ns     'my.lib
                            :name   'foo
                            :rename nil}
                           {:op     :refer
                            :form   'bar
                            :ns     'my.lib
                            :name   'bar
                            :rename nil}]}
                  {:op    :require
                   :form  '[foo.baz :refer [a] :rename {a b}]
                   :ns    'foo.baz
                   :alias nil
                   :refer [{:op     :refer
                            :form   'a
                            :ns     'foo.baz
                            :name   'a
                            :rename 'b}]}]}))


(is (= (analyze {} '(ns foo.bar
                      "hello world"
                      (:require lib.a
                                [lib.b]
                                [lib.c :as c]
                                [lib.d :refer [foo bar]]
                                [lib.e :refer [beep baz] :as e]
                                [lib.f :refer [faz] :rename {faz saz}]
                                [lib.g :refer [beer] :rename {beer coffee} :as booze])))
       {:op      :ns
        :form    '(ns foo.bar "hello world"
                    (:require lib.a
                              [lib.b]
                              [lib.c :as c]
                              [lib.d :refer [foo bar]]
                              [lib.e :refer [beep baz] :as e]
                              [lib.f :refer [faz] :rename {faz saz}]
                              [lib.g :refer [beer] :rename {beer coffee} :as booze]))
        :name    'foo.bar
        :doc     "hello world"
        :start   nil
        :end     nil
        :require [{:op    :require
                   :form  'lib.a
                   :ns    'lib.a
                   :alias nil
                   :refer nil}
                  {:op    :require
                   :form  '[lib.b]
                   :ns    'lib.b
                   :alias nil
                   :refer nil}
                  {:op    :require
                   :form  '[lib.c :as c]
                   :ns    'lib.c
                   :alias 'c
                   :refer nil}
                  {:op    :require
                   :form  '[lib.d :refer [foo bar]]
                   :ns    'lib.d
                   :alias nil
                   :refer [{:op     :refer
                            :form   'foo
                            :ns     'lib.d
                            :name   'foo
                            :rename nil}
                           {:op     :refer
                            :form   'bar
                            :ns     'lib.d
                            :name   'bar
                            :rename nil}]}
                  {:op    :require
                   :form  '[lib.e :refer [beep baz] :as e]
                   :ns    'lib.e
                   :alias 'e
                   :refer [{:op     :refer
                            :form   'beep
                            :ns     'lib.e
                            :name   'beep
                            :rename nil}
                           {:op     :refer
                            :form   'baz
                            :ns     'lib.e
                            :name   'baz
                            :rename nil}]}
                  {:op    :require
                   :form  '[lib.f :refer [faz] :rename {faz saz}]
                   :ns    'lib.f
                   :alias nil
                   :refer [{:op     :refer
                            :form   'faz
                            :ns     'lib.f
                            :name   'faz
                            :rename 'saz}]}
                  {:op    :require
                   :form  '[lib.g :refer [beer] :rename {beer coffee} :as booze]
                   :ns    'lib.g
                   :alias 'booze
                   :refer [{:op     :refer
                            :form   'beer
                            :ns     'lib.g
                            :name   'beer
                            :rename 'coffee}]}]}))
