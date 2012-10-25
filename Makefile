MAKEFLAGS=s
NODE=node
WISP=$(NODE) ./bin/wisp.js
BROWSERIFY=$(NODE) ./node_modules/browserify/bin/cmd.js

FILES=repl reader compiler runtime list sequence ast wisp
FILES+=engine/node engine/browser
SUPPORT=embed browserify

all: node browser
core: runtime list sequence ast reader compiler
node: core wisp engine/node repl
browser: core embed engine/browser browserify

clean:
	touch src/* src/engine/*

src/engine:
	mkdir -p src/engine

embed: support/embed.wisp
support/embed.wisp:
	cat ./support/embed.wisp | $(WISP) > ./embed.js && mv ./embed.js ./support/embed.js

browserify: support/app.js

support/app.js: support/embed.js
	$(BROWSERIFY) ./support/embed.js > ./support/app.js

define Compile
$(1): lib/$(1).js
lib/$(1).js: src/$(1).wisp
ifeq ($(MAKEFLAGS),s)
	echo " WISP $(1)"
endif
	$(WISP) < src/$(1).wisp > $(1).js && mv $(1).js lib/$(1).js
endef
$(foreach file,$(FILES),$(eval $(call Compile,$(file))))

