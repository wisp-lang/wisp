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
            :meta nil
            :info nil}))

(assert (= (analyze {} '[])
           {:op :vector
            :env {}
            :form '[]
            :meta nil
            :items []}))

(assert (= (analyze {} '[:foo bar "baz"])
           {:op :vector
            :env {}
            :form '[:foo bar "baz"]
            :meta nil
            :items [{:op :constant
                     :type :keyword
                     :env {}
                     :form ':foo}
                    {:op :var
                     :env {}
                     :form 'bar
                     :meta nil
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
                      :info nil
                      :meta nil}]
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
                     :meta nil
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
                     :meta nil
                     :info nil}
            :params [{:op :var
                      :env {}
                      :form 'bar
                      :meta nil
                      :info nil
                      }]
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
                     :meta nil
                     :info nil}
            :property {:op :var
                       :env {}
                       :form 'bar
                       :meta nil
                       :info nil}}))

(assert (= (analyze {} '(aget foo bar))
           {:op :member-expression
            :computed true
            :env {}
            :form '(aget foo bar)
            :target {:op :var
                     :env {}
                     :form 'foo
                     :meta nil
                     :info nil}
            :property {:op :var
                       :env {}
                       :form 'bar
                       :meta nil
                       :info nil}}))

(assert (= (analyze {} '(aget foo "bar"))
           {:op :member-expression
            :env {}
            :form '(aget foo "bar")
            :computed true
            :target {:op :var
                     :env {}
                     :form 'foo
                     :meta nil
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
                     :meta nil
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
                     :meta nil
                     :info nil}
            :property {:op :invoke
                       :env {}
                       :form '(beep bar)
                       :tag nil
                       :callee {:op :var
                                :form 'beep
                                :env {}
                                :meta nil
                                :info nil}
                       :params [{:op :var
                                 :form 'bar
                                 :env {}
                                 :meta nil
                                 :info nil}]}}))


(assert (= (analyze {} '(if x y))
           {:op :if
            :env {}
            :form '(if x y)
            :test {:op :var
                   :env {}
                   :form 'x
                   :meta nil
                   :info nil}
            :consequent {:op :var
                         :env {}
                         :form 'y
                         :meta nil
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
                            :meta nil
                            :info nil}
                   :params [{:op :var
                             :env {}
                             :form 'n
                             :meta nil
                             :info nil}]}
            :consequent {:op :invoke
                         :env {}
                         :form '(inc n)
                         :tag nil
                         :callee {:op :var
                                  :env {}
                                  :form 'inc
                                  :meta nil
                                  :info nil}
                         :params [{:op :var
                                   :env {}
                                   :form 'n
                                   :meta nil
                                   :info nil}]}
            :alternate {:op :invoke
                        :env {}
                        :form '(+ n 3)
                        :tag nil
                        :callee {:op :var
                                 :env {}
                                 :form '+
                                 :meta nil
                                 :info nil}
                        :params [{:op :var
                                  :env {}
                                  :form 'n
                                  :meta nil
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
                    :meta nil
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
                             :meta nil
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
                          :meta nil
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
                   :statements []
                   :result {:op :invoke
                            :env {}
                            :form '(read-string unicode-error)
                            :tag nil
                            :callee {:op :var
                                     :env {}
                                     :form 'read-string
                                     :meta nil
                                     :info nil}
                            :params [{:op :var
                                      :env {}
                                      :form 'unicode-error
                                      :meta nil
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
                   :statements []
                   :result {:op :invoke
                            :env {}
                            :form '(read-string unicode-error)
                            :tag nil
                            :callee {:op :var
                                     :env {}
                                     :form 'read-string
                                     :meta nil
                                     :info nil}
                            :params [{:op :var
                                      :env {}
                                      :form 'unicode-error
                                      :meta nil
                                      :info nil}]}}
            :handler {:env {}
                      :name {:op :var
                             :env {}
                             :form 'error
                             :meta nil
                             :info nil}
                      :statements []
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
                   :statements []
                   :result {:op :invoke
                            :env {}
                            :form '(read-string unicode-error)
                            :tag nil
                            :callee {:op :var
                                     :env {}
                                     :form 'read-string
                                     :meta nil
                                     :info nil}
                            :params [{:op :var
                                      :env {}
                                      :form 'unicode-error
                                      :meta nil
                                      :info nil}]}}
            :handler nil
            :finalizer {:env {}
                        :statements []
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
                   :statements []
                   :result {:op :invoke
                            :env {}
                            :form '(read-string unicode-error)
                            :tag nil
                            :callee {:op :var
                                     :env {}
                                     :form 'read-string
                                     :meta nil
                                     :info nil}
                            :params [{:op :var
                                      :env {}
                                      :form 'unicode-error
                                      :meta nil
                                      :info nil}]}}
            :handler {:env {}
                      :name {:op :var
                             :env {}
                             :form 'error
                             :meta nil
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
                                                      :meta nil
                                                      :info nil}
                                             :property {:op :var
                                                        :env {}
                                                        :form 'log
                                                        :meta nil
                                                        :info nil}}
                                    :params [{:op :var
                                              :env {}
                                              :form 'error
                                              :meta nil
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
                                                        :meta nil
                                                        :info nil}
                                               :property {:op :var
                                                          :env {}
                                                          :form 'log
                                                          :meta nil
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
                     :meta nil
                     :info nil}
            :value {:op :var
                    :env {}
                    :form 'bar
                    :meta nil
                    :info nil}}))

(assert (= (analyze {} '(set! *registry* {}))
           {:op :set!
            :target {:op :var
                     :env {}
                     :form '*registry*
                     :meta nil
                     :info nil}
            :value {:op :dictionary
                    :env {}
                    :form {}
                    :keys []
                    :values []
                    :hash? true}}))

(assert (= (analyze {} '(set! (.-log console) print))
           {:op :set!
            :target {:op :member-expression
                     :env {}
                     :form '(aget console 'log)
                     :computed false
                     :target {:op :var
                              :env {}
                              :form 'console
                              :meta nil
                              :info nil}
                     :property {:op :var
                                :env {}
                                :form 'log
                                :meta nil
                                :info nil}}
            :value {:op :var
                    :env {}
                    :form 'print
                    :meta nil
                    :info nil}}))

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
                                   :meta nil
                                   :info nil}
                          :params [{:op :var
                                    :env {}
                                    :form 'content
                                    :meta nil
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
                                            :meta nil
                                            :info nil}
                                   :property {:op :var
                                              :env {}
                                              :form 'log
                                              :meta nil
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
                              :meta nil
                              :info nil}
                     :params [{:op :var
                               :env {}
                               :form 'content
                               :meta nil
                               :info nil}]}}))

(assert (= (analyze {} '(def x 1))
           {:op :def
            :env {}
            :form '(def x 1)
            :doc nil
            :var {:op :var
                  :env {}
                  :form 'x
                  :meta nil
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
                  :meta nil
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
                  :meta nil
                  :info nil}
            :init {:op :invoke
                   :env {:parent {}}
                   :form '(foo bar)
                   :tag nil
                   :callee {:op :var
                            :form 'foo
                            :env {:parent {}}
                            :meta nil
                            :info nil}
                   :params [{:op :var
                             :form 'bar
                             :env {:parent {}}
                             :meta nil
                             :info nil}]}
            :dinamyc nil
            :export true}))

