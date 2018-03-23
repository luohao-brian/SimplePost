PACKAGES = $(shell go list ./...)
GOFLAGS :=
TESTFLAGS :=
TESTTIMEOUT := 2m
GO ?= go
TESTS := .

.PHONY: all
all: build check cover test

.PHONY: cover
cover:
	$(GO) list ./... | xargs -n1 go test --cover

.PHONY: test
test:
	$(GO) test -v $(GOFLAGS) -i $(PACKAGES)
	$(GO) test -v $(GOFLAGS) -run $(TESTS) -timeout $(TESTTIMEOUT) $(PACKAGES) $(TESTFLAGS)

.PHONY: check
check:
	find . -name "*.go" | xargs gofmt -s -l

.PHONY: build
build: GOFLAGS += -i -o dingo
build:
	$(GO) build -v $(GOFLAGS) main.go

.PHONY: run
run: GOFLAGS += -race
run:
	$(GO) run -v $(GOFLAGS) main.go
