run: install run

install: ;@echo "Installing....."; \
	npm install --save

run: ;@echo "Running....."; \
	node lib/syncDesignDoc.js 
	node app.js
