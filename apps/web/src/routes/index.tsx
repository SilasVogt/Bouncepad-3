import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold motion-preset-slide-down">
        Bouncepad
      </h1>
      <p className="mt-4 text-xl text-gray-400 motion-preset-fade motion-delay-200">
        RSS-based livestreaming platform
      </p>
    </div>
  );
}
