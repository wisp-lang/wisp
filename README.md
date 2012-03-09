# LispyScript
## Javascript using a Lispy syntax
### Why LispyScript? It's fun! It has macros!

    (console.log "Hello LispyScript!")
    
This is a LispyScript expression, which consists of a list enclosed by parenthesis.
The first element is a function and the second is the argument to the function. 

    (console.log (+ 1 2))

Elements may also be expressions (lists). However the first element must always be a function ...

    ((function (x y) (+ x y)) 1 2)

or evaluate to a function. This is function definition, that is called immediately by the outer
expression. All expressions evaluate to the return value of the function. In this case the number 3 will be returned.

    (var test 2)

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
>, >=, <, <=, !, string?, function?, number?, undefined?, null?, +, -, *, /, %.

All Javascript functions can be called directly from LispyScript. Like we called console.log.
