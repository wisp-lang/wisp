var rest = (require("../lib/sequence")).rest;;

var str = (require("../lib/runtime")).str;;

var transpile = (require("../lib/engine/browser")).transpile;;

var readFromString = (require("../lib/reader")).readFromString;;

var compileProgram = (require("../lib/compiler")).compileProgram;;

var updatePreview = function updatePreview(editor) {
  clearTimeout(updatePreview.id);
  return (function() {
    var code = editor.getValue();
    localStorage.buffer = code;
    return updatePreview.id = setTimeout(function() {
      return (function() {
      try {
        editor.clearMarker(updatePreview.line || 1);
        return output.setValue(transpile(code));
      } catch (error) {
        updatePreview.line = error.line;
        return editor.setMarker(error.line || 0, "" + "<span title='" + error.message + "'>●</span> %N%");
      }})();
    }, 200);
  })();
};

var input = CodeMirror(document.getElementById("input"), {
  "lineNumbers": true,
  "autoClearEmptyLines": true,
  "tabSize": 2,
  "indentWithTabs": false,
  "electricChars": true,
  "mode": "clojure",
  "theme": "ambiance",
  "autofocus": true,
  "fixedGutter": true,
  "matchBrackets": true,
  "value": localStorage.buffer || ((document.getElementById("examples")).innerHTML),
  "onChange": updatePreview,
  "onCursorActivity": function() {
    input.setLineClass(hlLine, null, null);
    return hlLine = input.setLineClass((input.getCursor()).line, null, "activeline");
  },
  "onGutterClick": function() {
    var output = document.getElementById("output");
    var input = document.getElementById("input");
    output.hidden = !(output.hidden);
    return input.style.width = output.hidden ?
      "100%" :
      "50%";
  }
});

var hlLine = input.setLineClass(0, void(0), "activeline");

var output = CodeMirror(document.getElementById("output"), {
  "lineNumbers": true,
  "fixedGutter": true,
  "matchBrackets": true,
  "mode": "javascript",
  "theme": "ambiance",
  "readOnly": true
});

setTimeout(updatePreview, 1000, input)
