(macro do (rest...)
  ((function () ~rest...)))

(macro when (cond rest...)
  (if ~cond (do ~rest...)))

(var i 1)
(when (= i 1) (console.log "Hello") (console.log "World"))