//! Experimental rmcp adapter. Feature-gated; must pass a real tools/list contract test.
use async_trait::async_trait;
use rmcp::{ServiceExt, model::CallToolRequestParams, transport::TokioChildProcess};
use serde_json::Value;
use crate::{agents::osint::OsintClient, utils::error::{Error, Result}};
use std::{path::PathBuf, process::Stdio, time::Duration};
pub struct StdioOsint { executable: PathBuf }
impl StdioOsint {
    /// Path is trusted operator configuration, never supplied by LLM or HTTP input.
    pub fn new(executable: PathBuf) -> Result<Self> {
        if !executable.is_absolute() { return Err(Error::Invalid("absolute MCP executable path required".into())); }
        Ok(Self { executable })
    }
}
fn foreign(e: impl std::fmt::Display) -> Error { Error::Invalid(format!("MCP error: {e}")) }
#[async_trait]
impl OsintClient for StdioOsint {
    async fn call_read(&self, name: &str, arguments: Value) -> Result<Value> {
        let field = match name { "osint_whois" => "target", "osint_cert_transparency" => "domain",
            _ => return Err(Error::Denied("MCP tool disabled".into())) };
        let args = arguments.as_object().cloned().ok_or_else(|| Error::Invalid("arguments object required".into()))?;
        let mut command = tokio::process::Command::new(&self.executable);
        command.env_clear().env("PATH", "/usr/local/bin:/usr/bin:/bin").current_dir("/")
            .stderr(Stdio::null()).kill_on_drop(true);
        let transport = TokioChildProcess::new(command).map_err(Error::Io)?;
        let client = tokio::time::timeout(Duration::from_secs(10), ().serve(transport))
            .await.map_err(|_| Error::Timeout)?.map_err(foreign)?;
        let response = async {
            let tools = client.list_all_tools().await.map_err(foreign)?;
            let tool = tools.iter().find(|t| t.name.as_ref() == name)
                .ok_or_else(|| Error::Denied("tool missing from tools/list".into()))?;
            let schema = serde_json::to_value(&tool.input_schema)?;
            // Fail closed for the known kwargs registration defect. This is a minimal shape check,
            // NOT a general JSON Schema validator or a signature/provenance check.
            if schema["properties"][field]["type"] != "string" ||
                !schema["required"].as_array().is_some_and(|a| a.iter().any(|v| v == field)) {
                return Err(Error::Denied("unexpected MCP wire schema; review server version".into()));
            }
            let result = client.call_tool(CallToolRequestParams::new(name.to_string()).with_arguments(args)).await.map_err(foreign)?;
            if result.is_error == Some(true) { return Err(Error::Invalid("remote MCP tool returned isError".into())); }
            let value = serde_json::to_value(result)?;
            if serde_json::to_vec(&value)?.len() > 1024 * 1024 { return Err(Error::OutputLimit); }
            Ok(value)
        };
        let result = tokio::time::timeout(Duration::from_secs(25), response).await;
        let _ = tokio::time::timeout(Duration::from_secs(3), client.cancel()).await;
        result.map_err(|_| Error::Timeout)?
    }
}
// Remote transport decoding occurs before the result-size check. Untrusted external servers
// need a separate memory-limited worker/cgroup and network egress policy. Not production-ready.
