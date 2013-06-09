BROWSERIFY = node ./node_modules/browserify/bin/cmd.js
WIPS_CURRENT = node ./bin/wisp.js
FLAGS =

ifdef verbose
	FLAGS = --verbose
endif

ifdef current
	WISP = $(WIPS_CURRENT)
else
	WISP = ./node_modules/wisp/bin/wisp.js
endif

core: runtime sequence string ast reader compiler writer analyzer
node: core wisp node-engine repl
browser: core browser-engine
all: node browser
test: test1

test1:
	$(WIPS_CURRENT) ./test/test.wisp $(FLAGS)

clean:
	rm -rf engine
	rm -rf backend
	touch null.js
	rm *.js

repl:
	cat ./src/repl.wisp | $(WISP) > ./repl.js

reader:
	cat ./src/reader.wisp | $(WISP) > ./reader.js

compiler:
	cat ./src/compiler.wisp | $(WISP) > ./compiler.js

writer:
	mkdir -p ./backend/javascript/
	cat ./src/backend/javascript/writer.wisp | $(WISP) > ./backend/javascript/writer.js

runtime:
	cat ./src/runtime.wisp | $(WISP) > ./runtime.js

sequence:
	cat ./src/sequence.wisp | $(WISP) > ./sequence.js

string:
	cat ./src/string.wisp | $(WISP) > ./string.js

ast:
	cat ./src/ast.wisp | $(WISP) > ./ast.js

analyzer:
	cat ./src/analyzer.wisp | $(WISP) > ./analyzer.js

wisp:
	cat ./src/wisp.wisp | $(WISP) > ./wisp.js

node-engine:
	mkdir -p ./engine/
	cat ./src/engine/node.wisp | $(WISP) > ./engine/node.js

browser-engine:
	mkdir -p ./engine/
	cat ./src/engine/browser.wisp | $(WISP) > ./engine/browser.js
