# History

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
