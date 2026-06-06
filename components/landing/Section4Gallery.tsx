const ITEMS = [
  { emoji: '🍕', label: 'Tolkien',         tilt: '-2deg' },
  { emoji: '🎬', label: 'Studio Ghibli',   tilt: '2deg'  },
  { emoji: '📺', label: 'Stranger Things', tilt: '-1deg' },
  { emoji: '🎸', label: 'Arctic Monkeys',  tilt: '3deg'  },
  { emoji: '⚽', label: 'Fútbol peruano',  tilt: '-3deg' },
  { emoji: '📚', label: 'Historia romana', tilt: '1deg'  },
  { emoji: '🏎',  label: 'Fórmula 1',       tilt: '-2deg' },
  { emoji: '🧙', label: 'Fantasía épica',  tilt: '2deg'  },
  { emoji: '🎮', label: 'Zelda',            tilt: '-1deg' },
  { emoji: '🎭', label: 'Teatro musical',  tilt: '3deg'  },
];

function Row() {
  return (
    <div className="flex gap-5 pr-5 shrink-0">
      {ITEMS.map((it) => (
        <div
          key={it.label}
          className="shrink-0 rounded-2xl bg-cream border border-ink/10 px-6 py-4 flex items-center gap-3 shadow-[0_6px_0_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform"
          style={{ transform: `rotate(${it.tilt})` }}
        >
          <span className="text-3xl">{it.emoji}</span>
          <span className="font-semibold text-ink whitespace-nowrap">{it.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Section4Gallery() {
  return (
    <section className="relative py-28 sm:py-36 bg-plum text-cream overflow-hidden">
      {/* Decorative blob */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-coral/30 rounded-full blur-3xl animate-blob-slow pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-coral/20 rounded-full blur-3xl animate-blob pointer-events-none" />

      <div className="relative px-6 text-center mb-14">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
          Cada mundo ahora tiene un lugar.
        </h2>
      </div>

      {/* Marquee row 1 → */}
      <div className="relative w-full">
        <div className="flex w-max animate-marquee">
          <Row />
          <Row />
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-plum to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-plum to-transparent" />
      </div>

      {/* Marquee row 2 ← reverse */}
      <div className="relative w-full mt-6">
        <div
          className="flex w-max animate-marquee"
          style={{ animationDirection: 'reverse', animationDuration: '36s' }}
        >
          <Row />
          <Row />
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-plum to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-plum to-transparent" />
      </div>
    </section>
  );
}
