(ns example.hello)

;; Using private fn's since we don't have exports in this demo.

(defn- hello
  [name]
  (print "hello " name))

(defn- main
  []
  (let [button (document.create-element "button")]
    (set! button.text-content "click me")
    (document.body.append-child button)))

(document.document-element.add-event-listener :click #(hello "wisp" %))

(main)