(macro object? (obj)
  (= (typeof ~obj) "object"))
  
(macro array? (obj)
  (= (toString.call ~obj) "[object Array]"))
  
(macro string? (obj)
  (= (typeof ~obj) "string"))
  
(macro number? (obj)
  (= (typeof ~obj) "number"))
  
(macro boolean? (obj)
  (= (typeof ~obj) "boolean"))
  
(macro function? (obj)
  (= (typeof ~obj) "function"))
  
(macro undefined? (obj)
  (= (typeof ~obj) "undefined"))
  
(macro null? (obj)
  (= ~obj null))
  
(macro inc (num)
  (+ ~num 1))
  
(macro dec (num)
  (- ~num 1))
  
(macro do (rest...)
  ((function () ~@rest...)))

(macro when (cond rest...)
  (if ~cond (do ~@rest...)))

(macro unless (cond rest...)
  (when (! ~cond) (do ~@rest...)))
  
