export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <section className="card relative animate-fade-up overflow-hidden p-6 sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(207,47,99,0.2),transparent_50%)]" />
        <div className="relative">
          <p className="eyebrow">Control center</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-white">Admin Dashboard</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Zonă rezervată pentru administrare — gestionarea utilizatorilor, a tranzacțiilor și a platformei Go-Out App.
          </p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          { title: "Utilizatori", desc: "Conturi de clienți și organizatori înregistrate pe platformă." },
          { title: "Tranzacții", desc: "Plăți și comenzi de bilete procesate în sistem." },
          { title: "Platformă", desc: "Sănătatea generală și activitatea evenimentelor." },
        ].map((item, index) => (
          <article
            key={item.title}
            className="card card-hover animate-fade-up p-6"
            style={{ animationDelay: `${index * 0.06}s` }}
          >
            <h2 className="font-display text-xl font-bold text-white">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{item.desc}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
