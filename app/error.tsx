"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="content" className="narrow">
      <h1>Something went wrong</h1>
      <p>Please try again. Nothing was invented in its place — there is no reading to show.</p>
      <button className="btn gold" type="button" onClick={() => reset()}>
        Try again
      </button>
    </main>
  );
}
