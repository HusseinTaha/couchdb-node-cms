run: install run

install: ;@echo "Installing....."; \
	npm install --save
	mkdir -p ./node_modules/promised-io/lib
	cp ./node_modules/promised-io/*.js ./node_modules/promised-io/lib/

run: ;@echo "Running....."; \
	node lib/syncDesignDoc.js 
	node app.js
