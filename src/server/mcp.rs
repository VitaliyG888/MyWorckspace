//! Minimal MCP stdio subset, protocol 2025-06-18. No Streamable HTTP or resource API.
use serde_json::{Value, json};
use tokio::io::{AsyncBufRead, AsyncBufReadExt, AsyncWriteExt, BufReader};
use crate::{core::tool_manager::ToolManager, utils::error::{Error, Result}};
const MAX_LINE: usize = 64 * 1024;
#[derive(Default)]
pub struct Session { initialized: bool, ready: bool }
fn error(id: Value, code: i32, message: &str) -> Value {
    json!({"jsonrpc":"2.0","id":id,"error":{"code":code,"message":message}})
}
impl Session {
    pub async fn handle(&mut self, manager: &ToolManager, value: Value) -> Option<Value> {
        if !value.is_object() { return Some(error(Value::Null,-32600,"object required")); }
        let id = value.get("id").cloned();
        if id.as_ref().is_some_and(|i| !i.is_string() && !i.is_number()) {
            return Some(error(Value::Null,-32600,"id must be string or number"));
        }
        let method = value.get("method").and_then(Value::as_str);
        if value["jsonrpc"] != "2.0" || method.is_none() {
            return Some(error(id.unwrap_or(Value::Null),-32600,"invalid JSON-RPC request"));
        }
        let method = method.unwrap_or_default();
        if id.is_none() {
            if method == "notifications/initialized" && self.initialized { self.ready = true; }
            return None;
        }
        let id = id.unwrap_or(Value::Null);
        let result = match method {
            "initialize" => {
                if self.initialized { return Some(error(id,-32600,"already initialized")); }
                let p = &value["params"];
                if !p["protocolVersion"].is_string() || !p["capabilities"].is_object() || !p["clientInfo"].is_object() {
                    return Some(error(id,-32602,"invalid initialize params"));
                }
                self.initialized = true;
                json!({"protocolVersion":"2025-06-18","capabilities":{"tools":{"listChanged":false}},
                    "serverInfo":{"name":"hexstrike-rust","version":env!("CARGO_PKG_VERSION")}})
            }
            "ping" => json!({}),
            _ if !self.ready => return Some(error(id,-32002,"initialize and initialized notification required")),
            "tools/list" => {
                if value["params"].get("cursor").is_some() { return Some(error(id,-32602,"unexpected cursor")); }
                json!({"tools":ToolManager::catalog()})
            }
            "tools/call" => {
                let Some(name) = value["params"]["name"].as_str() else { return Some(error(id,-32602,"name required")); };
                let args = value["params"].get("arguments").cloned().unwrap_or(json!({}));
                match manager.call("stdio-operator", name, args).await {
                    Ok(result) => json!({"content":[{"type":"text","text":result.to_string()}],"isError":false}),
                    Err(e) => json!({"content":[{"type":"text","text":e.to_string()}],"isError":true}),
                }
            }
            _ => return Some(error(id,-32601,"method not implemented")),
        };
        Some(json!({"jsonrpc":"2.0","id":id,"result":result}))
    }
}
pub async fn line<R: AsyncBufRead + Unpin>(reader: &mut R) -> Result<Option<Vec<u8>>> {
    let mut output = Vec::new();
    loop {
        let data = reader.fill_buf().await?;
        if data.is_empty() { return if output.is_empty() { Ok(None) } else { Err(Error::Invalid("unterminated JSON line".into())) }; }
        let n = data.iter().position(|b| *b == b'\n').map(|i|i+1).unwrap_or(data.len());
        let end = data[n-1] == b'\n';
        if output.len() + n > MAX_LINE { return Err(Error::OutputLimit); }
        output.extend_from_slice(&data[..n]); reader.consume(n);
        if end { return Ok(Some(output)); }
    }
}
pub async fn serve(manager: ToolManager) -> Result<()> {
    let mut input = BufReader::new(tokio::io::stdin()); let mut output = tokio::io::stdout();
    let mut session = Session::default();
    while let Some(bytes) = line(&mut input).await? {
        let response = match serde_json::from_slice(&bytes) {
            Ok(value) => session.handle(&manager,value).await,
            Err(_) => Some(error(Value::Null,-32700,"parse error")),
        };
        if let Some(value) = response { output.write_all(value.to_string().as_bytes()).await?;
            output.write_all(b"\n").await?; output.flush().await?; }
    }
    Ok(())
}
