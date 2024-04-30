.PHONY: clean stop

clean:
	find container -mindepth 1 -maxdepth 1 -type d -not -name '*.md' -exec sudo rm -rf {} +

stop:
	docker compose down

docker:	stop clean
	docker compose up -d

start:
	cd server && pnpm start && cd ..
