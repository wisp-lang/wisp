# History

## 0.6.2 - 2013/03/10

  - Revert back to 0.6.0 as builds were broken.
  
## 0.6.1 - 2013/03/10

  - Remove obsolete `exprots` form in favor of
    implicit exports.

## 0.6.0 - 2013/03/09

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

## 0.5.0 - 2013/03/08

  - Improved REPL prints lisp forms instead of JS.
  - Implement `pr-str` function from clojure.
  - Symbols now obtain take metadata.

## 0.4.1 - 2013/03/08

  - Fix regressions introduced in 4.0.0
  - Rewrite function compiler to depend less on symbol implementation details.

## 0.4.0 - 2013/03/07

  - Compile symbols to function calls `'foo => (symbol nil "foo")`.
  - Covert `=` special form to clojure compliant function.

## 0.3.3 - 2013/03/06

  - Implement runtime equivalents of `= == + - / * > >= < <=` special forms.
  - Implement runtime equivalents of `and or` special forms.

## 0.3.2 - 2013/03/06

  - Hotfix `(/ a b)` special forms.

## 0.3.1 - 2013/03/06

  - Fix the way `/` symbols are handled.

## 0.3.0 - 2013/03/06

  - Initial support for lazy sequences.
  - Improve conventional name translation to handle `+ - / * > < >= <=` better.
  - Minor bug fixes.

## 0.2.0 - 2013/02/29

  - Add short anonymous function literal support.
  - Fix regex with `/` chars.
  - Add line and column information to the metadata.
  - Reader code cleanup.

## 0.1.2 - 2013/02/28

  - Remove backend specific forms like `.concat`, `.indexOf`, etc form
    reader and compiler.

## 0.1.1 - 2013/02/25

  - Implement string module.
  - Minor enhancements to runtime type check functions.
  - Cleanup modules from JS specific calls.

## 0.1.0 - 2013/02/24

  - Implement type agnostic sequence module.

## 0.0.3 - 2012/10/10

  - Fix typos in introduction code.

## 0.0.2 - 2012/10/10


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

## 0.0.1 - 2012/09/28

  - Initial release
