// Use stable, well-supported emojis only.
// Avoid variation selectors (U+FE0F) and Unicode 14+ glyphs to prevent
// mojibake (Hola � ...) on older devices and odd URL roundtrips.

const HAND = '\u{1F44B}'; // 👋
const NERD = '\u{1F913}'; // 🤓
const HEART = '\u{1F49C}'; // 💜 (purple — fits brand, no variation selector)
const POINT_DOWN = '\u{1F447}'; // 👇

export function buildWhatsAppMessage(opts: {
  url: string;
  loveExample?: string;
}): string {
  const love = (opts.loveExample || 'algo que me apasiona').trim();
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
