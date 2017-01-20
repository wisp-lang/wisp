Wisp is a homoiconic JavaScript dialect with Clojure syntax, s-expressions and macros.

This is a fork of [the original language by @Gozala](https://github.com/Gozala/wisp).

You can find the [original readme here](./readme-original.md).

[Language essentials & documentation](./language-essentials.md).

*Why wouldn't I just use ClojureScript?*

For 99% of use-cases you probably should just use ClojureScript.

However, here are some niches that wisp might fill:

 * Including it in a project can be as simple as a single `<script>` tag.
 * Tries to compile down to readable JavaScript.
 * Closer to native JavaScript - doesn't need a `js/` prefix.

Think of wisp as markdown for JavaScript programming, but with the added subtlety of LISP S-expressions, homoiconicity and powerful macros that make it the easiest way to write JavaScript.
