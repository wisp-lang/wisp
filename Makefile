BROWSERIFY = ./node_modules/browserify/bin/cmd.js
MINIFY = ./node_modules/.bin/minify
WISP_CURRENT = node ./bin/wisp.js
FLAGS =
INSTALL_MESSAGE = "You need to run 'npm install' to install build dependencies."
BUILD_DEPS = $(BROWSERIFY) $(MINIFY) ./node_modules/wisp/bin/wisp.js
# set make's source file search path
vpath % src

ifdef verbose
	FLAGS = --verbose
endif

ifdef current
	WISP = $(WISP_CURRENT)
else
	WISP = ./node_modules/wisp/bin/wisp.js
endif

CORE = expander runtime sequence string ast reader compiler analyzer
core: $(CORE) writer escodegen
escodegen: escodegen-writer escodegen-generator
node: core wisp node-engine repl
browser: node core browser-engine dist/wisp.min.js
all: browser

test: core node recompile
	$(WISP_CURRENT) ./test/test.wisp $(FLAGS)

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

RECOMPILE = backend/escodegen/writer backend/escodegen/generator backend/javascript/writer engine/node engine/browser $(CORE)
recompile: node browser-engine
	$(info Recompiling with current version:)
	@$(foreach file,$(RECOMPILE),\
		echo "	$(file)" && \
		$(WISP_CURRENT) --source-uri wisp/$(file).wisp < src/$(file).wisp > $(file).js~ && \
		mv $(file).js~ $(file).js &&) echo "...done"

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

escodegen-generator: backend/escodegen/generator.js

### platform engine bundles ###

node-engine: ./engine/node.js

browser-engine: ./engine/browser.js

dist/wisp.js: engine/browser.js $(WISP) $(BROWSERIFY) browserify.wisp core recompile
	@mkdir -p dist
	$(WISP_CURRENT) browserify.wisp > dist/wisp.js

dist/wisp.min.js: dist/wisp.js $(MINIFY)
	@mkdir -p dist
	$(MINIFY) dist/wisp.js > dist/wisp.min.js
