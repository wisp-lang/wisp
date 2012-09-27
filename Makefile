MAKE = node ./bin/lispy.js

core: runtime list ast reader compiler
node: core engine node-engine repl
browser: core embed browser-engine browserify
all: node browser

repl:
	cat ./src/repl.ls | $(MAKE) > ./repl.js && mv ./repl.js ./lib/repl.js

reader:
	cat ./src/reader.ls | $(MAKE) > ./reader.js && mv ./reader.js ./lib/reader.js

compiler:
	cat ./src/compiler.ls | $(MAKE) > ./compiler.js && mv ./compiler.js ./lib/compiler.js

runtime:
	cat ./src/runtime.ls | $(MAKE) > ./runtime.js && mv ./runtime.js ./lib/runtime.js

list:
	cat ./src/list.ls | $(MAKE) > ./list.js && mv ./list.js ./lib/list.js

ast:
	cat ./src/ast.ls | $(MAKE) > ./ast.js && mv ./ast.js ./lib/ast.js

engine:
	cat ./src/engine.ls | $(MAKE) > ./engine.js && mv ./engine.js ./lib/engine.js

node-engine:
	cat ./src/engine/node.ls | $(MAKE) > ./node.js && mv ./node.js ./lib/engine/node.js

browser-engine:
	cat ./src/engine/browser.ls | $(MAKE) > ./browser.js && mv ./browser.js ./lib/engine/browser.js

embed:
	cat ./support/embed.ls | $(MAKE) > ./embed.js && mv ./embed.js ./support/embed.js

browserify:
	browserify ./support/embed.js > ./support/app.js
