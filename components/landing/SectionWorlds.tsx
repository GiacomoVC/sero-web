interface WorldCard {
  emoji:   string;
  title:   string;
  sub:     string;
  count:   string;
  bg:      string;
  accent:  string;
}

const WORLDS: WorldCard[] = [
  {
    emoji:  '🎵',
    title:  'Música',
    sub:    'Artistas, géneros, conciertos',
    count:  '2.4k personas',
    bg:     '#FFF0EF',
    accent: '#FF6B5E',
  },
  {
    emoji:  '📺',
    title:  'Series',
    sub:    'Maratones, estrenos, fandoms',
    count:  '1.8k personas',
    bg:     '#F0EDFF',
    accent: '#5B2D82',
  },
  {
    emoji:  '🎬',
    title:  'Películas',
    sub:    'Clásicos, indie, blockbusters',
    count:  '1.2k personas',
    bg:     '#FFF7ED',
    accent: '#FF8A3D',
  },
  {
    emoji:  '⚽',
    title:  'Deportes',
    sub:    'Equipos, ligas, partidos',
    count:  '3.1k personas',
    bg:     '#EDFFF5',
    accent: '#37C978',
  },
  {
    emoji:  '📚',
    title:  'Libros',
    sub:    'Géneros, autores, clubes',
    count:  '0.9k personas',
    bg:     '#FFF0EF',
    accent: '#FF6B5E',
  },
  {
    emoji:  '🎮',
    title:  'Gaming',
    sub:    'PC, consola, mobile, torneos',
    count:  '1.5k personas',
    bg:     '#F0EDFF',
    accent: '#5B2D82',
  },
];

export function SectionWorlds() {
  return (
    <section className="bg-white py-24 sm:py-32 px-6">
      {/* Heading */}
      <div className="text-center mb-16">
        <p className="text-sm font-bold tracking-widest text-coral uppercase">
          Tus mundos
        </p>
        <h2 className="text-4xl sm:text-6xl font-black text-ink tracking-tight mt-3">
          ¿Qué te mueve?
        </h2>
        <p className="text-ink/50 mt-4 text-lg max-w-xl mx-auto">
          Hay gente en Lima lista para conectar contigo en lo que más te importa.
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
        {WORLDS.map((w) => (
          <div
            key={w.title}
            className="rounded-3xl p-6 sm:p-8 cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{ backgroundColor: w.bg }}
          >
            <span className="text-4xl">{w.emoji}</span>
            <h3 className="text-xl font-bold text-ink mt-4">{w.title}</h3>
            <p className="text-sm text-ink/50 mt-1">{w.sub}</p>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full mt-4 inline-block"
              style={{
                backgroundColor: `${w.accent}26`,
                color: w.accent,
              }}
            >
              {w.count}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
