# Wisp

Wisp is a [homoiconic][homoiconicity] JavaScript dialect with [clojure] syntax,
[s-expressions] and [macros]. Unlike [clojurescript], Wisp code compiles to
human-readable JavaScript. The goal of Wisp is to compile to the JavaScript
you would have written anyway. Think of Wisp as [markdown] for JS programing!

[Homoiconic][homoiconicity] syntax and [macros] are the primary motivations!

![meta](http://upload.wikimedia.org/wikipedia/en/b/ba/DrawingHands.jpg)

# Try

You can try it before you buy it:
http://jeditoolkit.com/wisp/

# Install

    npm install -g wisp

[![Build Status](https://secure.travis-ci.org/Gozala/wisp.png)](http://travis-ci.org/Gozala/wisp)


# Introduction


Wisp is homoiconic JS dialect with a clojure syntax, s-expressions and
macros. Wisp code compiles to a human readable javascript, which is one
of they key differences from clojurescript.


## Data structures



#### nil

`nil` is just like JS `undefined` with a difference that it's
can not be redefined. It's just a shortcut for `void(0)` in JS.

```clojure
nil ;; => void(0)
```

#### Booleans

Wisp booleans `true` / `false` are plain JS booleans.

```clojure
true ;; => true
```

#### Numbers

Wisp numbers are JS numbers

```clojure
1  ;; => 1
```

#### Strings

Wisp strings are JS Strings

```clojure
"Hello world"
```

Wisp strings can be multiline

```clojure
"Hello,
My name is wisp!"
```

#### Characters

Characters are syntatic sugar for JS single char strings

```clojure
\a  ;; => "a"
\b  ;; => "b"
```

#### Keywords
Keywords are symbolic identifiers that evaluate to themselves.

```clojure
:keyword  ;; => "keyword"
```

Since in JS string constats fulfill this purpose of symbolic identifiers,
keywords compile to equivalent JS strings.

```clojure
(window.addEventListener :load handler false)
```

Keywords can also be invoked as functions, that desugars to associated
value access in JS:

```clojure
(:bar foo) ;; => foo["bar"]
```


#### Vectors

Wisp vectors are JS arrays.

```clojure
[ 1 2 3 4 ]
```
Note: Commas are white space & can be used if desired

```clojure
[ 1, 2, 3, 4]
```


#### Maps

Maps are hash maps, plain JS objects. Note that unlike in clojure keys can not
be of arbitary types.

```clojure
{ "foo" bar :beep-bop "bop" 1 2 }
```

Commas are optional but can come handy for separating key value pairs.

```clojure
{ a 1, b 2 }
```

*In a future JSONs syntax may be made compatible with map syntax.*


#### Lists

You can't have a lisp without lists! Wisp is homoiconic and it's code is made
up of lists representing expressions. The first item in the expression is a
function, being invoked with rest items as arguments.


```clojure
(foo bar baz) ; => foo(bar, baz);
```

## Conventions

Wisp puts a lot of effort in making naming conventions transparent,
by encouraning lisp conventions and then translating them to equivalent
JS conventions:

```clojure
(dash-delimited)   ;; => dashDelimited
(predicate?)       ;; => isPredicate
(**privates**)     ;; => __privates__
(list->vector)     ;; => listToVector
```

As a side effect some names can be expressed in a few ways, although
it's considered to be an advantage.

```clojure
(parse-int x)
(parseInt x)

(array? x)
(isArray x)
```


## Special forms

There are some functions in wisp that are special, in a sence that
they compile to JS expressions & can not be passed around as regular
functions. JS operators are represteted in wisp as special forms


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

#### Conditionals

Conditional code branching in wisp is expressed via
if special form. First expression following `if` is a condition,
if it evaluates to `true` result of the `if` expression is second
expression otherwise it's third expression.

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

Also number of expressions is `do` special form 0 to many. If `0`
result of evaluation will be nil.

```clojure
(do)
```

#### Bindings

Let special form evaluates containing expressions in a
lexical context of in which simbols in the bindings-forms (first item)
are bound to their respective expression results.

```clojure
(let [a 1
      b (+ a c)]
  (+ a b))
```


#### Functions

Wisp functions are JS functions

```clojure
(fn [x] (+ x 1))
```

Wisp functions can be named similar to JS

```clojure
(fn increment [x] (+ x 1))
```

Wisp functions can also contain documentation and some metadata.
Note: Docstring and metadata is not presented in compiled JS yet,
but in a future it will compile to comments associated with function.

```clojure
(fn incerement
  "Returns a number one greater than given."
  {:added "1.0"}
  [x] (+ x 1))
```

Wisp makes capturing of rest arguments a lot easier than JS. argument
that follows special `&` simbol will capture all the rest args in array.

```clojure
(fn [x & rest]
  (rest.reduce (fn [sum x] (+ sum x)) x))
```

Overloads - In wisp functions can be overloaded depending on number
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



## Other Special Forms

Instantiation - In wisp type instantiation has a consice form, type
function just needs to be suffixed with `.` character

```clojure
(Type. options)
```

More verbose but JS like form is also there 

```clojure
(new Class options)
```


Method calls - In wisp method calls are no different from function
calls, it's just method functions are perfixed with `.` character

```clojure
(.log console "hello wisp")
```

Also more JS like forms are supported too!

```clojure
(window.addEventListener "load" handler false)
```


Attribute access - In wisp attribute access is also just like function
call. Attribute name just needs to be prefixed with `.-`

```clojure
(.-location window)
```

Compound properties can be access via `get` special form

```clojure
(get templates (.-id element))
```

Catching exceptions - In wisp exceptions can be handled via `try` 
special form. As everything else try form is also expression. It
results to nil if no handling takes place.

```clojure
(try (raise exception))
```

Although catch form can be used to handle exceptions

```clojure
(try
  (raise exception)
  (catch error (.log console error)))
```

Also finally clause can be used when necessary

```clojure
(try
  (raise exception)
  (catch error (recover error))
  (finally (.log console "That was a close one!")))
```


Throwing exceptions - Throw special form allows throwing exceptions,
although doing that is not idiomatic.

```clojure
(fn raise [message] (throw (Error. message)))
```


## Macros

Wisp has a programmatic macro system which allows the compiler to
be extended by user code. Many core constructs of Wisp are in fact
normal macros.

#### quote

Before diving into macros too much, we need to learn about few more
things. In lisp any expression can be marked to prevent it from being
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

Any expression can be quoted, to prevent it's evaluation. Although your
resulting programs should not have these forms compiled to JS.

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

The body of unless macro executes at macro expansion time, producing an
if form for compilation. Which later is compiled as usual. This way
compiled JS is a conditional instead of function call.

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

Also there is a special syntax sugar for both unquoting operators:

Syntax quote: Quote form, but allow internal unquoting so that form
acts as template. Symbols inside form are resolved to help prevent
inadvertent symbol capture.

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

For expmale build-in `defn` macro can be defined expressed with
simple template macro. That's more or less how build-in `defn`
macro is implemented.

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
For instance let's define macro to ease functional chanining popular
in JS but usually expressed via method chaining. For example following
API is pioneered by jQuery is very common in JS:

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
  (reduce-list
   (rest operations)
   (fn [form operation]
     (cons (first operation)
           (cons form (rest operation))))
   (first operations)))


(->
 (open target :keypress)
 (filter enter-key?)
 (map get-input-text)
 (reduce render))
```


[homoiconicity]:http://en.wikipedia.org/wiki/Homoiconicity
[clojure]:http://clojure.org/
[macros]:http://clojure.org/macros
[s-expressions]:http://en.wikipedia.org/wiki/S-expression
[clojurescript]:https://github.com/clojure/clojurescript
[markdown]:http://daringfireball.net/projects/markdown/

