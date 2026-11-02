import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-sm text-slate-400">This route does not exist in AI Website Studio.</p>
      <Link href="/" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[var(--color-primary)] px-5 text-sm">
        Back to projects
      </Link>
    </div>
  );
}
