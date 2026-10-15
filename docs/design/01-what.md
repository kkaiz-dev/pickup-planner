# 01. 何を作るか

**この文書は抽出物。中身は持たず、正へのリンクだけ。手で直さない。
正（`event-storming/` と `features/`）が変わったら作り直す。**

## 登場人物

| 登場人物 | 役割 |
|---|---|
| 運転者 | 計画を作り、出発地・目的地を決める。この道具の主役 |
| 同乗者 | 拾ってもらう地点を追加・変更・取り消す |
| （幹事） | 車割りを決める人。**この道具の対象外** |

詳しくは [00-why.md](00-why.md) の「登場人物」、言葉の定義は [docs/language/glossary.md](../language/glossary.md)。

## ユースケース一覧

[event-storming/process-level.md](../../event-storming/process-level.md) のコマンド(青の付箋)に対応する。

| ユースケース | 状態 | シナリオ |
|---|---|---|
| 運転者が送迎計画を作る | **詳細化済み** | [features/plan.feature](../../features/plan.feature)（[Example Mapping: #12](https://github.com/kkaiz-dev/pickup-planner/issues/12)） |
| 同乗者が拾ってもらう地点を追加する | 見出しのみ | [features/pickup-points.feature](../../features/pickup-points.feature) |
| 同乗者が拾ってもらう地点を変更する | 見出しのみ | 同上 |
| 同乗者が拾ってもらう地点を取り消す | 見出しのみ | 同上 |
| 運転者が出発地を変更する | 見出しのみ | [features/change-plan.feature](../../features/change-plan.feature) |
| 運転者が目的地を変更する | 見出しのみ | 同上 |
| 予定が終わったら地点のデータを消す | 見出しのみ・未確定 | [features/schedule-ends.feature](../../features/schedule-ends.feature)（タイミングは [#8](https://github.com/kkaiz-dev/pickup-planner/issues/8) が未解決） |

## ルール（詳細化済みの1本だけ）

「運転者が送迎計画を作る」のルール。詳しくは [Issue #12](https://github.com/kkaiz-dev/pickup-planner/issues/12)。

- 出発時刻は到着希望時刻から逆算する
- 各地点で積み込み時間（5分、固定）を取る
- お迎えの順番はアプリが自動で決める（一番早く回れる順番）
- 同乗者が0人でも成立する

## 残っている疑問

- [#8](https://github.com/kkaiz-dev/pickup-planner/issues/8) 「予定が終わった」とはいつか
- [#9](https://github.com/kkaiz-dev/pickup-planner/issues/9) 共有リンクの権限

## 次にやること

残り6つのユースケースのうち1つを選び、Example Mapping → Gherkin → DDD → TDD と
縦に1本貫く（[docs/README.md](../README.md) の3節）。
