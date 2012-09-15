(include "./macros")

(test-suite
 "test list" (import "./list")
 "test reader" (import "./reader")
 "test ast" (import "./ast")
 "test runtime" (import "./runtime")
 "test compiler" (import "./compiler"))
