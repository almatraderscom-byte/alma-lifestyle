export default function HomeLoading() {
  return (
    <div className="min-h-[70vh] bg-warm-white">
      <div className="mx-auto max-w-7xl px-4 py-8 animate-pulse">
        <div className="h-8 w-48 rounded bg-cream" />
        <div className="mt-6 h-[420px] rounded-xl bg-cream" />
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-lg bg-cream" />
          ))}
        </div>
      </div>
    </div>
  );
}
