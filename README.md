# LispyScript

## Javascript using a Lispy syntax

### Why LispyScript?
### It's fun! It has macros! Compiles to Javascript.


Hello World! in LispyScript.

    (console.log "Hello LispyScript!")
  
A LispyScript program is made up of expressions in parenthesis. The first element in the expression
is a function or a LispyScript keyword. The rest of the elements (separated by space characters) are
the arguments to the function. As you can see above we can directly access javascript functions from
LispyScript.

A more intricate Hello World!

    (if (undefined? window)
      (console.log "Hello LispyScript!")
      (alert "Hello LispyScript!"))

You can have expressions within expressions.

An anonymous function in LispyScript.

    (function (x) (* x x))
      
The first element in an expression can be an anonymous function.

    ((function (x) (* x x)) 2)
    
That was the anonymous function above evaluated immediately with argument 2. Functions
return the last expression evaluated within the function.

You can set a variable name to a function.

    (var square
      (function (x)
        (* x x)))
    (console.log (square 10))

The 'var' expression takes a variable name as the second element and sets its value to the third.

All Javascript functions, objects and literals can be used in LispyScript. Let us do an example using
underscorejs.

    (var _ (require 'underscore'))
    (_.each [1, 2, 3] (function (elem i list) (console.log elem)))

If you noticed we passed a Javascript literal array as the first argument to '_.each'. You could just as well
have passed in '{one: 1, two: 2, three: 3}' instead.

The node server example in LispyScript.

    (var http (require "http"))
    (var server
      (http.createServer 
        (function (request response)
          (response.writeHead 200 {'Content-Type': 'text/plain'})
          (response.end "Hello World\n"))))
    (server.listen 1337 "127.0.0.1")
    (console.log "Server running at http://127.0.0.1:1337/")

LispyScript is not a dialect of Lisp. There is no list processing in LispyScript . LispyScript
is Javascript using a Lispy syntax (a tree syntax). This is so that we can manipulate the syntax tree
while compiling, in order to support macros.

You can define a macro.

    (macro array? (obj)
      (= (toString.call ~obj) "[object Array]"))

The 'array?' conditional is defined as a macro in LispyScript. The 'macro' expression takes a name as
its second element, a parameters list in the third element, and the fourth element is the template
to which the macro will expand.

Now let us mimic the Lisp 'let' macro in LispyScript.
    
    (macro let (names vals rest...)
      ((function ~names ~rest...) ~@vals))
      
    (let (name email tel) ("John" "john@example.org" "555-555-5555")
      (console.log name) (console.log email) (console.log tel))

The "let" macro creates lexically scoped variables with initial values. It does this by creating
an anonymous function whose argument names are the required variable names, sets the variables to
their initial values by calling the function immediately with the values. The macro also wraps the
required code inside the function. 

Now lets look at the call to the 'let' macro. 'names' will correspond to '(name email tel)'. 'rest...'
corresponds to '(console.log name) (console.log email) (console.log tel)', which is the rest of the 
expressions after vals. We want to dereference these values in the macro template, and we do that
with '~names', '~rest...'. However 'vals' corresponds to ("John" "john@example.org" "555-555-5555").
But thats not the way we want to dereference it. We need to dereference it without the parenthesis.
For that we use '~@vals'.

We don't really need 'let' in LispyScript. We have 'var'. But if you need it, you can extend LispyScript
by adding this macro to your code. Thats the power of macros. You can
extend the language itself or create your own domain specific language.

## Installing LispyScript

1) Clone the repository into a folder.

2) Add "path/to/lispiscript/bin" to your path.

## Using LispyScript

1) Typing "lispy" into the command prompt will open the REPL.

2) Typing "lispy test.ls" will compile "test.ls" into "test.js" in the same folder.

3) Type "lispy src/test.ls lib/test.js" to be more explicit.


