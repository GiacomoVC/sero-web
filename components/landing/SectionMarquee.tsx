const ROW1_ITEMS = [
  'Taylor Swift 🎵',
  'House of the Dragon 🐉',
  'FC Barcelona ⚽',
  'One Piece 🏴‍☠️',
  'Succession 📺',
  'Coldplay 🎵',
  'Fórmula 1 🏎️',
  'Arcane 🎮',
  'Murakami 📚',
  'La La Land 🎬',
];

const ROW2_ITEMS = [
  'BTS 🎵',
  'Stranger Things 👾',
  'Real Madrid ⚽',
  'Attack on Titan ⚔️',
  'The Bear 🍳',
  'Bad Bunny 🎵',
  'Harry Potter ✨',
  'Breaking Bad 💊',
  'Studio Ghibli 🌿',
  'Radiohead 🎸',
];

export function SectionMarquee() {
  // Duplicate each list for seamless loop
  const row1 = [...ROW1_ITEMS, ...ROW1_ITEMS];
  const row2 = [...ROW2_ITEMS, ...ROW2_ITEMS];

  return (
    <section className="bg-ink py-14 overflow-hidden">
      <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-10">
        Tus mundos ahora tienen un lugar.
      </h2>

      {/* Row 1 — forward */}
      <div className="relative overflow-hidden mb-3">
        <div className="animate-ticker flex gap-3 w-max">
          {row1.map((item, idx) => (
            <span
              key={idx}
              className="bg-white/10 text-white/80 border border-white/10 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Row 2 — reverse */}
      <div className="relative overflow-hidden">
        <div className="animate-ticker-rev flex gap-3 w-max">
          {row2.map((item, idx) => (
            <span
              key={idx}
              className="bg-plum/30 text-lilac border border-plum/25 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
