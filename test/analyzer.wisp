(ns wisp.test.analyzer
  (:require [wisp.src.analyzer :refer [analyze]]
            [wisp.src.ast :refer [meta symbol]]
            [wisp.src.sequence :refer [map list]]
            [wisp.src.runtime :refer [=]]))

(assert (= (analyze {} ':foo)
           {:op :constant
            :type :keyword
            :env {}
            :form ':foo}))

(assert (= (analyze {} "bar")
           {:op :constant
            :type :string
            :env {}
            :form "bar"}))

(assert (= (analyze {} true)
           {:op :constant
            :type :boolean
            :env {}
            :form true}))

(assert (= (analyze {} false)
           {:op :constant
            :type :boolean
            :env {}
            :form false}))

(assert (= (analyze {} nil)
           {:op :constant
            :type :nil
            :env {}
            :form nil}))

(assert (= (analyze {} 7)
           {:op :constant
            :type :number
            :env {}
            :form 7}))

(assert (= (analyze {} #"foo")
           {:op :constant
            :type :re-pattern
            :env {}
            :form #"foo"}))

(assert (= (analyze {} 'foo)
           {:op :var
            :env {}
            :form 'foo
            :info nil}))

(assert (= (analyze {} '[])
           {:op :vector
            :env {}
            :form '[]
            :items []}))

(assert (= (analyze {} '[:foo bar "baz"])
           {:op :vector
            :env {}
            :form '[:foo bar "baz"]
            :items [{:op :constant
                     :type :keyword
                     :env {}
                     :form ':foo}
                    {:op :var
                     :env {}
                     :form 'bar
                     :info nil}
                    {:op :constant
                     :type :string
                     :env {}
                     :form "baz"
                     }]}))

(assert (= (analyze {} {})
           {:op :dictionary
            :env {}
            :form {}
            :hash? true
            :keys []
            :values []}))

(assert (= {:op :dictionary
            :keys [{:op :constant
                    :type :string
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

(assert (= (analyze {} ())
           {:op :constant
            :type :list
            :env {}
            :form ()}))

(assert (= (analyze {} '(foo))
           {:op :invoke
            :callee {:op :var
                     :env {}
                     :form 'foo
                     :info nil}
            :params []
            :tag nil
            :form '(foo)
            :env {}}))


(assert (= (analyze {} '(foo bar))
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

(assert (= (analyze {} '(aget foo 'bar))
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

(assert (= (analyze {} '(aget foo bar))
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

(assert (= (analyze {} '(aget foo "bar"))
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
                       :type :string
                       :form "bar"}}))

(assert (= (analyze {} '(aget foo :bar))
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
                       :type :keyword
                       :form ':bar}}))


(assert (= (analyze {} '(aget foo (beep bar)))
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


(assert (= (analyze {} '(if x y))
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
                        :type :nil
                        :env {}
                        :form nil}}))

(assert (= (analyze {} '(if (even? n) (inc n) (+ n 3)))
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
                                  :type :number
                                  :env {}
                                  :form 3}]}}))

(assert (= (analyze {} '(throw error))
           {:op :throw
            :env {}
            :form '(throw error)
            :throw {:op :var
                    :env {}
                    :form 'error
                    :info nil}}))

(assert (= (analyze {} '(throw (Error "boom!")))
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
                              :type :string
                              :env {}
                              :form "boom!"}]}}))

(assert (= (analyze {} '(new Error "Boom!"))
           {:op :new
            :env {}
            :form '(new Error "Boom!")
            :constructor {:op :var
                          :env {}
                          :form 'Error
                          :info nil}
            :params [{:op :constant
                      :type :string
                      :env {}
                      :form "Boom!"}]}))

(assert (= (analyze {} '(try* (read-string unicode-error)))
           {:op :try*
            :env {}
            :form '(try* (read-string unicode-error))
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

(assert (= (analyze {} '(try*
                         (read-string unicode-error)
                         (catch error :throw)))

           {:op :try*
            :env {}
            :form '(try*
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
                               :type :keyword
                               :env {}
                               :form ':throw}}
            :finalizer nil}))

(assert (= (analyze {} '(try*
                         (read-string unicode-error)
                         (finally :end)))

           {:op :try*
            :env {}
            :form '(try*
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
                                 :type :keyword
                                 :env {}
                                 :form ':end}}}))


(assert (= (analyze {} '(try* (read-string unicode-error)
                              (catch error
                                (print error)
                                :error)
                              (finally
                               (print "done")
                               :end)))
           {:op :try*
            :env {}
            :form '(try* (read-string unicode-error)
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
                               :type :keyword
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
                                                :form "done"
                                                :type :string}]}]
                        :result {:op :constant
                                 :type :keyword
                                 :form ':end
                                 :env {}}}}))


(assert (= (analyze {} '(set! foo bar))
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

(assert (= (analyze {} '(set! *registry* {}))
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

(assert (= (analyze {} '(set! (.-log console) print))
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

(assert (= (analyze {} '(do
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
                                    :form "read"
                                    :type :string}]}]
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

(assert (= (analyze {} '(def x 1))
           {:op :def
            :env {}
            :form '(def x 1)
            :doc nil
            :var {:op :var
                  :env {}
                  :form 'x
                  :info nil}
            :init {:op :constant
                   :type :number
                   :env {}
                   :form 1}
            :tag nil
            :dinamyc nil
            :export false}))

(assert (= (analyze {:parent {}} '(def x 1))
           {:op :def
            :env {:parent {}}
            :form '(def x 1)
            :doc nil
            :var {:op :var
                  :env {:parent {}}
                  :form 'x
                  :info nil}
            :init {:op :constant
                   :type :number
                   :env {:parent {}}
                   :form 1}
            :tag nil
            :dinamyc nil
            :export true}))

(assert (= (analyze {:parent {}} '(def x (foo bar)))
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
                        :type :number
                        :env {}
                        :form 1}
                 :tag nil
                 :local true
                 :shadow nil}
                {:name 'y
                 :init {:op :constant
                        :type :number
                        :env {}
                        :form 2}
                 :tag nil
                 :local true
                 :shadow nil}]]
  (assert (= (analyze {} '(let* [x 1 y 2] (+ x y)))
             {:op :let
              :env {}
              :form '(let* [x 1 y 2] (+ x y))
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

  (assert (= (analyze {} '(loop* [chars stream
                                  result []]
                                 (if (empty? chars)
                                   :eof
                                   (recur (rest chars)
                                          (conj result (first chars))))))
             {:op :loop*
              :loop true
              :form '(loop* [chars stream
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
                                    :type :keyword
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



(assert (= (analyze {} '(fn [] x))
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


(assert (= (analyze {} '(fn foo [] x))
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

(assert (= (analyze {} '(fn foo [a] x))
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

(assert (= (analyze {} '(fn ([] x)))
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

(assert (= (analyze {} '(fn [& args] x))
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

(assert (= (analyze {} '(fn ([] 0) ([x] x)))
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
                                :type :number
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


(assert (= (analyze {} '(fn ([] 0) ([x] x) ([x & nums] :etc)))
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
                                :type :number
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
                                :type :keyword
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