BROWSERIFY = node ./node_modules/browserify/bin/cmd.js

ifdef current
	WISP = wisp
else
  WISP = node ./bin/wisp.js
endif

core: runtime list sequence ast reader compiler
node: core wisp node-engine repl
browser: core embed browser-engine browserify
all: node browser

repl:
	cat ./src/repl.wisp | $(WISP) > ./repl.js && mv ./repl.js ./lib/repl.js

reader:
	cat ./src/reader.wisp | $(WISP) > ./reader.js && mv ./reader.js ./lib/reader.js

compiler:
	cat ./src/compiler.wisp | $(WISP) > ./compiler.js && mv ./compiler.js ./lib/compiler.js

runtime:
	cat ./src/runtime.wisp | $(WISP) > ./runtime.js && mv ./runtime.js ./lib/runtime.js

list:
	cat ./src/list.wisp | $(WISP) > ./list.js && mv ./list.js ./lib/list.js

sequence:
	cat ./src/sequence.wisp | $(WISP) > ./sequence.js && mv ./sequence.js ./lib/sequence.js

ast:
	cat ./src/ast.wisp | $(WISP) > ./ast.js && mv ./ast.js ./lib/ast.js

wisp:
	cat ./src/wisp.wisp | $(WISP) > ./wisp.js && mv ./wisp.js ./lib/wisp.js

node-engine:
	cat ./src/engine/node.wisp | $(WISP) > ./node.js && mv ./node.js ./lib/engine/node.js

browser-engine:
	cat ./src/engine/browser.wisp | $(WISP) > ./browser.js && mv ./browser.js ./lib/engine/browser.js

embed:
	cat ./support/embed.wisp | $(WISP) > ./embed.js && mv ./embed.js ./support/embed.js

browserify:
	$(BROWSERIFY) ./support/embed.js > ./support/app.js
