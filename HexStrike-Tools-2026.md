# Проверка предложенных инструментов, 30.09.2026

Факты о существовании и роли отделены от решения о включении. Ни один сторонний scanner из этого списка не запущен и не включён автоматически в Rust executor. Лицензионные заметки предварительные, не юридическое заключение. Версии rolling sources меняются, pin revision обязателен.

| Проект | Проверка и роль | Решение | Ограничение | Источник |
|---|---|---|---|---|
| arsenal-ng | confirmed Kali 2026.2; Go cheat-sheet launcher | reference-only | MIT, verify package revision | https://www.kali.org/tools/arsenal-ng/ |
| legba | confirmed Kali 2026.2; Rust/Tokio credential testing | manual approval; not implemented | GPLv3; protocol parity and lockout controls | https://www.kali.org/tools/legba/ |
| oletools | confirmed Kali 2026.2; Office/OLE analysis, Python | isolated external parser candidate | BSD-style plus bundled third-party licenses | https://www.kali.org/tools/oletools/ |
| penelope | confirmed Kali 2026.2; shell/session handler | disabled, controlled lab only | GPLv3; listener/session authority | https://www.kali.org/tools/penelope/ |
| shell-gpt | confirmed Kali 2026.2; AI CLI productivity | reference only, not execution authority | MIT; provider data egress | https://www.kali.org/tools/shell-gpt/ |
| tookie-osint | confirmed Kali 2026.2; username/social discovery | optional with privacy review | MIT; false positives and platform terms | https://www.kali.org/tools/tookie-osint/ |
| uro | confirmed Kali 2026.2; offline URL decluttering | external adapter candidate | Apache-2.0; lossy filtering needs parity tests | https://www.kali.org/tools/uro/ |
| osint-mcp | confirmed 0.1.1 metadata, 26 declared tools; MCP facade | optional Rust client for two allowlisted reads | MIT; verify live tools/list schema; not all tools passive | https://github.com/rjn32s/osint-mcp |
| OSINTai | confirmed gs-ai/OSINTai; local-first crawler/evidence analysis | evaluate only | README MIT badge but license metadata ambiguous | https://github.com/gs-ai/osintai |
| OpenOSINT | confirmed OpenOSINT/OpenOSINT; MCP + CLI OSINT agent | evaluate separate server adapter | MIT in repository; remote/cloud path has different trust boundary | https://github.com/OpenOSINT/OpenOSINT |
| openosint PyPI | identity overlaps OpenOSINT distribution; Python package | not automatically an additional independent framework | pin exact distribution and verify project links | https://pypi.org/project/openosint/ |
| OWASP CVE Lite CLI | confirmed OWASP Lab announcement; JS/TS lockfile dependency scanner | dependency analysis adapter candidate | MIT; not universal Rust/container/network scanner | https://owasp.org/blog/2026/07/06/cve-lite-cli-lab.html |
| ProjectDiscovery Neo | confirmed official product; commercial autonomous security platform | API feasibility/licensing review, not CLI port | commercial product; data handling and scope | https://projectdiscovery.io/blog/neo-v1 |
| ForgeSec CLI | confirmed site/package; early maturity; AI dependency/secrets/repo scanner | hold pending package identity and privacy review | forgesec vs forgesec-cli ambiguity; 0.1.0 metadata | https://forgesec.co/ |
| Sn1per Professional 2026 | confirmed vendor product; commercial platform with Docker/API | evaluate separately | commercial EULA, not public Sn1per feature parity | https://sn1persecurity.com/wordpress/product/sn1per-professional-2026-license/ |
| RustAutoRecon | confirmed repository; AutoRecon-style Rust orchestration | hold production integration | no published releases; license not established from main tree | https://github.com/spacialsec/RustAutoRecon |
| killer | unverified ambiguous name; not established | exclude until canonical repository supplied | no verified publisher/version/license | Canonical source не найден |
| RapidPen | confirmed research paper; IP-to-shell autonomous agent research | design reference only, not executable integration | paper license does not license implementation | https://arxiv.org/html/2502.16730v1 |
| PentestGPT | confirmed repo and USENIX paper; reasoning/generation/parsing architecture | design reference | MIT repo; changing code vs fixed paper results | https://www.usenix.org/conference/usenixsecurity24/presentation/deng |
| VulnHuntr | confirmed Protect AI project; Python source vulnerability analysis | evidence/call-chain design reference | AGPLv3; not Capital One VulnHunter | https://github.com/protectai/vulnhuntr |
| Metatron | confirmed sooryathejas/METATRON; small local LLM CLI assistant | prototype design reference | MIT; no independent efficacy benchmark found | https://github.com/sooryathejas/METATRON |
| CyberStrikeAI | confirmed Go platform; agents, MCP, workflows and governance | control-plane pattern reference only | Apache-2.0; offensive capabilities not bundled | https://github.com/AIPentest/CyberStrikeAI |
| Darkmoon | confirmed ASCIT31/Dark-Moon; multi-agent pentest platform | evidence and governance design reference | GPLv3; project-authored benchmark not independent validation | https://github.com/ASCIT31/Dark-Moon |
| PTFusion | confirmed article DOI; context-aware multi-agent knowledge fusion | paper design reference | software release/license not established | https://doi.org/10.1016/j.inffus.2025.103731 |
| rmcp | released 3.5.0 checked in official docs; official Rust MCP SDK | optional client dependency | compilation still required in external environment | https://docs.rs/rmcp/3.5.0/rmcp/ |

## Основания отказа от blanket replacements

Nikto имеет обновления, Hydra также остается в Kali ecosystem, John имеет jumbo/OpenCL возможности. Актуальность не определяется языком реализации. Проверка источников:

* https://github.com/sullo/nikto
* https://github.com/vanhauser-thc/thc-hydra
* https://www.openwall.com/john/
* https://github.com/xmendez/wfuzz
* https://github.com/radareorg/radare2
* https://steghide.sourceforge.net/
* https://www.kali.org/blog/kali-linux-2026-2-release/

Внешние коммерческие platforms нельзя трактовать как устанавливаемые CLI или OSS crates. Для каждой нужен отдельный контракт API, license/EULA, data residency и budget review. Ссылки на новости подтверждают анонс, не доступность API или техническую эффективность.

PTFusion индексирован ACM, но DOI указывает на статью Information Fusion, а не на MCP package. VulnHuntr и VulnHunter разные проекты. Lowercase openosint не доказывает существование отдельного модульного framework вне OpenOSINT distribution.

## OSINT source-declared tool catalog

26 имен и декларируемые основные поля ниже не заменяют runtime tools/list. В частности, registry handler(**kwargs) может исказить wire schema. Отдельно проверять capabilities конфигурации и доступ к secrets.

| Tool | Fields (? = optional) |
|---|---|
| `osint_whois` | `target` |
| `osint_dns_lookup` | `domain, record_type?, nameserver?` |
| `osint_port_scan` | `target, ports?, timing?` |
| `osint_ip_info` | `ip` |
| `osint_asn_lookup` | `target` |
| `osint_subdomain_enum` | `domain, silent?` |
| `osint_amass` | `domain, timeout_minutes?` |
| `osint_cert_transparency` | `domain, deduplicate?` |
| `osint_harvester` | `domain, sources?, limit?` |
| `osint_dnsrecon` | `domain, type?` |
| `osint_username_search` | `username, timeout?` |
| `osint_maigret` | `username` |
| `osint_email_accounts` | `email` |
| `osint_email_breach` | `email` |
| `osint_wayback` | `url, timestamp?, list_snapshots?` |
| `osint_urlscan` | `url, visibility?` |
| `osint_shodan_host` | `ip` |
| `osint_shodan_search` | `query, limit?` |
| `osint_virustotal` | `target, target_type?` |
| `osint_phone_info` | `number` |
| `osint_scan_secrets` | `target, only_verified?` |
| `osint_gitleaks` | `repo_path` |
| `osint_install_status` | `category?` |
| `osint_config_get` | `key` |
| `osint_config_set` | `key, value` |
| `osint_config_list` | `none` |

Sources: https://pypi.org/project/osint-mcp/ ; https://github.com/rjn32s/osint-mcp/blob/main/src/osint_mcp/tools/registry.py ; https://github.com/rjn32s/osint-mcp/blob/main/README.md
