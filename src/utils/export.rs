use crate::{agents::osint::OsintReport, utils::error::{Error, Result}};
pub fn json(report: &OsintReport) -> Result<String> { Ok(serde_json::to_string_pretty(report)?) }
fn escape(s: &str) -> String { s.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;").replace('"', "&quot;").replace('\'', "&apos;") }
pub fn xml(report: &OsintReport) -> Result<String> {
    let data = json(report)?;
    if data.chars().any(|c| (c < ' ' && !['\t','\r','\n'].contains(&c)) || c == '\u{fffe}' || c == '\u{ffff}') {
        return Err(Error::Invalid("XML 1.0 invalid character".into()));
    }
    Ok(format!("<?xml version=\"1.0\" encoding=\"UTF-8\"?><osint-report><json>{}</json></osint-report>", escape(&data)))
}
pub fn sarif(report: &OsintReport) -> Result<String> {
    // OSINT observations are not vulnerabilities. Keep results empty until verified findings exist.
    Ok(serde_json::to_string_pretty(&serde_json::json!({
        "$schema":"https://json.schemastore.org/sarif-2.1.0.json", "version":"2.1.0",
        "runs":[{"tool":{"driver":{"name":"hexstrike-rust","version":env!("CARGO_PKG_VERSION")}},
            "results":[],"properties":{"osint_report":report,"unverified_observations":true}}]
    }))?)
}
