use crate::{core::decision_engine::{Policy, Plan}, utils::error::Result};
pub fn plan(policy: &Policy, target: &str) -> Result<Plan> { policy.plan_osint(target) }
// Passive planning only; no automatic exploitation, submissions or scope expansion.
