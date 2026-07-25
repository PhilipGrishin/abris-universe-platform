# Архитектура, данные и масштабируемость + рекомендованный стек (Abris Universe)

> **Repository authority note:** `[APPROVED — product-side architecture input]`
> without content changes by the Project Owner on 2026-07-21 (PROD-DEC-005).
> This document does not approve the engineering technology stack or runtime
> architecture. Engineering decisions require Codex Technical Review and the
> canonical engineering decision process registered in
> `docs/SOURCE_OF_TRUTH.md`.

**Документ:** System Architecture, Data & AI Governance Lead — Abris Universe
**Версия:** 1.0
**Дата:** 2026-07-20
**Статус:** Проектный документ архитектурного уровня. Раздел 6 содержит **рекомендации**, а не утверждённые технические решения.
**Источник истины:** Master Product Specification v1.0 (главы 11, 11.1, 11.2, 12; эпики EP-01…EP-23; раздел 18 «Риски»; раздел 19 «Реестр противоречий»).
**Контекст решений владельца:** web-first; первый срез — тонкий вертикальный (canonical Pattern + один простой формат импорта + viewer + отметка стежка + автосохранение); отдельное мобильное приложение позже на общем доменном ядре; мировой уровень, масштаб с первого дня, только современные стандарты, тотальное комментирование кода.

## Как читать этот документ

1. **Архитектурные требования (разделы 1–5, 8)** — обязательны, не зависят от выбора технологии.
2. **Рекомендованный стек (раздел 6)** — обоснованная рекомендация; финальный выбор языка/фреймворка/БД/облака предлагает и обосновывает **Codex**. Каждая позиция помечена: **[РЕКОМЕНДАЦИЯ — требует Codex Technical Review]**. Все ADR (раздел 7) — статус **Proposed**.

---

## 1. Архитектурные принципы

| № | Принцип | Источник | Почему нельзя нарушать |
|---|---|---|---|
| 1 | **Схема ≠ прогресс.** Pattern/PatternVersion — что вышить; Project/ProgressEvent — что отмечено. Одна схема — много проектов. | 11, 11.1 | Иначе невозможны повторная публикация, обновление схемы, несколько проектов; прогресс привязывается к «перекрашенному изображению». |
| 2 | **Importers отделены от canonical model и renderer.** | 5.1, 11.1 | Замена/добавление импортера не требует переписывания viewer/прогресса. |
| 3 | **Progress-операции идемпотентны, offline-first.** Каждое mark/unmark со стабильным ID и timestamp; повторная доставка не дублирует эффект. | 11.1, 11.2, NFR-004 | Основа sync между устройствами и восстановления после сбоя. |
| 4 | **Chunked/tiled rendering.** Viewer не рендерит 500k как один DOM/Canvas-объект. | 11.1, NFR-001, NFR-002 | Единственный способ удержать интерактивность на большой многоцветке. |
| 5 | **Версионируемый формат.** formatVersion отдельно от версии схемы; неизвестное поле не разрушает импорт. | 10, NFR-010 | Добавление типов стежков/метаданных без ломающих миграций. |
| 6 | **Provenance обязателен.** Источник, версия importer, confidence, ручные правки — на уровне поля/элемента. | 11.1, AI Governance | Отличить Original Data от AI Draft/User-Confirmed Data. |
| 7 | **Единый доменный контракт web+mobile.** Одна модель Pattern/Project/ProgressEvent. | 11.1, решение владельца | Mobile-релиз не требует повторной реализации домена. |
| 8 | **Тотальное комментирование кода и документации.** | Требование владельца | Формализовано в разделе 10. |

---

## 2. System Context и Bounded Contexts

Контексты: **Identity & Accounts**, **Pattern Management** (EP-01,02,03,06), **Project & Progress Tracking** (EP-05,12,13,14), **Stitching Intelligence** (EP-08,09,10,16), **Materials & Inventory** (EP-17), и позже — Community, Creator Hub, Marketplace, Brand & QR, Education.

**Ядро первого web-среза:** Pattern Management (`Pattern`, `PatternVersion`, `SourceFile`, `ImportJob`, `ImportReport`, один importer, `Grid`, `Symbol`, `PaletteItem`); Project & Progress (`Project`, `ProgressEvent` как идемпотентный event log, автосохранение). Undo/Redo в срез НЕ входит (Out of Scope Task Package; появляется в Phase 1/EP-05 поверх того же event log — структура событий закладывается сейчас). Identity: аккаунтов в срезе нет — приложение локальное; сущность `User` появляется вместе с auth в Phase 1/1.5, модель данных не должна этому препятствовать. Остальные контексты функционально не входят, но модель данных остаётся совместимой с их появлением.

**Границы:** Stitching Intelligence читает Pattern+Progress, но не владеет ими (состояние `ParkingPlan`/`Anchor` — производное). Brand/QR и Marketplace держатся раздельно (QR-активация ≠ обязательный посредник продажи — риск зависимости от бренда). Микросервисы на старте не рекомендуются — границы контекстов как модульные границы внутри одного деплоя (ADR-005).

---

## 3. Каноническая модель данных Pattern

### 3.1 Структурное разделение (обязательно)

```
Pattern
 ├─ Metadata     (автор, лицензия, размеры, count, тип ткани, версия формата)
 ├─ Geometry/Grid (координатная система, размеры, зоны, страницы источника)
 ├─ Layers       (full/fractional/backstitch/knots/beads/decorative)
 ├─ Symbols      (визуальные обозначения, независимые от цвета)
 ├─ Palette      (ThreadColor, ThreadBrand, Blend, strand count — независимо от Symbol)
 ├─ Stitches     (геометрия + ссылка на Symbol + ссылка на PaletteItem + strand count + layer)
 ├─ SourcePages  (связь координат с исходными страницами — provenance)
 └─ Provenance   (SourceFile, ImportJob, importer version, confidence per element)

Project (отдельно, ссылается на PatternVersion, не встраивается в Pattern)
 ├─ ProgressEvent[] (append-only: mark/unmark/bulk, id, timestamp, device, source)
 ├─ ProgressState   (материализованная проекция событий, не источник истины)
 └─ Session[], JournalEntry[], Goal/Task[] (вне первого среза, не блокируются моделью)
```

**Symbol и PaletteItem — разные сущности (many-to-many через Stitch):** один цвет — разные символы в разных типах стежков/слоях (§8). **Cell ≠ Stitch:** в одной клетке — full stitch, backstitch-сегмент, French knot, бисерина одновременно (множественные Stitch на координату с layer и stitch type).

### 3.2 Обязательные типы стежков в модели (данные, не UI)

Full cross, half/quarter/three-quarter/petit, backstitch (линии/сегменты `BackstitchSegment`, не клетки), French knots и точечные декоративные, beads, blends (`Blend` из нескольких `ThreadColor`), strand count (1, 2, 1+1). Каждый тип — расширяемый `StitchType`, не захардкоженный enum.

### 3.3 Версионирование и миграции — требования к Codex

1. Отдельные `formatVersion` и `patternVersion`.
2. Миграция — детерминированная тестируемая функция `migrate(vN→vN+1)` с changelog и golden-fixture тестами.
3. Неизвестное поле → opaque extension data (`extensions` bag), не теряется при записи.
4. Повторный импорт создаёт **новую** PatternVersion, не перезаписывает и не трогает существующие ProgressEvent; маппинг координат между версиями обязателен.
5. Ручные исправления — отдельный слой поверх Original Data, survive допустимые миграции.

---

## 4. Рендеринг больших схем (до 500 000 стежков)

**NFR-001/002** — конкретные пороги (мс, FPS, MB) устанавливаются на прототипе (раздел 9), не декларируются произвольно.

### 4.2 Подход: тайлинг + виртуализация + символы, а не клетки

1. Тайлинг полотна (независимые единицы загрузки/кэша/перерисовки; только видимое + буфер prefetch). 2. Виртуализация (ни DOM, ни render-дерево не создают узел на стежок). 3. Символы как глифы из атласа (TR-VIEW-001), не геометрия на клетку. 4. Continuous canvas (TR-VIEW-002): сшивка страниц на этапе импорта. 5. Progressive loading. 6. Инвалидация по слоям (изменение прогресса перерисовывает только регион).

### 4.3 Canvas2D vs WebGL vs WebGPU — рекомендация **[РЕКОМЕНДАЦИЯ — требует Codex Technical Review]**

| Технология | Роль | Обоснование |
|---|---|---|
| **Canvas2D + OffscreenCanvas + Web Worker** | Базовый рендер первого web-среза | Достаточная производительность для тайловой символьной отрисовки при простоте реализации/отладки. |
| **WebGL (PixiJS)** | Fallback/апгрейд для экстремального масштаба (500k, много слоёв highlight) | Выигрывает при тысячах перерисовок примитивов в кадр; PixiJS — зрелый батчинг спрайтов («символ как спрайт»). |
| **WebGPU** | Не для MVP; кандидат для будущего | Мощнее, но поддержка в браузерах/на бюджетных Android не универсальна (см. Deep Research R1-01). |

**Стратегия:** рендер-слой за абстракцией (`PatternRenderer` interface) — Canvas2D-реализация заменяема на WebGL без изменения domain-core и viewer-логики.

### 4.4 Что измерить на прототипе

Time-to-interactive видимой области, FPS zoom/pan на 500k, задержка mark/unmark (NFR-002), память на бюджетном устройстве, деградация при нехватке памяти (fallback, не крэш), отменяемость длительных операций, видимый прогресс фоновых операций.

---

## 5. Offline-first и синхронизация

### 5.1 Event log прогресса

```
ProgressEvent {
  id: stable UUID (клиентский — критично для идемпотентности)
  projectId, patternVersionId
  type: mark | unmark | bulk_mark | bulk_unmark | undo | redo   // в Phase 0 применяются только mark|unmark; остальные типы — Phase 1 (EP-05)
  targetRefs: [координаты]
  timestamp: client time + server receipt time
  deviceId, source: user | ai_suggestion_accepted | import_reconciliation
  causalityRef?: id предыдущего события
}
```

`ProgressState` — материализованная проекция журнала, не источник истины (§11.2, §14).

### 5.2 Event-based vs CRDT — рекомендация **[РЕКОМЕНДАЦИЯ — требует Codex Technical Review]**

**Основной механизм — event-based append-only log с идемпотентным upsert и доменными merge-правилами; CRDT — точечно** только для узких структур с реальным конкурентным редактированием (например, `Anchor` с двух устройств). Обоснование: прогресс — набор дискретных фактов «стежок X отмечен в момент T», а не совместно редактируемый документ; event log естественно даёт Undo/Redo и историю; идемпотентность = клиентский ID + upsert. Правило разрешения 7 сценариев конфликтов (§11.2/§15) специфицирует Codex; при сомнении — surface conflict пользователю, а не тихая перезапись.

### 5.3 Статус синхронизации

Пользователь видит: сохранено локально / отправлено / есть конфликт; ручной backup; фото/ассеты — отдельным менее критичным каналом от событий прогресса.

---

## 6. Рекомендованный стек (web-first, глобальный масштаб)

> Каждая позиция — **[РЕКОМЕНДАЦИЯ — требует Codex Technical Review]**.

| Слой | Рекомендация |
|---|---|
| **Язык** | TypeScript everywhere (web, домен, backend, будущий mobile) — буквальное переиспользование доменного ядра между web и mobile |
| **Web UI** | React + Vite (SPA-приложение) |
| **Viewer rendering** | Собственный тайловый renderer поверх Canvas2D+OffscreenCanvas+Web Worker (MVP) за абстракцией → WebGL/PixiJS для масштаба |
| **Domain core** | Framework-agnostic TS-пакет `@abris/domain-core` (модели Pattern/Progress, zod-валидация, миграции, chunk-индексация, merge-правила) — общий web/mobile |
| **Локальное хранилище** | Клиентская БД (SQLite-WASM/IndexedDB-обёртка) с append-only event log и очередью sync; переживает перезапуск/сбой (NFR-004) |
| **Backend/API** | Node.js (TS), **модульный монолит** по bounded contexts; типизированный RPC (tRPC-класс) для 1st-party + версионируемый REST/OpenAPI для внешних (позже); идемпотентность по клиентскому ID |
| **БД** | PostgreSQL + JSONB (реляционные User/Pattern/Project + append-only ProgressEvent; JSONB для payload Pattern) |
| **Файлы/assets** | S3-совместимое объектное хранилище (оригиналы SourceFile, tiles/превью, фото) |
| **Async (импорт/AI)** | Очередь задач (Redis/managed), отдельный масштабируемый worker-пул (NFR-005) |
| **Auth** | Managed OAuth+email провайдер (Google/Facebook/Apple, §3.1), JWT для web+mobile |
| **Платежи** | Глобальный провайдер с marketplace payouts (Phase 2/3), отдельный bounded context Order/Payment |
| **Infra/CDN** | Глобальный CDN с 1-го дня; 1 основной регион compute + read-replicas; multi-master позже (ADR-007) |
| **Observability** | OpenTelemetry (frontend viewer perf + backend + workers) + crash-reporting (NFR-009) |
| **i18n** | ICU MessageFormat библиотека (next-intl/i18next), внешние ресурсные файлы, готовность к RTL/pluralization (NFR-007) |
| **Тестирование** | Vitest/Jest (домен) + Playwright (E2E) + golden-fixture на каждый importer + performance-тесты 500k как CI-гейт |
| **CI/CD** | Trunk-based, preview-окружения на PR, обязательный прогон unit+golden+performance перед merge |
| **Монорепо** | pnpm workspaces + Turborepo (`apps/web`, `packages/domain-core`, `packages/renderer`, `packages/importers/*`, будущий `apps/mobile`) |
| **Mobile (позже)** | React Native + Expo на общем `@abris/domain-core`; рендер viewer — WebView или нативный RN Skia (решается прототипом) |

---

## 7. Architecture Decision Records (Proposed)

**ADR-001 — Канонический формат независим от форматов импорта.** Единый версионируемый canonical Pattern format; каждый importer — только маппинг «внешний→canonical». Риск: сложность проектирования, митигируется тем, что первый срез — 1 формат, но формат сразу расширяемый.

**ADR-002 — Тайловый рендер поверх Canvas2D с абстракцией под WebGL-fallback.** Зависит от Prototype (9.1). Решение (в): Canvas2D для MVP за интерфейсом `PatternRenderer` с путём миграции на WebGL. Пересмотр — по результатам прототипа 500k.

**ADR-003 — Event-log прогресса вместо CRDT-документа.** Append-only event log + идемпотентный upsert + доменные merge-правила; CRDT точечно для Anchor. Риск: merge-правила должны покрыть все 7 сценариев §15.

**ADR-004 — Монорепо с общим доменным ядром web/mobile.** pnpm+Turborepo, domain-core не зависит от React/RN. Риск: дисциплина границ (lint-правила зависимостей).

**ADR-005 — Модульный монолит вместо микросервисов на старте.** Явные модульные границы; отдельный worker-процесс только для async import/AI. Пересмотр — когда контекст (Marketplace, Phase 3) покажет независимые требования масштабирования.

**ADR-006 — PostgreSQL как единственный system of record.** JSONB для гибких частей Pattern + транзакционность для ProgressEvent + зрелые бэкапы/репликация (RPO/RTO).

**ADR-007 — Один регион записи + глобальный CDN и read-replicas на старте, полный мультирегион позже.** Низкая латентность чтения с 1-го дня; сложность multi-master откладывается; событийный лог/идемпотентность делают переход без изменения модели данных.

**ADR-008 — ICU MessageFormat i18n с первого дня.** Отсутствие рефакторинга строкового слоя при добавлении языков с иной плюрализацией/RTL.

---

## 8. Нефункциональные требования (сводка)

| NFR | Требование | Следствие |
|---|---|---|
| NFR-001 | 500k без лагов | 4.1–4.4, ADR-002, Prototype 9.1 |
| NFR-002 | Мгновенный mark, расчёты вне UI | Раздел 4, Web Worker |
| NFR-003 | Android/iOS/Web — единая модель | 6 (domain-core), ADR-004 |
| NFR-004 | Автосохранение, crash recovery | Раздел 5 (event log), локальное хранилище |
| NFR-005 | Независимое масштабирование импорта/AI | Отдельный worker-пул, ADR-005 |
| NFR-006 | Доступность | UI-слой viewer (не блокируется моделью) |
| NFR-007 | Локализация UA/RU/EN + расширяемость | 6 (i18n), ADR-008 |
| NFR-008 | Безопасность | Auth, хранение файлов, провенанс |
| NFR-009 | Наблюдаемость | OpenTelemetry |
| NFR-010 | Версионирование формата, миграции | 3.3, ADR-001 |

---

## 9. Prototype Required

**9.1 Рендеринг 500k** — удерживает ли Canvas2D+тайлинг+Worker целевые FPS/mark-latency на 500k на бюджетных устройствах, или нужен WebGL уже в MVP.
**9.2 PDF-импорт** — доля machine-readable vs scanned среди 20–30 образцов, достижимый confidence (C-01/EP-03).
**9.3 Синхронизация** — корректность идемпотентного применения ProgressEvent и merge-правил на всех 7 сценариях §15.
**9.4 Стоимость/latency AI** — до коммита на AI-провайдера в Creator Hub/Phase 2.
**9.5 Выбор «одного простого формата»** — рекомендация: структурированный интерактивный формат (XSD/PAT/XSP-класса), не PDF и не изображение; конкретный — по короткому spike на 2–3 файлах кандидатов.

---

## 10. Принципы комментирования кода и документации для Codex

1. Каждый доменный модуль — файловый комментарий (что за модуль, инварианты, какие принципы раздела 1 реализует, ссылки на NFR/EP/раздел спецификации).
2. Неочевидная бизнес-логика (parking, complexity, merge, миграции) — документируется **почему**, а не только что, со ссылкой на ADR.
3. Публичные интерфейсы domain-core и API — TSDoc с инвариантами, побочными эффектами, идемпотентностью, ошибками.
4. Provenance-поля — с указанием категории AI-результата (Original/Suggestion/Draft/Correction/User-Confirmed).
5. Каждая миграция и importer — README-описание (формат, маппинг, ограничения, Format Capability).
6. Тесты как документация — golden-fixture именуются по сценарию спецификации.
7. ADR — обязательная форма фиксации архитектурных решений; код ссылается на ADR-ID.
8. Комментарии в коде — на английском (международная команда); продуктовые/архитектурные документы — на языке проекта. Финальное разделение фиксирует Codex в Technical Design Proposal.

---

## Заключение

Ядро первого web-среза (canonical format EP-01, один importer EP-02, тайловый viewer EP-04, идемпотентный event log EP-05, автосохранение) спроектировано так, чтобы: не создавать тупиковую модель при добавлении PDF/parking/anchors/color flow/statistics/sync и далее экосистемы; быть готовым к мировому масштабу через поэтапный путь (модульный монолит → сервисы при необходимости; один регион → мультирегион при трафике; Canvas2D → WebGL при недостаточности); оставить финальный выбор технологий за Codex при сохранении архитектурных инвариантов раздела 1 как критерия Architecture Acceptance. Все рекомендации раздела 6 и ADR раздела 7 передаются на Codex Technical Design Proposal и Architecture Review перед статусом Accepted.
