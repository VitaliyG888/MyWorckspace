use axum::{Router, Json, extract::{State, DefaultBodyLimit}, http::{HeaderMap, StatusCode}, routing::{get, post}};
use serde::Deserialize;
use serde_json::{Value, json};
use std::sync::Arc;
use tokio::sync::Semaphore;
use crate::core::tool_manager::ToolManager;
#[derive(Clone)]
struct Api { manager: ToolManager, token: Arc<String>, permits: Arc<Semaphore> }
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Call { name: String, arguments: Value }
type Response = std::result::Result<Json<Value>, (StatusCode, Json<Value>)>;
fn equal(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() { return false; }
    a.iter().zip(b).fold(0u8, |acc, (a,b)| acc | (a ^ b)) == 0
}
fn auth(headers: &HeaderMap, state: &Api) -> std::result::Result<(), (StatusCode, Json<Value>)> {
    let token = headers.get("authorization").and_then(|h| h.to_str().ok()).and_then(|h| h.strip_prefix("Bearer "));
    if token.is_some_and(|t| equal(t.as_bytes(), state.token.as_bytes())) { Ok(()) }
    else { Err((StatusCode::UNAUTHORIZED, Json(json!({"error":"unauthorized"})))) }
}
async fn health(State(s): State<Api>, h: HeaderMap) -> Response { auth(&h,&s)?; Ok(Json(crate::utils::visual::status())) }
async fn tools(State(s): State<Api>, h: HeaderMap) -> Response { auth(&h,&s)?; Ok(Json(ToolManager::catalog())) }
async fn call(State(s): State<Api>, h: HeaderMap, Json(request): Json<Call>) -> Response {
    auth(&h,&s)?;
    let _permit = s.permits.try_acquire().map_err(|_| (StatusCode::TOO_MANY_REQUESTS,Json(json!({"error":"busy"}))))?;
    s.manager.call("local-operator", &request.name, request.arguments).await.map(Json)
        .map_err(|e| (StatusCode::BAD_REQUEST, Json(json!({"error":e.to_string()}))))
}
pub async fn serve(manager: ToolManager, token: String) -> anyhow::Result<()> {
    anyhow::ensure!(token.len() >= 32 && !token.trim().is_empty(), "API token must be at least 32 characters");
    let state = Api { manager, token: Arc::new(token), permits: Arc::new(Semaphore::new(8)) };
    let app = Router::new().route("/health", get(health)).route("/api/tools", get(tools))
        .route("/api/call", post(call)).layer(DefaultBodyLimit::max(64 * 1024)).with_state(state);
    // Single-user, localhost only. Remote deployment requires a separate TLS/authn gateway.
    let listener = tokio::net::TcpListener::bind("127.0.0.1:8888").await?;
    axum::serve(listener, app).with_graceful_shutdown(async { let _ = tokio::signal::ctrl_c().await; }).await?;
    Ok(())
}
