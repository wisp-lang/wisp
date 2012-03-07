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
  
(macro loop (args vals rest...)
  ((function ~args
    (var recur arguments.callee)
    ~rest...) ~@vals))

(macro foreach (fn arr)
  (loop (fn arr count accum) (~fn ~arr 0 null)
    (if (= count arr.length)
      accum
      (recur fn arr (inc count) (fn arr (get count arr) count accum)))))

(macro reduce (fn arr)
  (foreach 
    (function (arr item count accum)
      (if (= count 0)
        item
        (~fn accum item)))
    ~arr))

(macro map (fn arr)
  (foreach 
    (function (arr item count accum)
      (if (null? accum)
        (set accum []))
      (accum.push (~fn item))
      accum)
    ~arr))

     