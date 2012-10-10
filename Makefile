MAKE = node ./bin/wisp.js

core: runtime list sequence ast reader compiler
node: core wisp node-engine repl
browser: core embed browser-engine browserify
all: node browser

repl:
	cat ./src/repl.wisp | $(MAKE) > ./repl.js && mv ./repl.js ./lib/repl.js

reader:
	cat ./src/reader.wisp | $(MAKE) > ./reader.js && mv ./reader.js ./lib/reader.js

compiler:
	cat ./src/compiler.wisp | $(MAKE) > ./compiler.js && mv ./compiler.js ./lib/compiler.js

runtime:
	cat ./src/runtime.wisp | $(MAKE) > ./runtime.js && mv ./runtime.js ./lib/runtime.js

list:
	cat ./src/list.wisp | $(MAKE) > ./list.js && mv ./list.js ./lib/list.js

sequence:
	cat ./src/sequence.wisp | $(MAKE) > ./sequence.js && mv ./sequence.js ./lib/sequence.js

ast:
	cat ./src/ast.wisp | $(MAKE) > ./ast.js && mv ./ast.js ./lib/ast.js

wisp:
	cat ./src/wisp.wisp | $(MAKE) > ./wisp.js && mv ./wisp.js ./lib/wisp.js

node-engine:
	cat ./src/engine/node.wisp | $(MAKE) > ./node.js && mv ./node.js ./lib/engine/node.js

browser-engine:
	cat ./src/engine/browser.wisp | $(MAKE) > ./browser.js && mv ./browser.js ./lib/engine/browser.js

embed:
	cat ./support/embed.wisp | $(MAKE) > ./embed.js && mv ./embed.js ./support/embed.js

browserify:
	browserify ./support/embed.js > ./support/app.js
