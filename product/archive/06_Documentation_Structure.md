# СТРУКТУРА ПРОЕКТНОЙ ДОКУМЕНТАЦИИ — ABRIS UNIVERSE

> **Archive note:** The physical layout described below records the external
> Claude Cowork workspace before shared-repository integration. It is retained
> for provenance and is superseded for repository navigation by
> `product/README.md`. Machine-local paths were normalized during import.

**Document ID:** AU-GOV-DOCSTRUCT-001
**Версия:** 1.0
**Статус:** [APPROVED]
**Владелец документа:** Delivery, Documentation & Codex Coordination Lead
**Дата создания:** 2026-07-20
**Дата обновления:** 2026-07-20
**Назначение:** дать любому новому участнику (человеку или агенту) историческую
карту расположения документов во внешнем Claude Cowork workspace. Все старые
пути ниже относились к `<external-claude-workspace>`.

---

## 1. Логическая структура (адаптация рекомендованной модели)

Структура 00_GOVERNANCE…10_ARCHIVE реализована как физические папки в корне проекта (созданы только заполненные; 03/05/06/08/09/10 создаются при появлении первых документов). Ниже — таблица «категория → текущие файлы → что дальше».

| Логическая категория | Что входит | Текущие файлы (путь от корня проекта) | Статус | Следующее |
|---|---|---|---|---|
| **Корень** | Bootstrap, роли агентов, Master Spec | `README.md`; `agents/*.md` (7 ролей Cowork); `Abris_Universe_Master_Product_Specification_RU.docx` | README и роли — [APPROVED]; Master Spec — [APPROVED] | README обновляется при каждом изменении состояния проекта |
| **00_GOVERNANCE** | Decision Log, структура документации, Risk Register, Change Log | `00_GOVERNANCE/05_Decision_Log.md`; `00_GOVERNANCE/06_Documentation_Structure.md` | Оба [APPROVED] как живые реестры | Добавить Risk Register и Change Log после первых изменений Phase 0 |
| **01_PRODUCT** | Vision, Roadmap, Backlog, PRD | `01_PRODUCT/01_Product_Vision_and_Roadmap.md` | [DRAFT — к утверждению владельцем] | PRD модулей (детальные) — при планировании Phase 1 |
| **02_RESEARCH** | Research Backlog, Findings, Competitors, User Research | `02_RESEARCH/03_Deep_Research_Standards.md` | [APPROVED] как отчёт исследования | Продолжение по open questions (регуляторный мониторинг, стек команды) |
| **03_DOMAIN_UX** | Glossary, Domain Model, User Flows, UX, Accessibility | Пока внутри Master Spec (§11, §6 UF-01…08, Приложение B) | [APPROVED] внутри Master Spec | Выделить Domain Glossary + User Flow Library (Domain & UX Lead) |
| **04_ARCHITECTURE** | System Context, Data Model, Internal Format, ADR, AI Governance | `04_ARCHITECTURE/02_Architecture_and_Stack.md` | [DRAFT], ADR — Proposed | Technical Design Proposal Codex → апгрейд ADR до Accepted |
| **05_ECOSYSTEM** | Community, Creator, Marketplace, Brand, Education | Пока внутри Master Spec (§7–10, EP-18…23) | [APPROVED] внутри Master Spec | Отдельные спецификации — не раньше Phase 3 |
| **06_ANALYTICS** | Metrics, Events, Tracking, Experiments, Dashboards | Пока внутри Master Spec (§14 — гипотезы) | [HYPOTHESIS] (не утверждённые KPI) | Event Taxonomy базовых событий (import, mark/unmark) — параллельно Phase 0 |
| **07_CODEX_HANDOFF** | Ready Packages, Technical Reviews, Clarifications, Completion Reports | `07_CODEX_HANDOFF/04_Codex_Context_Pack.md`; `07_CODEX_HANDOFF/07_TaskPackage_EP01_ThinSlice.md` | [APPROVED] к передаче | Technical Review / Completion Report TASK-THINSLICE-001 — сюда по мере поступления |
| **08_QUALITY** | Test Strategy, Test Plans, Defects, Acceptance Reports | Не создан; обязательные тесты — внутри Task Package | Не создан | Master Test Strategy (Quality Lead) — параллельно Phase 0 |
| **09_RELEASES** | Release Plans/Notes, Migrations, Rollbacks, Post-release | Не создан (релизов не было) | Не создан | Release Record — при Release Readiness Phase 0 |
| **10_ARCHIVE** | Superseded, Deprecated, Rejected | Не создан | Не создан | При первом Superseded-документе |

---

## 2. Source of Truth Map (сводно)

| Категория | Основной источник | Производные | Правило обновления |
|---|---|---|---|
| Product Vision | Master Product Specification v1.0 | `01_Product_Vision_and_Roadmap.md` Часть I | Vision уточняет, не переопределяет Spec, кроме явно помеченных решений владельца |
| Roadmap | `01_Product_Vision_and_Roadmap.md` Часть II | Task Packages по фазам | Любое изменение фазировки — новая версия Roadmap + запись в Decision Log |
| Requirements | Master Spec §5, §13, §20 (эпики, критерии приёмки) | Будущие PRD модулей | PRD не может противоречить Master Spec без Change Request |
| Domain | Master Spec §11, Приложение B | Будущий отдельный Domain Glossary/Model | При выделении в отдельный документ — Master Spec помечает раздел как superseded-ссылку, не дублирует |
| Architecture | `02_Architecture_and_Stack.md` | ADR (внутри того же документа, статус Proposed → Accepted через Codex Review) | Codex Technical Design Proposal обновляет ADR-статусы, не текст принципов раздела 1 |
| Quality | (будет) Master Test Strategy | Acceptance Reports по каждому Task | Quality Lead — единственный владелец итогового вердикта приёмки |
| Research | `03_Deep_Research_Standards.md` | Рекомендации Architecture/Product Lead | Research — evidence, не решение; не может быть процитирован как утверждённое требование |
| Delivery | Work Item Register (в составе Task Package до появления отдельного реестра); `05_Decision_Log.md` | Codex Handoff Register, Completion Report Register | Ведёт Delivery Lead; не дублируется в других документах |

---

## 3. Статусы документов, используемые в проекте

`[DRAFT]` → `[IN REVIEW]` → `[REVISION REQUIRED]` / `[APPROVED]` → `[SUPERSEDED]` / `[DEPRECATED]` → `[ARCHIVED]`; отдельно `[REJECTED]`. Документ без статуса не используется для передачи в Codex. Текущие статусы:

| Документ | Статус |
|---|---|
| Master Product Specification v1.0 | [APPROVED] (рабочая базовая спецификация, не заменяет детальное тех. проектирование модулей — согласно её собственному титульному листу) |
| `01_Product_Vision_and_Roadmap.md` | [DRAFT — к утверждению владельцем] |
| `02_Architecture_and_Stack.md` | [DRAFT] (принципы §1–5,8 — обязательны; §6–7 — рекомендация/Proposed) |
| `03_Deep_Research_Standards.md` | [APPROVED] как исследовательский отчёт |
| `04_Codex_Context_Pack.md` | [APPROVED] к передаче Codex |
| `05_Decision_Log.md` | [APPROVED] как живой реестр |
| `06_Documentation_Structure.md` (этот документ) | [APPROVED] |
| `07_TaskPackage_EP01_ThinSlice.md` | [APPROVED] к передаче Codex, версия постановки 1.0 |

---

## 4. Правила версионирования

0.1 — первый черновик; 0.x — рабочие правки до утверждения; 1.0 — первая утверждённая версия; 1.x — совместимые уточнения; 2.0 — существенное изменение смысла/структуры. Утверждённая версия не перезаписывается без истории изменений (Change Log). Task Package имеет собственную «версию постановки», инкрементируемую при каждом Clarification/Conflict Report, отдельно от версии этого документа.

---

## 5. Что создаётся дальше

1. **Немедленно (параллельно с Phase 0):** Master Test Strategy (Quality Lead), Domain Glossary/User Flow Library как отдельные документы (Embroidery Domain & UX Lead), Event Taxonomy для базовых событий импорта/отметки (Research & Product Analytics Lead).
2. **По завершении Phase 0 (Codex Technical Review + Completion Report получены):** Technical Review и Completion Report для TASK-THINSLICE-001 в `07_CODEX_HANDOFF`; обновление Traceability Matrix; Post-Phase-0 Decision Log запись о переходе к Phase 1.
3. **При планировании Phase 1:** детальные PRD по модулям (Pattern Import, Progress Marking, Legend, Highlight, Anchors, Color Flow, Simplified Parking, Statistics, Journal, Action Plan) — каждый по шаблону §21.1 Master Spec.
4. **Не создаётся сейчас:** документы 05_ECOSYSTEM/08_QUALITY-детализация/09_RELEASES/10_ARCHIVE — до соответствующей фазы, чтобы не создавать преждевременные источники истины без наполнения.

---
