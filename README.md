# HexStrike Rust 0.1: review prototype

**Не full port и не проверенный бинарный релиз.** Это инженерный анализ оригиналов и исходники ограниченного control-plane прототипа. 150 исходных MCP names остаются inventory-only. Реально реализованные capabilities: offline normalize_urls и scoped plan_osint без исполнения. Внешняя сеть и scanner execution не включаются по умолчанию.

Полный отчёт: [docs/MIGRATION_RU.md](docs/MIGRATION_RU.md). Проверенные инструменты: [docs/TOOLS_2026.md](docs/TOOLS_2026.md). Результат локальных проверок: [docs/VALIDATION.md](docs/VALIDATION.md).

## Сборка на вашей машине

Нужны Linux, Rust stable с edition 2024, cargo, rustfmt, clippy и разрешённый доступ к Rust registry. В Computer ни cargo, ни rustc не были доступны, поэтому эти команды ещё не выполнены. Cargo.lock намеренно не подделан. Первое разрешение зависимостей не воспроизводимо; до выпуска pin toolchain и commit lockfile.

````sh
cargo fmt --all
cargo generate-lockfile
cargo check --all-features
cargo test --all-features
cargo clippy --all-targets --all-features -- -D warnings
cargo bench --no-run
python3 scripts/static_checks.py
cargo build --release --locked
````

CI scaffold предназначен для первого внешнего review. После formatting закоммитьте изменения; CI `fmt --check` будет отклонять неотформатированные исходники. Review/fix compilation issues до использования. GitHub Actions tags и Docker base tags пока mutable, production release требует hashes/digests.

## Безопасные локальные примеры

````sh
./target/release/hexstrike-rust --fixture-osint
./target/release/hexstrike-rust --fixture-process
HEXSTRIKE_SCOPE=example.com ./target/release/hexstrike-rust --mcp-stdio
````

Fixture OSINT не делает HTTP/DNS запросов, возвращает `fixture=true` evidence и deterministic-not-llm analysis. Fixture process запускает только фиксированный `/usr/bin/printf` без shell. `--mcp-stdio` используется как subprocess MCP host; stdout зарезервирован для JSON-RPC. Конфигурация в examples/mcp-config.json требует заменить абсолютный путь на ваш compiled binary.

HTTP mode слушает **только 127.0.0.1:8888**. Создайте случайный минимум 32-символьный `HEXSTRIKE_API_TOKEN` через ваш secret manager и экспортируйте локально, не коммитьте. Затем:

````sh
HEXSTRIKE_SCOPE=example.com ./target/release/hexstrike-rust --http
````

GET /health, GET /api/tools, POST /api/call требуют Authorization: Bearer. POST body:

````json
{"name":"normalize_urls","arguments":{"urls":["https://EXAMPLE.com:443/a#fragment","https://example.com/a"]}}
````

````json
{"name":"plan_osint","arguments":{"target":"example.com"}}
````

plan_osint возвращает executed=false и approval_required=true. HTTP endpoint не умеет подтверждать approval или исполнять этот план. Scope задаёт оператор, не model/request. include_subdomains по умолчанию false. Проект single-operator, не multi-tenant platform.

## Experimental real MCP client

Feature `mcp-client` включает src/ai/mcp_client.rs и pinned rmcp 3.5.0. Это library adapter, не включённый в HTTP/CLI automatic execution. Пример использования после отдельного review:

````rust
use hexstrike_rust::{agents::osint::investigate, ai::{llm::EvidenceSummary, mcp_client::StdioOsint}};
// policy создана доверенным оператором; path не берётся из MCP tool arguments.
let client = StdioOsint::new("/opt/reviewed-osint/bin/osint-mcp".into())?;
let report = investigate(&policy, &client, &EvidenceSummary, "example.com", true).await?;
````

`true` это локальное подтверждение в demo API, не production signed approval token. До network execution: pin/review server, установить capabilities/egress allowlist и resource-isolated worker, убедиться в tools/list schema. Запускать arbitrary downloaded uvx/package на каждый вызов нельзя. Adapter очищает env и не передаёт ключи Shodan/LLM. Для любых новых credentials нужна отдельная секретная конфигурация.

## Полезные артефакты

`docs/inventory/definitions.csv`, `http_routes.csv`, `mcp_tools.csv`, `health_declared.json`, `tool_migration.csv`, `readme_tool_claims.json`, `new_tools.csv` разделяют определения, routes, tools и marketing declarations. `pdf_pages.json`, `pdf_tool_mentions.csv`, `pdf_repository_candidates.csv`, `pdf_urls.csv` хранят provenance. Наличие в каталоге не означает поддержку в Rust.

`tests/core.rs` содержит 11 Rust tests, `benches/control_plane.rs` содержит Criterion harness. Ни Rust tests, ни benchmarks не были запущены в Computer. 12 Python artifact checks прошли. Измеренного speedup нет.

## Не реализовано и release blockers

Нет full adapter parity, live LLM providers, persistent job scheduler, multi-agent runtime, TUI, OpenOSINT adapter, full JSON Schema validation, network egress/DNS rebinding protection, cgroup isolation и complete MCP conformance. rmcp transport result limit проверяется после decoding. Process groups не удерживают процессы, покинувшие group через setsid. Ни один из этих компонентов не считается production-ready.

## Docker

Dockerfile собирает stdio mode. Сеть не требуется для fixtures: после внешней сборки запускать с `--network none --read-only --cap-drop ALL --security-opt no-new-privileges`, без privileged/root и без host mounts. Это deployment recommendation, не проверенный container run. HTTP mode внутри bridge container с loopback binding намеренно не публикуется на хост через обычный -p.

## Лицензирование

Исходники пользователя не включены в архив. Перед публикацией проверить лицензию оригинального HexStrike и права на derivative code. SPDX/license проекта не выдуманы. Лицензии внешних scanners и PDF контента независимы от нового Rust control plane.
