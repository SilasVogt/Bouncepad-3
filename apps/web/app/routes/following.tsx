import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/following")({
  component: Following,
});

function Following() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-4xl font-bold">Following</h1>
      <p className="mt-4 text-[var(--muted)]">Streams from people you follow</p>
    </div>
  );
}
