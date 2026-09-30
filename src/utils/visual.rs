use serde_json::{Value, json};
pub fn status() -> Value { json!({"status":"prototype","version":env!("CARGO_PKG_VERSION"),
    "live_scanners":0,"llm":"not_configured","tui":"not_implemented"}) }
