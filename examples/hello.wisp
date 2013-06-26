(ns wisp.hello-wold)

(defn- hello
  [name]
  (print "hello " name))

;; =>


(hello "wisp")

;; =>


(defn- main
  []
  (let [button (document.create-element "button")]
    (set! button.text-content "click me")
    (document.body.append-child button)))

(document.document-element.add-event-listener :click #(hello "wisp" %))

(main)