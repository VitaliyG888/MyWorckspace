use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use crate::{ai::llm::Analyzer, core::decision_engine::Policy, tools::osint::arguments, utils::error::{Error, Result}};
#[async_trait]
pub trait OsintClient: Send + Sync {
    async fn call_read(&self, name: &str, arguments: Value) -> Result<Value>;
}
#[derive(Debug, Serialize, Deserialize)]
pub struct OsintReport { pub target: String, pub evidence: Vec<Value>, pub analysis: Value, pub provider: String }
pub async fn investigate<C: OsintClient, A: Analyzer>(policy: &Policy, client: &C, analyzer: &A,
    target: &str, local_consent: bool) -> Result<OsintReport> {
    let plan = policy.plan_osint(target)?;
    let mut evidence = Vec::new();
    for action in plan.actions {
        policy.authorize_read(&action, local_consent)?;
        let args = arguments(&action.tool, &action.target)?;
        let result = tokio::time::timeout(std::time::Duration::from_secs(30), client.call_read(&action.tool, args))
            .await.map_err(|_| Error::Timeout)??;
        if serde_json::to_vec(&result)?.len() > 1024 * 1024 { return Err(Error::OutputLimit); }
        evidence.push(json!({"tool":action.tool, "target":action.target, "untrusted":true, "data":result}));
    }
    let analysis = tokio::time::timeout(std::time::Duration::from_secs(30), analyzer.analyze(&json!(evidence)))
        .await.map_err(|_| Error::Timeout)??;
    Ok(OsintReport { target: target.into(), evidence, analysis, provider: "configured MCP client".into() })
}
pub struct FixtureOsint;
#[async_trait]
impl OsintClient for FixtureOsint {
    async fn call_read(&self, name: &str, _arguments: Value) -> Result<Value> {
        Ok(json!({"fixture":true,"tool":name,"records":[]}))
    }
}
