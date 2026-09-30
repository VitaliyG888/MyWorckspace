//! Unix fixture executor only. Not a general shell/tool execution endpoint.
use crate::utils::error::{Error, Result};
use serde::Serialize;
use std::{process::Stdio, sync::Arc, time::Duration};
use tokio::{io::{AsyncRead, AsyncReadExt}, sync::Semaphore};
#[derive(Debug, Serialize)]
pub struct Output { pub code: Option<i32>, pub stdout: String, pub stderr: String }
#[derive(Clone)]
pub struct Executor { permits: Arc<Semaphore> }
impl Default for Executor { fn default() -> Self { Self { permits: Arc::new(Semaphore::new(4)) } } }
pub async fn read_bounded<R: AsyncRead + Unpin>(mut reader: R, cap: usize) -> Result<Vec<u8>> {
    let mut out = Vec::new(); let mut buf = [0u8; 4096];
    loop { let n = reader.read(&mut buf).await?; if n == 0 { return Ok(out); }
        if out.len().saturating_add(n) > cap { return Err(Error::OutputLimit); }
        out.extend_from_slice(&buf[..n]); }
}
#[cfg(unix)]
struct Group(i32);
#[cfg(unix)]
impl Drop for Group {
    fn drop(&mut self) { let _ = nix::sys::signal::killpg(nix::unistd::Pid::from_raw(self.0), nix::sys::signal::Signal::SIGKILL); }
}
impl Executor {
    /// Fixed, harmless argv; production adapters require independent typed schemas and isolation.
    #[cfg(unix)]
    pub async fn fixture(&self) -> Result<Output> {
        use std::os::unix::process::CommandExt;
        let _permit = tokio::time::timeout(Duration::from_secs(1), self.permits.acquire()).await
            .map_err(|_| Error::Timeout)?.map_err(|_| Error::Denied("executor closed".into()))?;
        let mut command = tokio::process::Command::new("/usr/bin/printf");
        command.args(["%s", "hexstrike-fixture"]).env_clear().current_dir("/")
            .stdin(Stdio::null()).stdout(Stdio::piped()).stderr(Stdio::piped()).kill_on_drop(true);
        command.as_std_mut().process_group(0);
        let mut child = command.spawn()?;
        let group = Group(child.id().ok_or_else(|| Error::Invalid("missing child pid".into()))? as i32);
        let stdout = child.stdout.take().ok_or_else(|| Error::Invalid("stdout unavailable".into()))?;
        let stderr = child.stderr.take().ok_or_else(|| Error::Invalid("stderr unavailable".into()))?;
        let work = async { tokio::try_join!(read_bounded(stdout, 8192), read_bounded(stderr, 8192),
            async { child.wait().await.map_err(Error::Io) }) };
        let result = tokio::time::timeout(Duration::from_secs(2), work).await;
        drop(group); // Also kill descendants on timeout, overflow and normal completion.
        let _ = child.kill().await; let _ = child.wait().await;
        match result {
            Ok(Ok((out, err, status))) => Ok(Output { code: status.code(),
                stdout: String::from_utf8_lossy(&out).into(), stderr: String::from_utf8_lossy(&err).into() }),
            Ok(Err(e)) => Err(e), Err(_) => Err(Error::Timeout),
        }
    }
    #[cfg(not(unix))]
    pub async fn fixture(&self) -> Result<Output> { Err(Error::Unsupported("Unix process groups required".into())) }
}
// Process groups alone are not a sandbox: descendants can setsid(). Use cgroups/containers in production.
