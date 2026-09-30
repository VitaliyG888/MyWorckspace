use thiserror::Error;
#[derive(Debug, Error)]
pub enum Error {
    #[error("denied: {0}")] Denied(String),
    #[error("invalid request: {0}")] Invalid(String),
    #[error("execution deadline exceeded")] Timeout,
    #[error("output limit exceeded")] OutputLimit,
    #[error("not implemented: {0}")] Unsupported(String),
    #[error(transparent)] Io(#[from] std::io::Error),
    #[error(transparent)] Json(#[from] serde_json::Error),
}
pub type Result<T> = std::result::Result<T, Error>;
