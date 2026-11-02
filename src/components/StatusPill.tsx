export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "ready" || status === "ok" || status === "connected" || status === "completed"
      ? "bg-emerald-500/15 text-emerald-200"
      : status === "failed" || status === "error"
        ? "bg-red-500/15 text-red-200"
        : status === "requires-setup" || status === "untested"
          ? "bg-amber-500/15 text-amber-200"
          : "bg-white/10 text-slate-200";
  return <span className={`rounded-full px-2.5 py-1 text-xs capitalize ${tone}`}>{status}</span>;
}
