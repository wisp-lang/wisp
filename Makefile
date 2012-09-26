
LISPY_MAKE = node ./bin/lispy.js
MAKE = node ./bin/lispy-2.js

all: runtime list ast reader compiler engine engine-node node repl lispy browser
new: engine-node engine runtime list ast reader compiler
embed: runtime list ast reader compiler browserify

reader:
	$(LISPY_MAKE) ./src/reader.ls ./lib/reader.js

ast:
	$(LISPY_MAKE) ./src/ast.ls ./lib/ast.js

compiler:
	$(LISPY_MAKE) ./src/compiler.ls ./lib/compiler.js

runtime:
	$(LISPY_MAKE) ./src/runtime.ls ./lib/runtime.js

lispy:
	$(LISPY_MAKE) ./src/lispy.ls ./lib/lispy.js

repl:
	$(LISPY_MAKE) ./src/repl.ls ./lib/repl.js

node:
	$(LISPY_MAKE) ./src/node.ls ./lib/node.js

browser:
	$(LISPY_MAKE) ./src/browser.ls ./lib/browser.js

list:
	cat ./src/list.ls | $(MAKE) > ./list.js && mv ./list.js ./lib/list.js

engine:
	cat ./src/engine.ls | $(MAKE) > ./engine.js && mv ./engine.js ./lib/engine.js

engine-node:
	cat ./src/engine/node.ls | $(MAKE) > ./node.js && mv ./node.js ./lib/engine/node.js

browserify:
	cat ./support/embed.ls | $(MAKE) > ./embed.js && mv ./embed.js ./support/embed.js
	browserify ./support/embed.js > ./support/app.js
