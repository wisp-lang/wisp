(ns wisp.test.analyzer
  (:require [wisp.test.util :refer [is thrown?]]
            [wisp.src.analyzer :refer [analyze]]
            [wisp.src.ast :refer [meta symbol pr-str]]
            [wisp.src.sequence :refer [first second third map list]]
            [wisp.src.runtime :refer [=]]))


(is (= (analyze {} ':foo)
       {:op :constant
        :env {}
        :form ':foo}))

(is (= (analyze {} "bar")
       {:op :constant
        :env {}
        :form "bar"}))

(is (= (analyze {} true)
       {:op :constant
        :env {}
        :form true}))

(is (= (analyze {} false)
       {:op :constant
        :env {}
        :form false}))

(is (= (analyze {} nil)
       {:op :constant
        :env {}
        :form nil}))

(is (= (analyze {} 7)
       {:op :constant
        :env {}
        :form 7}))

(is (= (analyze {} #"foo")
       {:op :constant
        :env {}
        :form #"foo"}))

(is (= (analyze {} 'foo)
       {:op :var
        :env {}
        :form 'foo
        :info nil}))

(is (= (analyze {} '[])
       {:op :vector
        :env {}
        :form '[]
        :items []}))

(is (= (analyze {} '[:foo bar "baz"])
       {:op :vector
        :env {}
        :form '[:foo bar "baz"]
        :items [{:op :constant
                 :env {}
                 :form ':foo}
                {:op :var
                 :env {}
                 :form 'bar
                 :info nil}
                {:op :constant
                 :env {}
                 :form "baz"
                 }]}))

(is (= (analyze {} {})
       {:op :dictionary
        :env {}
        :form {}
        :hash? true
        :keys []
        :values []}))

(is (= {:op :dictionary
        :keys [{:op :constant
                :env {}
                :form "foo"}]
        :values [{:op :var
                  :env {}
                  :form 'bar
                  :info nil}]
        :hash? true
        :env {}
        :form {:foo 'bar}}
       (analyze {} {:foo 'bar})))

(is (= (analyze {} ())
       {:op :constant
        :env {}
        :form ()}))

(is (= (analyze {} '(foo))
       {:op :invoke
        :callee {:op :var
                 :env {}
                 :form 'foo
                 :info nil}
        :params []
        :tag nil
        :form '(foo)
        :env {}}))


(is (= (analyze {} '(foo bar))
       {:op :invoke
        :callee {:op :var
                 :env {}
                 :form 'foo
                 :info nil}
        :params [{:op :var
                  :env {}
                  :form 'bar
                  :info nil}]
        :tag nil
        :form '(foo bar)
        :env {}}))

(is (= (analyze {} '(aget foo 'bar))
       {:op :member-expression
        :computed false
        :env {}
        :form '(aget foo 'bar)
        :target {:op :var
                 :env {}
                 :form 'foo
                 :info nil}
        :property {:op :var
                   :env {}
                   :form 'bar
                   :info nil}}))

(is (= (analyze {} '(aget foo bar))
       {:op :member-expression
        :computed true
        :env {}
        :form '(aget foo bar)
        :target {:op :var
                 :env {}
                 :form 'foo
                 :info nil}
        :property {:op :var
                   :env {}
                   :form 'bar
                   :info nil}}))

(is (= (analyze {} '(aget foo "bar"))
       {:op :member-expression
        :env {}
        :form '(aget foo "bar")
        :computed true
        :target {:op :var
                 :env {}
                 :form 'foo
                 :info nil}
        :property {:op :constant
                   :env {}
                   :form "bar"}}))

(is (= (analyze {} '(aget foo :bar))
       {:op :member-expression
        :computed true
        :env {}
        :form '(aget foo :bar)
        :target {:op :var
                 :env {}
                 :form 'foo
                 :info nil}
        :property {:op :constant
                   :env {}
                   :form ':bar}}))


(is (= (analyze {} '(aget foo (beep bar)))
       {:op :member-expression
        :env {}
        :form '(aget foo (beep bar))
        :computed true
        :target {:op :var
                 :env {}
                 :form 'foo
                 :info nil}
        :property {:op :invoke
                   :env {}
                   :form '(beep bar)
                   :tag nil
                   :callee {:op :var
                            :form 'beep
                            :env {}
                            :info nil}
                   :params [{:op :var
                             :form 'bar
                             :env {}
                             :info nil}]}}))


(is (= (analyze {} '(if x y))
       {:op :if
        :env {}
        :form '(if x y)
        :test {:op :var
               :env {}
               :form 'x
               :info nil}
        :consequent {:op :var
                     :env {}
                     :form 'y
                     :info nil}
        :alternate {:op :constant
                    :env {}
                    :form nil}}))

(is (= (analyze {} '(if (even? n) (inc n) (+ n 3)))
       {:op :if
        :env {}
        :form '(if (even? n) (inc n) (+ n 3))
        :test {:op :invoke
               :env {}
               :form '(even? n)
               :tag nil
               :callee {:op :var
                        :env {}
                        :form 'even?
                        :info nil}
               :params [{:op :var
                         :env {}
                         :form 'n
                         :info nil}]}
        :consequent {:op :invoke
                     :env {}
                     :form '(inc n)
                     :tag nil
                     :callee {:op :var
                              :env {}
                              :form 'inc
                              :info nil}
                     :params [{:op :var
                               :env {}
                               :form 'n
                               :info nil}]}
        :alternate {:op :invoke
                    :env {}
                    :form '(+ n 3)
                    :tag nil
                    :callee {:op :var
                             :env {}
                             :form '+
                             :info nil}
                    :params [{:op :var
                              :env {}
                              :form 'n
                              :info nil}
                             {:op :constant
                              :env {}
                              :form 3}]}}))

(is (= (analyze {} '(throw error))
       {:op :throw
        :env {}
        :form '(throw error)
        :throw {:op :var
                :env {}
                :form 'error
                :info nil}}))

(is (= (analyze {} '(throw (Error "boom!")))
       {:op :throw
        :env {}
        :form '(throw (Error "boom!"))
        :throw {:op :invoke
                :tag nil
                :env {}
                :form '(Error "boom!")
                :callee {:op :var
                         :env {}
                         :form 'Error
                         :info nil}
                :params [{:op :constant
                          :env {}
                          :form "boom!"}]}}))

(is (= (analyze {} '(new Error "Boom!"))
       {:op :new
        :env {}
        :form '(new Error "Boom!")
        :constructor {:op :var
                      :env {}
                      :form 'Error
                      :info nil}
        :params [{:op :constant
                  :env {}
                  :form "Boom!"}]}))

(is (= (analyze {} '(try (read-string unicode-error)))
       {:op :try
        :env {}
        :form '(try (read-string unicode-error))
        :body {:env {}
               :statements nil
               :result {:op :invoke
                        :env {}
                        :form '(read-string unicode-error)
                        :tag nil
                        :callee {:op :var
                                 :env {}
                                 :form 'read-string
                                 :info nil}
                        :params [{:op :var
                                  :env {}
                                  :form 'unicode-error
                                  :info nil}]}}
        :handler nil
        :finalizer nil}))

(is (= (analyze {} '(try
                      (read-string unicode-error)
                      (catch error :throw)))

       {:op :try
        :env {}
        :form '(try
                 (read-string unicode-error)
                 (catch error :throw))
        :body {:env {}
               :statements nil
               :result {:op :invoke
                        :env {}
                        :form '(read-string unicode-error)
                        :tag nil
                        :callee {:op :var
                                 :env {}
                                 :form 'read-string
                                 :info nil}
                        :params [{:op :var
                                  :env {}
                                  :form 'unicode-error
                                  :info nil}]}}
        :handler {:env {}
                  :name {:op :var
                         :env {}
                         :form 'error
                         :info nil}
                  :statements nil
                  :result {:op :constant
                           :env {}
                           :form ':throw}}
        :finalizer nil}))

(is (= (analyze {} '(try
                      (read-string unicode-error)
                      (finally :end)))

       {:op :try
        :env {}
        :form '(try
                 (read-string unicode-error)
                 (finally :end))
        :body {:env {}
               :statements nil
               :result {:op :invoke
                        :env {}
                        :form '(read-string unicode-error)
                        :tag nil
                        :callee {:op :var
                                 :env {}
                                 :form 'read-string
                                 :info nil}
                        :params [{:op :var
                                  :env {}
                                  :form 'unicode-error
                                  :info nil}]}}
        :handler nil
        :finalizer {:env {}
                    :statements nil
                    :result {:op :constant
                             :env {}
                             :form ':end}}}))


(is (= (analyze {} '(try (read-string unicode-error)
                      (catch error
                        (print error)
                        :error)
                      (finally
                       (print "done")
                       :end)))
       {:op :try
        :env {}
        :form '(try (read-string unicode-error)
                 (catch error
                   (print error)
                   :error)
                 (finally
                  (print "done")
                  :end))
        :body {:env {}
               :statements nil
               :result {:op :invoke
                        :env {}
                        :form '(read-string unicode-error)
                        :tag nil
                        :callee {:op :var
                                 :env {}
                                 :form 'read-string
                                 :info nil}
                        :params [{:op :var
                                  :env {}
                                  :form 'unicode-error
                                  :info nil}]}}
        :handler {:env {}
                  :name {:op :var
                         :env {}
                         :form 'error
                         :info nil}
                  :statements [{:op :invoke
                                :env {}
                                :form '((aget console 'log) error)
                                :tag nil
                                :callee {:op :member-expression
                                         :computed false
                                         :env {}
                                         :form '(aget console 'log)
                                         :target {:op :var
                                                  :env {}
                                                  :form 'console
                                                  :info nil}
                                         :property {:op :var
                                                    :env {}
                                                    :form 'log
                                                    :info nil}}
                                :params [{:op :var
                                          :env {}
                                          :form 'error
                                          :info nil}]}]
                  :result {:op :constant
                           :form ':error
                           :env {}}}
        :finalizer {:env {}
                    :statements [{:op :invoke
                                  :env {}
                                  :form '((aget console 'log) "done")
                                  :tag nil
                                  :callee {:op :member-expression
                                           :computed false
                                           :env {}
                                           :form '(aget console 'log)
                                           :target {:op :var
                                                    :env {}

                                                    :form 'console
                                                    :info nil}
                                           :property {:op :var
                                                      :env {}
                                                      :form 'log
                                                      :info nil}}
                                  :params [{:op :constant
                                            :env {}
                                            :form "done"}]}]
                    :result {:op :constant
                             :form ':end
                             :env {}}}}))


(is (= (analyze {} '(set! foo bar))
       {:op :set!
        :target {:op :var
                 :env {}
                 :form 'foo
                 :info nil}
        :value {:op :var
                :env {}
                :form 'bar
                :info nil}
        :form '(set! foo bar)
        :env {}}))

(is (= (analyze {} '(set! *registry* {}))
       {:op :set!
        :target {:op :var
                 :env {}
                 :form '*registry*
                 :info nil}
        :value {:op :dictionary
                :env {}
                :form {}
                :keys []
                :values []
                :hash? true}
        :form '(set! *registry* {})
        :env {}}))

(is (= (analyze {} '(set! (.-log console) print))
       {:op :set!
        :target {:op :member-expression
                 :env {}
                 :form '(aget console 'log)
                 :computed false
                 :target {:op :var
                          :env {}
                          :form 'console
                          :info nil}
                 :property {:op :var
                            :env {}
                            :form 'log
                            :info nil}}
        :value {:op :var
                :env {}
                :form 'print
                :info nil}
        :form '(set! (.-log console) print)
        :env {}}))

(is (= (analyze {} '(do
                      (read content)
                      (print "read")
                      (write content)))
       {:op :do
        :env {}
        :form '(do
                 (read content)
                 (print "read")
                 (write content))
        :statements [{:op :invoke
                      :env {}
                      :form '(read content)
                      :tag nil
                      :callee {:op :var
                               :env {}
                               :form 'read
                               :info nil}
                      :params [{:op :var
                                :env {}
                                :form 'content
                                :info nil}]}
                     {:op :invoke
                      :env {}
                      :form '((aget console 'log) "read")
                      :tag nil
                      :callee {:op :member-expression
                               :computed false
                               :env {}
                               :form '(aget console 'log)
                               :target {:op :var
                                        :env {}

                                        :form 'console
                                        :info nil}
                               :property {:op :var
                                          :env {}
                                          :form 'log
                                          :info nil}}
                      :params [{:op :constant
                                :env {}
                                :form "read"}]}]
        :result {:op :invoke
                 :env {}
                 :form '(write content)
                 :tag nil
                 :callee {:op :var
                          :env {}
                          :form 'write
                          :info nil}
                 :params [{:op :var
                           :env {}
                           :form 'content
                           :info nil}]}}))

(is (= (analyze {} '(def x 1))
       {:op :def
        :env {}
        :form '(def x 1)
        :doc nil
        :var {:op :var
              :env {}
              :form 'x
              :info nil}
        :init {:op :constant
               :env {}
               :form 1}
        :tag nil
        :dinamyc nil
        :export false}))

(is (= (analyze {:parent {}} '(def x 1))
       {:op :def
        :env {:parent {}}
        :form '(def x 1)
        :doc nil
        :var {:op :var
              :env {:parent {}}
              :form 'x
              :info nil}
        :init {:op :constant
               :env {:parent {}}
               :form 1}
        :tag nil
        :dinamyc nil
        :export true}))

(is (= (analyze {:parent {}} '(def x (foo bar)))
       {:op :def
        :env {:parent {}}
        :form '(def x (foo bar))
        :doc nil
        :tag nil
        :var {:op :var
              :env {:parent {}}
              :form 'x
              :info nil}
        :init {:op :invoke
               :env {:parent {}}
               :form '(foo bar)
               :tag nil
               :callee {:op :var
                        :form 'foo
                        :env {:parent {}}
                        :info nil}
               :params [{:op :var
                         :form 'bar
                         :env {:parent {}}
                         :info nil}]}
        :dinamyc nil
        :export true}))

(let [bindings [{:name 'x
                 :init {:op :constant
                        :env {}
                        :form 1}
                 :tag nil
                 :local true
                 :shadow nil}
                {:name 'y
                 :init {:op :constant
                        :env {}
                        :form 2}
                 :tag nil
                 :local true
                 :shadow nil}]]
  (is (= (analyze {} '(let [x 1 y 2] (+ x y)))
         {:op :let
          :env {}
          :form '(let [x 1 y 2] (+ x y))
          :loop false
          :bindings bindings
          :statements nil
          :result {:op :invoke
                   :form '(+ x y)
                   :env {:parent {}
                         :bindings bindings}
                   :tag nil
                   :callee {:op :var
                            :form '+
                            :env {:parent {}
                                  :bindings bindings}
                            :info nil}
                   :params [{:op :var
                             :form 'x
                             :env {:parent {}
                                   :bindings bindings}
                             :info nil}
                            {:op :var
                             :form 'y
                             :env {:parent {}
                                   :bindings bindings}
                             :info nil}]}})))

(let [bindings [{:name 'chars
                 :init {:op :var
                        :form 'stream
                        :info nil
                        :env {}}
                 :tag nil
                 :shadow nil
                 :local true}
                {:name 'result
                 :init {:op :vector
                        :items []
                        :form []
                        :env {}}
                 :tag nil
                 :shadow nil
                 :local true}]]

  (is (= (analyze {} '(loop [chars stream
                             result []]
                        (if (empty? chars)
                          :eof
                          (recur (rest chars)
                                 (conj result (first chars))))))
         {:op :loop
          :loop true
          :form '(loop [chars stream
                        result []]
                   (if (empty? chars) :eof
                     (recur (rest chars)
                            (conj result (first chars)))))
          :env {}
          :bindings bindings
          :statements nil
          :result {:op :if
                   :form '(if (empty? chars)
                            :eof
                            (recur (rest chars)
                                   (conj result (first chars))))
                   :env {:parent {}
                         :bindings bindings
                         :params bindings}

                   :test {:op :invoke
                          :form '(empty? chars)
                          :env {:parent {}
                                :bindings bindings
                                :params bindings}
                          :tag nil
                          :callee {:op :var
                                   :env {:parent {}
                                         :bindings bindings
                                         :params bindings}
                                   :form 'empty?
                                   :info nil}
                          :params [{:op :var
                                    :form 'chars
                                    :info nil
                                    :env {:parent {}
                                          :bindings bindings
                                          :params bindings}}]}

                   :consequent {:op :constant
                                :env {:parent {}
                                      :bindings bindings
                                      :params bindings}
                                :form ':eof}

                   :alternate {:op :recur
                               :form '(recur (rest chars)
                                             (conj result (first chars)))
                               :env {:parent {}
                                     :bindings bindings
                                     :params bindings}
                               :params [{:op :invoke
                                         :tag nil
                                         :form '(rest chars)
                                         :env {:parent {}
                                               :bindings bindings
                                               :params bindings}
                                         :callee {:op :var
                                                  :form 'rest
                                                  :info nil
                                                  :env {:parent {}
                                                        :bindings bindings
                                                        :params bindings}}
                                         :params [{:op :var
                                                   :form 'chars
                                                   :info nil
                                                   :env {:parent {}
                                                         :bindings bindings
                                                         :params bindings}}]}
                                        {:op :invoke
                                         :tag nil
                                         :form '(conj result (first chars))
                                         :env {:parent {}
                                               :bindings bindings
                                               :params bindings}
                                         :callee {:op :var
                                                  :form 'conj
                                                  :info nil
                                                  :env {:parent {}
                                                        :bindings bindings
                                                        :params bindings}}
                                         :params [{:op :var
                                                   :form 'result
                                                   :info nil
                                                   :env {:parent {}
                                                         :bindings bindings
                                                         :params bindings}}
                                                  {:op :invoke
                                                   :tag nil
                                                   :form '(first chars)
                                                   :env {:parent {}
                                                         :bindings bindings
                                                         :params bindings}
                                                   :callee {:op :var
                                                            :form 'first
                                                            :info nil
                                                            :env {:parent {}
                                                                  :bindings bindings
                                                                  :params bindings}}
                                                   :params [{:op :var
                                                             :form 'chars
                                                             :info nil
                                                             :env {:parent {}
                                                                   :bindings bindings
                                                                   :params bindings}}]}]}]}}})))



(is (= (analyze {} '(fn [] x))
       {:op :fn
        :name nil
        :variadic false
        :form '(fn [] x)
        :methods [{:op :overload
                   :variadic false
                   :arity 0
                   :params []
                   :form '([] x)
                   :statements nil
                   :result {:op :var
                            :form 'x
                            :info nil
                            :env {:parent {}
                                  :locals {}}}
                   :env {:parent {}
                         :locals {}}}]
        :env {}}))


(is (= (analyze {} '(fn foo [] x))
       {:op :fn
        :name 'foo
        :variadic false
        :form '(fn foo [] x)
        :methods [{:op :overload
                   :variadic false
                   :arity 0
                   :params []
                   :form '([] x)
                   :statements nil
                   :result {:op :var
                            :form 'x
                            :info nil
                            :env {:parent {}
                                  :locals {:foo {:op :var
                                                 :fn-var true
                                                 :shadow nil
                                                 :form 'foo
                                                 :env {}}}}}
                   :env {:parent {}
                         :locals {:foo {:op :var
                                        :fn-var true
                                        :shadow nil
                                        :form 'foo
                                        :env {}}}}}]
        :env {}}))

(is (= (analyze {} '(fn foo [a] x))
       {:op :fn
        :name 'foo
        :variadic false
        :form '(fn foo [a] x)
        :methods [{:op :overload
                   :variadic false
                   :arity 1
                   :params [{:name 'a
                             :tag nil
                             :shadow nil}]
                   :form '([a] x)
                   :statements nil
                   :result {:op :var
                            :form 'x
                            :info nil
                            :env {:parent {}
                                  :locals {:foo {:op :var
                                                 :fn-var true
                                                 :shadow nil
                                                 :form 'foo
                                                 :env {}}
                                           :a {:name 'a
                                               :tag nil
                                               :shadow nil}}}}
                   :env {:parent {}
                         :locals {:foo {:op :var
                                        :fn-var true
                                        :shadow nil
                                        :form 'foo
                                        :env {}}
                                  :a {:name 'a
                                      :tag nil
                                      :shadow nil}}}}]
        :env {}}))


(is (= (analyze {} '(fn ([] x)))
       {:op :fn
        :name nil
        :variadic false
        :form '(fn ([] x))
        :methods [{:op :overload
                   :variadic false
                   :arity 0
                   :params []
                   :form '([] x)
                   :statements nil
                   :result {:op :var
                            :form 'x
                            :info nil
                            :env {:parent {}
                                  :locals {}}}
                   :env {:parent {}
                         :locals {}}}]
        :env {}}))


(is (= (analyze {} '(fn [& args] x))
       {:op :fn
        :name nil
        :variadic true
        :form '(fn [& args] x)
        :methods [{:op :overload
                   :variadic true
                   :arity 0
                   :params [{:name 'args
                             :tag nil
                             :shadow nil}]
                   :form '([& args] x)
                   :statements nil
                   :result {:op :var
                            :form 'x
                            :info nil
                            :env {:parent {}
                                  :locals {:args {:name 'args
                                                  :tag nil
                                                  :shadow nil}}}}
                   :env {:parent {}
                         :locals {:args {:name 'args
                                         :tag nil
                                         :shadow nil}}}}]
        :env {}}))


(is (= (analyze {} '(fn ([] 0) ([x] x)))
       {:op :fn
        :name nil
        :variadic false
        :form '(fn ([] 0) ([x] x))
        :methods [{:op :overload
                   :variadic false
                   :arity 0
                   :params []
                   :form '([] 0)
                   :statements nil
                   :result {:op :constant
                            :form 0
                            :env {:parent {}
                                  :locals {}}}
                   :env {:parent {}
                         :locals {}}}
                  {:op :overload
                   :variadic false
                   :arity 1
                   :params [{:name 'x
                             :tag nil
                             :shadow nil}]
                   :form '([x] x)
                   :statements nil
                   :result {:op :var
                            :form 'x
                            :info {:name 'x
                                   :tag nil
                                   :shadow nil}
                            :env {:parent {}
                                  :locals {:x {:name 'x
                                               :tag nil
                                               :shadow nil}}}}
                   :env {:parent {}
                         :locals {:x {:name 'x
                                      :tag nil
                                      :shadow nil}}}}]
        :env {}}))


(is (= (analyze {} '(fn ([] 0) ([x] x) ([x & nums] :etc)))
       {:op :fn
        :name nil
        :variadic true
        :form '(fn ([] 0) ([x] x) ([x & nums] :etc))
        :methods [{:op :overload
                   :variadic false
                   :arity 0
                   :params []
                   :form '([] 0)
                   :statements nil
                   :result {:op :constant
                            :form 0
                            :env {:parent {}
                                  :locals {}}}
                   :env {:parent {}
                         :locals {}}}
                  {:op :overload
                   :variadic false
                   :arity 1
                   :params [{:name 'x
                             :tag nil
                             :shadow nil}]
                   :form '([x] x)
                   :statements nil
                   :result {:op :var
                            :form 'x
                            :info {:name 'x
                                   :tag nil
                                   :shadow nil}
                            :env {:parent {}
                                  :locals {:x {:name 'x
                                               :tag nil
                                               :shadow nil}}}}
                   :env {:parent {}
                         :locals {:x {:name 'x
                                      :tag nil
                                      :shadow nil}}}}
                  {:op :overload
                   :variadic true
                   :arity 1
                   :params [{:name 'x
                             :tag nil
                             :shadow nil}
                            {:name 'nums
                             :tag nil
                             :shadow nil}]
                   :form '([x & nums] :etc)
                   :statements nil
                   :result {:op :constant
                            :form ':etc
                            :env {:parent {}
                                  :locals {:x {:name 'x
                                               :tag nil
                                               :shadow nil}
                                           :nums {:name 'nums
                                                  :tag nil
                                                  :shadow nil}}}}
                   :env {:parent {}
                         :locals {:x {:name 'x
                                      :tag nil
                                      :shadow nil}
                                  :nums {:name 'nums
                                         :tag nil
                                         :shadow nil}}}}]
        :env {}}))

(is (= (analyze {} '(ns foo.bar
                      "hello world"
                      (:require [my.lib :refer [foo bar]]
                                [foo.baz :refer [a] :rename {a b}])))
       {:op :ns
        :name 'foo.bar
        :doc "hello world"
        :require [{:op :require
                   :alias nil
                   :ns 'my.lib
                   :refer [{:op :refer
                            :name 'foo
                            :form 'foo
                            :rename nil
                            :ns 'my.lib}
                           {:op :refer
                            :name 'bar
                            :form 'bar
                            :rename nil
                            :ns 'my.lib}]
                   :form '[my.lib :refer [foo bar]]}
                  {:op :require
                   :alias nil
                   :ns 'foo.baz
                   :refer [{:op :refer
                            :name 'a
                            :form 'a
                            :rename 'b
                            :ns 'foo.baz}]
                   :form '[foo.baz :refer [a] :rename {a b}]}]
        :form '(ns foo.bar
                 "hello world"
                 (:require [my.lib :refer [foo bar]]
                           [foo.baz :refer [a] :rename {a b}]))
        :env {}}))

(is (= (analyze {} '(ns foo.bar
                      "hello world"
                      (:require lib.a
                                [lib.b]
                                [lib.c :as c]
                                [lib.d :refer [foo bar]]
                                [lib.e :refer [beep baz] :as e]
                                [lib.f :refer [faz] :rename {faz saz}]
                                [lib.g :refer [beer] :rename {beer coffee} :as booze])))
       {:op :ns
        :name 'foo.bar
        :doc "hello world"
        :require [{:op :require
                   :alias nil
                   :ns 'lib.a
                   :refer nil
                   :form 'lib.a}
                  {:op :require
                   :alias nil
                   :ns 'lib.b
                   :refer nil
                   :form '[lib.b]}
                  {:op :require
                   :alias 'c
                   :ns 'lib.c
                   :refer nil
                   :form '[lib.c :as c]}
                  {:op :require
                   :alias nil
                   :ns 'lib.d
                   :form '[lib.d :refer [foo bar]]
                   :refer [{:op :refer
                            :name 'foo
                            :form 'foo
                            :rename nil
                            :ns 'lib.d}
                           {:op :refer
                            :name 'bar
                            :form 'bar
                            :rename nil
                            :ns 'lib.d
                            }]}
                  {:op :require
                   :alias 'e
                   :ns 'lib.e
                   :form '[lib.e :refer [beep baz] :as e]
                   :refer [{:op :refer
                            :name 'beep
                            :form 'beep
                            :rename nil
                            :ns 'lib.e}
                           {:op :refer
                            :name 'baz
                            :form 'baz
                            :rename nil
                            :ns 'lib.e}]}
                  {:op :require
                   :alias nil
                   :ns 'lib.f
                   :form '[lib.f :refer [faz] :rename {faz saz}]
                   :refer [{:op :refer
                            :name 'faz
                            :form 'faz
                            :rename 'saz
                            :ns 'lib.f}]}
                  {:op :require
                   :alias 'booze
                   :ns 'lib.g
                   :form '[lib.g :refer [beer] :rename {beer coffee} :as booze]
                   :refer [{:op :refer
                            :name 'beer
                            :form 'beer
                            :rename 'coffee
                            :ns 'lib.g}]}]
        :form '(ns foo.bar
                 "hello world"
                 (:require lib.a
                           [lib.b]
                           [lib.c :as c]
                           [lib.d :refer [foo bar]]
                           [lib.e :refer [beep baz] :as e]
                           [lib.f :refer [faz] :rename {faz saz}]
                           [lib.g :refer [beer] :rename {beer coffee} :as booze]))
        :env {}}))
