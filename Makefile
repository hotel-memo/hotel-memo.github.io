# Makefile for hotel-memo Astro site

.PHONY: dev build preview sync publish clean

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

# 本拠地リポジトリ (content/hotel-memo submodule) を最新の main に追従させる。
sync:
	git submodule update --remote content/hotel-memo

# sync して、submodule の pointer 更新をコミット & push。
publish: sync
	@if git diff --quiet content/hotel-memo; then \
		echo "No upstream changes."; \
	else \
		git add content/hotel-memo; \
		git commit -m "Update content submodule"; \
		git push; \
	fi

clean:
	rm -rf dist .astro
