(macro let (args vals rest...)
  ((function ~args ~rest...) ~@vals))
      
(let (name email tel) ("John" "john@example.org" "555-555-5555")
  (console.log name) (console.log email))


