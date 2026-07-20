# Abris Universe — управляющий проект (Claude Cowork)

> **Repository registration note:** This document was imported from the
> read-only external Claude Cowork workspace on 2026-07-20. Machine-local paths
> were normalized, but its approved product and organizational meaning was not
> rewritten. Repository authority and current locations are resolved through
> `product/README.md` and `docs/SOURCE_OF_TRUTH.md`. Codex roles mentioned here
> are planning inputs unless they are active in `.codex/AGENT_REGISTRY.md`.

Этот файл — точка входа для каждой новой рабочей сессии. Он должен всегда отражать актуальное состояние проекта. Правило проекта: всё, что обсуждено и решено, немедленно фиксируется письменно — в этом README, в реестрах и в памяти проекта. Ни одно решение не существует только в контексте одной сессии.

Исходная папка проекта в локальном окружении зарегистрирована как
`<external-claude-workspace>`. Она была перемещена 2026-07-20 из
`<legacy-product-workspace>`; старый путь больше не использовать. Переносимая
repository-копия и её authority status определяются через документы, указанные
в registration note выше.

Последнее обновление: 2026-07-20 (создан фундаментальный пакет документов: Vision, Roadmap, Архитектура+стек, Deep Research, Codex Context Pack, Decision Log, первый Task Package).

## Что это за проект

Abris Universe — цифровая экосистема для вышивки крестом, бисером и других направлений рукоделия. Этот проект Claude Cowork — управляющий контур: продуктовая стратегия, исследования, требования, постановка задач, приёмка. Программный код здесь НЕ пишется — вся реализация выполняется в независимом проекте Codex.

Главный продуктовый источник истины: `Abris_Universe_Master_Product_Specification_RU.docx` (в корне этой папки).

## Структура папки

- `README.md` — этот файл, bootstrap новой сессии.
- `Abris_Universe_Master_Product_Specification_RU.docx` — Master Product Specification v1.0 (главный продуктовый источник истины, 23 эпика EP-01…EP-23, конфликты C-01…C-10, NFR, критерии приёмки, каноническая модель).
- `agents/` — определения 7 специализированных агентов Claude Cowork (формат: YAML frontmatter + системный промпт).
- `00_GOVERNANCE/` — `05_Decision_Log.md` (решения + конфликты C-01…C-10), `06_Documentation_Structure.md` (карта документации + Source of Truth Map).
- `01_PRODUCT/` — `01_Product_Vision_and_Roadmap.md` (Vision + глобальный Roadmap Phase 0…3, web-first→mobile).
- `02_RESEARCH/` — `03_Deep_Research_Standards.md` (deep research мировых стандартов рендеринга/sync/monorepo/i18n/privacy + валидация конкурентов, с источниками).
- `04_ARCHITECTURE/` — `02_Architecture_and_Stack.md` (архитектурные принципы, каноническая модель Pattern, рекомендованный стек, 8 ADR Proposed, Prototype Required).
- `07_CODEX_HANDOFF/` — `04_Codex_Context_Pack.md` (вводный документ для Codex) + `07_TaskPackage_EP01_ThinSlice.md` (первый Task Package: тонкий вертикальный срез Phase 0).

Статус документов: Master Spec — [APPROVED]; Vision/Roadmap и Architecture — [DRAFT, к утверждению владельцем]; Deep Research/Decision Log/Doc Structure/Codex Context Pack/Task Package — [APPROVED к передаче]. Порядок чтения новой сессией: память проекта → этот README → 00_GOVERNANCE → 01_PRODUCT → 04_ARCHITECTURE → 07_CODEX_HANDOFF.

## Команда проекта

Вся команда состоит из агентов Claude Cowork и агентов Codex. Других участников нет. Спорные вопросы эскалируются владельцу проекта (Philip).

### Команда Claude Cowork

1. **Chief Project Orchestrator** — главный управляющий агент; задан инструкциями проекта Cowork, отдельного файла нет.
2. **Product Strategy & Requirements Lead** — создан: `agents/product-strategy-requirements-lead.md` (name: `product-strategy-lead`).
3. **Embroidery Domain & UX Lead** — создан: `agents/embroidery-domain-ux-lead.md` (name: `embroidery-domain-ux-lead`).
4. **System Architecture, Data & AI Governance Lead** — создан: `agents/system-architecture-data-ai-governance-lead.md` (name: `system-architecture-lead`).
5. **Quality, Security & Independent Acceptance Lead** — создан: `agents/quality-security-independent-acceptance-lead.md` (name: `quality-security-acceptance-lead`). Независимый контроль; автор не принимает свою работу.
6. **Ecosystem, Community & Commercial Product Lead** — создан: `agents/ecosystem-community-commercial-product-lead.md` (name: `ecosystem-commercial-lead`).
7. **Research & Product Analytics Lead** — создан: `agents/research-product-analytics-lead.md` (name: `research-analytics-lead`).
8. **Delivery, Documentation & Codex Coordination Lead** — создан: `agents/delivery-documentation-codex-coordination-lead.md` (name: `delivery-codex-coordination-lead`).

### Команда Codex

1. Lead Software Architect & Development Orchestrator.
2. Pattern Engine, Import & Algorithms Engineer.
3. Mobile & Web Application Engineer.
4. Backend, Data & Synchronization Engineer.
5. Engineering Quality, DevOps & Security Agent.

## Действующие правила проекта

1. **Разделение контуров.** Claude Cowork — продукт, требования, приёмка. Codex — техническая реализация. Codex не меняет продуктовую логику самостоятельно; Cowork не принимает реализацию на доверии. Двойная независимая проверка каждого существенного решения.
2. **Адресация задач Codex.** В каждом Task Package для Codex обязательно указывается, какие агенты Codex выполняют задачу: поле «Агенты Codex» (исполнитель + проверяющий). При приёмке сверяется, что задачу выполнял заявленный контур.
3. **Всё фиксируется письменно.** Каждое решение, договорённость и правило сразу вносится в README/реестры/память проекта, чтобы новая сессия стартовала с полными знаниями.
4. **Пара Product + Domain/UX.** Продуктовые постановки Product Strategy & Requirements Lead проходят предметную и UX-проверку у Embroidery Domain & UX Lead до передачи в Codex.
5. **Статусы информации.** [CONFIRMED] / [DERIVED] / [RESEARCH FINDING] / [HYPOTHESIS] / [ASSUMPTION] / [OPEN] / [CONFLICT] / [DEFERRED] / [REJECTED]. Гипотезы не превращаются в подтверждённые факты без решения.
6. **Приоритет источников.** 1) последнее прямое решение владельца проекта; 2) Decision Log; 3) Master Product Specification; 4) PRD модуля; 5) подтверждённые исследования; 6) исходные черновики; 7) выводы агентов.

## Как новая сессия подключает агентов

1. Прочитать память проекта (MEMORY.md и файлы реестров).
2. Прочитать этот README из подключённой папки.
3. При необходимости запуска специализированного агента использовать его
repository source из `product/agents/definitions/` и механизм запуска,
поддерживаемый текущим Claude Cowork environment. Не считать имя из frontmatter
доказательством активации роли без проверки product agent registry.

## Текущий статус (2026-07-20)

- Команда агентов Cowork УКОМПЛЕКТОВАНА: 7 специализированных агентов + Chief Project Orchestrator.
- Проанализирована Master Product Specification; силами агентов создан фундаментальный пакет: Vision, глобальный Roadmap (web-first→mobile→экосистема), архитектура + рекомендованный стек (8 ADR Proposed), deep research мировых стандартов, Codex Context Pack, Decision Log (C-01…C-10), структура документации, первый Task Package (тонкий вертикальный срез Phase 0). Всё разложено по папкам 00…07.
- Утверждённые владельцем решения (2026-07-20): web-first; первый веб-срез = тонкий вертикальный (canonical format + импорт одного простого формата + viewer + отметка стежка + автосохранение); рекомендованный стек — с обязательным Codex Technical Review; порядок web→mobile→экосистема. Принципы: мировой уровень, невероятная масштабируемость, современные стандарты, тотальное комментирование кода.
- ОЖИДАЕТ РЕШЕНИЯ ВЛАДЕЛЬЦА (см. 00_GOVERNANCE/05_Decision_Log.md): утверждение Vision/Roadmap/Architecture; выбор критерия первого формата импорта; открытые вопросы deep research (масштаб «весь мир»/data localization; несовершеннолетние в Education; стек команды JS vs Kotlin).
- Следующий шаг после утверждения: передача 07_TaskPackage_EP01_ThinSlice.md в Codex (сначала его Technical Review), параллельно — Master Test Strategy (Quality Lead), Domain Glossary/User Flows (Domain/UX Lead), Event Taxonomy (Research Lead).
