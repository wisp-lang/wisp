(import [rest] "../lib/sequence")
(import [str] "../lib/runtime")
(import [transpile] "../lib/engine/browser")
(import [read-from-string] "../lib/reader")
(import [compile-program] "../lib/compiler")

(defn update-preview
  "updates preview"
  [editor]
  (clear-timeout update-preview.id)
  (let [code (.get-value editor)]
    (set! local-storage.buffer code)
    (set! update-preview.id
      (set-timeout (fn []
        (try
          (do
            (.clear-marker editor (or update-preview.line 1))
            (.set-value output (transpile code)))
        (catch error
          (do
            (set! update-preview.line error.line)
            (.set-marker
              editor
              (or error.line 0)
              (str "<span title='" error.message "'>●</span> %N%"))))))
        200))))

(def input
  (Code-mirror
     (.get-element-by-id document "input")
     {
      :lineNumbers true
      :autoClearEmptyLines true
      :tabSize 2
      :indentWithTabs false
      :electricChars true
      :autoClearEmptyLines true
      :mode "clojure"
      :theme "ambiance"
      :autofocus true
      :fixedGutter true
      :matchBrackets true
      :value
        (or local-storage.buffer
            (.-innerHTML (.get-element-by-id document "examples")))
      :onChange update-preview
      :onCursorActivity
        (fn []
          (.set-line-class input hl-line null null)
          (set! hl-line
            (.set-line-class
              input (.-line (.get-cursor input)) null "activeline")))
      :onGutterClick
        (fn []
          (let [output (.get-element-by-id document "output")
                input (.get-element-by-id document "input")]
            (set! output.hidden (not output.hidden))
            (set! input.style.width
              (if output.hidden "100%" "50%"))))}))

(def hl-line (.set-line-class input 0 nil "activeline"))


(def output
  (Code-mirror
    (.get-element-by-id document "output")
    { :lineNumbers true
      :fixedGutter true
      :matchBrackets true
      :mode "javascript"
      :theme "ambiance"
      :readOnly true}))

(set-timeout update-preview 1000 input)
