# LispyScript
## Javascript using a Lispy syntax  
  
  
### Why LispyScript? It's fun! It has macros! Compiles to Javascript.  
  
  
Hello World!

    (console.log "Hello LispyScript!")
    
This is a LispyScript expression, which consists of a list enclosed by parenthesis.
The first element is a function and the second is the argument to the function. And you can
reference Javascript objects and variables directly from LispyScript.  
  

The node server example.

    (var http (require "http"))
    (var server
      (http.createServer 
        (function (req res)
          (res.writeHead 200 {'Content-Type': 'text/plain'})
          (res.end "Hello World\n"))))
    (server.listen 1337 "127.0.0.1")
    (console.log "Server running at http://127.0.0.1:1337/")


    (console.log (+ 1 2))

Elements may also be expressions (lists). However the first element must always be a function ...

    ((function (x y) (+ x y)) 1 2)

or evaluate to a function. This is an anonymous function definition, that is called immediately by the outer
expression. All expressions evaluate to the return value of the function. In this case the number 3 will be returned.

    (var email "info@example.com")

The first element may also be a LispyScript keyword if not a function. var works exactly like the Javascript "var".

    (var square
      (function (x)
        (* x x)))
    (console.log (square 10))
    
We define a function square, and pass the function call as an argument to console.log.

    (if (object? window) "We are running on a browser" "We are running on nodejs")

The if expression evaluates a condition and returns the next element if true or the last element.

    (macro object? (obj)
      (= (typeof ~obj) "object"))

The object? operator is iteslf a LispyScript macro that expands to the = operator.

    (object? window) => (= (typeof window) "object")
    
The = operator in LispyScript works like === in Javascript. The other LispyScript Operators are, !=, 
>, >=, <, <=, !, string?, function?, number?, boolen?, undefined?, null?, +, -, *, /, %.

All Javascript functions can be called directly from LispyScript. Like we called console.log.

    (var fib
      (function (n)
        (loop (a b count) (1 0 n)
          (if (= count 0)
            b
            (recur (+ a b) a (- count 1))))))
    (console.log (fib 10))

Here we define a function to calculate a fibonacci number. It uses the LispyScript loop-recur construct.
If you notice, the recur call here is tail recursive. Try fib 100000! You will get "Infinity". It didn't 
blow the stack. Thats because the loop-recur construct is tail call optimised. The other iteration
functions are "for", "foreach", "map", "reduce". All of them are macros wrapping loop-recur, so are all tail recursive.

    (var http (require "http"))
    ((.listen
      (http.createServer 
        (function (req res)
          (res.writeHead 200 {'Content-Type': 'text/plain'})
          (res.end "Hello World\n")))) 1337 "127.0.0.1")
    (console.log "Server running at http://127.0.0.1:1337/")
    
The node server example in LispyScript. You can not only call Javascript functions from LispyScript but also use Javascript data structures
like arrays and objects as is, in LispyScript. Keywords starting with "." as the first element in an
expression, like ".listen" above, behave like a function that returns the value of the key in its
argument object, which in this case is the object returned by "http.createServer". And we call the
returned function immediately with arguments 1337 "127.0.0.1".

    
    (macro let (args vals rest...)
      ((function ~args ~rest...) ~@vals))

    (let (name email tel) ("John" "john@example.org" "555-555-5555")
      (console.log (str "Name: " name "\nEmail: " email "\nTel: " tel)))

The "let" macro is very common in Lisp dialects. It creates a list of lexically scoped variables. It is
not commonly used in LispyScript because we have the var expression. But it's there just in case.
It takes as its argument elements, a list of arguments, a list of initial values and the rest of the
expressions to be evaluated inside the let. The "let" macro expands into an immediately called anonymous
function, whose arguments are the let's arguments and the values used to call the function are the values
passed, and the rest of the expressions form the function body. The "~" char is used to dereference the 
elements in the macro template. "args" and "rest..." are dereferenced as is. However we don't want
the "vals" argument to be deferenced as is. We only want the elements inside the vals list. (Not
the parenthesis). So we dereference using "~@".
 
