# pickup-planner — ゴルフの送迎の、お迎えの順番と時刻を決める道具

幹事が車割りをしたあと、各車の**運転者**が出発点を決めると、
同乗者を迎えに行く**順番と時刻**が出る。
**出発地・経由地・目的地が変わったら自動で再計算し、開けばいつでも最新が見える。**

> 1 Day = 1 PR。各回で何を決めて何を捨てたかは、その Day の PR と `docs/adr/` に残る。
> 「Day」は実日数ではなく、おおよその区切り。**ちゃんと動くアプリを作ることと並行して、
> 個人開発で DDD を中心にした「速く・柔軟で・しっかりした」開発手法そのものを探究する**のが狙い。

## いまどこか

**まだコードは無い。** Day0（開発の進め方そのものを決める回）が終わったところ。
次は Day1、「何を作るか」を決める。

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

理由は [ADR-0002](docs/adr/0002-typescript-nestjs-svelte.md) と [ADR-0003](docs/adr/0003-repository-layout.md)。
