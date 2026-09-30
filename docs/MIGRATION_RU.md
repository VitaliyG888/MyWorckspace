# HexStrike AI: миграция на Rust, инженерный отчёт

Дата проверки: 30 сентября 2026. Статус поставки: анализ и исходники ограниченного прототипа 0.1, не завершённая миграция. Исходные Python-приложения, сканеры и команды из PDF не запускались. Rust-компилятор и cargo в Computer отсутствуют; установка пакетов недоступна. Rust-код, optional rmcp, Docker и CI требуют внешней сборки. Нет измеренного ускорения, Cargo.lock и аттестации production readiness.

## 1. Фактическая поверхность исходного проекта

| Единица измерения | Значение |
|---|---:|
| Строки hexstrike_server.py | 17 289 |
| Классы / функции и методы сервера | 44 / 448 |
| Строки hexstrike_mcp.py | 5 470 |
| Классы / функции и методы MCP | 3 / 160 |
| Статические Flask routes | 156 |
| Routes под /api/tools/ | 90 |
| Декораторы @mcp.tool | 151 |
| Уникальные имена MCP | 150 |
| Элементы health-списков / уникальные строки | 127 / 124 |
| Кандидаты после объединения health и tool routes с ограниченными aliases | 133 |
| Выделенные жирным README-заявления в разделе arsenal | 161, не количество доказанных бинарников |
| PDF / страницы | 6 / 733 |

133 кандидата включают внутренние возможности и declared-only записи. Это не доказательство 133 работоспособных внешних CLI. 150 уникальных MCP имён также не означают 150 внешних программ. Инвентаризация сохраняет эти множества раздельно. `tool_migration.csv` не скрывает `rust_implemented=False`; `mcp_tools.csv` содержит каждую регистрацию, сигнатуру, HTTP-вызовы и строку. `definitions.csv` и symbols JSON содержат все статически обнаруженные классы, функции и методы. Imports JSON перечисляют модули. `http_routes.json` сохраняет обнаруженные поля params.get и defaults, но это не полноценная восстановленная OpenAPI-схема.

Метод: AST без выполнения кода, чтение README/requirements/config, PDF embedded text и OCR двух обложек. Dynamic imports, регистрации во время выполнения, недостижимые ветки и совместимость реально установленных бинарников не доказаны. SHA-256 оригиналов записаны в source_manifest.json. В архив не включены сами PDF или их полные текстовые копии.

### Архитектура Python

Flask-монолит использует global singletons: process registries, caches, browser driver, requests session, decision/workflow managers. FastMCP stdio адаптер выполняет HTTP forwarding через HexStrikeClient. Основной путь: MCP wrapper → Flask route → строка команды → EnhancedCommandExecutor → subprocess.Popen(shell=True). Отдельный process pool имеет другой кэш и жизненный цикл.

Ключевые группы классов:

| Группа | Классы |
|---|---|
| Планирование | IntelligentDecisionEngine, TargetProfile, AttackStep, AttackChain, TechnologyDetector, ParameterOptimizer |
| Ошибки | IntelligentErrorHandler, GracefulDegradation, FailureRecoverySystem, RateLimitDetector |
| Workflows | BugBountyWorkflowManager, CTFWorkflowManager, CTFToolManager, CTFChallengeAutomator, CTFTeamCoordinator |
| Процессы | ProcessPool, EnhancedProcessManager, ProcessManager, EnhancedCommandExecutor, ResourceMonitor |
| Кэш/наблюдаемость | AdvancedCache, HexStrikeCache, TelemetryCollector, PerformanceMonitor, PerformanceDashboard |
| Дополнительные | CVEIntelligenceManager, AIExploitGenerator, VulnerabilityCorrelator, HTTPTestingFramework, BrowserAgent, PythonEnvironmentManager, FileOperationsManager |

Внутренний AI не равен интеграции OpenAI/Claude/Ollama: значительная часть исходного поведения это эвристики, шаблоны, словари и mock CVE correlations. Внешний MCP host обеспечивает LLM. Маркетинговые показатели README нельзя использовать как baseline качества.

## 2. Дефекты, которые нельзя механически перенести

Ссылки ниже относятся к строкам предоставленных оригинальных файлов, нумерация с 1.

| Приоритет | Наблюдение | Свидетельство | Migration gate |
|---|---|---|---|
| P0 | Нет видимой authn для произвольного command API; Flask слушает все интерфейсы | server:9137–9158,17256–17289; mcp:192–256 | Удалить generic command API; loopback, principal, capability policy |
| P0 | shell=True и интерполяция аргументов | server:6875–6883,10344–10352,10401–10405 | Typed argv, fixed binary, запрет free-form additional_args |
| P0 | Пароли в argv, логах и кэше | server:11118–11133,11282–11316,6802–6817 | Secret handles, redaction, без secret-bearing cache |
| P0 | Установка произвольных пакетов и Python execute, слабый confinement путей | server:14468–14534,8936–8953 | Исключить из control plane; отдельный изолированный worker |
| P0 | Browser отключает security/TLS/sandbox и возвращает cookies/storage | server:13632–13732 | Sandbox browser без ambient credentials, egress policy |
| P1 | Out-of-scope URL возвращается неизменённым и затем отправляется | server:13302–13325,13370–13388 | Hard deny до каждой сетевой операции |
| P1 | Завершение shell PID не гарантирует остановку потомков | server:6876–6882,6925–6943,5576–5628 | Process group + cgroup, cancel/reap regression tests |
| P1 | Cache hit async возвращает объект вместо task id; communicate без deadline | server:5236–5255,5272–5293,16694–16715 | Typed persistent job records, deadline |
| P1 | stdout/stderr накапливаются без byte cap | server:6799–6819,5291–5303 | Bounded pipes, spill storage, backpressure |
| P1 | Общие mutable browser/session/cache/process data | server:13281–13293,13623–13630 | Job/tenant isolation |
| P1 | Разные cache key semantics, нет tenant/tool-version context | server:6668–6717,5236–5245 | Context-aware keys, TTL и cache eligibility |
| P1 | MCP burpsuite_scan вызывает отсутствующий route | mcp:3462–3491; server:14224–14236 | Единый catalog и contract suite |
| P1 | Дважды зарегистрирован httpx_probe | mcp:2675,3392 | Уникальность tool names в CI |
| P1 | self внутри nested MCP functions без параметра self | mcp:2880–2910,3103–3148 | Явные зависимости workflow, execute fixtures |
| P1 | Raw HTML/outputs попадают внешнему агенту без trust boundary | server:9734–9752,13691–13713 | Provenance, untrusted evidence, policy до side effects |

Кроме route drift есть response shape drift: http_framework_test ожидает вложенный result, тогда как сервер возвращает плоский объект (mcp:5188–5191, server:13354–13359,14053–14066). Автоматический literal_route_mismatches.json не обнаруживает все возможные динамические несовпадения.

## 3. Что извлечено из PDF

| Документ | Страниц | Полезное содержание и page provenance | Решение |
|---|---:|---|---|
| Blue Team Tools | 29 | Network discovery стр. 3–7, Shodan 6–7, monitoring с 9, Sysmon/SIEM/forensics категории | Добавить evidence/defensive integrations, не переносить как команды агента |
| Bug Bounty Tools Collection | 17 | Subdomain enumeration 2–3, port scanners 3, web discovery/parameters/fuzzing далее | Каталог возможностей, URL provenance; проверить upstream перед установкой |
| Red Teaming Toolkit-1 | 27 | Recon 2–3: RustScan, Amass, gitleaks, cloud_enum, Recon-ng; остальные главы по adversary lifecycle | Recon кандидаты; высокорисковые возможности отдельно от default capabilities |
| Red Team Guides | 198 | Сетевые/системные команды 2–3, Nmap 63–68, Shodan 112–113, OSINT 189,192–196 | Справочный corpus, не доверенный executable source |
| Bug Bounty Playbook v1 | 212 | Scope 41–42; workflows 43–51; subdomains 85–116; scanning 118–129 | Явные pipeline stages и scope gate |
| Bug Bounty Playbook V2v | 250 | Technology/CVE/CMS главы с 11; application weakness taxonomy; reporting 130 | Knowledge taxonomy и regression cases, не автогенерация эксплуатации |

733 страницы имеют извлечённый текст или OCR обложки. В V2 заметно дублирование текстового слоя; номера здесь физические PDF pages, не гарантированно printed page numbers. Все изображения и скриншоты команд не проходили OCR: нельзя утверждать, что каждый видимый payload/флаг распознан. 470 ссылок-кандидатов GitHub из PDF индексированы с номером страницы, включая повторы; это не 470 уникальных инструментов. Short URLs из toolkit сохранены как provenance, не считаются проверенным upstream.

Существующие сетевые команды сопоставляются с typed adapter schemas, а не передаются shell. Legacy net-tools предложено заменять на iproute2/ss там, где совпадает смысл. DNS lookup остается отдельным capability; zone transfer, fuzzing, credential tests и exploitation не становятся passive OSINT по названию раздела PDF.

## 4. Решения по инструментам в 2026

Подробная проверка и источники: `TOOLS_2026.md`, `new_tools.csv`. Kali 2026.2 действительно включает предложенные семь новых пакетов в репозитории, но это не означает установку в каждом образе. См. https://www.kali.org/blog/kali-linux-2026-2-release/ .

| Текущий инструмент | Решение | Почему не просто удалить |
|---|---|---|
| dirb | feroxbuster по умолчанию после parity tests | Directory enumeration, baseline dictionary cases сохраняются |
| nikto | Сохранить опционально, добавить nuclei | Server/config checks и template scans не равны; Nikto обновляется |
| wfuzz | ffuf для совместимых HTTP fuzz cases | Учитывать payload generators/filtering semantics |
| hydra | legba как дополнительный protocol adapter | Rust не доказывает превосходство по каждой protocol workload |
| john | hashcat для подходящих GPU workload; john оставить | Разная поддержка форматов и CPU/GPU режимов |
| enum4linux | enum4linux-ng | Есть в исходнике уже сейчас |
| crackmapexec | netexec с отдельным mapping flags | Это продолжение экосистемы, не обещание 100% CLI compatibility |
| volatility2 | volatility3 для совместимых memory images | Volatility3 уже в исходном health registry; legacy images тестировать |
| steghide | Добавить zsteg/stegsolve/outguess по форматам | Не взаимозаменяемые форматы; stegsolve GUI не универсальный headless CLI |
| radare2 | Сохранить; Ghidra headless/Rizin опционально | Синтаксис не критерий устаревания |
| Python scripts | Профилировать до rewrite | angr, oletools, Volatility3 и другие зависят от Python экосистемы |

BeautifulSoup не «ручной парсинг HTML» в смысле brittle string matching. Статические словари, signatures и единичные scans полезны как воспроизводимые baselines. Их следует дополнять corpus-aware ranking, typed parsers, bounded concurrency и evidence verification, а не исключать идеологически. AI не является источником доказательства уязвимости.

## 5. Целевая архитектура

````mermaid
flowchart TD
  U[Operator / MCP host] --> G[Identity and scope gateway]
  G --> A[Axum API / MCP stdio]
  A --> P[Deterministic policy]
  P --> Q[Bounded durable jobs]
  Q --> C[Coordinator and typed task DAG]
  C --> B[Bug bounty planner]
  C --> O[OSINT worker]
  C --> V[CVE evidence worker]
  C --> T[Isolated CTF worker]
  B --> M[Tool broker]
  O --> M
  V --> M
  T --> M
  M --> E[Isolated CLI containers]
  M --> X[Approved external MCP]
  E --> F[Normalized evidence store]
  X --> F
  F --> L[LLM analysis with redaction]
  L --> P
  F --> R[Verified report JSON XML SARIF]
  Q --> N[Event stream and ratatui]
````

Эта диаграмма описывает target architecture. В поставке реализована только часть, см. section 6. Durable jobs, настоящая DAG coordination, egress proxy, TUI, persistent evidence store и remote identity gateway не реализованы.

Разделить три бинарных компонента в следующем milestone: API/control plane, unprivileged worker, MCP stdio front-end. Scanner worker получает job id, immutable scope revision, deadline, typed argv и output limit. Он не получает общие credentials приложения. Async Tokio используется для I/O; CPU-heavy parsers запускаются в bounded blocking pool, не на runtime threads.

Model proposal → deterministic validation → approval → worker result → verifier. LLM не расширяет scope, не устанавливает tools и не присваивает себе capabilities. Prompt injection defense требует независимой policy enforcement, а не обещания «LLM проигнорирует инструкции».

### Контракты

`JobRequest`: principal, scope_id/revision, target, tool_id/version, typed parameters, deadline, approval_reference, idempotency_key. `JobRecord`: id, queued/running/succeeded/failed/cancelled/timed_out, timestamps, artifact_refs. `ToolResult`: exit_code, parsed facts, raw artifact reference, truncation, parser_version, evidence provenance. Findings требуют source evidence и verifier status; строка «critical» в stdout не равна critical finding.

Стойкое состояние рекомендуется хранить SQLite для single node, PostgreSQL для нескольких worker nodes. Moka не заменяет job database. Для network-facing tools DNS resolution и redirects проверяются перед фактическим connect, cgroup egress ограничивает адреса. Domain allowlist из прототипа недостаточен против DNS rebinding/SSRF и не заявлен как такая защита.

### Технологии и FFI

Tokio + Axum, serde/serde_json, Moka, quick-xml, rmcp optional. `quick-xml` уже предусмотрен dependency для следующих parsers; текущий XML export это escaped JSON payload в XML envelope, не полноценная findings XML schema. HTTP-клиент планируется reqwest/rustls. `async-openai` и `ollama-rs` подключаются только после выбора провайдера, pins, privacy и contract tests. Claude имеет свой API контракт; OpenAI-compatible wrapper не означает автоматическую поддержку Claude.

Не добавлять libloading/libpcap/OpenSSL только ради полноты списка: FFI увеличивает trusted computing base и не ускоряет внешние scanners. Для capture выбрать maintained libpcap binding и привилегированный отдельный worker, для TLS предпочесть rustls, если совместимость допускает. Для браузера оставить isolated external service. Производственная dependency policy требует Cargo.lock, cargo audit/deny, SBOM, provenance и pinned container digests.

## 6. Что реализовано в 0.1

| Модуль | Поставка | Не заявляется |
|---|---|---|
| core/decision_engine | Canonical domain checks, boundary-aware subdomain scope, step budget, deterministic passive-tool gate | Network egress enforcement, approval database |
| core/tool_manager | Единый каталог двух native capabilities: normalize_urls и plan_osint | Перенос 150 MCP wrappers |
| core/cache | Moka weighted cache, principal/tool/version/input keys, TTL | Distributed cache, secret result caching |
| core/process | Fixed printf fixture, no shell, semaphore, bounded output, deadline, Unix process-group cleanup | Универсальный scanner broker или sandbox; setsid escape/cgroups ещё не закрыты |
| server/api | Axum на 127.0.0.1, bearer для single operator, body cap, concurrency admission | Multi-tenant production auth/TLS/rate-limiting per IP |
| server/mcp | Минимальный MCP stdio: initialize, initialized, ping, tools/list, tools/call, bounded lines | Полная MCP certification, latest protocol parity, Streamable HTTP |
| agents/osint | Trait-based evidence workflow, consent gate, per-call deadlines, fixture | Автономный live OSINT запуск по HTTP |
| ai/mcp_client | Optional rmcp stdio adapter, discovery, minimal schema checks, allowlisted calls | Подтверждённая compilation/live wire compatibility |
| ai/llm | Analyzer trait + deterministic EvidenceSummary, явно not-llm | Интеграция live LLM |
| agents/bugbounty | Passive plan wrapper | Автономный exploitation workflow |
| agents/ctf | Fail-closed unsupported | Реализация CTF execution |
| agents/cve | Typed evidence structure | Live CVE feed и correlation engine |
| tools/network,binary,cloud | Явные markers IMPLEMENTED=false | Реализованные адаптеры |
| exports | JSON, escaped XML envelope, SARIF 2.1.0 с пустыми results | OSINT observations как подтверждённые vulnerabilities |
| utils/visual | JSON status | Ratatui TUI |

Это source-level implementation foundation, не бинарный релиз. Даже default build нельзя считать проверенным до cargo check/test на машине с Rust.

## 7. MCP и OSINT: важные детали

Проверенный публичный source osint-mcp заявляет 26 tools. WHOIS принимает `target`; subdomain_enum принимает `domain`; Shodan host принимает `ip`. Передавать один и тот же target string без mapping неправильно. Domain надо разрешить в IP и проверить каждый адрес против scope прежде, чем делать Shodan lookup. Поэтому Shodan не включён в исполняемый passive workflow v0.1.

У source registry osint-mcp обнаружен риск FastMCP регистрации handler(**kwargs) без явной передачи input_schema. README schema не гарантирует runtime tools/list schema. Optional Rust adapter проверяет наличие ожидаемых required string properties и отказывает при drift. Это минимальная shape validation, а не полноценный JSON Schema validator; до production нужны pinned server revision, tool-schema snapshot/hash и test fixture реального сервера.

`osint_config_get/list/set`, secrets scanners и active port scanner не разрешены автоматически. Инструмент с названием OSINT может читать secrets, изменять config или совершать active requests. Собственный process osint-mcp тоже имеет authority и требует отдельного memory/CPU/egress-isolated worker. Внешний MCP stdout является untrusted input. rmcp result limit в prototype применяется после декодирования, поэтому не ограничивает память transport decoding. Это конкретный release blocker.

Официальный SDK проверен как released rmcp 3.5.0: https://docs.rs/rmcp/3.5.0/rmcp/ и https://github.com/modelcontextprotocol/rust-sdk . Внутренний lightweight stdio server и optional external client имеют разный maturity: первый реализует ограниченный 2025-06-18 subset, второй использует SDK lifecycle. Нельзя называть JSON REST endpoint полноценным MCP Streamable HTTP.

## 8. План по этапам и критериям готовности

Исходный план суммируется в 16 недель. Это planning envelope для команды с параллельной работой и готовой lab infrastructure, не гарантия full parity одного инженера. 150 wrappers за 4 недели означают почти 8 в рабочий день без запаса на contract tests, licensing и sandboxing.

| Этап | Недели последовательно | Результат / gate |
|---|---|---|
| Анализ | 1 | Раздельные inventory sets, source hashes, contract gaps, baseline workloads |
| Каркас | 2–3 | Auth/scope model, typed schemas, bounded job model, no generic shell, compiling CI |
| Адаптеры волнами | 4–7 | P0 offline/pure; P1 passive DNS/metadata; P2 scoped active only after review; parity and failure fixtures для каждого |
| AI и coordination | 8–10 | Typed task graph, budget/cost caps, dedup, evidence verifier, no model-granted authority |
| Интеграции | 11–12 | Versioned MCP, provider privacy tests, exports, event stream/TUI |
| Тестирование | 13–14 | Contract, cancellation, resource stress, fuzzing, security regression, measured benchmark results |
| Документация | 15 | Reproducible install, compatibility matrix, operator/recovery runbooks |
| Релиз | 16 | Lockfiles, SBOM, signatures, staged rollout, rollback and kill switch |

Production acceptance: 100% enabled tool IDs имеют owner, source/version/license, risk class, schema, parser, timeout, output policy, scope policy, execution fixture и negative tests. Disabled/inventory-only tools не считаются migration completed. Каждая старая route имеет явное preserved/replaced/removed решение. Compatibility API не сохраняет опасную arbitrary command semantics ради parity.

Рекомендуемая стратегия: strangler migration. Заморозить исходные contracts, убрать remote exposure старого сервера, направлять сначала offline/read-only traffic в Rust, сравнивать normalized results на fixtures, постепенно заменять broker. Shadow runs не дублируют активные запросы к реальной цели. Python/scanner dependencies в контейнерах сохраняются, пока native rewrite не даёт доказанной пользы.

## 9. Производительность и тесты

10–100x это экспериментальная гипотеза для CPU-bound частей, не SLA для network scanning. Если 80% времени занимает сеть/CLI/LLM, бесконечное ускорение оставшихся 20% даёт максимум 1.25x overall. При ускорении этой доли в 100x получается около 1.247x. Замена Flask wrapper на Axum не ускоряет внутреннюю работу Nmap/Hashcat.

Бенчмарки разделить: URL normalization, JSON/XML parsing, cache, policy, queue, subprocess overhead, external tool wall time, LLM latency. Одинаковые inputs, versions, hardware, concurrency, rate limits, error budget. Измерять p50/p95/p99, RSS control plane отдельно от child process tree, peak memory, throughput, timeout/cancel latency и ошибочность результатов. Не считать повышение rate limit оптимизацией алгоритма.

`benches/control_plane.rs` содержит Criterion harness, но не результаты и не Python comparison. Python implementation исходника не имеет такого же native URL normalization workflow, поэтому baseline надо отдельно определить, а не сравнивать разные алгоритмы. End-to-end replay corpus должен фиксировать DNS/HTTP responses и resource budgets.

Фактически выполнены 12 Python static artifact/inventory checks. Они проверяют TOML parse, module paths, counts, duplicate names, PDF coverage metadata, hashes metadata, no generic shell markers и config shape. Они не доказывают Rust semantics, отсутствие всех command injections или sandbox safety. 11 Rust test functions подготовлены, не выполнены. Process tests покрывают harmless fixture и output overflow; полноценные descendant/cancel/timeout/setsid tests ещё нужны.

## 10. Следующий инженерный gate

На отдельной машине выполнить cargo fmt, resolve dependencies, cargo check/test/clippy, optional rmcp compilation, затем wire contract fixture osint-mcp с networks disabled. Зафиксировать Cargo.lock и toolchain, исправить найденные ошибки. До этого не публиковать docker image как tested release и не включать live scanner adapters.

Главный результат анализа: миграция должна менять границы доверия и модель исполнения, а не только синтаксис. Rust повышает memory safety, но не устраняет SSRF, prompt injection, authorization failures и опасность внешних процессов сам по себе.

## Состав каталога

28 Rust source files, 11 Rust test functions, 2 Criterion benchmark cases, 12 выполненных static artifact checks. Дополнительно 25 строк verified/proposed integration review, 26 source-declared osint-mcp tools, 655 Python definitions. Полный CSV/JSON registry находится в архиве.
