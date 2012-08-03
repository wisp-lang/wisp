(defmacro test
  [title & assertions]
  `(set! (get exports (str "test" ~title))
         (fn [assert] ~@assertions)))
