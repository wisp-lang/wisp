# History

## 0.10.0

  - Implement support for `defprotocol`, `deftype`, `defrecord`,
  `extend-type` and `extend-protocol` forms.

## 0.9.0

  - Compiler no longer does dummy string concatinations instead
    JS AST is emited from which `esprima` generates JS.
  - Implement analyzer that does analyzes read forms to add
    variable shadowing info, do macroexpansion etc..
  - Reader now includes source location into all read forms
    except primitives.
  - Compiler generates source maps unless disabled manually.
  - `fn` form no longer supports clojure(script) incompatible
    API.
  - Improvements in conventional name translations.
  - Compiler now throws errors on invalid forms, instead of
    generating invalid JS.
  - Add support for binding shadowing in let and loop forms,
    now bindings defined in those forms get unique names with
    suffix of the shadow depth.
  - Bunch of reader improvements.
  - Macros now support special `&env` and `&form` arguments.
  - Enhanced CLI tool.

## 0.8.1

  - Remove support for third non-standard argument for `aget`.
  - Implement `interleave` high order function.
  - Implement `some` high order function.
  - Implement `partition` high order function.
  - Implement `every?` function.
  - Rewrite `get` as macro compiling to `aget` forms.
  - Make re-pattern writer.
  - Alias `compile*` as `compile-program`.
  - Implement `.` operator as a macro.
  - Fix `aget` with for quoted attributes `(aget foo 'bar).
  - Move `instance?` form expander to a writer.
  - Add `(debugger!)` form to generate `debugger;` statements.

## 0.8.0

  - Remove `:use` forms in favor of `:require`.
  - Remove `import` macro in favor of `:require`.

## 0.7.1

  - Implement `assoc` function.
  - Make `:use` form for imports obsolete by extending `:require`.

## 0.7.0

  - Migrate to imports via clojure compatible `ns` form instead custom
    `import` forms used previously.
  - Factor out interactive try tool into seperate project:
    https://github.com/Gozala/try-wisp

## 0.6.7

  - Implement `repeat` function that is similar to clojure's but
    is not lazy and only supports finite options.
  - Implement `(print foo bar)` function & macro that serves as a
    shortcut for `(.log console foo bar)`.
  - Implement `ns` macro that implements subset of clojure's `ns` that
    compiles to plain requires. For now only few types of requirement
    declarations are recognized and compiled to `require` calls.
    - `(:require module.name)`
    - `(:require lib.foo :as foo)`
    - `(:use wisp.sequence :only [first second])`
    - `(:use wisp.sequence :rename {first car rest cdr})
    Relative requires forms are produced by resolving requirements to
    a defined ns name. If requirement does not shares root of ns name
    then absolute require forms are generated.
  - Update travis-ci config to test on later node versions.

## 0.6.6

  - Fix indentation in compile output to avoid trailing white-spaces.
  - Fix compile output for `get` special form to allow `nil` as first
    argument and add fallback argument support.
  - Stop tracking compiled JS in git.
  - Change file layout to allow loading of core modules like: `wisp/runtime`.

## 0.6.5

  - Implement `identity` function.
  - Factor out parts of `compiler` into backend specific `writer`.
  - Implement `seq?` function.
  - Implement `take-while` function.
  - Various code maintainibily improvements.
  - Add `read*` function for reading out multiple forms.
  - Add `compile*` function for complining multiple forms.

## 0.6.4

  - Fix regression in REPL.
  - Change reader such that no unread is necessary.
  - Fix metadata mixup in multiline forms.

## 0.6.3

  - Fix bugs introduced by 0.6.1 and re-release.

## 0.6.2

  - Revert back to 0.6.0 as builds were broken.

## 0.6.1

  - Remove obsolete `exprots` form in favor of
    implicit exports.

## 0.6.0

  - Add support for `()` form as a sugar to `'()`
  - Improve REPL support for multi-line inputs.
  - Add `*debug*` setting to REPL to print intermediate forms.
  - Allow access to last 3 forms read in REPL from `**1`, `**2`, `**3`.
  - Allow access to last 3 evalution result in REPL as `*1`, `*2` `*3`.
  - Make wisp types more tolarant to multiple JS contexts.
  - Fix bug in `(get (or a b) c)` like forms.
  - Make `(:foo bar)` compatible with `nil` `bar` values.
  - Export all the top level definitions unless marked as private.
  - Implement `defn-` macro for defining private functions.
  - Implement `str` macro in order to inline common cases.
  - Fix keyword based metadata sugar `(^:foo bar) ;; => (with-meta bar {:foo true})`.
  - Improvements to `assert` macro.
  - Reader simplifications.

## 0.5.0

  - Improved REPL prints lisp forms instead of JS.
  - Implement `pr-str` function from clojure.
  - Symbols now obtain take metadata.

## 0.4.1

  - Fix regressions introduced in 4.0.0
  - Rewrite function compiler to depend less on symbol implementation details.

## 0.4.0

  - Compile symbols to function calls `'foo => (symbol nil "foo")`.
  - Covert `=` special form to clojure compliant function.

## 0.3.3

  - Implement runtime equivalents of `= == + - / * > >= < <=` special forms.
  - Implement runtime equivalents of `and or` special forms.

## 0.3.2

  - Hotfix `(/ a b)` special forms.

## 0.3.1

  - Fix the way `/` symbols are handled.

## 0.3.0

  - Initial support for lazy sequences.
  - Improve conventional name translation to handle `+ - / * > < >= <=` better.
  - Minor bug fixes.

## 0.2.0

  - Add short anonymous function literal support.
  - Fix regex with `/` chars.
  - Add line and column information to the metadata.
  - Reader code cleanup.

## 0.1.2

  - Remove backend specific forms like `.concat`, `.indexOf`, etc form
    reader and compiler.

## 0.1.1

  - Implement string module.
  - Minor enhancements to runtime type check functions.
  - Cleanup modules from JS specific calls.

## 0.1.0

  - Implement type agnostic sequence module.

## 0.0.3

  - Fix typos in introduction code.

## 0.0.2


  - Compiler simplifications
  - Switch to literal forms of array, hash, symbols now that new compiler
    supports them.
  - Improve internal macro system to allow `fn` installations as macros.
  - Implement built-in macros as functions.
  - Implement `apply` special form.
  - Fix `concat-list` to support multiple unquote-splicings in a list.
  - Implement function overload on arity.
  - Implement generic sequence functions in a sequence module.
  - Write wisp introduction guide.

## 0.0.1

  - Initial release
