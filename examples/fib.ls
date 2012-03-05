(var fib
  (function (n)
    ((function (a b count)
      (if (= count 0)
        b
        (arguments.callee (+ a b) a (- count 1)))) 1 0 n)))
    
(console.log (fib 10))