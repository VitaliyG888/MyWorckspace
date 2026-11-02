import { lookup } from "dns/promises";
import { isIP } from "net";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.google.com",
]);

function isPrivateIp(ip: string): boolean {
  if (ip === "127.0.0.1" || ip === "::1" || ip === "0.0.0.0") return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("169.254.")) return true;
  const match = ip.match(/^172\.(\d+)\./);
  if (match) {
    const octet = Number(match[1]);
    if (octet >= 16 && octet <= 31) return true;
  }
  return false;
}

export async function assertSafeProviderUrl(raw: string, allowLocal: boolean): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid provider URL");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Only http and https URLs are allowed");
  }
  const host = url.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(host) && !allowLocal) {
    throw new Error("This host is blocked to prevent SSRF");
  }
  if (host.endsWith(".internal") || host.endsWith(".local")) {
    if (!allowLocal) throw new Error("Internal hosts are blocked");
  }
  if (allowLocal) return url;
  const ip = isIP(host) ? host : (await lookup(host)).address;
  if (isPrivateIp(ip)) {
    throw new Error("Private network endpoints require trusted local LLM mode");
  }
  return url;
}
