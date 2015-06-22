run: install run

install: ;@echo "Installing....."; \
	npm install --save

run: ;@echo "Running....."; \
	# node lib/syncDesignDoc.js 
	node app.js


test: ;@echo "Running tests"; \
	node test.js
