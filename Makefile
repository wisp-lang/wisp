
LISPY_MAKE = node ./bin/lispy.js
MAKE = node ./bin/lispy-2.js

all: list ast runtime reader compiler
embed: all browserify

reader:
	$(LISPY_MAKE) ./src/reader.ls - > ./lib/reader.js

ast:
	$(LISPY_MAKE) ./src/ast.ls - > ./lib/ast.js

compiler:
	$(LISPY_MAKE) ./src/compiler.ls - > ./lib/compiler.js

runtime:
	$(LISPY_MAKE) ./src/runtime.ls - > ./lib/runtime.js

list:
	cat ./src/list.ls | $(MAKE) > ./list.js && mv ./list.js ./lib/list.js

browserify:
	cat ./support/embed.ls | $(MAKE) > ./embed.js && mv ./embed.js ./support/embed.js
	browserify ./support/embed.js > ./support/app.js
