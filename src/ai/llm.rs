use async_trait::async_trait;
use serde_json::{Value, json};
use crate::utils::error::Result;
#[async_trait]
pub trait Analyzer: Send + Sync {
    async fn analyze(&self, evidence: &Value) -> Result<Value>;
}
pub struct EvidenceSummary;
#[async_trait]
impl Analyzer for EvidenceSummary {
    async fn analyze(&self, evidence: &Value) -> Result<Value> {
        Ok(json!({"provider":"deterministic-not-llm", "verified_findings":[],
            "evidence_items":evidence.as_array().map_or(0, Vec::len),
            "note":"Untrusted evidence requires human review; no vulnerability inferred."}))
    }
}
// Real OpenAI/Claude/Ollama providers are NOT implemented. They must redact data,
// enforce input/token/cost limits and return structured data, never shell commands.
