# CODEX CONTEXT PACK — ABRIS UNIVERSE

> **Repository authority note:** This is approved product-to-engineering context,
> not a replacement for the Master Product Specification, owner decisions, or a
> versioned Task Package. Codex role activation is determined only by
> `.codex/AGENT_REGISTRY.md`.

**Document ID:** AU-CDX-001
**Название:** Codex Context Pack — вводный документ для технического контура
**Версия:** 1.0
**Статус:** [APPROVED] как контекстный документ (не продуктовое требование; продуктовые формулировки наследуются из источников ниже и не переопределяются здесь)
**Владелец документа:** Delivery, Documentation & Codex Coordination Lead
**Авторы:** Delivery, Documentation & Codex Coordination Lead (компиляция); содержание согласовано с Product Strategy & Requirements Lead, System Architecture, Data & AI Governance Lead
**Дата создания:** 2026-07-20
**Дата обновления:** 2026-07-20
**Reviewers:** Главный управляющий агент (Claude Cowork) — на утверждение перед первой передачей в Codex
**Связанные решения:** DEC-001…DEC-004 (см. `05_Decision_Log.md`)
**Предыдущая версия:** нет (первая версия)
**Связанные задачи:** TASK-THINSLICE-001 (`07_TaskPackage_EP01_ThinSlice.md`)

**Назначение.** Это первый документ, который читает любой агент Codex, прежде чем открыть Task Package. Он не заменяет ни Master Product Specification, ни Vision/Roadmap, ни Architecture-документ — он ориентирует в них и фиксирует правила взаимодействия. Если что-то в этом документе противоречит более новому Decision Log, приоритет — за Decision Log.

---

## 1. Что за продукт

Abris Universe — цифровая экосистема вокруг ручной вышивки (крестом и бисером), позиционируется как **«Embroidery OS»**, а не как «ещё один viewer/tracker». Северная звезда: пользователь проходит весь путь в одной системе — импорт/получение схемы → материалы → вышивка и прогресс → статистика и план → публикация → сообщество → покупка/продажа контента и материалов (Master Spec §1.1).

Продуктовая архитектура строится по фазам (Master Spec §4, уточнено решением владельца от 2026-07-20 в `01_Product_Vision_and_Roadmap.md`):

- **Phase 0 — Thin Vertical Slice (Web).** Первый тонкий e2e-срез: канонический формат Pattern (минимум) + импорт одного простого структурированного формата + viewer (символы, zoom/pan, тайловый рендер) + отметка/снятие одного стежка + автосохранение. Это ядро, а не одноразовое демо.
- **Phase 1 — Web MVP Core.** Полное P0-ядро по критериям приёмки MVP (Master Spec §13).
- **Phase 1.5 — Web MVP+.** Расширенная парковка, complexity lite, PDF (machine-readable), cloud sync, inventory basics.
- **Phase 2 — Mobile.** Отдельное мобильное приложение на общем доменном ядре с web.
- **Phase 3 — Экосистема.** Creator Hub, Community, Marketplace & Brand, Education, Online Exhibitions (по под-фазам, все — после стабильного ядра).

Сейчас в работе — **Phase 0**. Ни один Codex-агент не должен по своей инициативе расширять scope в сторону Phase 1+ функций (highlight, anchors, parking, color flow, статистика, undo/redo, bulk mark, PDF, cloud) — см. `07_TaskPackage_EP01_ThinSlice.md`, раздел «Out of Scope» и «Запрещённые изменения».

---

## 2. Два контура и разделение ответственности

Проект работает как два независимых контура.

**Контур Claude Cowork** отвечает за: исследования, продукт, требования, предметную область, UX, архитектурные требования (инварианты, а не реализацию), данные (доменную модель на уровне требований), AI Governance, экосистему, аналитику, качество, безопасность (требования), независимую приёмку, документацию и координацию. Внутри него — Delivery/Documentation/Codex Coordination Lead (этот документ), Product Strategy & Requirements Lead, Embroidery Domain & UX Lead, System Architecture, Data & AI Governance Lead, Quality, Security & Independent Acceptance Lead, Ecosystem/Community & Commercial Product Lead, Research & Product Analytics Lead.

**Контур Codex** отвечает за: анализ репозитория, техническое проектирование, реализацию, рефакторинг, миграции, автоматические тесты, DevOps, техническую документацию, технический self-review, исправление дефектов. Внутри него — специализированные агенты Codex (см. раздел 5).

**Жёсткое правило:** Codex не принимает продуктовые решения самостоятельно и не меняет продуктовый смысл постановки. Claude Cowork не пишет production-код и не подменяет технический self-review Codex. Если задача касается пункта, помеченного `[CONFLICT]` или `[OPEN]`, Codex обязан остановиться и вернуть вопрос — не выбирать вариант по умолчанию.

---

## 3. Source of Truth Map

| Категория | Основной источник (в этом проекте) | Статус |
|---|---|---|
| Product Vision / общий продуктовый контекст | Master Product Specification v1.0 (`Abris_Universe_Master_Product_Specification_RU.docx`, корень папки проекта; консолидация десяти источников S1–S10) | [APPROVED] как базовая спецификация |
| Vision (формулировка «зачем» и продуктовые принципы) | `01_Product_Vision_and_Roadmap.md`, Часть I | [DRAFT — к утверждению владельцем] |
| Roadmap / фазы | `01_Product_Vision_and_Roadmap.md`, Часть II | [DRAFT — к утверждению владельцем] |
| Requirements (эпики, приоритеты, критерии приёмки MVP) | Master Spec §5, §13, §20 | [APPROVED] |
| Domain (термины, каноническая модель) | Master Spec §11, Приложение B; детализация — `02_Architecture_and_Stack.md` §3 | [APPROVED] / [DRAFT] |
| Architecture (принципы, ADR, стек) | `02_Architecture_and_Stack.md` | [DRAFT], ADR — все статус **Proposed** |
| Research / валидация индустриальных стандартов | `03_Deep_Research_Standards.md` | [APPROVED] как отчёт исследования (не решение) |
| Delivery / Decision Log / реестры | `05_Decision_Log.md` | [APPROVED] как живой реестр |
| Codex Handoff (этот пакет + Task Package) | `04_Codex_Context_Pack.md` (этот документ), `07_TaskPackage_EP01_ThinSlice.md` | [APPROVED] к передаче |
| Структура документации | `06_Documentation_Structure.md` | [APPROVED] |

Если один и тот же факт встречается в нескольких документах — Master Spec первичен для продуктового смысла, Architecture-документ первичен для технических инвариантов, Decision Log первичен для статуса решений. Roadmap/Vision — производные интерпретации Master Spec с явно помеченными уточнениями владельца.

---

## 4. Web-first и «тонкий вертикальный срез» — что это значит технически

**Web-first:** продукт сначала обкатывается как небольшое веб-приложение — это полигон для доменной модели, архитектуры рендеринга, Codex-процесса и инфраструктуры при минимальном операционном риске. Мобильное приложение — отдельная поставка Phase 2 на **том же** доменном ядре (не переписывается).

**Тонкий вертикальный срез (Phase 0)** — не «маленькая версия каждой фичи», а **полный end-to-end путь по одному узкому сценарию**:

`канонический формат Pattern (минимум) → импорт ОДНОГО простого структурированного формата → viewer (символы + zoom/pan, тайловый рендер) → отметка/снятие ОДНОГО стежка → автосохранение с восстановлением после reload`

Смысл среза — доказать, что доменная модель, рендер-архитектура и процесс Claude↔Codex работают на реальном (не игрушечном) вертикальном пути, прежде чем расширяться вширь. Именно поэтому код и модель данных Phase 0 — основа Phase 1, а не одноразовый прототип, и именно поэтому Out of Scope в Task Package такой жёсткий (см. `07_TaskPackage_EP01_ThinSlice.md`).

---

## 5. Архитектурные инварианты (обязательны, не зависят от выбора технологии)

Источник: `02_Architecture_and_Stack.md` §1. Эти 8 принципов — критерий Architecture Acceptance для любого Codex-результата в этом проекте:

1. **Схема ≠ прогресс.** Pattern/PatternVersion (что вышить) отделены от Project/ProgressEvent (что отмечено). Одна схема — много проектов.
2. **Importers отделены от canonical model и renderer-а.** Добавление/замена importer-а не требует переписывания viewer/прогресса.
3. **Progress-операции идемпотентны, offline-first.** Стабильный клиентский ID + timestamp на каждое mark/unmark; повторная доставка не дублирует эффект.
4. **Chunked/tiled rendering.** Viewer не рендерит схему как единый DOM/Canvas-объект — тайлы/чанки, только видимое + буфер.
5. **Версионируемый формат.** `formatVersion` отдельно от версии схемы; неизвестное поле не разрушает импорт (opaque extension data).
6. **Provenance обязателен.** Источник, версия importer-а, confidence — на уровне поля/элемента.
7. **Единый доменный контракт web+mobile.** Одна модель Pattern/Project/ProgressEvent, независимая от UI-фреймворка.
8. **Тотальное комментирование кода и документации.** Обязательное требование владельца, формализовано ниже (раздел 9) и в `02_Architecture_and_Stack.md` §10.

ADR (все статус **Proposed**, подлежат Codex Technical Design Proposal и Architecture Review перед статусом Accepted): ADR-001 (канонический формат независим от импортеров), ADR-002 (тайловый рендер Canvas2D + абстракция под WebGL-fallback), ADR-003 (event-log вместо CRDT-документа для прогресса), ADR-004 (монорепо с общим доменным ядром web/mobile), ADR-005 (модульный монолит вместо микросервисов на старте), ADR-006 (PostgreSQL как system of record), ADR-007 (один регион записи + глобальный CDN на старте), ADR-008 (ICU MessageFormat i18n с первого дня). Полные формулировки — `02_Architecture_and_Stack.md` §7.

---

## 6. Рекомендованный стек (кратко) — финальный выбор за Codex

`02_Architecture_and_Stack.md` §6 даёт обоснованную рекомендацию (TypeScript everywhere, React+Vite, тайловый Canvas2D-рендер за абстракцией с WebGL/PixiJS fallback, framework-agnostic `@abris/domain-core`, клиентская БД с event log, Node.js модульный монолит, PostgreSQL+JSONB, S3-совместимое хранилище файлов, OAuth-провайдер, OpenTelemetry, ICU i18n, pnpm+Turborepo монорепо, React Native+Expo для будущего mobile). **Каждая позиция помечена «требует Codex Technical Review» — это не утверждённое решение.**

Codex обязан представить **Technical Design Proposal** с обоснованием финального выбора языка/фреймворка/БД/облака (принять рекомендацию, изменить или предложить альтернативу — с явным сравнением) и провести по нему Architecture Review, прежде чем ADR получают статус Accepted. Смена рекомендованного стека — это **Technical Alternative Proposal** (см. раздел 8), а не тихое решение внутри реализации.

`03_Deep_Research_Standards.md` содержит независимую (research-based, не архитектурную) валидацию по 5 темам: рендеринг больших сеток (R1-01…R1-05), offline-first sync (R2-01…R2-03), монорепо web/mobile и альтернатива KMP (R3-01…R3-03), i18n/privacy/data localization (R4-01…R4-04), проверка конкурентных утверждений (R5-01…R5-03). Codex должен учитывать эти findings как evidence при Technical Design Proposal, но не как готовое решение.

---

## 7. Prototype Required (spikes) — до или в начале работы

Из `02_Architecture_and_Stack.md` §9:

- **9.1 Рендеринг 500k** — удерживает ли Canvas2D+тайлинг+Worker целевые FPS/mark-latency на 500k на бюджетных устройствах, или нужен WebGL уже в MVP. Для Phase 0 — ранний сигнал: прогон тайлового рендера на обеих тестовых схемах среза, включая заметно более крупную (см. Task Package, «Prototype/Spike требования»); полный stress-test 500k — до расширения в Phase 1.
- **9.2 PDF-импорт** — доля machine-readable vs scanned на 20–30 образцах (relevant для Phase 1.5 / C-01, не для Phase 0).
- **9.3 Синхронизация** — корректность идемпотентного применения ProgressEvent на всех сценариях конфликтов (relevant для EP-15 / Phase 1.5, не для Phase 0, где sync отсутствует).
- **9.4 Стоимость/latency AI** — до коммита на AI-провайдера (Phase 2/3, не Phase 0).
- **9.5 Выбор «одного простого формата» для Phase 0** — рекомендация архитектуры: структурированный интерактивный формат (класса XSD/PAT/SXP), не PDF и не изображение; конкретный формат определяется коротким spike на 2–3 файлах-кандидатах. **Это первый технический шаг перед реализацией TASK-THINSLICE-001** — см. Task Package, раздел «Prototype/Spike требования».

---

## 8. Обязательный порядок работы Codex (жизненный цикл)

Полный жизненный цикл единицы работы описан в роли координатора (23 стадии, IDEA→CLOSED). Для Codex релевантна следующая последовательность, начиная с момента получения пакета:

1. **READY FOR CODEX REVIEW** — Claude Cowork передаёт полный Task Package с явно указанными Codex-агентами (исполнитель + проверяющий) и Definition of Ready выполнен.
2. **CODEX TECHNICAL REVIEW** — Codex анализирует постановку и репозиторий (см. обязательную инструкцию, раздел 9 ниже). Результат — Technical Review-отчёт: понимание задачи, анализ репозитория, затронутые компоненты, подход, альтернативы, модель данных, API, миграции, зависимости, риски, безопасность, производительность, тестирование, rollback, вопросы, отклонения от постановки, оценка сложности.
3. **CLARIFICATION / CONFLICT** (если применимо) — Codex не решает противоречие/пробел сам; готовит Clarification Report или Conflict Report и возвращает Claude Cowork **до** реализации соответствующей части.
4. **READY FOR DEVELOPMENT** — только после того, как все вопросы получили профильный ответ Claude и Task Package обновлён (новая версия).
5. **IN DEVELOPMENT** — реализация.
6. **CODEX SELF-VERIFICATION** — Codex проверяет реализацию, готовит доказательства (тесты, perf-замеры, security-чеки).
7. **Completion Report** — по полному перечню 22 полей (раздел 10 ниже) — передаётся Claude Cowork.
8. **READY FOR INDEPENDENT ACCEPTANCE → IN ACCEPTANCE** — продуктовая, UX/domain, архитектурная и QA-проверка Claude Cowork. Статус Codex «done» **не** означает готовность продукта.
9. **VERIFIED / REWORK REQUIRED** — по результатам приёмки.

Codex никогда не переводит задачу в статус, эквивалентный VERIFIED или RELEASED, самостоятельно.

---

## 9. Обязательные правила исполнения

- **Importer:** для любого нового или изменённого импортера — обязательны fixture (реальный или репрезентативный образец), golden output (эталонный ожидаемый Pattern) и минимум один негативный тест (повреждённый/неподдерживаемый файл с понятным отчётом об ошибке).
- **Progress:** для каждого действия прогресса (mark/unmark/bulk) — обязательны тесты undo (где применимо в скоупе), persistence (переживает reload/крэш) и sync semantics (идемпотентность, повторная доставка события).
- **Viewer:** обязательно измерять на стресс-схеме время открытия (time-to-interactive), FPS zoom/pan и mark latency; заносить в Completion Report как performance evidence.
- **Backward compatibility:** любая новая модель stitch/формата обязана сохранять обратную совместимость (миграции, opaque extension data — принцип 5 раздела 5).
- **Комментирование:** тотальное — файловый комментарий модуля (что, зачем, какие инварианты раздела 5 реализует, ссылки на NFR/EP), TSDoc публичных интерфейсов, README на каждый importer и миграцию, комментарии в коде на английском (см. `02_Architecture_and_Stack.md` §10).
- **[CONFLICT] / [OPEN]:** любой встреченный пункт с этой пометкой (в Master Spec, Vision/Roadmap или в самой постановке) выносится в Decision Log через Clarification/Conflict Report — **никогда не решается догадкой** внутри реализации.
- **Scope discipline:** не расширять и не переопределять scope «по пути», даже если техническое удобство подсказывает иное (см. правило Technical Alternative Proposal — техническое удобство не есть достаточная причина для изменения продуктовой логики).

---

## 10. Матрица маршрутизации вопросов Codex к профильным Claude-агентам

| Тип вопроса | Кому направлять |
|---|---|
| Продукт, scope, приоритет | Product Strategy & Requirements Lead |
| Предметная логика, терминология, UX | Embroidery Domain & UX Lead |
| Архитектура, данные, формат, sync, AI | System Architecture, Data & AI Governance Lead |
| Качество, безопасность, тестирование | Quality, Security & Independent Acceptance Lead |
| Community, Marketplace, Creator, Commercial | Ecosystem, Community & Commercial Product Lead |
| Исследования, метрики, аналитика | Research & Product Analytics Lead |
| Затрагивает несколько направлений/стратегию | Главный управляющий агент, при необходимости — владелец проекта |

Все вопросы физически проходят через Delivery, Documentation & Codex Coordination Lead — он не отвечает на них по существу, а маршрутизирует, регистрирует и возвращает зафиксированный ответ (Clarification Report).

---

## 11. Глоссарий ссылок

- **EP-xx** — Epic из Реестра эпиков Master Spec §20 (EP-01…EP-23), приоритет P0–P3.
- **C-xx** — запись Реестра противоречий Master Spec §19 (C-01…C-10), см. также `05_Decision_Log.md`.
- **NFR-xxx** — нефункциональное требование Master Spec §12 (NFR-001…NFR-010).
- **TR-VIEW-xxx** — функциональное требование к viewer, Master Spec §5.2.
- **ADR-xxx** — Architecture Decision Record, `02_Architecture_and_Stack.md` §7, все статус Proposed.
- **DEC-xxx / OQ-xxx** — записи Decision Log / Open Questions, `05_Decision_Log.md`.
- **[CONFIRMED] / [CONFLICT] / [OPEN] / [DERIVED]** — маркеры достоверности из Master Spec §0.
- **S1…S10** — исходные документы, консолидированные в Master Spec (Приложение A).

Термины предметной области (Pattern, Project, Stitch, Anchor, Parking, Color Flow, Confetti, Count, HAED, Backstitch, Blend, SAL, WIP, Markup, Importer, Heatmap) — Master Spec, Приложение B.

---
