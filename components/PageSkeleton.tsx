export default function PageSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-8 w-40 rounded-full bg-white/10 animate-pulse" />
        <div className="h-4 w-64 rounded-full bg-white/10 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          {Array.from({ length: cards }, (_, index) => (
            <div key={index} className="rounded-2xl border border-white/10 p-5 space-y-3">
              <div className="flex gap-4">
                <div className="h-20 w-20 rounded-full bg-white/10 animate-pulse" />
                <div className="flex-1 space-y-2 pt-2">
                  <div className="h-4 w-32 rounded-full bg-white/10 animate-pulse" />
                  <div className="h-3 w-24 rounded-full bg-white/10 animate-pulse" />
                </div>
              </div>
              <div className="h-3 w-full rounded-full bg-white/10 animate-pulse" />
              <div className="h-3 w-4/5 rounded-full bg-white/10 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
