import Link from 'next/link';

const CAROUSELS: { slug: string; title: string; subtitle: string; slides: { slug: string; label: string }[] }[] = [
  {
    slug: 'como-funciona',
    title: 'Cómo funciona',
    subtitle: '3 slides · basado en sección 3 del website',
    slides: [
      { slug: 'como-funciona-1', label: 'Slide 1 · Cuéntanos qué amas' },
      { slug: 'como-funciona-2', label: 'Slide 2 · Invita a tus amigos' },
      { slug: 'como-funciona-3', label: 'Slide 3 · Vive mejores planes' },
    ],
  },
  {
    slug: 'principios',
    title: 'Principios de Sero',
    subtitle: '1 slide · anti-date, solo amistad',
    slides: [
      { slug: 'principios-1', label: 'Único slide' },
    ],
  },
  {
    slug: 'cena-sero',
    title: 'Cena Sero',
    subtitle: '4 slides · usa tus fotos en public/ig-posts/{pizza.jpg, terraza.jpg}',
    slides: [
      { slug: 'cena-sero-1', label: 'Slide 1 · Foto pizza' },
      { slug: 'cena-sero-2', label: 'Slide 2 · Pizza blur + título' },
      { slug: 'cena-sero-3', label: 'Slide 3 · Foto terraza' },
      { slug: 'cena-sero-4', label: 'Slide 4 · Terraza blur + texto' },
    ],
  },
  {
    slug: 'brand',
    title: 'Marca · why',
    subtitle: '1 slide · core belief',
    slides: [
      { slug: 'brand-1', label: 'Único slide' },
    ],
  },
];

export default function IgPostsIndex() {
  return (
    <main className="min-h-screen bg-ink text-white px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black tracking-tight">Posts de IG</h1>
        <p className="text-white/60 text-sm mt-2 max-w-xl">
          Cada slide es una página separada que renderea a 1080×1440 exacto. Abre cada una y
          tap el botón <b>Descargar PNG</b> para bajar el archivo. Para Cena Sero, copia tus 2
          fotos a <code className="px-1.5 py-0.5 bg-white/10 rounded">public/ig-posts/pizza.jpg</code> y{' '}
          <code className="px-1.5 py-0.5 bg-white/10 rounded">public/ig-posts/terraza.jpg</code> antes
          de exportar.
        </p>

        <div className="mt-10 space-y-10">
          {CAROUSELS.map((c) => (
            <section key={c.slug}>
              <h2 className="text-xl font-bold">{c.title}</h2>
              <p className="text-white/50 text-sm">{c.subtitle}</p>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {c.slides.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/ig-posts/${s.slug}`}
                    className="rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-5 text-sm text-center transition-colors"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
