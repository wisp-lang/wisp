(import [str] "../runtime")
(import [rest] "../sequence")
(import [read-from-string] "../reader")
(import [compile-program] "../compiler")

(defn transpile
  [source uri]
  (str (compile-program
        ;; Wrap program body into a list in order to to read
        ;; all of it.
        (rest (read-from-string (str "(do " source ")") uri))) "\n"))

(defn evaluate
  [code url] (eval (transpile code url)))

;; Running code does not provide access to this scope.
(defn run
  [code url]
  ((Function (transpile code url))))

;; If we're not in a browser environment, we're finished with the public API.
;; return unless window?
;;
;; Load a remote script from the current domain via XHR.
(defn load
  [url callback]
  (def request
    (if window.XMLHttpRequest
      (XMLHttpRequest.)
      (ActiveXObject. "Microsoft.XMLHTTP")))

  (.open request :GET url true)

  (if request.override-mime-type
    (.override-mime-type request "application/wisp"))

  (set! request.onreadystatechange
        (fn []
          (if (identical? request.ready-state 4)
            (if (or (identical? request.status 0)
                    (identical? request.status 200))
              (callback (run request.response-text url))
              (callback "Could not load")))))

  (.send request null))

;; Activate LispyScript in the browser by having it compile and evaluate
;; all script tags with a content-type of `application/wisp`.
;; This happens on page load.
(defn run-scripts
  "Compiles and exectues all scripts that have type application/wisp type"
  []
  (def scripts
    (Array.prototype.filter.call
     (document.get-elements-by-tag-name :script)
     (fn [script] (identical? script.type "application/wisp"))))

  (defn next []
    (if scripts.length
      (let [script (.shift scripts)]
        (if script.src
          (load script.src next)
          (next (run script.innerHTML))))))

  (next))

;; Listen for window load, both in browsers and in IE.
(if (or (identical? document.ready-state :complete)
        (identical? document.ready-state :interactive))
  (run-scripts)
  (if window.add-event-listener
    (.add-event-listener window :DOMContentLoaded run-scripts false)
    (.attach-event window :onload run-scripts)))

(export transpile evaluate run)
