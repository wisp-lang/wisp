(define (fn [require exports module]

(def ls (require "../lib/ls"))

(set! exports.eval
      (fn [code url] (eval (ls._compile code url))))

;; Running code does not provide access to this scope.
(set! exports.run
      (fn (code url)
        ((Function (ls._compile code url)))))

;; If we're not in a browser environment, we're finished with the public API.
;; return unless window?
;;
;; Load a remote script from the current domain via XHR.
(set! exports.load
  (fn (url callback)
    (def request
      (if window.XMLHttpRequest
        (new XMLHttpRequest)
        (new ActiveXObject "Microsoft.XMLHTTP")))

    (.open request :GET url true)

    (if request.override-mime-type
      (.override-mime-type request "application/lispyscript"))

    (set! request.onreadystatechange
          (fn []
            (if (= request.ready-state 4)
              (if (or (= request.status 0)
                      (= request.status 200))
                (callback (exports.run request.response-text url))
                (callback "Could not load")))))

    (.send request null)))

;; Activate LispyScript in the browser by having it compile and evaluate
;; all script tags with a content-type of `application/lispyscript`.
;; This happens on page load.
(defn run-scripts
  "Compiles and exectues all scripts that have type application/lispyscript
  type"
  []
  (def scripts
    (filter (document.get-elements-by-tag-name :script)
            (fn [script] (= script.type "application/lispyscript"))))

  (defn next []
    (if scripts.length
      (let [script (.shift scripts)]
        (if script.src
          (.load exports script.src next)
          (next (.run exports script.innerHTML))))))

  (next))

;; Listen for window load, both in browsers and in IE.
(if (or (= document.ready-state :complete)
        (= document.ready-state :interactive))
  (run-scripts)
  (if window.add-event-listener
    (.add-event-listener window :DOMContentLoaded run-scripts false)
    (.attach-event window :onload run-scripts)))))
