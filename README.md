# LispyScript

## Javascript using a Lispy syntax

### Why LispyScript? It's fun! It has macros! Compiles to Javascript.

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

The 'if' expression takes a conditional expression and one or two more expressions.
The 'if' expression will evaluate
to the first expression after the condition for a true condition, otherwise second.
      
The first element can be an anonymous function.

    ((function (x y) (+ x y)) 1 2)
    
In the expression above we are calling an anonymous function immediately with params 1 and 2.

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

LispyScript is not a dialect of Lisp. If you know a Lisp language, there is no list processing here, . LispyScript
is Javascript using a Lispy syntax (a tree syntax). This is so that we can manipulate the syntax tree
while compiling, to support macros.

The node server example in LispyScript.

    (var http (require "http"))
    (var server
      (http.createServer 
        (function (request response)
          (response.writeHead 200 {'Content-Type': 'text/plain'})
          (response.end "Hello World\n"))))
    (server.listen 1337 "127.0.0.1")
    (console.log "Server running at http://127.0.0.1:1337/")

You can define a macro.

    (macro array? (obj)
      (= (toString.call ~obj) "[object Array]"))

The 'array?' conditional is defined as a macro in LispyScript. The 'macro' expression takes a name as
its second element, a parameters list in the third element, and the fourth element is the template
to which the macro will expand.

Now let us mimic the Lisp 'let' macro in LispyScript.
    
    (macro let (args vals rest...)
      ((function ~args ~rest...) ~@vals))
      
    (let (name email tel) ("John" "john@example.org" "555-555-5555")
      (console.log name) (console.log email) (console.log tel))

The "let" macro is very common in Lisp dialects. It creates a list of lexically scoped variables. It is
not used in LispyScript because we have the var expression. 
It takes as its argument elements, a list of arguments, a list of initial values and the rest of the
expressions to be evaluated inside the let. The "let" macro expands into an immediately called anonymous
function, whose arguments are the let's arguments and the values used to call the function are the values
passed, and the rest of the expressions form the function body. The "~" char is used to dereference the 
elements in the macro template. "args" dereferenced as is. However we don't want
the "vals" argument to be deferenced as is. We only want the elements inside the vals list. (Not
the parenthesis). So we dereference using "~@".
 
