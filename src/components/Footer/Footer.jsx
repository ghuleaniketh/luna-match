export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#09090b]/80">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 sm:px-10 md:grid-cols-[1.4fr_1fr] md:px-16 md:py-12">
        <div className="max-w-sm">
          <a
            href="#overview"
            className="text-sm font-semibold uppercase tracking-[0.18em] text-white"
          >
            LUNA-MATCH
          </a>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Finding the same place on the Moon, even when the light changes.
          </p>
        </div>

        <div className="flex flex-col justify-between gap-6 md:items-end">
          <span className="inline-flex items-center gap-2 text-xs text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.7)]" />
            Lunar correspondence research
          </span>
          <p className="text-xs text-slate-600 md:text-right">
            © {year} LUNA-MATCH
          </p>
        </div>
      </div>
    </footer>
  );
}
