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

core: runtime sequence string ast reader compiler writer analyzer expander escodegen
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
	cat ./src/repl.wisp | $(WISP) --source-uri wisp/repl.wisp > ./repl.js

reader:
	cat ./src/reader.wisp | $(WISP) --source-uri wisp/reader.wisp > ./reader.js

compiler:
	cat ./src/compiler.wisp | $(WISP) --source-uri wisp/compiler.wisp > ./compiler.js

writer:
	mkdir -p ./backend/javascript/
	cat ./src/backend/javascript/writer.wisp | $(WISP) --source-uri wisp/backend/javascript/writer.wisp > ./backend/javascript/writer.js

escodegen: escodegen-writer escodegen-compiler escodegen-generator

escodegen-writer:
	mkdir -p ./backend/escodegen/
	cat ./src/backend/escodegen/writer.wisp | $(WISP) --source-uri wisp/backend/escodegen/writer.wisp > ./backend/escodegen/writer.js

escodegen-compiler:
	mkdir -p ./backend/escodegen/
	cat ./src/backend/escodegen/compiler.wisp | $(WISP) --source-uri wisp/backend/escodegen/compiler.wisp > ./backend/escodegen/compiler.js

escodegen-generator:
	mkdir -p ./backend/escodegen/
	cat ./src/backend/escodegen/generator.wisp | $(WISP) --source-uri wisp/backend/escodegen/generator.wisp > ./backend/escodegen/generator.js

runtime:
	cat ./src/runtime.wisp | $(WISP) --source-uri wisp/runtime.wisp > ./runtime.js

sequence:
	cat ./src/sequence.wisp | $(WISP) --source-uri wisp/sequence.wisp > ./sequence.js

string:
	cat ./src/string.wisp | $(WISP) --source-uri wisp/string.wisp > ./string.js

ast:
	cat ./src/ast.wisp | $(WISP) --source-uri wisp/ast.wisp > ./ast.js

analyzer:
	cat ./src/analyzer.wisp | $(WISP) --source-uri wisp/analyzer.wisp > ./analyzer.js

expander:
	cat ./src/expander.wisp | $(WISP) --source-uri wisp/expander.wisp > ./expander.js

wisp:
	cat ./src/wisp.wisp | $(WISP) --source-uri wisp/wisp.wisp > ./wisp.js

node-engine:
	mkdir -p ./engine/
	cat ./src/engine/node.wisp | $(WISP) --source-uri wisp/engine/node.wisp > ./engine/node.js

browser-engine:
	mkdir -p ./engine/
	cat ./src/engine/browser.wisp | $(WISP) --source-uri wisp/engine/browser.wisp > ./engine/browser.js
