# LispyScript

## A Javascript with Macros!

Lispyscript is Javascript using a 'Lispy' syntax, and compiles to Javascript.

An inherent problem with Javascript is that it has no
macro support, like other Lisp like languages. That's because macros manipulate the syntax tree while
compiling. And this is next to impossible in a language like Javascript. In LispyScript we write Javascript
in a tree structure. If you know Javascript and a Lisp like language, then using LispyScript will be a
breeze. Even if you don't know a Lispy Language, all you need to learn is to write code in a tree structure.

## Hello World! in LispyScript.

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

## Functions

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

## LispyScript is Javascript!

All Javascript functions, objects and literals can be used in LispyScript. 

    (Array.prototype.forEach.call [1, 2, 3]
      (function (elem index list)
        (console.log elem)))

If you noticed we passed a Javascript literal array as the first argument to 'forEach'. You could just as well
have passed in '{one: 1, two: 2, three: 3}' instead.

You can access object methods and properties using the "." notation.

    (console.log (.greet {greet: "hello"}))
    
ie. If the first element of an expression starts with a ".", it's considered as a property of the
second element, and the expresion evaluates to the property.

You can also use the 'get' expression to access a property of an object.

    (console.log (get "greet" {greet: "hello"}))
    (console.log (get 1 [1, 2, 3]))
    
You can 'set' variables too.

    (set window.onload (function () (alert "Page Loaded")))
    
The node server example in LispyScript.

    (var http (require "http"))
    (var server
      (http.createServer 
        (function (request response)
          (response.writeHead 200 {'Content-Type': 'text/plain'})
          (response.end "Hello World\n"))))
    (server.listen 1337 "127.0.0.1")
    (console.log "Server running at http://127.0.0.1:1337/")
    
## Macros

LispyScript is not a dialect of Lisp. There is no list processing in LispyScript . LispyScript
is Javascript using a Lispy syntax (a tree syntax). This is so that we can manipulate the syntax tree
while compiling, in order to support macros.

You can define a macro.

    (macro array? (obj)
      (= (toString.call ~obj) "[object Array]"))

The 'array?' conditional is defined as a macro in LispyScript. The 'macro' expression takes a name as
its second element, a parameters list in the third element, and the fourth element is the template
to which the macro will expand.

Now let us create a Lisp like 'let' macro in LispyScript.
    
    (macro let (names vals rest...)
      ((function ~names ~rest...) ~@vals))
      
    (let (name email tel) ("John" "john@example.org" "555-555-5555")
      (console.log name)
      (console.log email)
      (console.log tel))

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

The compiler requires nodejs and underscorejs installed. However the compiled code is standalone javascript that
will run anywhere.

1) Clone the repository into a folder.

2) Add "path/to/lispiscript/bin" to your path.

## Using LispyScript

1) Typing "lispy" into the command prompt will open a simple REPL.

2) Typing "lispy test.ls" will compile "test.ls" into "test.js" in the same folder.

3) Type "lispy src/test.ls lib/test.js" to be more explicit.

## Reference

## Operators

null?, undefined?, boolean?, number?, string?, object?, array?, function?, =, !=, !, >, <, <=, >=, +, -,
*, /, %, &&, ||.

"=" and "!=" work like "===" and "!==" in Javascript.

## LispyScript Statements

### (str (string expression) ...)

Adds up all the strings.

    (var title "My Home Page")
    (console.log
      (str "<!DOCTYPE html>
    <html>
    <head>
      <title>" title "</title>
    </head>
    <body class=\"test\">
    Hello World
    </body>
    </html>"))

In LispyScript double quoted strings are multiline strings. As you can see above they span multiple lines.
If you need a double quote inside the string, escape it with \".

### (if (condition) (if true expression) (if false expression))

If takes a conditional expression and evaluates the true expression if the condition is true, or the false
expression otherwise.

### (do (expression1) (expression2) ...)

The do statement evaluates a set of expressions passed as it arguments.

### (when (condition) (expression1) (expression2) ...)

The when statement evaluates a set of expressions passed as it arguments when the condition is true.

### (unless (condition) (expression1) (expression2) ...)

The unless statement evaluates a set of expressions passed as it arguments when the condition is false.

### (each object (iterator) [context])

each is just a macro that expands to the native 'forEach' function. So it will not work in old browsers.
For backwards compatibility use a library like 'underscore.js'.

    (each [1, 2, 3]
      (function (elem index list)
        (console.log elem)))
        
The above example using underscore.js.
        
    (var _ (require 'underscore'))
    (_.each [1, 2, 3]
      (function (elem index list)
        (console.log elem)))

### (map object (iterator) [(context)])

map is just a macro that expands to the native 'map' function. So it will not work in old browsers.
For backwards compatibility use a library like 'underscore.js'.

### (reduce object (iterator) memo [context])

reduce is just a macro that expands to the native 'reduce' function. So it will not work in old browsers.
For backwards compatibility use a library like 'underscore.js'.

### (function (arguments expression) (expression1) (expression2) ... )

Creates an anonymous function.

### (macro name (arguments expression) (template expression))

### (try (expression1) (expression2) ... (catch function))

Try takes a set of expressions and evaluates them. The last expression must be a function, that
will be called in case an exception is thrown. The function is called with the error object.

    (var fs (require 'fs'))
    (var outfile "text.txt")
    (try
      (fs.writeFileSync outfile "Hello World")
      (function (err)
        (console.log (+ "Cannot write file " outfile)
        (process.exit 1)))

### (template (argument expression) (string expressions) ... )

    (var link
      (template (data)
        "<li><a href=" (.href data) ">" (.text data) "</a></li>\n"))
    
    (var page 
      (template (title links)
    "<!DOCTYPE html>
    <html>
    <head>
      <title>" title "</title>
    </head>
    <body>
    <ul class='nav'>"
    
    (reduce links (function (memo elem) (+ memo (link elem))) "")
    
    "</ul>
    </body>
    </html>"))
    
    (console.log 
      (page "My Home Page" 
        [{href:"/about", text:"About"},
         {href:"/products", text:"Products"},
         {href:"/contact", text:"Contact"}]))

### (include "string filename")

Includes a file to be compiled with this compilation unit.

### Comments

Comments in LispyScript start with a `;` and span the rest of the line.

### LispyScript was inspired by [Beating the averages](http://www.paulgraham.com/avg.html).

### Discuss LispyScript at [https://groups.google.com/forum/#!forum/lispyscript](https://groups.google.com/forum/#!forum/lispyscript).
