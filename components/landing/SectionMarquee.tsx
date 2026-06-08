import { Confetti } from '@/components/ui/Confetti';
import { StickerNote } from '@/components/ui/StickerNote';

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

// Cycled pastel palette for chips
const CHIP_STYLES = [
  'bg-peach text-[#B33E2E] border-[#FFB8A6]/60',
  'bg-lavender text-[#5B2D82] border-[#C9B3E8]/60',
  'bg-butter text-[#8A6A1A] border-[#F2CF6A]/60',
  'bg-mint text-[#1F6E3C] border-[#A8D8B9]/60',
  'bg-sky text-[#2A5685] border-[#A8C8E8]/60',
];

const chip = (i: number) => CHIP_STYLES[i % CHIP_STYLES.length];

export function SectionMarquee() {
  const row1 = [...ROW1_ITEMS, ...ROW1_ITEMS];
  const row2 = [...ROW2_ITEMS, ...ROW2_ITEMS];

  return (
    <section className="relative bg-cream py-20 overflow-hidden border-y border-ink/5">
      <Confetti density="light" />

      <div className="relative z-10 text-center mb-10 px-6">
        <p className="text-sm font-bold tracking-widest text-coral uppercase">
          Lo que ya está aquí
        </p>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-ink mt-3">
          Tus mundos ahora tienen un lugar.
        </h2>

        {/* Floating sticker, right-aligned */}
        <div className="hidden sm:block absolute -top-2 right-[6%]">
          <StickerNote color="peach" tilt={6} arrow="down-left">
            todo lo<br />que amas ♡
          </StickerNote>
        </div>
      </div>

      {/* Row 1 — forward, with edge fades */}
      <div className="relative overflow-hidden mb-3 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="animate-ticker flex gap-3 w-max">
          {row1.map((item, idx) => (
            <span
              key={idx}
              className={`rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap shadow-sm ${chip(idx)}`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Row 2 — reverse */}
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="animate-ticker-rev flex gap-3 w-max">
          {row2.map((item, idx) => (
            <span
              key={idx}
              className={`rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap shadow-sm ${chip(idx + 2)}`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
