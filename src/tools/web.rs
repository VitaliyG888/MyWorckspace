use std::collections::BTreeSet;
use crate::utils::error::{Error, Result};
pub fn normalize_urls(items: &[String]) -> Result<Vec<String>> {
    if items.len() > 1000 { return Err(Error::Invalid("at most 1000 URLs".into())); }
    let mut out = BTreeSet::new();
    for s in items {
        if s.len() > 4096 { return Err(Error::Invalid("URL too long".into())); }
        let mut u = url::Url::parse(s).map_err(|_| Error::Invalid("invalid URL".into()))?;
        if !["http", "https"].contains(&u.scheme()) || u.host_str().is_none() ||
            !u.username().is_empty() || u.password().is_some() {
            return Err(Error::Invalid("HTTP(S), no embedded credentials".into()));
        }
        u.set_fragment(None); out.insert(u.to_string());
    }
    Ok(out.into_iter().collect())
}
// No network requests. Query order, duplicate keys and path case are intentionally preserved.
