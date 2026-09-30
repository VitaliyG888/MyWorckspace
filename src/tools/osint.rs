use serde_json::{Value, json};
use crate::utils::error::{Error, Result};
pub fn arguments(name: &str, target: &str) -> Result<Value> {
    match name {
        "osint_whois" => Ok(json!({"target": target})),
        "osint_cert_transparency" => Ok(json!({"domain": target, "deduplicate": true})),
        _ => Err(Error::Denied("OSINT tool not in local read-only registry".into())),
    }
}
