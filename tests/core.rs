use hexstrike_rust::{core::{decision_engine::{Policy, Scope, Action, Risk}, tool_manager::ToolManager, cache::ResultCache}, tools::web::normalize_urls, server::mcp::Session};
use serde_json::json;
fn policy() -> Policy { Policy { scope: Scope { domains: ["example.com".into()].into(), include_subdomains: true }, max_steps: 4 } }
fn manager() -> ToolManager { ToolManager { policy: policy(), cache: ResultCache::default() } }
#[test] fn domain_boundary() {
    let p=policy(); assert!(p.scope.allows("WWW.Example.com."));
    for t in ["example.com.evil.test","badexample.com","example.com;id","127.0.0.1","https://example.com","a..example.com"] { assert!(!p.scope.allows(t),"{t}"); }
}
#[test] fn consent_and_tool_classification() {
    let p=policy(); let a=Action { tool:"osint_whois".into(),target:"example.com".into(),risk:Risk::PassiveExternal };
    assert!(p.authorize_read(&a,false).is_err()); assert!(p.authorize_read(&a,true).is_ok());
    assert!(p.authorize_read(&Action {tool:"osint_config_set".into(),..a},true).is_err());
}
#[test] fn normalize_without_destroying_semantics() {
    let values=["https://EXAMPLE.com:443/a?b=2&a=1#f".into(),"https://example.com/a?b=2&a=1".into()];
    assert_eq!(normalize_urls(&values).unwrap(),vec!["https://example.com/a?b=2&a=1"]);
    assert!(normalize_urls(&["file:///etc/passwd".into()]).is_err());
    assert!(normalize_urls(&["https://u:p@example.com".into()]).is_err());
}
#[test] fn request_budgets() { assert!(normalize_urls(&vec!["https://example.com".into();1001]).is_err()); }
#[tokio::test] async fn reject_extra_arguments() {
    assert!(manager().call("test","normalize_urls",json!({"urls":[],"command":"ignored"})).await.is_err());
    assert!(manager().call("test","nmap",json!({})).await.is_err());
}
#[tokio::test] async fn mcp_lifecycle() {
    let mut s=Session::default(); let m=manager();
    let r=s.handle(&m,json!({"jsonrpc":"2.0","id":1,"method":"tools/list"})).await.unwrap();
    assert_eq!(r["error"]["code"],-32002);
    let r=s.handle(&m,json!({"jsonrpc":"2.0","id":2,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"test","version":"1"}}})).await.unwrap();
    assert_eq!(r["result"]["protocolVersion"],"2025-06-18");
    assert!(s.handle(&m,json!({"jsonrpc":"2.0","method":"notifications/initialized"})).await.is_none());
    let r=s.handle(&m,json!({"jsonrpc":"2.0","id":3,"method":"tools/list"})).await.unwrap();
    assert_eq!(r["result"]["tools"].as_array().unwrap().len(),2);
}
#[tokio::test] async fn osint_fixture() {
    let report=hexstrike_rust::agents::osint::investigate(&policy(),&hexstrike_rust::agents::osint::FixtureOsint,
        &hexstrike_rust::ai::llm::EvidenceSummary,"example.com",true).await.unwrap();
    assert_eq!(report.evidence.len(),2);
    let sarif:serde_json::Value=serde_json::from_str(&hexstrike_rust::utils::export::sarif(&report).unwrap()).unwrap();
    assert_eq!(sarif["runs"][0]["results"],json!([]));
}
#[tokio::test] async fn bounded_output() {
    let bytes=&b"12345"[..]; assert!(hexstrike_rust::core::process::read_bounded(bytes,4).await.is_err());
}
#[tokio::test] async fn bounded_mcp_frame() {
    let data=vec![b'x';65537]; let mut r=tokio::io::BufReader::new(&data[..]);
    assert!(hexstrike_rust::server::mcp::line(&mut r).await.is_err());
}
#[tokio::test] async fn rejects_partial_mcp_line() {
    let mut r=tokio::io::BufReader::new(&b"{}"[..]); assert!(hexstrike_rust::server::mcp::line(&mut r).await.is_err());
}
#[cfg(unix)]
#[tokio::test] async fn process_fixture() {
    let out=hexstrike_rust::core::process::Executor::default().fixture().await.unwrap();
    assert_eq!(out.stdout,"hexstrike-fixture"); assert_eq!(out.code,Some(0));
}
