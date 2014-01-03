(ns wisp.test.escodegen
  (:require [wisp.test.util :refer [is thrown?]]
            [wisp.src.sequence :refer [concat cons vec take first rest
                                       second third list list? count drop
                                       lazy-seq? seq nth map]]
            [wisp.src.runtime :refer [subs = dec identity keys nil? vector?
                                      string? dec re-find satisfies?]]
            [wisp.src.compiler :refer [compile]]
            [wisp.src.reader :refer [read* read-from-string]
                             :rename {read-from-string read-string}]
            [wisp.src.ast :refer [meta name pr-str symbol]]))

(defprotocol INope
  (nope? [self]))

(is (thrown? (nope? 1) #"method")
    "protocol isn't implemented")


(is (not (satisfies? INope js/Number))
    "number doesn't satisfies INope")

(deftype Nope [x]
  INope
  (nope? [_] true))

(is (Nope. 1)
    "Can be instantiated")

(is (satisfies? INope (Nope.))
    "satisfies protocol")

(is (nope? (Nope.))
    "implements protcol method")

(extend-type number
  INope
  (nope? [x] true))

(is (satisfies? INope 4) "numbers implement protocol")
(is (nope? 3) "numbers implement protocol")

(is (not (satisfies? INope "foo"))
    "strings do not satisfy")

(extend-type default
  INope
  (nope? [_] false))

(is (satisfies? INope "foo")
    "everything satisfies protocol now")

(is (= (nope? "foo") false)
    "default implementation")

(is (= (nope? 3) true)
    "overriden implementation")

(is (= (nope? true) false)
    "default implementation")

(defprotocol IType
  (-type [x]))

(defn satisfaction
  [protocol]
  {:nil (satisfies? protocol nil)
   :boolean (satisfies? protocol true)
   :number (satisfies? protocol 1)
   :string (satisfies? protocol "foo")
   :pattern (satisfies? protocol #"foo")
   :fn (satisfies? protocol (fn [x] x))
   :vector (satisfies? protocol [1 2 3])
   :object (satisfies? protocol {})})

(is (= (satisfaction IType)
       {:nil false
        :boolean false
        :number false
        :string false
        :pattern false
        :fn false
        :vector false
        :object false})
    "no types satisfy protocol")

(extend-type nil
  IType
  (-type [_] :nil))

(is (= (satisfaction IType)
       {:nil true
        :boolean false
        :number false
        :string false
        :pattern false
        :fn false
        :vector false
        :object false})
    "only nil satisfyies protocol")

(extend-type boolean
  IType
  (-type [_] :boolean))

(is (= (satisfaction IType)
       {:nil true
        :boolean true
        :number false
        :string false
        :pattern false
        :fn false
        :vector false
        :object false})
    "nil & booleans satisfyies protocol")

(extend-type number
  IType
  (-type [_] :number))

(is (= (satisfaction IType)
       {:nil true
        :boolean true
        :number true
        :string false
        :pattern false
        :fn false
        :vector false
        :object false})
    "nil, booleans & numbers satisfyies protocol")

(extend-type string
  IType
  (-type [_] :string))

(is (= (satisfaction IType)
       {:nil true
        :boolean true
        :number true
        :string true
        :pattern false
        :fn false
        :vector false
        :object false})
    "nil, booleans, numbers & strings satisfyies protocol")

(extend-type re-pattern
  IType
  (-type [_] :pattern))

(is (= (satisfaction IType)
       {:nil true
        :boolean true
        :number true
        :string true
        :pattern true
        :fn false
        :vector false
        :object false})
    "nil, booleans, numbers, strings & patterns satisfyies protocol")

(extend-type function
  IType
  (-type [_] :function))

(is (= (satisfaction IType)
       {:nil true
        :boolean true
        :number true
        :string true
        :pattern true
        :fn true
        :vector false
        :object false})
    "nil, booleans, numbers, strings, patterns & functions satisfyies protocol")

(extend-type vector
  IType
  (-type [_] :vector))

(is (= (satisfaction IType)
       {:nil true
        :boolean true
        :number true
        :string true
        :pattern true
        :fn true
        :vector true
        :object false})
    "nil, booleans, numbers, strings, patterns, functions & vectors satisfyies protocol")

(extend-type default
  IType
  (-type [_] :default))

(is (= (satisfaction IType)
       {:nil true
        :boolean true
        :number true
        :string true
        :pattern true
        :fn true
        :vector true
        :object true})
    "all types satisfyies protocol")

(is (= (-type nil) :nil))
(is (= (-type true) :boolean))
(is (= (-type false) :boolean))
(is (= (-type 1) :number))
(is (= (-type 0) :number))
(is (= (-type 17) :number))
(is (= (-type "hello") :string))
(is (= (-type "") :string))
(is (= (-type #"foo") :pattern))
(is (= (-type (fn [x] x)) :function))
(is (= (-type #(inc %)) :function))
(is (= (-type []) :vector))
(is (= (-type [1]) :vector))
(is (= (-type [1 2 3]) :vector))
(is (= (-type {}) :default))
(is (= (-type {:a 1}) :default))

(defprotocol IFoo
  (foo? [x]))

(is (= (satisfaction IFoo)
       {:nil false
        :boolean false
        :number false
        :string false
        :pattern false
        :fn false
        :vector false
        :object false})
    "no types satisfyies protocol")

(extend-type default
  IFoo
  (foo? [_] false))

(is (= (satisfaction IFoo)
       {:nil true
        :boolean true
        :number true
        :string true
        :pattern true
        :fn true
        :vector true
        :object true})
    "all types satisfy protocol")

(defprotocol IBar
  (bar? [x]))

(extend-type js/Object
  IBar
  (bar? [_] true))

(is (= (satisfaction IBar)
       {:nil false
        :boolean false
        :number false
        :string false
        :pattern false
        :fn false
        :vector false
        :object true})
    "only objects satisfy protocol")

(extend-type js/Number
  IBar
  (bar? [_] true))

(is (= (satisfaction IBar)
       {:nil false
        :boolean false
        :number true
        :string false
        :pattern false
        :fn false
        :vector false
        :object true})
    "only objects & numbers satisfy protocol")


(extend-type js/String
  IBar
  (bar? [_] true))

(is (= (satisfaction IBar)
       {:nil false
        :boolean false
        :number true
        :string true
        :pattern false
        :fn false
        :vector false
        :object true})
    "only objects, numbers & strings satisfy protocol")


(extend-type js/Boolean
  IBar
  (bar? [_] true))

(is (= (satisfaction IBar)
       {:nil false
        :boolean true
        :number true
        :string true
        :pattern false
        :fn false
        :vector false
        :object true})
    "only objects, numbers, strings & booleans satisfy protocol")

(extend-type js/Function
  IBar
  (bar? [_] true))

(is (= (satisfaction IBar)
       {:nil false
        :boolean true
        :number true
        :string true
        :pattern false
        :fn true
        :vector false
        :object true})
    "only objects, numbers, strings, booleans & functions satisfy protocol")

(extend-type js/Array
  IBar
  (bar? [_] true))

(is (= (satisfaction IBar)
       {:nil false
        :boolean true
        :number true
        :string true
        :pattern false
        :fn true
        :vector true
        :object true})
    "only objects, numbers, strings, booleans, functions & array satisfy protocol")

(extend-type js/RegExp
  IBar
  (bar? [_] true))

(is (= (satisfaction IBar)
       {:nil false
        :boolean true
        :number true
        :string true
        :pattern true
        :fn true
        :vector true
        :object true})
    "only objects, numbers, strings, booleans, functions & patterns satisfy protocol")
