var rest = (require("../lib/list")).rest;;

var str = (require("../lib/runtime")).str;;

var readFromString = (require("../lib/reader")).readFromString;;

var compileProgram = (require("../lib/compiler")).compileProgram;;

var updatePreview = function updatePreview(editor) {
  clearTimeout(updatePreview.id);
  return (function() {
    var code = editor.getValue();
    var source = str("(do ", code, ")");
    localStorage.buffer = code;
    return updatePreview.id = setTimeout(function() {
      return (function() {
      try {
        return (function() {
          editor.clearMarker(updatePreview.line || 1);
          return output.setValue(compileProgram(rest(readFromString(source))));
        })();
      } catch (error) {
        return (function() {
          updatePreview.line = error.line;
          return editor.setMarker(error.line || 0, str("<span title='", error.message, "'>●</span> %N%"));
        })();
      }})();
    }, 200);
  })();
};

var input = CodeMirror(document.getElementById("input"), {
  lineNumbers: true,
  autoClearEmptyLines: true,
  tabSize: 2,
  indentWithTabs: false,
  electricChars: true,
  mode: "clojure",
  theme: "ambiance",
  autofocus: true,
  fixedGutter: true,
  matchBrackets: true,
  value: localStorage.buffer || ((document.getElementById("examples")).innerHTML),
  onChange: updatePreview,
  onCursorActivity: function() {
    input.setLineClass(hlLine, null, null);
    return hlLine = input.setLineClass((input.getCursor()).line, null, "activeline");
  },
  onGutterClick: function() {
    return (function() {
      var output = document.getElementById("output");
      var input = document.getElementById("input");
      output.hidden = !(output.hidden);
      return input.style.width = output.hidden ?
        "100%" :
        "50%";
    })();
  }
});

var hlLine = input.setLineClass(0, "activeline");

var output = CodeMirror(document.getElementById("output"), {
  lineNumbers: true,
  fixedGutter: true,
  matchBrackets: true,
  mode: "javascript",
  theme: "ambiance",
  readOnly: true
});

setTimeout(updatePreview, 1000, input)
