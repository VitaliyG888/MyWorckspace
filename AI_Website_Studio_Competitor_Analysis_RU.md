# AI Website Studio — анализ конкурентов и архитектурные рекомендации

**Дата подготовки:** 1 ноября 2026 года  
**Задача:** определить, какие продуктовые возможности следует объединить и какие инженерные решения использовать при разработке независимой AI-платформы сайтов через OpenCode.

## 1. Ограничения исследования

Framer, Webflow, Lovable, v0, Relume, Wix Studio, Durable, Dora, Reweb, Playcode, OnSpace и Dottle — коммерческие продукты. Их полный production source code не является общедоступным. Поэтому нельзя достоверно утверждать, что исследован внутренний исходный код этих закрытых платформ.

Исследование опирается на:
- официальные продуктовые страницы и документацию;
- публичные GitHub-репозитории и опубликованные README/архитектурные сведения;
- доступные описания API и редакторских возможностей;
- функциональные и проблемные наблюдения из исходного списка пользователя.

Публичные репозитории Puck, OpenPage, ChaiBuilder и GrapesJS позволяют изучить технические подходы к редакторам и структуре сайта, но это не исходный код коммерческих конкурентов.

Оценки G2/Product Hunt и числа отзывов из исходного описания пользователя не перепроверялись как независимая статистика и в этом документе не трактуются как текущие рейтинги.

## 2. Сравнение продуктовых возможностей

| Продукт | Сильная идея для заимствования | Что необходимо учесть при проектировании своей платформы |
|---|---|---|
| Framer AI | AI-агент может создавать и менять страницы, секции, тексты и визуальные материалы непосредственно в проекте; редактор сохраняет ручной контроль над canvas, типографикой, breakpoint и effects. Есть работа с CMS, code components, аудит сайта и аналитические рекомендации. | Не ограничиваться генерацией текста; нужен canvas, точечные AI-правки и единая дизайн-система. Не копировать proprietary UI/код. |
| Webflow AI | Сначала формируются структура сайта, страницы и секции; затем генерируются тема и дизайн. Секции можно добавлять, удалять, менять местами и заменять. AI расширяет работу с copy, CMS, SEO/AEO и accessibility. | Планирование сайта должно предшествовать оформлению каждой страницы. Нужны повторно используемые секции и site-wide design tokens. |
| Lovable | Разработка по диалогу, интеграции и возможность держать код в собственном Git-репозитории с двусторонней синхронизацией. | Сохранность кода, версионирование, внешняя IDE и возможность самостоятельного деплоя — важная часть продукта, а не необязательная функция. |
| v0 | Живой preview, визуальный выбор элемента, точные визуальные правки, применение изменений к исходному коду как новой версии; browser/terminal/test agent. | Нужны выделение блока, pending edits, diff/rollback и тестирование результата в работающем runtime. |
| Relume | Site map → wireframes на базе компонентов → style guide → экспорт в Figma/Webflow/React. | Не начинать с генерации красивой страницы без согласованной информационной архитектуры. |
| Bolt / bolt.diy ecosystem | Локальная среда разработки, streaming изменений, runtime preview, выбор разных провайдеров, Git, terminal и тестовые инструменты. | Использовать независимый LLM Gateway, live preview и управление версиями; не блокировать пользователя на одном поставщике. Публичные forks не являются исходным кодом закрытого Bolt.new. |
| Wix Studio | Визуальная разработка, responsive design, CMS, API/custom code и AI sitemap/wireframe инструменты. | Предусмотреть клиентские проекты, роли и управление несколькими сайтами/рабочими пространствами. |
| Durable | Бизнес-ориентированный подход: сайт + CRM + лиды + бронирование + SEO/GEO + AI image studio. | Конструктор должен приводить к заявкам/продажам, а не заканчивать работу после публикации страницы. |
| Dora AI | В исходном исследовании пользователя отмечены 3D и визуальные эффекты. | Вынести сложные эффекты в отдельную motion-систему с performance/accessibility ограничениям. Не делать эффекты обязательными для каждого сайта. |
| Reweb | Визуальное создание секций и перенос собственного React/Tailwind-кода в проект. | Экспортировать реальный исходный код, а не только закрытый preview или ссылку на платформу. |
| Playcode | AI-агент планирует, пишет код, проверяет работу тестами и браузерными инструментами, затем публикует; проект продолжается после релиза. | QA должен быть частью генерации, а не ручной проверкой в конце. |
| OnSpace | AI app builder с управляемыми database/auth/edge functions/secrets/logs и экспортом кода через GitHub/download. | В продукте нужны рабочие backend интеграции, секреты и переносимость исходного проекта. |
| Dottle AI | В исходном исследовании пользователя отмечены итерационная генерация и экспорт HTML/CSS/React/Vue. | Перед выбором конкретных UX-паттернов требуется дополнительная проверка актуальных официальных материалов и доступного API. |

### Основные подтверждения по официальной документации

- Framer описывает AI-агента, который создаёт/обновляет страницы, секции, copy и visuals в проекте; AI работает с canvas и CMS, может создавать code components и проверять сайт на проблемы. https://www.framer.com/ai/  
- Webflow описывает генерацию структуры, страниц, секций и темы; далее секции можно reorder, delete, duplicate, change или add. https://help.webflow.com/hc/en-us/articles/38840145286035-Build-a-site-with-Webflow-s-AI-site-builder  
- Webflow AI включает generation of sections, copy, CMS items, SEO/AEO и accessibility audits. https://help.webflow.com/hc/en-us/articles/34297897805715-Webflow-AI-overview  
- Relume описывает последовательность sitemap, wireframes и style guide, а также экспорт в Figma, Webflow и React. https://www.relume.ai/export  
- v0 Design Mode позволяет выбирать элементы preview, менять свойства и применять правки в исходный код с созданием новой версии. https://v0.app/docs/design-mode  
- v0 Agentic Features включают browser use, тестирование, terminal и marketplace/MCP integrations. https://v0.app/docs/agentic-features  
- Lovable Git sync поддерживает двустороннюю синхронизацию кода с собственными GitHub/GitLab/Bitbucket репозиториями. https://docs.lovable.dev/integrations/git-sync-overview  
- Playcode описывает цикл plan/build/test/browser preview/publish. https://playcode.io/docs/start/what-is-playcode  
- Durable позиционирует продукт как AI business builder с CRM, SEO/GEO, bookings и image studio. https://durable.com/  
- Reweb заявляет canvas/chat editing и копирование React/Tailwind кода в свой проект. https://reweb.so/  
- OnSpace описывает managed database/auth/edge functions/secrets/logs и code export через GitHub/download. https://www.onspace.ai/  
- Wix Studio описывает AI visual sitemap/wireframe, responsive design, custom code/API и CMS. https://www.wix.com/studio  

## 3. Что показывают открытые исходники

### 3.1. Puck — визуальный редактор React

Репозиторий: https://github.com/puckeditor/puck  
Лицензия, указанная в репозитории: MIT.

Полезные идеи:
- редактор можно встроить в своё React-приложение;
- блоки регистрируются через конфигурацию компонентов;
- поля компонента задают допустимый формат редактирования;
- данные страницы сохраняются приложением;
- render-компонент позволяет вывести документ отдельно от редактора;
- нет обязательной привязки к хостингу Puck.

Рекомендация: рассмотреть Puck как основу canvas/editor UX, сохранив собственную схему `SiteDocument`, собственное хранилище, генератор и export layer. Перед фиксацией версии проверить актуальную документацию, совместимость React/Next.js и лицензию конкретной версии.

### 3.2. OpenPage — JSON-first AI website builder

Репозиторий: https://github.com/buildingopen/openpage  
В README проект описан как open-source MIT, React/TypeScript/Tailwind builder.

Полезные идеи:
- сайт является структурированным JSON-документом;
- AI endpoint генерирует `SiteConfig`, а редактор меняет тот же документ;
- визуальные правки и AI-изменения используют общий источник правды;
- набор типизированных блоков и layout variants;
- версии и diffs легче контролировать, чем произвольную генерацию большого исходного файла.

Ограничения для заимствования:
- опубликованный пример ориентирован на относительно простой сайт с блоками;
- прежде чем использовать как основу коммерческой SaaS-платформы, нужно отдельно оценить production readiness, security, тесты, многопользовательскую архитектуру, CMS, publishing и масштабирование.

Рекомендация: использовать JSON-first как архитектурный принцип, а не обязательно форкать весь проект.

### 3.3. ChaiBuilder Core — типизированный React block registry

Репозиторий: https://github.com/chaibuilder/core  
Документация/сайт: https://chaibuilder.com/docs

Публичное описание указывает на:
- block-based editor;
- typed props schema для custom React blocks;
- AI-editable props;
- server-side rendering;
- data providers;
- database adapters;
- расширяемые панели, слоты и плагины.

Рекомендация: изучить их идею реестра блоков и разделения editor/client и render/server модулей. Не включать код ChaiBuilder в продукт до отдельной проверки точных условий лицензирования и коммерческого использования.

### 3.4. GrapesJS — альтернативный visual builder framework

Репозиторий: https://github.com/GrapesJS/grapesjs

Публичный README описывает blocks, style manager, layer manager, code viewer, asset manager и local/remote storage.

Рекомендация: рассматривать как альтернативу, если нужен редактор произвольных HTML/CSS-шаблонов. Для React-first production sites с типизированными блоками, React components и серверным рендерингом Puck выглядит более прямым кандидатом.

## 4. Рекомендуемая архитектура собственного продукта

### 4.1. Основной принцип

**Не генерировать весь сайт как произвольный код одним большим ответом модели.**

Использовать гибридную модель:
- структурированный JSON как source of truth;
- реестр типизированных блоков;
- React renderer;
- визуальный редактор;
- генерация через узкие AI-задачи;
- отдельный кодовый sandbox для действительно необходимых custom code components.

### 4.2. Поток генерации

1. Interview Agent → `SiteBrief`.
2. Strategy Agent → аудитория, value proposition, conversion goals и content strategy.
3. Site Architect → sitemap/pages.
4. Visual Director → brand kit/design tokens.
5. Page Planner → список секций каждой страницы.
6. Content Agent → тексты и структурированные content props.
7. Block Builder → генерация блока с JSON Schema.
8. Validator → проверка схемы, обязательных полей, смысла контента и интерактивности.
9. Renderer → обновление preview после каждого блока.
10. Motion Agent → отдельный `MotionConfig`, без изменения контента/структуры.
11. SEO Agent → metadata, links, schema, audit.
12. Integration Agent → формы, CRM, analytics.
13. QA Agent → браузерные тесты, responsive, accessibility, build.
14. Publisher → экспорт и deployment.

### 4.3. Ключевые объекты

`SiteBrief` — цели, аудитория, факты, предположения, бренд, предложения, страницы, SEO и интеграции.

`SiteDocument` — метаданные проекта, локаль, theme/design tokens, assets, pages.

`PageDocument` — page metadata, SEO, блоки и порядок секций.

`SectionDocument` — `id`, `type`, `variant`, `props`, `responsive`, `motion`, `status`, `generationMetadata`.

`GenerationRun` — выбранные агенты/модели, steps, progress, usage, errors, prompt versions.

`LLMProvider` / `LLMModel` — protocol, baseURL, secret reference, capabilities, rate limits, context/output limits, costs, health status.

### 4.4. LLM Gateway

Нужен независимый слой, который:
- нормализует разные API протоколы;
- умеет streaming/cancellation;
- хранит capabilities каждой модели;
- поддерживает ручные OpenAI-compatible endpoints;
- умеет model routing per role;
- обеспечивает retry/fallback;
- записывает token usage и примерные расходы;
- позволяет пользователю заменить модель без переписывания pipeline.

Custom provider configuration должна учитывать, что некоторые модели используют Chat Completions API, другие Responses API, а некоторые требуют собственного адаптера. Не следует считать наличие OpenAI-compatible URL гарантией полной совместимости.

### 4.5. Motion Agent

Модель анимации получает уже готовую структуру секции и возвращает только разрешённый motion JSON. Не позволять этой модели переписывать блок, HTML, CTA или маршруты.

### 4.6. Quality Gates против пустых секций

Каждый блок должен иметь Zod/JSON schema. Статус `ready` присваивается только после проверки:
- валидного типа/варианта;
- обязательных props;
- содержательного контента;
- CTA destinations/actions;
- доступности и корректного рендера;
- отсутствия неразрешённых placeholders.

Невалидный результат направляется в repair loop с диагностикой валидатора. После ограниченного числа попыток секция получает `failed`, а не пустой `ready`-блок.

## 5. Что сделает приложение заметно лучше конкурентов

### Приоритет P0 — базовая надёжность
- независимость от одного LLM-провайдера;
- custom providers;
- назначение моделей по ролям;
- динамическое интервью;
- JSON-first страницы;
- инкрементальная генерация;
- live preview каждого готового блока;
- валидация и retry;
- локальная правка одного блока;
- реальный export исходников.

### Приоритет P1 — профессиональная студия
- visual editor;
- brand/design system;
- motion model отдельной ролью;
- CMS;
- SEO/AEO audit;
- рабочие формы и CRM;
- analytics;
- responsive visual checks;
- version history и rollback.

### Приоритет P2 — масштабирование
- несколько сайтов/клиентов в workspace;
- роли и совместная работа;
- агентства/white-label;
- marketplace блоков;
- ecommerce;
- локализация;
- A/B testing;
- billing/usage packs;
- дополнительные deployment providers.

## 6. Главные продуктовые риски и противодействия

| Риск | Защита |
|---|---|
| LLM создаёт пустые секции | Schema validation, content checks, repair loop, status `failed` вместо пустого `ready`. |
| Модель ломает соседние блоки | Изолированный scope edit, block IDs, minimal patch, version snapshots. |
| Генерация сайта занимает много времени | Durable jobs, SSE progress, persist after each block, pause/resume/cancel. |
| Расход токенов непредсказуем | Routing by task complexity, prompt compiler, context compression, token budgets, cost ledger. |
| Провайдер не поддерживает нужную функцию | Capability matrix, protocol adapters, explicit fallback, test connection. |
| API key раскрывается | Server-only secret storage, encryption, masked UI, secret scanning, tenant isolation. |
| Custom endpoint используется для SSRF | URL/IP validation, allowlist for trusted local providers, redirect checks, network policy. |
| Генерируются фальшивые отзывы/цифры | Separate facts/assumptions, source metadata, draft confirmation before publish. |
| Анимация вредит UX | Allow-listed presets, reduced motion, device/performance checks, separate Motion Agent. |
| SEO-обещания не исполняются | Automated technical checks, crawlable SSR/SSG output, no ranking guarantees. |
| Интеграции являются декорацией | Real health checks, sandbox/test destinations, delivery logs and retries. |

## 7. Рекомендуемая очередность MVP

1. Foundation, auth, project/workspace.
2. Provider settings, custom OpenAI-compatible endpoint, capability checks.
3. Interview → valid SiteBrief.
4. Sitemap + design tokens.
5. Typed block registry + renderer + visual editor.
6. Block generation with streaming and validation.
7. Separate Motion Agent.
8. Basic SEO and content.
9. Working lead form + webhook + one CRM adapter.
10. Export source + production QA.

Не строить enterprise CRM, все платёжные интеграции, полный интернет-магазин и сложный маркетплейс до готовности этого end-to-end сценария.

## 8. Полезные ссылки на официальные материалы и код

### Продукты и документация
- Framer AI: https://www.framer.com/ai/
- Framer Developers: https://www.framer.com/developers/
- Webflow AI Site Builder: https://help.webflow.com/hc/en-us/articles/38840145286035-Build-a-site-with-Webflow-s-AI-site-builder
- Webflow AI overview: https://help.webflow.com/hc/en-us/articles/34297897805715-Webflow-AI-overview
- Relume Export: https://www.relume.ai/export
- v0 Design Mode: https://v0.app/docs/design-mode
- v0 Agentic Features: https://v0.app/docs/agentic-features
- Lovable Git Sync: https://docs.lovable.dev/integrations/git-sync-overview
- Playcode: https://playcode.io/docs/start/what-is-playcode
- Reweb: https://reweb.so/
- Durable: https://durable.com/
- OnSpace: https://www.onspace.ai/
- Wix Studio: https://www.wix.com/studio

### Открытые репозитории
- Puck: https://github.com/puckeditor/puck
- OpenPage: https://github.com/buildingopen/openpage
- ChaiBuilder Core: https://github.com/chaibuilder/core
- GrapesJS: https://github.com/GrapesJS/grapesjs
- Bolt Builder community/local fork (не исходный код закрытого Bolt.new): https://github.com/bolt-builder/builder

### OpenCode — официальная документация
- Providers: https://opencode.ai/docs/providers
- Agents: https://docs.opencode.ai/docs/agents/
- Skills: https://docs.opencode.ai/docs/skills/
- Plugins: https://docs.opencode.ai/docs/plugins/
- Rules/AGENTS.md: https://docs.opencode.ai/docs/rules/
- SDK: https://docs.opencode.ai/docs/sdk/

---

**Итоговая рекомендация:** строить продукт как AI-native website operating system с JSON-first ядром, визуальным editor, независимым LLM Gateway и узкими агентами. Уникальность платформы должна быть не в обещании «сделать любой сайт одним промтом», а в контролируемой генерации, возможности заменить любую модель, точечно управлять любым блоком и получить проверенный переносимый сайт.
