PACKAGES = $(shell go list ./...)
GOFLAGS :=
TESTFLAGS :=
TESTTIMEOUT := 2m
GO ?= go
TESTS := .

.PHONY: all
all: build check 

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
