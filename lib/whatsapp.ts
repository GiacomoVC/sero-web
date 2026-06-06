// Use stable, well-supported emojis only.
// Avoid variation selectors (U+FE0F) and Unicode 14+ glyphs to prevent
// mojibake (Hola ï¿½ ...) on older devices and odd URL roundtrips.

const HAND = '\u{1F44B}'; // 👋
const NERD = '\u{1F913}'; // 🤓
const HEART = '\u{1F49C}'; // 💜 (purple — fits brand, no variation selector)
const POINT_DOWN = '\u{1F447}'; // 👇

export function buildWhatsAppMessage(opts: {
  url: string;
  /** Ordered tags from extractTags — specific items first, then category chips. */
  tags?: string[];
}): string {
  const tags = (opts.tags ?? []).filter(Boolean).slice(0, 3);

  let love: string;
  if (tags.length === 0) {
    love = 'algo que me apasiona';
  } else if (tags.length === 1) {
    love = tags[0];
  } else if (tags.length === 2) {
    love = `${tags[0]} y ${tags[1]}`;
  } else {
    love = `${tags[0]}, ${tags[1]} y ${tags[2]}`;
  }

  return [
    `Hola ${HAND}`,
    '',
    `No sé si sabías esto, pero me encanta ${love} ${NERD}${HEART}`,
    '',
    '¿Qué es eso que a ti te encanta y de lo que podrías hablar durante horas?',
    '',
    POINT_DOWN,
    opts.url,
    '',
    'Comparte lo que amas y Sero lo convertirá en experiencias con amigos.',
  ].join('\n');
}

export function whatsappShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
