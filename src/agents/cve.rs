use serde::{Deserialize, Serialize};
#[derive(Debug, Deserialize, Serialize)]
pub struct CveEvidence { pub id: String, pub affected_version: String, pub source_url: String, pub confirmed: bool }
// Evidence schema only. No live CVE feed or invented CVE data.
