use std::collections::BTreeSet;
use hexstrike_rust::{core::{cache::ResultCache, decision_engine::{Policy, Scope}, tool_manager::ToolManager}, server};
#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let domains = std::env::var("HEXSTRIKE_SCOPE").unwrap_or_else(|_| "example.com".into())
        .split(',').map(str::to_string).collect::<BTreeSet<_>>();
    let manager = ToolManager { policy: Policy { scope: Scope { domains, include_subdomains: false }, max_steps: 4 }, cache: ResultCache::default() };
    match std::env::args().nth(1).as_deref() {
        Some("--http") => server::api::serve(manager, std::env::var("HEXSTRIKE_API_TOKEN")?).await?,
        Some("--mcp-stdio") => server::mcp::serve(manager).await?,
        Some("--fixture-osint") => {
            let mut report = hexstrike_rust::agents::osint::investigate(&manager.policy,
                &hexstrike_rust::agents::osint::FixtureOsint, &hexstrike_rust::ai::llm::EvidenceSummary,
                "example.com", true).await?;
            report.provider = "fixture-no-network".into();
            println!("{}", hexstrike_rust::utils::export::json(&report)?);
        }
        Some("--fixture-process") => {
            println!("{}", serde_json::to_string(&hexstrike_rust::core::process::Executor::default().fixture().await?)?);
        }
        _ => { eprintln!("Use --http | --mcp-stdio | --fixture-osint | --fixture-process"); }
    }
    Ok(())
}
