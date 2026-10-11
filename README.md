# pickup-planner — ゴルフの送迎の、お迎えの順番と時刻を決める道具

幹事が車割りをしたあと、各車の**運転者**が出発点を決めると、
同乗者を迎えに行く**順番と時刻**が出る。
**期日が近づいたら渋滞を反映して再計算し、全員に知らせる。**

> このリポジトリは YouTube で **Day ごとに作っていく様子を公開**している（ビルドインパブリック）。
> 1 Day = 1 PR。各回で何を決めて何を捨てたかは、その Day の PR と `docs/adr/` に残る。

## いまどこか

**まだコードは無い。** 足場と進め方だけ。Day 1 で「何を作るか」を決めるところから始める。

## 読むもの

| | どこ |
|---|---|
| **開発の進め方**（このリポジトリの本体） | [docs/README.md](docs/README.md) |
| 作業の手順（Issue・ブランチ・PR・Day の回し方） | [CONTRIBUTING.md](CONTRIBUTING.md) |
| 決めたことと、捨てたもの | [docs/adr/](docs/adr/) |

## 予定している構成

| | 使うもの | 置き場 |
|---|---|---|
| フロントエンド | Vite + Svelte + TypeScript（PWA） | `web/` → Cloudflare Pages |
| API | NestJS + TypeScript | `api/` → Cloud Run |
| 経路 | Google Maps Routes API | `api/` の外部接続層 |

理由は [ADR-0003](docs/adr/0003-typescript-nestjs-svelte.md) と [ADR-0004](docs/adr/0004-repository-layout.md)。
