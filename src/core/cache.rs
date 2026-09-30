use moka::future::Cache;
use serde_json::Value;
use std::time::Duration;
#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct Key { pub principal: String, pub policy_revision: String, pub tool: String, pub version: String, pub input: String }
#[derive(Clone)]
pub struct ResultCache(pub Cache<Key, Value>);
impl Default for ResultCache {
    fn default() -> Self { Self(Cache::builder().max_capacity(16 * 1024 * 1024)
        .weigher(|k: &Key, v: &Value| (k.input.len() + k.principal.len() + k.policy_revision.len() +
            k.tool.len() + k.version.len() + v.to_string().len()).min(u32::MAX as usize) as u32)
        .time_to_live(Duration::from_secs(60)).build()) }
}
// Only offline normalization is cached. Network/PII/secret-bearing results are not cached.
