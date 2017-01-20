# WISP

## Project is abandoned

Project maintainer [@gozala](https://github.com/Gozala/wisp) is no longer able to spend time on this project. ClojureScript managed to overcome JVM dependency, so there is almost no reason to choose wisp over it. Never the less if you feel motivated to carry on the effort and step up as a maintainer contact [@gozala](https://github.com/Gozala/wisp).

[![Build Status](https://secure.travis-ci.org/Gozala/wisp.png)](http://travis-ci.org/Gozala/wisp)
[![NPM version](https://badge.fury.io/js/wisp.svg)](http://badge.fury.io/js/wisp)
[![Dependency Status](https://david-dm.org/gozala/wisp.svg)](https://david-dm.org/gozala/wisp)
[![Gitter chat](https://badges.gitter.im/Gozala/wisp.png)](https://gitter.im/Gozala/wisp)

_wisp_ is a [homoiconic][homoiconicity] JavaScript dialect with [Clojure][]
syntax, [s-expressions][] and [macros][]. Unlike [ClojureScript][], _wisp_
does not depend on the JVM and is completely self-hosted, embracing
native JavaScript data structures for better interoperability.

The main goal of _wisp_ is to provide a rich subset of Clojure(Script) so
that packages written in _wisp_ can work seamlessly with Clojure(Script) and
JavaScript without data marshalling or code changes.

_wisp_ also does its best to compile down to JavaScript you would have written
by hand - think of _wisp_ as [markdown] for JavaScript programming, but with
the added subtlety of LISP S-expressions, [homoiconicity][homoiconicity] and
powerful [macros] that make it the easiest way to write JavaScript.

![meta](http://upload.wikimedia.org/wikipedia/en/b/ba/DrawingHands.jpg)

# Try _Wisp_

You can try _wisp_ on your browser by [trying the interactive compiler](http://jeditoolkit.com/try-wisp/)
([repo](https://github.com/Gozala/try-wisp)) or [an online REPL](http://jeditoolkit.com/interactivate-wisp)
with syntax highlighting.

# Install

You can install _wisp_ locally via `npm` by doing:

    npm install -g wisp

...and then running `wisp` to get a REPL. To compile standalone `.wisp` files, simply do:

    cat in.wisp | wisp > out.js


# Language Essentials

## Data structures


#### nil

`nil` is just like JavaScript `undefined` with the difference that it
cannot be redefined. It compiles down to `void(0)` in JavaScript.

```clojure
nil ; => void(0)
```

#### Booleans

`true` / `false` are directly equivalent to plain JavaScript booleans:

```clojure
true ; => true
```

#### Numbers

_wisp_ numbers are directly equivalent to JavaScript numbers:

```clojure
1 ; => 1
```

#### Strings

_wisp_ strings are JavaScript strings:

```clojure
"Hello world"
```
...and can be multi-line:

```clojure
"Hello,
My name is wisp!"
```

#### Characters

Characters are syntactic sugar for single character strings:

```clojure
\a  ; => "a"
\b  ; => "b"
```

#### Keywords
Keywords are symbolic identifiers that evaluate to themselves:

```clojure
:keyword  ; => "keyword"
```

Since in JavaScript string constants fulfill the purpose of symbolic identifiers,
keywords compile to equivalent strings in JavaScript. This allows using
keywords in Clojure(Script) and JavaScript idiomatic fashion:

```clojure
(window.addEventListener :load handler false)
```

Keywords can also be invoked as functions, although that too is syntax sugar
that compiles to property access in JavaScript:

```clojure
(:bar foo) ; => (foo || 0)["bar"]
```

Note that keywords in _wisp_ are not real functions so they can't be composed
or passed to high order functions.

#### Vectors

_wisp_ vectors are plain JavaScript arrays, but nevertheless all standard
library functions are non-destructive and pure functional as in Clojure.

```clojure
[ 1 2 3 4 ]
```
Note: Commas are considered whitespace and can be used if desired:

```clojure
[1, 2, 3, 4]
```
#### Dictionaries

_wisp_ does not have Clojure-like value-to-value maps by default, but rather dictionaries that map to plain JavaScript objects.

Therefore, unlike Clojure, keys cannot consist of arbitrary types.

```clojure
{ "foo" bar :beep-bop "bop" 1 2 }
```
Like with vectors, commas are optional but can come handy for separating key value pairs.

```clojure
{ :a 1, :b 2 }
```

#### Lists

What would be a LISP without lists? _wisp_ being homoiconic, its
code is made up of lists representing expressions.

As in other LISPs, the first item of an expression is an operator or function that takes the remainder of the list as arguments, and compiles accordingly to JavaScript:


```clojure
(foo bar baz) ; => foo(bar, baz);
```

The compiled JavaScript is quite unlikely to end up with lists as they primarily serve their purpose at compile time. Nevertheless lists are supported and can be used (more further down)

#### Arrays

_wisp_ partially emulates Clojure(Script) handling of arrays in two ways:

1. By using `get`, which compiles to guarded access in JavaScript:

```clojure
(get [1 2 3] 1) ; => ([1, 2, 3] || 0)[0]
```

2. By using `aget`, which compiles to unguarded access and can (for the moment) also be used to perform item assignments:

```clojure
(aget an-array 2) ; => anArray[2];
(set! (aget an-array 2) "bar") ; => anArray[2] = "bar";
```

(`aset` will be added ASAP for symmetry, but you can easily define an equivalent macro for the moment)

## Conventions

_wisp_ tries very hard to compile to JavaScript that feels hand-crafted while trying to embrace LISP-style idioms and naming conventions, and translates them to equivalent JavaScript conventions:

```clojure
(dash-delimited)   ; => dashDelimited
(predicate?)       ; => isPredicate
(**privates**)     ; => __privates__
(list->vector)     ; => listToVector
```

This makes for very natural-looking code, but also allows some things to be expressed in different ways. For instance, the following function invocations will translate to the same things:

```clojure
(parse-int x)
(parseInt x)

(array? x)
(isArray x)
```


## Special forms

There are some special operators in _wisp_ in the sense that
they compile to JavaScript expressions rather then function calls.

Identically-named functions are also available in the standard library to allow function composition.

#### Arithmetic operations

_wisp_ comes with special forms for common arithmetic:

```clojure
(+ a b)        ; => a + b
(+ a b c)      ; => a + b + c
(- a b)        ; => a - b
(* a b c)      ; => a * b * c
(/ a b)        ; => a / b
(mod a b)      ; => a % 2
```

#### Comparison operations

...and special forms for common comparisons:

```clojure
(identical? a b)     ; => a === b
(identical? a b c)   ; => a === b && b === c
(= a b)              ; => a == b
(= a b c)            ; => a == b && b == c
(> a b)              ; => a > b
(>= a b)             ; => a >= b
(< a b c)            ; => a < b && b < c
(<= a b c)           ; => a <= b && b <= c
```

#### Logical and bitwise operations

...and special forms for logical and bitwise operations:

```clojure
(and a b)            ; => a && b
(and a b c)          ; => a && b && c
(or a b)             ; => a || b
(and (or a b)
     (and c d))      ; (a || b) && (c && d)
```

```clojure
(bit-and a b)                  ; => a & b
(bit-or a b)                   ; => a | b
(bit-xor a b)                  ; => a ^ b
(bit-shift-left a 2)           ; => a << 2
(bit-shift-right b 3)          ; => b >> 3
(bit-shift-right-zero-fil a 1) ; => a >>> 1
```

#### Definitions

Variable definitions also happen through special forms:

```clojure
(def a)     ; => var a = void(0);
(def b 2)   ; => var b = 2;
```

#### Assignments

In _wisp_ variables can be set to new values via the `set!` special form.

Note that in functional programming binding changes are a bad practice (avoiding these will improve the quality and testability of your code), but there are always cases where this is required for JavaScript interoperability:

```clojure
(set! a 1) ; => a = 1
```
The `!` suffix is a useful visual reminder that you're causing a side-effect.

#### Conditionals

Conditional code branching in _wisp_ is expressed via the `ìf` special form.

As usual, the first expression following `if` is a condition - if it evaluates to `true` the result of the `if` form will be the second expression, otherwise it'll be the third "else" expression:

```clojure
(if (< number 10)
  "Digit"
  "Number")
```

The third ("else") expression is optional, and if missing and the conditional evaluates to `true` the result will be `nil`.

```clojure
(if (monday? today) "How was your weekend")
```

The form `cond` is also available:

```clojure
(cond
  (monday? today)  "How was your weekend"
  (friday? today)  "Enjoy your weekend"
  (weekend? today) "Huzzah weekend"
  :else "Some other day")
```

Each term is evaluated in sequence until it evaluates to true. If none are true,
the form evaluates to `undefined`.

#### Combining expressions

In _wisp_ everything is an expression, but sometimes one might want to combine multiple expressions into one, usually for the purpose of evaluating expressions that have side-effects. That's where `do` comes in:

```clojure
(do
  (console.log "Computing sum of a & b")
  (+ a b))
```

`do` can take any number of expressions (including `0`, in which case it will evaluate to `nil`):

```clojure
(do) ; => nil
```

#### Bindings

The `let` special form evaluates sub-expressions in a lexical context in which symbols in its binding-forms (first item) are bound to their respective expression results:

```clojure
(let [a 1
      b (+ a 1)]
  (+ a b))
; => 3
```


#### Functions

_wisp_ functions are plain JavaScript functions

```clojure
(fn [x] (+ x 1)) ; => function(x) { return x + 1; }
```

_wisp_ functions can have names, just as in JavaScript

```clojure
(fn increment [x] (+ x 1)) ; => function increment(x) { return x + 1; }
```

_wisp_ function _declarations_ can also contain documentation and some metadata:

```clojure
(defn sum
  "Return the sum of all arguments"
  {:version "1.0"}
  [x] (+ x 1))
```

Function _expressions, though, can only have names:

```clojure
(fn increment
  {:added "1.0"}
  [x] (+ x 1))
```

_Note: Docstrings and metadata are not included in compiled JavaScript yet, but support for that is planned._

#### Arguments

_wisp_ makes capturing of remaining (`rest`) arguments a lot easier than JavaScript. An argument that follows an ampersand (`&`) symbol will capture the remaining args in a standard vector (i.e., array).

```clojure
(fn [x & rest]
  (rest.reduce (fn [sum x] (+ sum x)) x))
```

#### Overloading Functions

In _wisp_ functions can be overloaded depending on arity (the number of arguments they take), without introspection of remaining arguments.

```clojure
(fn sum
  "Return the sum of all arguments"
  {:version "1.0"}
  ([] 0)
  ([x] x)
  ([x y] (+ x y))
  ([x & more] (more.reduce (fn [x y] (+ x y)) x)))
```

If a function does not have variadic overload and more arguments are passed to it, it throws an exception.

```clojure
(fn
  ([x] x)
  ([x y] (- x y)))
```

#### Loops and TCO

A classic way to build a loop in LISP is via recursion,  _wisp_ provides a `loop` `recur` construct that allows for tail call optimization:

```clojure
(loop [x 10]
  (if (> x 1)
    (print x)
    (recur (- x 2))))
```

## Other Special Forms

### Instantiation

In _wisp_ type instantiation has a concise form, by way of suffixing the function with a period (`.`):

```clojure
(Type. options)
```

However, the more verbose but more JavaScript-like form is also valid:

```clojure
(new Class options)
```

#### Method calls

In _wisp_ method calls are no different from function calls, but prefixed with a period (`.`):

```clojure
(.log console "hello wisp")
```

...and, of course, the more JavaScript-like forms are supported too:

```clojure
(window.addEventListener "load" handler false)
```

#### Attribute access

In _wisp_, attribute access is also treated like a function call, but attributes need to be prefixed with `.-`:

```clojure
(.-location window)
```

Compound properties can be accessed via the `get` special form:

```clojure
(get templates (.-id element))
```

#### Catching Exceptions

In _wisp_ exceptions can be handled via the `try` special form. As with everything
else, the `try` form is also an expression that evaluates to `nil` if no handling
takes place.

```clojure
(try (raise exception))
```

...the `catch` form can be used to handle exceptions...

```clojure
(try
  (raise exception)
  (catch error (.log console error)))
```

...and the `finally` clause can be used too:

```clojure
(try
  (raise exception)
  (catch error (recover error))
  (finally (.log console "That was a close one!")))
```


#### Throwing Exceptions

In a non-idiomatic twist (but largely for symmetry and JavaScript interop), the `throw` special form allows throwing exceptions:

```clojure
(fn raise [message] (throw (Error. message)))
```

## Macros

_wisp_ has a powerful programmatic macro system which allows the compiler to
be extended by user code.

Many core constructs of _wisp_ are in fact normal macros, and you are encouraged to study the source to learn how to build your own. Nevertheless, the following sections are a quick primer on macros.

#### quote

Before diving into macros too much, we need to learn a few more
things. In LISP any expression can be quoted to prevent it from being
evaluated.

As an example, take the symbol `foo` - by default, you will be
evaluating the reference to its corresponding value:

```clojure
foo
```

But if you wish to refer to the literal symbol, this is how you do it:

```clojure
(quote foo)
```

or, as shorthand:

```clojure
'foo
```

Any expression can be quoted to prevent its evaluation (these are not, however, compiled to JavaScript):

```clojure
'foo
':bar
'(a b)
```

#### An Example Macro

_wisp_ doesn't have the `unless` special form or a macro, but it's trivial
to implement it via macros.

But it's useful to try implementing it as a function to understand a use case for macros, so let's get started:

`unless` is easy to understand -- we want to execute a `body` unless a given `condition` is `true`:

```clojure
(defn unless-fn [condition body]
  (if condition nil body))
```

But since function arguments are evaluated before the function itself is called, the following code will _always_ write a log message:

```clojure
(unless-fn true (console.log "should not print"))
```

Macros solve this problem, because they do not evaluate their arguments
immediately. Instead, you get to choose when (and if!) the arguments
to a macro are evaluated. Macros take items of the expression as
arguments and return a new form that is compiled instead.

```clojure
(defmacro unless
  [condition form]
  (list 'if condition nil form))
```

The body of the `unless` macro executes at macro expansion time, producing an `if`
form for compilation. This way the compiled JavaScript is a conditional instead of a function call.

```clojure
(unless true (console.log "should not print"))
```

#### syntax-quote

Simple macros like the above could be written via templating and expressed
as syntax-quoted forms.

`syntax-quote` is almost the same as plain `quote`, but it allows
sub expressions to be unquoted so that form acts as a template.

The symbols inside the form are resolved to help prevent inadvertent symbol capture, which can be done via `unquote` and `unquote-splicing` forms.

```clojure
(syntax-quote (foo (unquote bar)))
(syntax-quote (foo (unquote bar) (unquote-splicing bazs)))
```

Note that there is special syntactic sugar for both unquoting operators:

1. Syntax quote: Quote the form, but allow internal unquoting so that the form acts
as template. Symbols inside the form are resolved to help prevent inadvertent symbol
capture.

```clojure
`(foo bar)
```

2. Unquote: Use inside a syntax-quote to substitute an unquoted value.

```clojure
`(foo ~bar)
```

3. Splicing unquote: Use inside a syntax-quote to splice an unquoted
list into a template.

```clojure
`(foo ~bar ~@bazs)
```

For example, the built-in `defn` macro can be defined with a simple
template macro. That's more or less how the built-in `defn` macro is implemented.

```clojure
(defmacro define-fn
  [name & body]
  `(def ~name (fn ~@body)))
```

Now if we use `define-fn` form above, the defined macro will be expanded
at compile time, resulting into different program output.

```clojure
(define-fn print
  [message]
  (.log console message))
```

Not all of the macros can be expressed via templating, but all of the
language is available to assemble macro expanded forms.

#### Another Macro Example

As an example, let's define a macro to ease functional chaining, a technique popular
in JavaScript but usually expressed via method chaining. A typical use of that would be something like:

```javascript
open(target, "keypress").
  filter(isEnterKey).
  map(getInputText).
  reduce(render)
```

Unfortunately, though, it usually requires that all the chained functions need to be methods of an object, which is very limited and has the undesirable effect of making third party functions "second class".

But using macros we can achieve similar chaining without such tradeoffs, and chain _any_ function:

```clojure
(defmacro ->
  [& operations]
  (reduce
   (fn [form operation]
     (cons (first operation)
           (cons form (rest operation))))
   (first operations)
   (rest operations)))

(->
 (open target :keypress)
 (filter enter-key?)
 (map get-input-text)
 (reduce render))
```

## Import/Export (Symbols and Modules)

### Exporting Symbols

All the top level definitions in a file are exported by default:

```clojure
(def foo bar)
(defn greet [name] (str "hello " name))
```

...but it's still possible to define top level bindings without exporting them via `^:private` metadata:

```clojure
(def ^:private foo bar)
```

...and a little syntax sugar for functions:

```clojure
(defn- greet [name] (str "hello " name))
```


### Importing

Module importing is done via an `ns` special form that is manually
named. Unlike `ns` in Clojure(Script), _wisp_ takes a minimalistic
approach and supports only one essential way of importing modules:

```clojure
(ns interactivate.core.main
  "interactive code editing"
  (:require [interactivate.host :refer [start-host!]]
            [fs]
            [wisp.backend.javascript.writer :as writer]
            [wisp.sequence
             :refer [first rest]
             :rename {first car rest cdr}]))
```

Let's go through the above example to get a complete picture regarding
how modules can be imported:

1. The first parameter `interactivate.core.main` is a name of the
module / namespace. In this case it represents module
`./core/main` under the package `interactivate`. While this is
not enforced in any way the common convention is that these mirror the filesystem hierarchy.

2. The second string parameter is just a description of the module
and is completely optional.

3. The `(:require ...)` form defines dependencies that will be
imported at runtime, and the example above imports multiple modules:

  1. First it imports the `start-host!` function from the
     `interactivate.host` module. That will be loaded from the
     `../host` location, since because module paths are resolved
     relative to a name, but only if they share the same root.
  2. The second form imports `fs` module and makes it available under
     the same name. Note that in this case it could have been
     written without wrapping it in brackets.
  3. The third form imports `wisp.backend.javascript.writer` module
     from `wisp/backend/javascript/writer` and makes it available
     via the name `writer`.
  4. The last and most complex form imports `first` and `rest`
     functions from the `wisp.sequence` module, although it also
     renames them and there for makes available under different
     `car` and `cdr` names.

While Clojure has many other kinds of reference forms they are
not recognized by _wisp_ and will therefore be ignored.

### Types and Protocols

In wisp protocols can be defined same as in Clojure(Script),
via [defprotocol](http://clojuredocs.org/clojure_core/clojure.core/defprotocol):

```clojure
(defprotocol ISeq
  (-first [coll])
  (-rest [coll]))

(defprotocol ICounted
  (^number count [coll] "constant time count"))
```

Above code will define `ISeq`, `ICounted` protocols (objects representing
those protocol) and `_first`, `_rest`, `count` functions, that dispatch on
first argument (that must implement associated protocol).


Existing types / classes (defined either in wisp or JS) can be
extended to implement specific protocol using
[extend-type](http://clojuredocs.org/clojure_core/clojure.core/extend-type):

```clojure
(extend-type Array
  ICounted
  (count [array] (.-length array))
  ISeq
  (-first [array] (aget array 0))
  (-rest [array] (.slice array 1)))
```

Once type / class implements some protocol, its functions can be used
on the instances of that type / class.

```clojure
(count [])        ;; => 0
(count [1 2])     ;; => 2
(-first [1 2 3])  ;; => 1
(-rest [1 2 3])   ;; => [2 3]
```

In wisp value can be checked to satisfy given protocol same as in
Clojure(Script) via [satisfies?](http://clojuredocs.org/clojure_core/clojure.core/satisfies_q):

```clojure
(satisfies? ICounted [1 2])
(satisfies? ISeq [])
```

New types (that translate to JS classes) can be defined same as in
Clojure(Script) via [deftype](http://clojuredocs.org/clojure_core/clojure.core/deftype)
form:

```clojure
(deftype List [head tail size]
  ICounted
  (count [_] size)
  ISeq
  (-first [_] head)
  (-rest [_] tail)
  Object
  (toString [self] (str "(" (join " " self) ")")))
```

Note: Protocol functions are defined as methods with unique names
(that include namespace info where protocol was defined, protocol
name & method name) to avoid name collisions on types / classes
implementing them. This implies that such methods aren't very
useful from JS side. Special `Object` protocol can be used to
define methods who's names will be kept as is, which can be used
to define interface to be used from JS side (like `toString`
method above).

In wisp multiple types can be extended to implement a specific
protocol using [extend-protocol](http://clojuredocs.org/clojure_core/clojure.core/extend-protocol)
form same as in Clojure(Script) too.

[homoiconicity]:http://en.wikipedia.org/wiki/Homoiconicity
[clojure]:http://clojure.org/
[macros]:http://clojure.org/macros
[s-expressions]:http://en.wikipedia.org/wiki/S-expression
[clojurescript]:https://github.com/clojure/clojurescript
[markdown]:http://daringfireball.net/projects/markdown/

