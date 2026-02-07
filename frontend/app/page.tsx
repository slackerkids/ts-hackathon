export default function Home() {
  return (
    <div className="px-4 pt-6 space-y-6">
      {/* Hero Section */}
      <section className="bg-secondary-bg rounded-2xl p-5 space-y-2">
        <h1 className="text-xl font-bold">TS Community OS</h1>
        <p className="text-hint text-sm">
          Your digital hub for Tomorrow School life
        </p>
        <div className="flex gap-3 pt-2">
          <div className="bg-background rounded-xl px-4 py-3 flex-1 text-center">
            <p className="text-2xl font-bold text-link">--</p>
            <p className="text-xs text-hint">Rank</p>
          </div>
          <div className="bg-background rounded-xl px-4 py-3 flex-1 text-center">
            <p className="text-2xl font-bold text-link">--</p>
            <p className="text-xs text-hint">Coins</p>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Latest News</h2>
        <div className="space-y-2">
          <NewsCard
            tag="#Official"
            title="Welcome to TS Community OS"
            preview="The new digital platform for our school community is now live."
          />
          <NewsCard
            tag="#Hackathon"
            title="Hackathon Registration Open"
            preview="Join the upcoming hackathon and build something amazing."
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <ActionCard title="Student Gov" icon="🏛️" />
          <ActionCard title="Clubs" icon="👥" />
          <ActionCard title="Hackathons" icon="🏆" />
          <ActionCard title="Profile" icon="👤" />
        </div>
      </section>
    </div>
  );
}

function NewsCard({
  tag,
  title,
  preview,
}: {
  tag: string;
  title: string;
  preview: string;
}) {
  return (
    <div className="bg-secondary-bg rounded-xl p-4 space-y-1">
      <span className="text-xs text-link font-medium">{tag}</span>
      <h3 className="font-semibold text-sm">{title}</h3>
      <p className="text-xs text-hint">{preview}</p>
    </div>
  );
}

function ActionCard({ title, icon }: { title: string; icon: string }) {
  return (
    <button className="bg-secondary-bg rounded-xl p-4 flex flex-col items-center gap-2 hover:opacity-80 transition-opacity">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium">{title}</span>
    </button>
  );
}
