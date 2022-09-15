#!make

TAG = $(shell git describe --tags | sed -e 's/^v//')

PRERELEASE_TAG ?= rc
PUBLISH_FLAGS = publish --access public

PACKAGE_LOCK = package-lock.json
SRC = src
DIST = build
ENVFILE = .env
MODULES = node_modules node_modules/.bin

DOCKER = docker
COMPOSE ?= docker compose
COMPOSE_FLAGS = --rm ${COMPOSE_SERVICE}
COMPOSE_SERVICE := app
RUN_IN_CONTAINER = docker compose run --rm $(COMPOSE_SERVICE)

PM ?= npm
RM ?= rm
ifeq ($(CONTEXT), container)
	PM = $(RUN_IN_CONTAINER) npm
	RM = $(RUN_IN_CONTAINER) rm
endif

# TARGETS
.PHONY: all
all: $(ENVFILE) $(PACKAGE_LOCK) $(MODULES) $(DIST)

.PHONY: dev
dev:
	$(PM) run dev

.PHONY: start
start:
	$(COMPOSE) up

$(MODULES):
	$(PM) ci

$(ENVFILE):
	cp $(ENVFILE).defaults $(ENVFILE)

.PHONY: env
env: $(ENVFILE)
	$(eval include $(ENVFILE))
	$(eval export $(shell sed 's/=.*//' $(ENVFILE)))

.PHONY: build $(DIST)

build: $(DIST)

$(DIST): $(MODULES) $(SRC_FILES)
	$(PM) run build
	@touch $(DIST)
	@cp -r src/db $(DIST)

.PHONY: publish
publish:
	$(PM) publish

$(PACKAGE_LOCK):
	$(PM) i

.PHONY: clean
clean:
	$(RM) -rf $(DIST)

.PHONY: clean-modules
clean-modules:
	$(RM) -rf $(MODULES)/*
	$(RM) $(PACKAGE_LOCK)

.PHONY: clean-all
clean-all: clean clean-modules

.PHONY: container
container: $(PACKAGE_LOCK)
	$(COMPOSE) build ${COMPOSE_SERVICE}

.PHONY: shell
shell:
ifneq (,$(wildcard /.dockerenv))
	bash
else
	$(COMPOSE) run $(COMPOSE_FLAGS) bash
endif

.PHONY: release
release:
ifneq (,$(findstring n,$(MAKEFLAGS)))
	+npx standard-version -s --dry-run
else
	npx standard-version -s
endif

.PHONY: prerelease
prerelease:
ifneq (,$(findstring n,$(MAKEFLAGS)))
	+npx standard-version -s --prerelease $(PRERELEASE_TAG) --dry-run
else
	npx standard-version -s --prerelease $(PRERELEASE_TAG)
endif

.SILENT: publish-intermediate
.PHONY: publish-intermediate
publish-intermediate: build
	VERSION=$$(git describe --tags --abbrev=0); \
	SHORT_SHA=$$(git rev-parse --short HEAD); \
	npm --no-git-tag-version version $${VERSION}-$${KEY}$${SHORT_SHA}; \
	npm publish
