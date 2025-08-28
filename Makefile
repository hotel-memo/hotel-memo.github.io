# Makefile for Hotel Memo Quartz site

# Obsidianのpublishフォルダのパス
OBSIDIAN_PATH := /Users/mizzy/obsidian/hotel-memo/publish

# ローカルでビルドとサーブ
serve: sync
	npx quartz build --serve

# ビルドのみ
build: sync
	npx quartz build

# Obsidianからコンテンツを同期
sync:
	@echo "Syncing content from Obsidian vault..."
	@rm -rf content
	@cp -r $(OBSIDIAN_PATH) content
	@echo "Content synced successfully"

# コンテンツを同期してGitにコミット・プッシュ
publish: sync
	@echo "Publishing to GitHub..."
	git add content/
	git diff --staged --quiet || git commit -m "Update content from Obsidian vault"
	git push origin main
	@echo "Published successfully"

# 開発用：同期してビルドしてサーブ
dev: sync
	npx quartz build --serve

# クリーンアップ
clean:
	rm -rf public
	rm -rf content

# ヘルプ
help:
	@echo "Available commands:"
	@echo "  make sync    - Sync content from Obsidian"
	@echo "  make build   - Sync and build the site"
	@echo "  make serve   - Sync and serve locally"
	@echo "  make publish - Sync, commit, and push to GitHub"
	@echo "  make dev     - Alias for serve"
	@echo "  make clean   - Clean build artifacts"
	@echo "  make help    - Show this help"

.PHONY: serve build sync publish dev clean help