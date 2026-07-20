# Deep Research — мировые стандарты и валидация (Abris Universe)

**Роль:** Research & Product Analytics Lead, Abris Universe
**Дата:** 2026-07-20
**Статус документа:** Research Report (не product decision, не архитектурное утверждение)

---

## 0. Паспорт исследования

1. **Research ID:** DR-2026-07-GLOBAL-STANDARDS-01
2. **Исследовательский вопрос:** Строим ли мы web-часть Abris Universe (тонкий вертикальный срез viewer+tracker до 500 000 стежков) в соответствии с современными (2025–2026) мировыми технологическими и регуляторными стандартами, и что нужно знать для «невероятной масштабируемости с самого начала»?
3. **Решение, которое зависит от ответа:** Выбор технологического стека рендеринга, модели offline-sync, структуры монорепозитория web/mobile, i18n/privacy-архитектуры до начала кодирования EP-01/EP-04/EP-05/EP-15.
4. **Что уже известно:** Спецификация (Master Product Spec v1.0) фиксирует архитектурные принципы (§11.1–11.2): тайловый/чанковый viewer, идемпотентные progress-события, merge-не-перезапись, единый доменный контракт web/mobile.
5. **Что неизвестно:** Конкретный технологический выбор не утверждён владельцем; отсутствует независимая проверка того, что заявленные принципы соответствуют реальной индустриальной практике 2025–2026, а не устаревшим или маркетинговым представлениям.
6. **Целевая аудитория вывода:** System Architecture Lead, Product Strategy Lead, Codex.
7. **География:** Глобальный продукт (Украина/ЕС/США как ядро, дальше — весь мир).
8. **Период актуальности:** 2025–2026, с пометками, где регуляторные изменения ещё не финализированы.
9. **Методы:** Desk research + Technical research через реальный веб-поиск (WebSearch/WebFetch), включая официальную документацию (MDN, Kotlin, PixiJS, Figma Engineering, Shopify Engineering, caniuse), нишевые технические блоги и авторитетные privacy-организации (FPF, IAPP).
10. **Источники:** см. Sources в каждом Finding.
11. **Ограничения:** WebSearch/WebFetch дают срез общедоступных источников на момент запроса; часть материалов — вторичные блоги, а не первичные бенчмарки; количественные проценты производительности почти всегда контекстно-зависимы и не воспроизведены нами напрямую.
12. **Критерий достаточности:** Для каждой из 5 тем — минимум 2–3 независимых источника разного типа (официальная документация/инженерный блог + независимый анализ), явное разделение FACT/HYPOTHESIS/INTERPRETATION.
13. **Срок:** Однократный отчёт, не заменяет continuous competitor monitoring.
14. **Ожидаемый результат:** Доказательная база для Architecture Lead и Product Lead, не заменяющая их решения.

---

## Тема 1. Высокопроизводительный рендеринг больших сеток (100k–500k+ стежков)

### Finding R1-01
**Тема:** Canvas2D vs WebGL vs WebGPU — состояние поддержки браузеров в 2026
**Finding:** WebGPU не является универсально доступной технологией даже в middle of 2026: глобальная поддержка ≈83.6%, но Firefox по умолчанию держит её выключенной на всех версиях, а десктопный Safari до версии 26 не поддерживает её вовсе (частичная поддержка только с 26.0+); мобильный Safari/iOS с 26+ поддерживает полностью. Следовательно, «чистый WebGPU-only» рендерер не может быть единственным путём для глобального продукта в 2026 году — нужен fallback.
**Evidence:** Данные caniuse.com по браузерам/версиям (Chrome/Edge/Opera/Samsung Internet — full support; Firefox 63–155 — disabled by default; Safari 15–17.3 — no support, 17.4–18.7 disabled, 26+ partial/full на iOS).
**Sources:** [caniuse.com/webgpu](https://caniuse.com/webgpu); [WebGPU is now supported in major browsers — web.dev](https://web.dev/blog/webgpu-supported-major-browsers)
**Source Quality:** High (caniuse — агрегатор данных браузерных движков, независим и регулярно обновляется).
**Confidence:** High.
**Affected Users:** Все web-пользователи viewer'а, особенно на Firefox и старых версиях Safari/macOS.
**Product Implication:** Архитектура рендерера должна с самого начала проектироваться с раздельным backend-слоем (rendering backend abstraction), а не жёстко на одном API.
**Risks of Misinterpretation:** Нельзя трактовать «83.6%» как «WebGPU готов для продакшна по умолчанию» — доля учитывает только техническую доступность API, а не стабильность и behaviour parity между вендорами GPU-драйверов.
**Conflicting Evidence:** Нет.
**Remaining Questions:** Какова реальная доля целевой аудитории Abris Universe (Украина/ЕС/США, много Android/iOS mid-range устройств) на браузерах без WebGPU — нужен собственный анализ user-agent после запуска.
**Recommendation:** Architecture Lead должен рассмотреть Canvas2D/WebGL2 как baseline и WebGPU как progressive enhancement, а не как единственный путь.

---

### Finding R1-02
**Тема:** Индустриальный precedent — как Figma (профессиональный canvas-инструмент масштаба «миллионы объектов») решает эту проблему
**Finding:** Figma в 2025 перешла на WebGPU, но реализовала **динамический runtime fallback**: сессия может начаться на WebGPU и на лету переключиться на WebGL при сбое адаптера/устройства — авторы прямо пишут, что асинхронный GPU-readback не позволяет заранее (pre-flight) протестировать совместимость без добавления сотен миллисеконд к времени загрузки. Также Figma отдельно инвестирует в virtualization слоёв (Layers Panel) и incremental frame loading для больших документов.
**Evidence:** Прямая цитата инженерного блога Figma (сентябрь 2025): "performance improvement... on some classes of devices, and more neutral results on others, but no regressions"; описан graceful handling device loss/adapter failure.
**Sources:** [Figma Rendering: Powered by WebGPU](https://www.figma.com/blog/figma-rendering-powered-by-webgpu/); [Improving Performance in the Layers Panel](https://www.figma.com/blog/improving-performance-in-the-layers-panel/); [Speeding Up File Load Times, One Page At A Time](https://www.figma.com/blog/speeding-up-file-load-times-one-page-at-a-time/); [Improving Performance with Incremental Frame Loading](https://www.figma.com/blog/incremental-frame-loading/)
**Source Quality:** High (первичный инженерный блог компании, реализовавшей и публично задокументировавшей архитектуру; но это не независимый бенчмарк, а самоотчёт вендора).
**Confidence:** High для факта существования такого паттерна; Medium для количественных performance-цифр (не приведены точные числа, только качественные оценки).
**Affected Users:** Пользователи любых high-density canvas-приложений, включая viewer Abris Universe на больших многоцветных схемах.
**Product Implication:** Паттерн "fallback rendering backend + постраничная/потайловая инкрементальная загрузка" — прямой аналог требования спецификации TR-VIEW-002 (continuous canvas) и NFR-001 (500k стежков без критических лагов).
**Risks of Misinterpretation:** Figma — не embroidery-домен и её объекты (векторные слои) отличаются от однородной сетки стежков; прямое 1:1 копирование архитектуры не гарантировано оптимальным, но принцип «слоистый fallback + инкрементальная подгрузка» переносим.
**Conflicting Evidence:** Нет.
**Remaining Questions:** Нужен собственный technical spike на реальных 100k/500k-стежковых fixture-схемах, а не экстраполяция с Figma.
**Recommendation:** Architecture Lead — рассмотреть как референс при проектировании EP-04 (High-performance Viewer), не как обязательный шаблон.

---

### Finding R1-03
**Тема:** Тайлинг/чанкинг и виртуализация — базовый best practice независимо от выбора API
**Finding:** Для очень больших наборов данных в вебе индустриальный консенсус — не рендерить весь объём как единый DOM/canvas-объект, а (а) виртуализировать (windowing) UI-списки и (б) для графических сцен — делить на тайлы/чанки и рендерить по viewport + буфер (LOD/preload), что подтверждается и в контексте списков (AG Grid, TanStack Virtual), и в контексте геопространственной визуализации миллионов точек (deck.gl TileLayer).
**Evidence:** Документация TanStack Virtual, AG Grid DOM Virtualisation, deck.gl TileLayer/Performance Optimization guide — все описывают паттерн "рендерь только видимое + запас".
**Sources:** [TanStack Virtual](https://tanstack.com/virtual/latest); [AG Grid — JavaScript Grid: DOM Virtualisation](https://www.ag-grid.com/javascript-data-grid/dom-virtualisation/); [deck.gl TileLayer](https://deck.gl/docs/api-reference/geo-layers/tile-layer); [deck.gl Performance Optimization](https://deck.gl/docs/developer-guide/performance)
**Source Quality:** High (официальная документация зрелых open-source библиотек с широким production-использованием).
**Confidence:** High.
**Product Implication:** Прямо подтверждает уже сформулированный в спецификации архитектурный принцип §11.1 ("Viewer должен работать на тайлах/чанках и не рендерить 500 000 стежков как один DOM/Canvas объект") — это не гипотеза, а признанная индустриальная практика.
**Risks of Misinterpretation:** DOM-виртуализация (windowing) как в AG Grid/TanStack — это паттерн для списков/таблиц, не прямая замена GPU-рендерингу растровой сетки; для сетки стежков корректнее тайловый canvas/WebGL-рендеринг с текстурным атласом символов, а не тысячи DOM-узлов на клетку.
**Remaining Questions:** Оптимальный размер тайла для стежковой сетки (типично блоки 10×10/20×20 упоминаются в спецификации для parking/complexity — могут совпасть с рендер-тайлами) не проверен эмпирически.
**Recommendation:** Считать тайловый/чанковый рендеринг обязательным техническим требованием для EP-04; конкретные размеры тайлов — предмет technical spike Codex/Architecture Lead.

---

### Finding R1-04
**Тема:** Практические ограничения WebGL/мобильных браузеров, релевантные текстурному атласу символов и палитр
**Finding:** MDN (обновлено 3 ноября 2025) формулирует конкретные технические границы: гарантированный минимум `MAX_TEXTURE_SIZE = 4096` (нельзя полагаться на десктопные 16k на мобильных устройствах), рекомендуется батчинг draw calls, текстурные атласы, mipmaps, компрессированные текстуры (разные форматы для Android/iOS), и явно указано, что нужно тестировать реальные ограничения устройства в рантайме.
**Evidence:** Прямые технические рекомендации и таблица гарантированных лимитов в MDN WebGL best practices.
**Sources:** [MDN — WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
**Source Quality:** High (официальная кроссвендорная документация Mozilla).
**Confidence:** High.
**Product Implication:** Легенда/палитра/символы как texture atlas должны быть спроектированы с учётом 4096px как безопасного базового лимита, а не десктопных значений.
**Remaining Questions:** Конкретный performance budget (FPS/mark-latency) для целевого класса устройств должен быть определён отдельно (NFR-002) и протестирован на low-end Android.
**Recommendation:** Включить в Acceptance Criteria тестового эталона "стресс-схема 500k" явную проверку на entry-level Android/старом Safari.

---

### Finding R1-05
**Тема:** Возможность единого рендер-движка для web и будущего mobile (существенно для NFR-003)
**Finding:** React Native Skia (Shopify) официально поддерживает Web через CanvasKit (WASM-сборка Skia, ~2.9MB gzip), и **тот же код отрисовки** может выполняться и в нативном мобильном приложении, и в браузере. Ограничения: 4 неподдерживаемых Skia API на web-слое и жёсткий лимит браузеров в 16 WebGL-контекстов на страницу.
**Evidence:** Официальная документация проекта (Shopify) с явным описанием web-поддержки, ограничений и решений.
**Sources:** [React Native Skia — Web Support](https://shopify.github.io/react-native-skia/docs/getting-started/web/); [Shopify Engineering — Getting Started with React Native Skia](https://shopify.engineering/getting-started-with-react-native-skia)
**Source Quality:** High (первичная документация мейнтейнера библиотеки).
**Confidence:** Medium-High (возможность подтверждена; независимых бенчмарков на схемах 500k именно в embroidery-контексте НЕ найдено — это НЕ проверено на нашем домене).
**Product Implication:** Конкретный проверяемый технический кандидат для shared rendering между web и будущим mobile — но именно кандидат, не решение.
**Remaining Questions:** Нужен отдельный technical spike: рендеринг 500k символов через RN-Skia/CanvasKit vs WebGL2/PixiJS vs Canvas2D-тайлинг на реальных fixture-схемах.
**Recommendation:** Включить RN Skia/CanvasKit в список кандидатов для technical spike EP-04.

---

## Тема 2. Local-first / offline-first синхронизация прогресса

### Finding R2-01
**Тема:** Зрелость CRDT vs event-log/database-replication решений в 2025–2026
**Finding:** По состоянию на начало-середину 2026 нет единого "победившего" решения: **Yjs** — "самая зрелая CRDT-библиотека" (для текстового/collaborative редактирования), **Automerge** — "солидная альтернатива" (Rust-based); из sync-движков **PowerSync** — "production-ready", **ElectricSQL/Zero** — "ещё созревают". Индустрия сама фиксирует незавершённость консолидации (Local-First Conf 2025).
**Evidence:** Разбор в Smashing Magazine (май 2026) и отчёт PowerSync с Local-First Conf 2025.
**Sources:** [Smashing Magazine — The Architecture Of Local-First Web Development](https://www.smashingmagazine.com/2026/05/architecture-local-first-web-development/); [PowerSync — Local-First Conf 2025 Reflections](https://powersync.com/blog/local-first-conf-2025-reflections); [Local-First Conf 2026](https://www.localfirstconf.com/)
**Source Quality:** Medium-High (Smashing — авторитетное издание, но мнение одного автора; PowerSync — вендор, потенциальный конфликт интересов).
**Confidence:** Medium по зрелости конкретных продуктов; High по факту "поле ещё не консолидировано".
**Product Implication:** Нельзя закладывать один "модный" CRDT-фреймворк как безусловно готовый — нужен technical spike с учётом уже используемого стека (в среде проекта видна интеграция с Supabase/Postgres — PowerSync/ElectricSQL проектируются под Postgres-replication).
**Recommendation:** Провести technical spike сравнения 2–3 решений на реальной модели ProgressEvent.

---

### Finding R2-02
**Тема:** CRDT vs event-log для конкретно idempotent mark/unmark прогресса
**Finding:** Практики предупреждают, что CRDT-merge структурированных данных может давать неожиданные результаты; для типового приложения рекомендуется **field-level last-write-wins** (LWW) с серверной валидацией семантических конфликтов постфактум (принимать запись, но помечать конфликт, а не отклонять).
**Evidence:** Цитаты Smashing Magazine (май 2026).
**Sources:** [Smashing Magazine — The Architecture Of Local-First Web Development](https://www.smashingmagazine.com/2026/05/architecture-local-first-web-development/)
**Source Quality:** Medium (мнение одного практикующего автора, но конкретное и проверяемое рассуждение).
**Confidence:** Medium.
**Product Implication:** Модель ProgressEvent из спецификации (§11) совместима: mark/unmark стежка — boolean-состояние на координату, для которого достаточно idempotent append-only event log с "последним по timestamp побеждает" на уровне конкретного стежка (проще полноценного document-CRDT).
**Conflicting Evidence:** CRDT-библиотеки с Set-семантикой (OR-Set/2P-Set) для «множества помеченных элементов» работают предсказуемо — уточняет вывод: для mark/unmark нужен narrow-scope CRDT (Set), а не general-purpose document CRDT.
**Recommendation:** Использовать как evidence при проработке EP-05 и EP-15, не как готовое решение.

---

### Finding R2-03
**Тема:** Разделение критичных данных прогресса и тяжёлых asset'ов (фото)
**Finding:** Индустриальная практика согласуется со спецификацией §11.2 — синхронизировать компактные критичные события быстро/надёжно, а тяжёлые blob-ассеты — отдельным, менее приоритетным каналом.
**Sources:** [PowerSync — Offline-First Apps Made Simple: Supabase + PowerSync](https://powersync.com/blog/offline-first-apps-made-simple-supabase-powersync)
**Source Quality:** Medium (вендорский блог, распространённый паттерн).
**Confidence:** Medium.
**Recommendation:** Нет дополнительных действий сверх зафиксированного в спецификации.

---

## Тема 3. Монорепо и разделяемый доменный слой web+mobile

### Finding R3-01
**Тема:** TypeScript-монорепо (React + React Native/Expo) как зрелый паттерн 2025–2026
**Finding:** Устоявшаяся практика: монорепо на pnpm workspaces + Turborepo/Nx, где Next.js/React (web) и Expo/React Native (mobile) шарят пакеты домена, с открытыми reference-примерами.
**Sources:** [GitHub — byCedric/expo-monorepo-example](https://github.com/byCedric/expo-monorepo-example); [React Native Monorepo Guide (2026)](https://reactnativerelay.com/article/react-native-monorepo-turborepo-expo-2026); [JavaScript Monorepos — Growin](https://www.growin.com/blog/javascript-monorepos-frontend/)
**Source Quality:** Medium (инженерные гайды, множественная независимая конвергенция).
**Confidence:** Medium-High.
**Product Implication:** Совместимо с решением владельца ("сначала веб, потом отдельное мобильное") — можно начать только с web-пакетов, mobile добавить позже без переписывания домена, если он изолирован от UI-фреймворка.
**Recommendation:** TS-монорепо — reasonable default для доменного слоя, при подтверждении Architecture Lead с учётом состава команды.

---

### Finding R3-02
**Тема:** Kotlin Multiplatform (KMP) как альтернатива — состояние на 2026
**Finding:** JetBrains (вендор, апрель 2026) заявляет 40–60% сокращения кода и до 90% переиспользования логики (кейсы Bitkey/Block, Blackstone, Forbes, Duolingo). Официально: Compose Multiplatform stable для iOS/Android/desktop, но **Beta** для web.
**Sources:** [JetBrains Blog — Helping Decision-Makers Say Yes to KMP (апрель 2026)](https://blog.jetbrains.com/kotlin/2026/04/helping-decision-makers-say-yes-to-kmp/); [kotlinlang.org — KMP vs React Native](https://kotlinlang.org/docs/multiplatform/kotlin-multiplatform-react-native.html)
**Source Quality:** Mixed — официальная документация (высокая), но проценты — вендорский маркетинг, не независимо аудированы.
**Confidence:** Medium (факт продакшн-использования крупными компаниями — High; конкретные проценты — Low-Medium).
**Product Implication:** KMP — реальная альтернатива, но Compose Web в Beta создаёт риск для «веб как первый тонкий срез». Требует Kotlin-экспертизы.
**Recommendation:** Не отбрасывать KMP для будущей mobile-фазы, но учитывать Beta-статус Compose Web как аргумент против KMP как пути к web-первому срезу сейчас.

---

### Finding R3-03
**Тема:** Общий вывод по выбору стека для "веб сначала, mobile отдельно"
**Finding [INTERPRETATION]:** Учитывая решение владельца и документированную поддержку react-native-web/Expo и RN Skia пути "написать один раз — запустить на web и native", TypeScript-монорепо с общим доменным пакетом выглядит более совместимым с поэтапным планом, чем KMP (эффективнее при синхронной мультиплатформенной разработке) или Flutter.
**Confidence:** Medium (интерпретация, не факт).
**Product Implication:** Это НЕ архитектурное решение — представить Architecture Lead как один из обоснованных вариантов.
**Conflicting Evidence:** KMP-кейсы показывают успешность противоположного пути у крупных компаний.
**Recommendation:** Вынести как один из вариантов в decision log Architecture Lead.

---

## Тема 4. Интернационализация, глобальный масштаб, приватность

### Finding R4-01
**Тема:** ICU MessageFormat как стандарт i18n/l10n
**Finding:** ICU MessageFormat остаётся де-факто стандартом для плюрализации, форматирования дат/чисел, gender/select-логики (i18next, FormatJS/react-intl, Lokalise, Crowdin, Phrase).
**Sources:** [Lokalise — Guide to ICU message format](https://lokalise.com/blog/complete-guide-to-icu-message-format/); [Crowdin — ICU Message Format Guide (2026)](https://crowdin.com/blog/icu-guide); [Phrase — Guide to ICU Message Format](https://phrase.com/blog/posts/guide-to-the-icu-message-format/)
**Source Quality:** Medium-High (конвергенция нескольких независимых TMS-поставщиков).
**Confidence:** High.
**Product Implication:** Закладывать ICU-совместимый i18n-слой с самого начала (даже в MVP с 3 языками) дешевле, чем мигрировать позже — украинский/польский имеют нетривиальные plural rules (NFR-007).
**Recommendation:** Заложить ICU-совместимую i18n-библиотеку в EP-01 как cross-cutting non-functional требование.

---

### Finding R4-02
**Тема:** GDPR не статичен — EU Digital Omnibus меняет правила (2025–2026)
**Finding [FACT]:** 19 ноября 2025 Еврокомиссия анонсировала "Digital Omnibus" — предложение об изменении GDPR, ePrivacy, Data Act, NIS2, AI Act. Ключевые изменения затрагивают само определение "персональных данных". По состоянию на январь 2026 не финализировано.
**Sources:** [FPF — 2026: A Year at the Crossroads for Global Data Protection](https://fpf.org/blog/2026-a-year-at-the-crossroads-for-global-data-protection-and-privacy/); [IAPP — EU Digital Omnibus: Analysis of key changes](https://iapp.org/news/a/eu-digital-omnibus-analysis-of-key-changes)
**Source Quality:** High (FPF — независимая privacy-организация; IAPP — профессиональная ассоциация).
**Confidence:** High по факту процесса реформы; Low по конечному содержанию закона.
**Product Implication:** Privacy-архитектуру нельзя жёстко "зашивать" под нынешний текст GDPR — нужен слой конфигурируемости/версионирования privacy-политик.
**Recommendation:** Quality/Security Lead — включить отслеживание EU Digital Omnibus в continuous compliance monitoring.

---

### Finding R4-03
**Тема:** Регулирование приватности несовершеннолетних — расширяется
**Finding [FACT]:** По FPF (январь 2026) стандарты age-appropriate design расширяются, пороги вплоть до 18 лет в некоторых юрисдикциях. Релевантно для Education & DIY Schools и Community Layer с UGC.
**Sources:** [FPF — 2026: A Year at the Crossroads](https://fpf.org/blog/2026-a-year-at-the-crossroads-for-global-data-protection-and-privacy/); [Mayer Brown — Little Users, Big Rules](https://www.mayerbrown.com/en/insights/publications/2026/01/little-users-big-rules-tracking-childrens-privacy-legislation); [WSGR — 2026 Global Minors' Privacy](https://www.wsgrdataadvisor.com/2026/01/2026-year-in-preview-global-minors-privacy-and-online-safety-predictions/)
**Source Quality:** High.
**Confidence:** Medium-High.
**Product Implication:** Если Education (EP-22) вовлекает несовершеннолетних — нужен отдельный privacy-by-design review (age assurance, parental consent) заблаговременно.
**Recommendation:** Поднять как открытый вопрос для владельца.

---

### Finding R4-04
**Тема:** Цифровой суверенитет / локализация данных
**Finding [FACT/HYPOTHESIS]:** FPF отмечает усиление data localization и региональных соглашений о трансграничной передаче — [FACT] как тренд; влияние на embroidery-платформу — [HYPOTHESIS].
**Sources:** [FPF — 2026: A Year at the Crossroads](https://fpf.org/blog/2026-a-year-at-the-crossroads-for-global-data-protection-and-privacy/)
**Source Quality:** High.
**Confidence:** Medium.
**Product Implication:** Если "весь мир" включает юрисдикции с жёсткой локализацией — нужна multi-region архитектура с региональной изоляцией. Для MVP (UA/EU/US) не актуально.
**Recommendation:** Открытый вопрос для владельца; не проектировать multi-region data residency как P0 без подтверждения.

---

## Тема 5. Валидация конкурентных утверждений спецификации

### Finding R5-01
**Тема:** Pattern Keeper — Android-only и PDF-фокус
**Finding:** [FACT] Доступен только на Android; независимый источник цитирует "Pattern Keeper isn't available for iOS devices". Фокус — PDF-схемы, one-off ~$9, 100K+ установок. Backstitch и fractional stitches не поддерживаются нативно.
**Sources:** [Pattern Keeper — Google Play](https://play.google.com/store/apps/details?id=app.patternkeeper.android&hl=en_US); [Notorious Needle — Pattern Keeper Alternative for iOS](https://notoriousneedle.com/pattern-keeper-alternative-ios-devices/)
**Source Quality:** Mixed (Google Play — High для платформы/цены; community-блог — Medium с прямыми цитатами).
**Confidence:** High.
**Product Implication:** Спецификация (Раздел 17) **точно** отражает реальность — подтверждённый [FACT].
**Risks of Misinterpretation:** Не считать "100K+ установок" активной аудиторией (установки ≠ MAU).
**Remaining Questions:** Свежесть статуса "нет iOS" не проверена на дату — нужна точечная перепроверка (< 3 мес) перед публикацией.

---

### Finding R5-02
**Тема:** Markup R-XP — универсальность импорта и подписка
**Finding:** [FACT] Кроссплатформенный (iOS+Android), поддерживает PDF/изображения/камеру, монетизация — подписка (2-недельный trial, годовая).
**Sources:** [Markup R-XP — Home](https://markuprxp.co.uk/home/); [App Store](https://apps.apple.com/us/app/markup-r-xp/id1559524491); [Google Play](https://play.google.com/store/apps/details?id=uk.co.kewinlawsonsmith.markup&hl=en_US)
**Source Quality:** Medium (маркетинговый сайт + подтверждение платформ через сторы).
**Confidence:** High по платформам и модели; Medium по качеству функций.
**Product Implication:** Подтверждает формулировку спецификации; "перегруженность"/"learning curve" остаются [USER REPORT], не проверены напрямую.

---

### Finding R5-03
**Тема:** Cross Stitch Saga — платформы и форматы
**Finding:** [FACT] Доступен на iOS ($14.99 единоразово, 4.4★/54 оценки, v5.2.2 июнь 2025) и Android. Поддерживает XSD, XSP, PAT, OXS, DIZE, CSS, собственный SAGA — соответствует и превышает список P0-форматов спецификации (§5.1).
**Sources:** [Cross Stitch Saga — App Store](https://apps.apple.com/us/app/cross-stitch-saga/id1440279996); [AppBrain (Android)](https://www.appbrain.com/app/cross-stitch-saga/today.ipublish.crossstitchsaga)
**Source Quality:** High для iOS; Medium для Android (агрегаторы).
**Confidence:** High по кроссплатформенности и форматам; Low по "зрелости UX" (54 оценки — крайне мелкая выборка).
**Product Implication:** Список форматов CSS — полезный ориентир для fixture-набора technical spike EP-02.
**Risks of Misinterpretation:** Малая выборка (54) не позволяет судить о доле рынка.

---

## Рекомендации для Architecture Lead и Product Lead

*(research-based рекомендации, не утверждённые требования — финальное решение за лидами и владельцем.)*

1. **Рендеринг (EP-04).** Абстракция rendering backend (Canvas2D/WebGL2 baseline + WebGPU progressive enhancement), не завязка на один API. Обязателен тайловый рендеринг с текстурным атласом символов, учёт `MAX_TEXTURE_SIZE=4096` на мобильных.
2. **Технический spike рендеринга.** Сравнительный бенчмарк 2–3 кандидатов (WebGL2/PixiJS vs RN Skia/CanvasKit) на реальных fixture 100k/500k, включая entry-level Android.
3. **Sync/offline-first (EP-15).** Не выбирать CRDT "по умолчанию" — для mark/unmark рассмотреть append-only event log + field/stitch-level LWW, а не document-CRDT.
4. **Монорепо.** TypeScript-монорепо (React + Expo/RN) — обоснованный кандидат; KMP — состоятельная альтернатива, но Compose Web в Beta — риск для web-first.
5. **i18n.** ICU MessageFormat-совместимая библиотека с самого начала.
6. **Privacy/compliance.** Версионируемый privacy/consent-слой; continuous regulatory monitoring за Quality/Security Lead (EU Digital Omnibus).
7. **Конкурентный анализ.** Заявления о Pattern Keeper подтверждены; точечная переперепроверка перед публикацией.

---

## Открытые вопросы для владельца

1. **Масштаб "весь мир".** Включает ли стратегия юрисдикции с жёсткой data localization (Китай, Россия), или "мировой масштаб" = глобальная western/EU-aligned аудитория? (Finding R4-04)
2. **Несовершеннолетние в Education.** Планируется ли вовлекать несовершеннолетних учеников на горизонте, требующем privacy-by-design заранее? (Finding R4-03)
3. **Технологический стек команды.** JS/TS (в пользу React Native/Expo) или готовность инвестировать в Kotlin/Swift (KMP)? Организационно-ресурсный вопрос.
4. **Приоритет regulatory monitoring.** Кто ведёт continuous-мониторинг EU Digital Omnibus на 2026–2027.

---

**Ограничение отчёта:** Доказательная база для решений Architecture Lead и Product Lead. Не утверждает MVP, roadmap или архитектуру; не заменяет technical spike на реальных fixture-схемах.
