(require "amd-loader")
(var fs (require "fs"))
(var ls (require "../lib/ls"))

(set global.define
  (function ()
    (var factory (Array.prototype.slice.call arguments -1))
    (factory require exports module)))

;; Register `.ls` file extension so that `ls`
;; modules can be simply required.
(set require.extensions[".ls"]
  (function (module filename)
    (var code (fs.readFileSync filename "utf8"))
    (module._compile (ls._compile code filename) filename)))

;; Load macros to be included into a compiler.
(require "../src/macros")
