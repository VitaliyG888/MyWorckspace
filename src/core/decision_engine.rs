use serde::{Deserialize, Serialize};
use std::collections::BTreeSet;
use crate::utils::error::{Error, Result};

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct Scope {
    pub domains: BTreeSet<String>,
    pub include_subdomains: bool,
}
pub fn canonical_domain(value: &str) -> Result<String> {
    let s = value.trim_end_matches('.').to_ascii_lowercase();
    if s.len() > 253 || s.parse::<std::net::IpAddr>().is_ok() || !s.contains('.') ||
        s.split('.').any(|l| l.is_empty() || l.len() > 63 || l.starts_with('-') ||
            l.ends_with('-') || !l.bytes().all(|b| b.is_ascii_alphanumeric() || b == b'-')) {
        return Err(Error::Invalid("expected DNS domain in ASCII/punycode".into()));
    }
    Ok(s)
}
impl Scope {
    pub fn allows(&self, target: &str) -> bool {
        let Ok(t) = canonical_domain(target) else { return false; };
        self.domains.iter().filter_map(|d| canonical_domain(d).ok()).any(|d|
            t == d || (self.include_subdomains && t.ends_with(&format!(".{d}"))))
    }
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Risk { Offline, PassiveExternal, Active, Credential, Exploit }
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Action { pub tool: String, pub target: String, pub risk: Risk }
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Plan { pub actions: Vec<Action>, pub executed: bool, pub approval_required: bool }
#[derive(Clone)]
pub struct Policy { pub scope: Scope, pub max_steps: usize }
impl Policy {
    pub fn plan_osint(&self, target: &str) -> Result<Plan> {
        let target = canonical_domain(target)?;
        if !self.scope.allows(&target) { return Err(Error::Denied("out of configured scope".into())); }
        let actions = ["osint_whois", "osint_cert_transparency"].iter().map(|name|
            Action { tool: name.to_string(), target: target.clone(), risk: Risk::PassiveExternal }
        ).collect::<Vec<_>>();
        if actions.len() > self.max_steps { return Err(Error::Denied("step budget exhausted".into())); }
        Ok(Plan { actions, executed: false, approval_required: true })
    }
    pub fn authorize_read(&self, action: &Action, consent: bool) -> Result<()> {
        // Tool classification is server-owned, never inferred from model-supplied risk.
        if !["osint_whois", "osint_cert_transparency"].contains(&action.tool.as_str()) ||
            action.risk != Risk::PassiveExternal || !consent || !self.scope.allows(&action.target) {
            return Err(Error::Denied("passive capability, scoped target and local consent required".into()));
        }
        Ok(())
    }
}
