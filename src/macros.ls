(macro do (rest...)
  ((function () ~rest...)))

(macro when (cond rest...)
  (if ~cond (do ~rest...)))
  
(macro object? (obj)
  (= (typeof ~obj) "object"))
  
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
  