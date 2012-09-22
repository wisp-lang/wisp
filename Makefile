
LISPY_MAKE = node ./bin/lispy.js

all: list ast runtime reader compiler
embed: all browserify

reader:
	$(LISPY_MAKE) ./src/reader.ls - > ./lib/reader.js

ast:
	$(LISPY_MAKE) ./src/ast.ls - > ./lib/ast.js

compiler:
	$(LISPY_MAKE) ./src/compiler.ls - > ./lib/compiler.js

list:
	$(LISPY_MAKE) ./src/list.ls - > ./lib/list.js

runtime:
	$(LISPY_MAKE) ./src/runtime.ls - > ./lib/runtime.js

browserify:
	$(LISPY_MAKE) ./support/embed.ls - > ./support/embed.js
	browserify ./support/embed.js > ./support/app.js
