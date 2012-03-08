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
  ((_tco
    (function ~args ~rest...)) ~@vals))
    
(macro for (n fn)
  (loop (x accum fn) (0 null ~fn)
    (if (= ~n x)
      accum
      (recur (inc x) (fn x accum) fn))))

(macro foreach (arr fn)
  (do
    (var arr ~arr)
    (var l arr.length)
    (for l
      (function (i accum)
        (~fn (get i arr) accum)))))

(macro reduce (arr fn)
  (foreach ~arr
    (function (item accum)
      (if (null? accum)
        item
        (~fn item accum)))))

(macro map (arr fn)
  (foreach ~arr
    (function (item accum)
      (if (null? accum)
        (set accum []))
      (accum.push (~fn item))
      accum))))

     