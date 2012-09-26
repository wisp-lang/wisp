
LISPY_MAKE = node ./bin/lispy.js
MAKE = node ./bin/lispy-2.js

all: runtime list ast reader compiler engine engine-node node repl lispy browser
new: engine-node engine runtime list ast reader compiler
embed: runtime list ast reader compiler browserify

lispy:
	$(LISPY_MAKE) ./src/lispy.ls ./lib/lispy.js

repl:
	$(LISPY_MAKE) ./src/repl.ls ./lib/repl.js

node:
	$(LISPY_MAKE) ./src/node.ls ./lib/node.js

browser:
	$(LISPY_MAKE) ./src/browser.ls ./lib/browser.js

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

engine-node:
	cat ./src/engine/node.ls | $(MAKE) > ./node.js && mv ./node.js ./lib/engine/node.js

browserify:
	cat ./support/embed.ls | $(MAKE) > ./embed.js && mv ./embed.js ./support/embed.js
	browserify ./support/embed.js > ./support/app.js
