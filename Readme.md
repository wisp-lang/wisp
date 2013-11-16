# wisp

[![Build Status](https://secure.travis-ci.org/Gozala/wisp.png)](http://travis-ci.org/Gozala/wisp)

Wisp is a [homoiconic][homoiconicity] JavaScript dialect with [Clojure][]
syntax, [s-expressions][] and [macros][]. Unlike [ClojureScript][], wisp
does not depend on the JVM and is completely self-hosted, embracing
native JavaScript data structures for better interoperability.

The main goal of wisp is to provide a rich subset of Clojure(Script) so 
that packages written in wisp can work seamlessly with Clojure(Script) and
JavaScript without data marshalling or code changes.

Wisp also does its best to compile down to JavaScript you would have written
by hand - think of wisp as [markdown] for JavaScript programming, but with
the added subtlety of LISP S-expressions, [homoiconicity][homoiconicity] and 
powerful [macros] that make it the easiest way to write JavaScript.

![meta](http://upload.wikimedia.org/wikipedia/en/b/ba/DrawingHands.jpg)

# Try Wisp

You can try wisp on your browser by [trying the interactive compiler](http://jeditoolkit.com/try-wisp/) or [an online REPL](http://jeditoolkit.com/interactivate-wisp) with syntax highlighting.

# Install

You can install wisp locally via `npm` by doing:

    npm install -g wisp

...and then running `wisp` to get a REPL. To compile standalone `.wisp` files, simply do:

    cat in.wisp | wisp > out.js


# Language Essentials

## Data structures


#### nil

`nil` is just like JavaScript `undefined` with the difference that it
cannot be redefined. It compiles down to `void(0)` in JavaScript.

```clojure
nil ;; => void(0)
```

#### Booleans

`true` / `false` are directly equivalent to plain JavaScript booleans:

```clojure
true ;; => true
```

#### Numbers

Wisp numbers are directly equivalent to JavaScript numbers:

```clojure
1  ;; => 1
```

#### Strings

Wisp strings are JavaScript strings:

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
\a  ;; => "a"
\b  ;; => "b"
```

#### Keywords
Keywords are symbolic identifiers that evaluate to themselves:

```clojure
:keyword  ;; => "keyword"
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
(:bar foo) ;; => (foo || 0)["bar"]
```

Note that keywords in wisp are not real functions so they can't be composed
or passed to high order functions.

#### Vectors

Wisp vectors are plain JavaScript arrays, but nevertheless all standard
library functions are non-destructive and pure functional as in Clojure.

```clojure
[ 1 2 3 4 ]
```
Note: Commas are considered whitespace and can be used if desired:

```clojure
[ 1, 2, 3, 4]
```
#### Dictionaries

Wisp does not have Clojure-like value-to-value maps by default, but rather dictionaries that map to plain JavaScript objects.

Therefore, unlike Clojure, keys cannot consist of arbitrary types.

```clojure
{ "foo" bar :beep-bop "bop" 1 2 }
```
Like with vectors, commas are optional but can come handy for separating key value pairs.

```clojure
{ :a 1, :b 2 }
```

#### Lists

What would be a LISP without lists right ?! Wisp is homoiconic and its
code is made up of lists representing expressions. As in other LISPs
first item of the expression is an operator / function, that is passed
rest of the list items.


```clojure
(foo bar baz) ; => foo(bar, baz);
```

In compiled JavaScript it's quite unlikely to end up with lists as it's
primarily serves it's purpose at compile time. Never the less lists
are exposed by standard library and can be used, but we'll get back
to this later.

#### Arrays

Wisp partially emulates Clojure handling of Java arrays by using `aget`:

```clojure
(aget an-array 2) ; => anArray[2];
(set! (aget an-array 2) "bar") ; => anArray[2] = "bar";
```

## Conventions

Wisp makes it's best effort to compile to JavaScript that one would write by
hand, but it also trys to embrace idiomatic naming conventios of LISP.
To make this possible wisp translates LISP name conventions to related
JavaScript conventions:

```clojure
(dash-delimited)   ;; => dashDelimited
(predicate?)       ;; => isPredicate
(**privates**)     ;; => __privates__
(list->vector)     ;; => listToVector
```

Side effect of this is that same thing may be expressed in a few differnt
ways, although it's unlikely to cause problems instead it should lead to
very natural APIs from both JavaScript and LISP perspective.

```clojure
(parse-int x)
(parseInt x)

(array? x)
(isArray x)
```


## Special forms

There are some special operators in wisp, in a sense that
they compile to JavaScript expressions rather then function calls,
although same named functions are also available in standard
library to allow function composition.

#### Arithmetic operations

Wisp comes with special form for arithmetic operations.

```clojure
(+ a b)        ; => a + b
(+ a b c)      ; => a + b + c
(- a b)        ; => a - b
(* a b c)      ; => a * b * c
(/ a b)        ; => a / b
(mod a b)      ; => a % 2
```

#### Comparison operations

Wisp comes with special forms for comparisons

```clojure
(identical? a b)     ;; => a === b
(identical? a b c)   ;; => a === b && b === c
(= a b)              ;; => a == b
(= a b c)            ;; => a == b && b == c
(> a b)              ;; => a > b
(>= a b)             ;; => a >= b
(< a b c)            ;; => a < b && b < c
(<= a b c)           ;; => a <= b && b <= c
```

#### Logical operations

Wisp comes with special forms for logical operations

```clojure
(and a b)            ;; => a && b
(and a b c)          ;; => a && b && c
(or a b)             ;; => a || b
(and (or a b)
     (and c d))      ;; (a || b) && (c && d)
```


#### Definitions

Variable definitions also happen through special forms.

```clojure
(def a)     ; => var a = void(0);
(def b 2)   ; => var b = 2;
```

#### Assignments

In wisp new values can be set to a variables via `set!`
special form. Note that in functional programing binding changes are
a bad practice, avoiding those would make your programs only better!
Still if you need it you have it.

```clojure
(set! a 1)
```
Note that `!` suffic serves as an alert of causing side-effects.

#### Conditionals

Conditional code branching in wisp is expressed via
if special form. First expression following `if` is a condition,
if it evaluates to `true` result of the `if` expression is the
second expression, otherwise it's the third expression.

```clojure
(if (< number 10)
  "Digit"
  "Number")
```

Else expression is optional, if missing and conditional evaluates to
`true` result will be `nil`.

```clojure
(if (monday? today) "How was your weekend")
```



#### Combining expressions

In wisp is everything is an expression, but sometimes one might
want to combine multiple expressions into one, usually for the
purpose of evaluating expressions that have side-effects

```clojure
(do
  (console.log "Computing sum of a & b")
  (+ a b))
```

`do` can take any number of expressions, even 0.  If `0`, the result of
evaluation will be nil.

```clojure
(do) ;; => nil
```

#### Bindings

Let special form evaluates containing expressions in a
lexical context of in which symbols in the bindings-forms (first item)
are bound to their respective expression results.

```clojure
(let [a 1
      b (+ a c)]
  (+ a b))
```


#### Functions

Wisp functions are JavaScript functions

```clojure
(fn [x] (+ x 1))
```

Wisp functions can have names, just as in JavaScript

```clojure
(fn increment [x] (+ x 1))
```

Wisp functions can also contain documentation and some metadata.
Note: Docstrings and metadata are not presented in compiled JavaScript yet,
but in the future they will compile to comments associated with function.

```clojure
(fn incerement
  "Returns a number one greater than given."
  {:added "1.0"}
  [x] (+ x 1))
```

Wisp makes capturing of rest arguments a lot easier than JavaScript. argument
that follows special `&` symbol will capture rest args in standar vector
(array).

```clojure
(fn [x & rest]
  (rest.reduce (fn [sum x] (+ sum x)) x))
```

#### Overloads

In wisp functions can be overloaded depending on number
of arguments they take, without introspection of rest arguments.

```clojure
(fn sum
  "Return the sum of all arguments"
  {:version "1.0"}
  ([] 0)
  ([x] x)
  ([x y] (+ x y))
  ([x & more] (more.reduce (fn [x y] (+ x y)) x)))
```

If function does not has variadic overload and more arguments is
passed to it, it throws exception.

```clojure
(fn
  ([x] x)
  ([x y] (- x y)))
```

#### Loops

The classic way to build a loop in a LISP is a recursive call,
and it’s in wisp as well. To do that it provides `loop` `recur`
pair.

```clojuerscript
(loop [x 10]
  (if (> x 1)
    (print x)
    (recur (- x 2))))
```

## Other Special Forms

### Instantiation

In wisp type instantiation has a concise form. The type
function just needs to be suffixed with `.` character

```clojure
(Type. options)
```

The more verbose but more JavaScript-like form is also valid

```clojure
(new Class options)
```

#### Method calls

In wisp method calls are no different from function calls, it's just that method
functions are prefixed with `.` character

```clojure
(.log console "hello wisp")
```

More JavaScript-like forms are supported too!

```clojure
(window.addEventListener "load" handler false)
```

#### Attribute access

In wisp attribute access is also just like function
call. Attribute name just needs to be prefixed with `.-`

```clojure
(.-location window)
```

Compound properties can be access via `get` special form

```clojure
(get templates (.-id element))
```

#### Catching exceptions

In wisp exceptions can be handled via `try` special form. As with everything
else, the `try` form is also expression. It results to `nil` if no handling
takes place.

```clojure
(try (raise exception))
```

Although the `catch` form can be used to handle exceptions

```clojure
(try
  (raise exception)
  (catch error (.log console error)))
```

Also `finally` clause can be used when necessary

```clojure
(try
  (raise exception)
  (catch error (recover error))
  (finally (.log console "That was a close one!")))
```


#### Throwing exceptions

Throw special form allows throwing exceptions, although doing that is not
idiomatic.

```clojure
(fn raise [message] (throw (Error. message)))
```

## Macros

Wisp has a programmatic macro system which allows the compiler to
be extended by user code. Many core constructs of Wisp are in fact
normal macros.

#### quote

Before diving into macros too much, we need to learn about few more
things. In LISP any expression can be marked to prevent it from being
evaluated. For instance, if you enter the symbol `foo` you will be
evaluating the reference to the value of the corresponding variable.

```clojure
foo
```

If you wish to refer to the literal symbol, rather than reference you
could use

```clojure
(quote foo)
```

or more usually

```clojure
'foo
```

Any expression can be quoted, to prevent its evaluation. Although your
resulting programs should not have these forms compiled to JavaScript.

```clojure
'foo
':bar
'(a b)
```

Wisp doesn’t have `unless` special form or a macro, but it's trivial
to implement it via macro. Although let's try implemting it as a
function to understand a use case for macro!

We want to execute body unless condition is `true`.

```clojure
(defn unless-fn [condition body]
  (if condition nil body))
```

Although following code will log "should not print" anyway, since
function arguments are exectued before function is called.

```clojure
(unless-fn true (console.log "should not print"))
```

Macros solve this problem, because they do not evaluate their arguments
immediately. Instead, you get to choose when (and if!) the arguments
to a macro are evaluated. Macros take items of the expression as
arguments and return new form that is compiled instead.

```clojure
(defmacro unless
  [condition form]
  (list 'if condition nil form))
```

The body of unless macro executes at macro expansion time, producing an `if`
form for compilation. Later this is compiled as usual. This way the compiled JavaScript
is a conditional instead of function call.

```clojure
(unless true (console.log "should not print"))
```

#### syntax-quote

Simple macros like above could be written via templating, expressed
as syntax-quoted forms.

`syntax-quote` is almost the same as the plain `quote`, but it allows
sub expressions to be unquoted so that form acts a template. Symbols
inside form are resolved to help prevent inadvertent symbol capture.
Which can be done via `unquote` and `unquote-splicing` forms.

```clojure
(syntax-quote (foo (unquote bar)))
(syntax-quote (foo (unquote bar) (unquote-splicing bazs)))
```

Note that there is special syntactic sugar for both unquoting operators:

Syntax quote: Quote the form, but allow internal unquoting so that the form acts
as template. Symbols inside form are resolved to help prevent inadvertent symbol
capture.

```clojure
`(foo bar)
```

Unquote: Use inside a syntax-quote to substitute an unquoted value.

```clojure
`(foo ~bar)
```

Splicing unquote: Use inside a syntax-quote to splice an unquoted
list into a template.

```clojure
`(foo ~bar ~@bazs)
```

For example, the built-in `defn` macro can be defined expressed with simple
template macro. That's more or less how build-in `defn` macro is implemented.

```clojure
(defmacro define-fn
  [name & body]
  `(def ~name (fn ~@body)))
```

Now if we use `define-fn` form above defined macro will be expanded
and compile time resulting into diff program output.

```clojure
(define-fn print
  [message]
  (.log console message))
```

Not all of the macros can be expressed via templating, but all of the
language is available at hand to assemble macro expanded form.
For instance let's define a macro to ease functional chaining popular
in JavaScript but usually expressed via method chaining. For example following
API is pioneered by jQuery is very common in JavaScript:

```javascript
open(target, "keypress").
  filter(isEnterKey).
  map(getInputText).
  reduce(render)
```

Unfortunately though it usually requires all the functions need to be
methods of dsl object, which is very limited. Making third party
functions second class. Via macros we can achieve similar chaining
without such tradeoffs.

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

## Export/Import modules

### Export

All the top level definition in a file are by default exported:

```clojure
(def foo bar)
(defn greet [name] (str "hello " name))
```

Although it's still possible to define top level bindings without
exporting them via ^:private matada:

```clojure
(def ^:private foo bar)
```

For functions there is even syntax sugar:

```js
(defn- greet [name] (str "hello " name))
```


### Import

Module importing is done via `ns` special form that is manually
named. Unlike `ns` in clojure in wisp it's super minimalistic and
supports only one essential way of importing modules:

```clojure
(ns interactivate.core.main
  "interactive code editing"
  (:require [interactivate.host :refer [start-host!]]
            [fs]
            [wisp.backend.javascript.writer :as writer]
            [wisp.sequence
             :refer [first rest]
             :rename {first car rest cadr}]))
```

Let's go through the above example to get a complete picture on
how modules can be imported:

First parameter `interactivate.core.main` is a name of the
module / namespace, in this case it represent's module
`./core/main` under the package `interactivate`. While this is
not enforced in any way it's recomended to replecate filesystem
path's in name.

Second string parameter is just a description of the module
and is completely optional.

Next `(:require ...)` form defines dependencies that will be
imported at runtime. Given example imports multiple modules:

  1. First import will import `start-host!` function from the
     `interactivate.host` module. Which will be loaded from the
     `../host` location. That's because modules path is resolved
     relative to a name, but only if they share same root.
  2. Second form imports `fs` module and make it available under
     the same name. Note that in this case it could have being
     written without wrapping it into brackets.
  3. Third form imports `wisp.backend.javascript.writer` module
     from `wisp/backend/javascript/writer` and makes it available
     via `writer` name.
  4. Last and most advanced form imports `first` and `rest`
     functions from the `wisp.sequence` module, although it also
     renames them and there for makes available under different
     `car` and `cdr` names.

While clojure has many other kind of reference forms they are
not recognized by wisp and there for will be ignored.


[homoiconicity]:http://en.wikipedia.org/wiki/Homoiconicity
[clojure]:http://clojure.org/
[macros]:http://clojure.org/macros
[s-expressions]:http://en.wikipedia.org/wiki/S-expression
[clojurescript]:https://github.com/clojure/clojurescript
[markdown]:http://daringfireball.net/projects/markdown/

