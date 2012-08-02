(set! (get exports "test list") (require "./list"))

(.run (import "test") exports)
