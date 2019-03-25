BROWSERIFY = ./node_modules/browserify/bin/cmd.js
MINIFY = ./node_modules/.bin/minify
WIPS_CURRENT = node ./bin/wisp.js
FLAGS =
INSTALL_MESSAGE = "You need to run 'npm install' to install build dependencies."
BUILD_DEPS = $(BROWSERIFY) $(MINIFY) ./node_modules/wisp/bin/wisp.js
# set make's source file search path
vpath % src

ifdef verbose
	FLAGS = --verbose
endif

ifdef current
	WISP = $(WIPS_CURRENT)
else
	WISP = ./node_modules/wisp/bin/wisp.js
endif

core: runtime sequence string ast reader compiler writer analyzer expander escodegen
escodegen: escodegen-writer escodegen-generator
node: core wisp node-engine repl
browser: core browser-engine dist/wisp.min.js
all: node browser
test: test1

test1: core node
	$(WIPS_CURRENT) ./test/test.wisp $(FLAGS)

$(BUILD_DEPS):
	@echo $(INSTALL_MESSAGE)
	@exit 1

clean:
	rm -rf engine
	rm -rf backend
	rm -rf dist
	rm -f *.js

%.js: %.wisp $(WISP)
	@mkdir -p $(dir $@)
	$(WISP) --source-uri wisp/$(subst .js,.wisp,$@) < $< > $@

### core ###

repl: repl.js

reader: reader.js

compiler: compiler.js

runtime: runtime.js

sequence: sequence.js

string: string.js

ast: ast.js

analyzer: analyzer.js

expander: expander.js

wisp: wisp.js

writer: backend/javascript/writer.js

### escodegen backend ###

escodegen-writer: backend/escodegen/writer.js

escodegen-compiler: backend/escodegen/compiler.js

escodegen-generator: backend/escodegen/generator.js

### platform engine bundles ###

node-engine: ./engine/node.js

browser-engine: ./engine/browser.js

dist/wisp.js: engine/browser.js $(WISP) $(BROWSERIFY) browserify.wisp core
	@mkdir -p dist
	$(WISP) browserify.wisp > dist/wisp.js

dist/wisp.min.js: dist/wisp.js $(MINIFY)
	@mkdir -p dist
	$(MINIFY) dist/wisp.js > dist/wisp.min.js

