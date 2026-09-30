use crate::{core::{cache::{Key, ResultCache}, decision_engine::Policy}, tools::web::normalize_urls, utils::error::{Error, Result}};
use serde::Deserialize;
use serde_json::{Value, json};
#[derive(Clone)]
pub struct ToolManager { pub policy: Policy, pub cache: ResultCache }
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Urls { urls: Vec<String> }
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Target { target: String }
impl ToolManager {
    pub fn catalog() -> Value { json!([
        {"name":"normalize_urls","description":"Offline HTTP URL normalization; no network",
          "inputSchema":{"type":"object","properties":{"urls":{"type":"array","maxItems":1000,"items":{"type":"string","maxLength":4096}}},"required":["urls"],"additionalProperties":false}},
        {"name":"plan_osint","description":"Produce a scoped passive plan, never executes it",
          "inputSchema":{"type":"object","properties":{"target":{"type":"string"}},"required":["target"],"additionalProperties":false}}
    ]) }
    pub async fn call(&self, principal: &str, name: &str, args: Value) -> Result<Value> {
        match name {
            "normalize_urls" => {
                let parsed: Urls = serde_json::from_value(args)?;
                let input = serde_json::to_string(&parsed.urls)?;
                let key = Key { principal: principal.into(), policy_revision: "offline-v1".into(),
                    tool: name.into(), version: env!("CARGO_PKG_VERSION").into(), input };
                if let Some(v) = self.cache.0.get(&key).await { return Ok(v); }
                let v = json!({"urls":normalize_urls(&parsed.urls)?, "network_requests":0});
                self.cache.0.insert(key, v.clone()).await; Ok(v)
            }
            "plan_osint" => { let parsed: Target = serde_json::from_value(args)?;
                Ok(serde_json::to_value(self.policy.plan_osint(&parsed.target)?)?) }
            _ => Err(Error::Unsupported(name.into())),
        }
    }
}
