clean:
	npm cache clean --force
	npx jest --clearCache

up:
	docker compose up -d --build

down:
	docker compose down