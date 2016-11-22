.PHONY: run-server 

build-server:
	@go build -o ./build/serverbin ./static-server

run-server: build-server
	@./build/serverbin

install-js:
	@npm i

build-js:
	@npm start
