import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Hello — A Simple Web Page" },
      { name: "description", content: "A simple, clean web page built with care." },
    ],
  }),
});

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <section className="max-w-2xl text-center space-y-6">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Welcome
        </p>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">
          Hello, world.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          This is a simple web page. Clean, calm, and ready for whatever you
          want to build next.
        </p>
        <div className="flex items-center justify-center gap-3 pt-4">
          <a
            href="#get-started"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get started
          </a>
          <a
            href="#learn-more"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            Learn more
          </a>
        </div>
      </section>
    </main>
  );
}
