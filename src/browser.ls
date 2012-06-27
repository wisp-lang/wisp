(define (function (require exports module)

(var ls (require "../lib/ls"))

(set exports.eval
  (function (code url)
    (eval (ls._compile code url))))

;; Running code does not provide access to this scope.
(set exports.run
  (function (code url)
    ((Function (ls._compile code url)))))

;; If we're not in a browser environment, we're finished with the public API.
;; return unless window?
;;
;; Load a remote script from the current domain via XHR.
(set exports.load
  (function (url callback)
    (var request
      (if window.XMLHttpRequest
        (new XMLHttpRequest)
        (new ActiveXObject "Microsoft.XMLHTTP")))
    (request.open "GET" url true)
    (if request.overrideMimeType (request.overrideMimeType "text/plain"))
    (set request.onreadystatechange
      (function ()
        (if (= request.readyState 4)
          (if (|| (= request.status 0) (= request.status 200))
            (callback (exports.run request.responseText url))
            (callback "Could not load")))))
    (request.send null)))

;; Activate LispyScript in the browser by having it compile and evaluate
;; all script tags with a content-type of `application/lispyscript`.
;; This happens on page load.
(var runScripts
  (function ()
    (var scripts
      (filter
        (document.getElementsByTagName "script")
        (function (script) (= script.type "application/lispyscript"))))

    (var next
      (function ()
        (if scripts.length
          (do
            (var script (scripts.shift))
            (if script.src
              (exports.load script.src next)
              (next (exports.run script.innerHTML)))))))

    (next)))

;; Listen for window load, both in browsers and in IE.
(if (|| (= document.readyState "complete")
        (= document.readyState "interactive"))
  (runScripts)
  (if window.addEventListener
    (addEventListener "DOMContentLoaded" runScripts false)
    (attachEvent "onload" runScripts)))))
