.PHONY: update-env setup-test-db

update-env:
	npx babel-node ./scripts/generate-env.js

setup-dev-db:
	@docker compose up -d dev-db

setup-test-db:
	@docker compose up -d test-db

init-test-db:
	@knex seed:run --specific=setup_test_db.ts --env test

init-dev-db:
	@knex seed:run --specific=setup_dev_db.ts --env development

redis: 
	docker run --name gk-redis -p 6379:6379 -d redis

redis-sh:
	docker exec -it gk-redis sh