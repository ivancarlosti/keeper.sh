import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center flex-1 gap-4">
      <h1 className="text-2xl font-semibold text-zinc-900">Page not found</h1>
      <p className="text-zinc-500">The page you're looking for doesn't exist.</p>
      <Link
        href="/"
        className="text-zinc-900 font-medium hover:underline"
      >
        Go home
      </Link>
    </main>
  );
}
