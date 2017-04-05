A little Clojure-like LISP in JavaScript.

<!-- interactive demo -->

1. Read about the [language essentials & documentation](./doc/language-essentials.md).

2. Drop [wisp.min.js](https://github.com/Gozala/wisp/raw/gh-pages/dist/wisp.min.js) into your HTML code:

```html
<script src="wisp.min.js"></script>

<script type="application/wisp">
  (alert "Hello world!")
</script>

<!-- Load from a file: -->
<script type="application/wisp" src="my-script.wisp"></script>
```

3. Or install the binary with npm:

	`npm install wisp`

4. Compile wisp code to native JS just like CoffeeScript:

	`node_modules/.bin/wisp < my-script.wisp > my-script.js`

5. Fire up a REPL to explore the language:

	`./node_modules/.bin/wisp`

[More info](./doc/more-info.md).

Wisp is currently in maintenance mode. We're merging PRs but not actively writing new code.
