;; Defining helper macros to simplify module import / exports.
(defmacro destructure*
  "Helper macro for destructuring object"
  ([source name] `(def ~name (js* "~{}.~{}" ~source ~name)))
  ([source name & names]
   `(statements*
     (destructure* ~source ~name)
     (destructure* ~source ~@names))))

(defmacro import
  "Helper macro for importing node modules"
  ([path]
   `(require ~path))
  ([names path]
   `(destructure* (import ~path) ~@names)))

(defmacro export*
  ([source name]
   `(set! (js* "~{}.~{}" ~source ~name) ~name))
  ([source name & names]
   `(statements*
     (export* ~source ~name)
     (export* ~source ~@names))))

(defmacro export
  ([name]
   `(set! module.exports ~name))
  ([& names]
   `(export* 'exports ~@names)))
