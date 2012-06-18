# List of built in macros for LispyScript. This file is included by
# default by the LispyScript compiler.

(macro object? (obj)
  (= (typeof ~obj) "object"))
  
(macro array? (obj)
  (= (toString.call ~obj) "[object Array]"))
  
(macro string? (obj)
  (= (toString.call ~obj) "[object String]"))
  
(macro number? (obj)
  (= (toString.call ~obj) "[object Number]"))
  
(macro boolean? (obj)
  (= (typeof ~obj) "boolean"))
  
(macro function? (obj)
  (= (toString.call ~obj) "[object Function]"))
  
(macro undefined? (obj)
  (= (typeof ~obj) "undefined"))
  
(macro null? (obj)
  (= ~obj null))
  
(macro inc (num)
  (+ ~num 1))
  
(macro dec (num)
  (- ~num 1))
  
(macro do (rest...)
  ((function () ~rest...)))

(macro when (cond rest...)
  (if ~cond (do ~rest...)))

(macro unless (cond rest...)
  (when (! ~cond) (do ~rest...)))
  
(macro str (rest...)
  ((function ()
    ((.join (Array.prototype.slice.call arguments)) "")) ~rest...))

(macro each (rest...)
  (Array.prototype.forEach.call ~rest...))
  
(macro map (rest...)
  (Array.prototype.map.call ~rest...))
  
(macro reduce (rest...)
  (Array.prototype.reduce.call ~rest...))


