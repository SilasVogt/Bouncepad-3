import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/search")({
  component: Search,
});

function Search() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-4xl font-bold">Search</h1>
      <p className="mt-4 text-[var(--muted)]">Find streams and creators</p>
    </div>
  );
}
