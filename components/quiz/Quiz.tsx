'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '../ui/Logo';
import { ProgressBar } from './ProgressBar';
import { CATEGORIES, MAX_WORLDS, SPORTS, WORLDS } from '@/lib/worlds';
import type {
  AnimeMangaPref,
  Dietary,
  DiningStyle,
  ExpPreference,
  QuizResponses,
  Sport,
  SubmitResult,
  World,
} from '@/lib/types';
import { ShareScreen } from './ShareScreen';

type Step =
  | { kind: 'personal' }
  | { kind: 'worlds' }
  | { kind: 'world'; world: Exclude<World, 'otros'> }
  | { kind: 'closing' };

function emptyResponses(): QuizResponses {
  return {
    firstName: '',
    lastName: '',
    age: '',
    whatsapp: '',
    selectedWorlds: [],
    diningStyle: 'depende',
    dietary: 'ninguna',
    expPreference: 'cualquiera',
  };
}

export function Quiz({ referredBy }: { referredBy?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const refFromQuery = params.get('ref') || undefined;
  const ref = referredBy || refFromQuery;

  const [stepIdx, setStepIdx] = useState(0);
  const [q, setQ] = useState<QuizResponses>(() => ({
    ...emptyResponses(),
    referredBy: ref,
  }));
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Build the list of steps dynamically based on selected worlds
  const steps: Step[] = useMemo(() => {
    const base: Step[] = [{ kind: 'personal' }, { kind: 'worlds' }];
    const worldSteps: Step[] = WORLDS.filter((w) =>
      q.selectedWorlds.includes(w.id)
    )
      .filter((w): w is typeof w & { id: Exclude<World, 'otros'> } => w.id !== 'otros')
      .map((w) => ({ kind: 'world' as const, world: w.id }));
    return [...base, ...worldSteps, { kind: 'closing' }];
  }, [q.selectedWorlds]);

  const totalSteps = steps.length;
  const current = steps[stepIdx];
  const progress = (stepIdx + 1) / (totalSteps + 1); // +1 to leave headroom for share

  const update = <K extends keyof QuizResponses>(
    key: K,
    value: QuizResponses[K]
  ) => setQ((prev) => ({ ...prev, [key]: value }));

  const updateWorld = <W extends Exclude<World, 'otros'>>(
    w: W,
    patch: Partial<NonNullable<QuizResponses[W]>>
  ) => {
    setQ((prev) => ({
      ...prev,
      [w]: { ...(prev[w] as object), ...patch },
    }) as QuizResponses);
  };

  const canAdvance = (): boolean => {
    if (!current) return false;
    if (current.kind === 'personal') {
      return (
        q.firstName.trim().length > 0 &&
        q.lastName.trim().length > 0 &&
        q.age.trim().length > 0 &&
        q.whatsapp.trim().length > 0
      );
    }
    if (current.kind === 'worlds') {
      if (q.selectedWorlds.length === 0) return false;
      // Si marcó "Otros mundos", debe escribir en el textarea Y tener al menos 1 mundo más
      if (q.selectedWorlds.includes('otros')) {
        if (!q.otrosMundos?.trim()) return false;
        if (q.selectedWorlds.filter((w) => w !== 'otros').length === 0) return false;
      }
      return true;
    }
    if (current.kind === 'closing') return true;
    if (current.kind === 'world') {
      const w = current.world;
      switch (w) {
        case 'musica':
          // topArtists es opcional ("puedes saltar")
          return !!(q.musica?.categories?.length);
        case 'series':
          // rewatch es opcional
          return !!(q.series?.categories?.length && q.series?.recent?.trim());
        case 'peliculas':
          // favorites es opcional
          return !!(q.peliculas?.categories?.length && q.peliculas?.recent?.trim());
        case 'anime':
          // favorites es opcional
          return !!(
            q.anime?.categories?.length &&
            q.anime?.preference &&
            q.anime?.current?.trim()
          );
        case 'libros':
          // topBooks es opcional
          return !!(q.libros?.categories?.length && q.libros?.recent?.trim());
        case 'deportes':
          if (!q.deportes?.selected?.length) return false;
          if (q.deportes.selected.includes('otros') && !q.deportes.otros?.trim())
            return false;
          return true;
        case 'videojuegos':
          // favorites es opcional
          return !!(q.videojuegos?.categories?.length);
      }
    }
    return true;
  };

  const next = async () => {
    if (!canAdvance()) return;
    if (stepIdx < totalSteps - 1) {
      setStepIdx((i) => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // submit
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(q),
      });
      if (!res.ok) throw new Error('No pudimos guardar tu respuesta.');
      const data: SubmitResult = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setSubmitting(false);
    }
  };

  const back = () => {
    if (stepIdx > 0) {
      setStepIdx((i) => i - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/');
    }
  };

  if (result) {
    return <ShareScreen result={result} firstName={q.firstName} />;
  }

  return (
    <div className="min-h-[100svh] flex flex-col bg-cream">
      <header className="px-6 pt-8 sm:pt-12 max-w-2xl w-full mx-auto">
        <div className="flex flex-col items-center gap-3">
          <Logo width={180} priority />
          <p className="text-ink/60 text-sm tracking-wide">
            Mismos gustos, mejores planes.
          </p>
        </div>
        <div className="mt-8">
          <ProgressBar value={progress} />
        </div>
      </header>

      <main className="flex-1 px-6 py-10 max-w-2xl w-full mx-auto">
        <div key={stepIdx} className="animate-step-in">
          {current?.kind === 'personal' && (
            <PersonalStep q={q} update={update} />
          )}
          {current?.kind === 'worlds' && <WorldsStep q={q} update={update} />}
          {current?.kind === 'world' && (
            <WorldStep world={current.world} q={q} updateWorld={updateWorld} />
          )}
          {current?.kind === 'closing' && <ClosingStep q={q} update={update} />}
        </div>

        {error && (
          <p className="mt-6 text-coral text-sm text-center">{error}</p>
        )}
      </main>

      <footer className="sticky bottom-0 bg-cream/90 backdrop-blur border-t border-ink/10 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={back}
            className="btn-ghost"
            disabled={submitting}
          >
            ← Atrás
          </button>
          <button
            type="button"
            onClick={next}
            className="btn-primary"
            disabled={!canAdvance() || submitting}
          >
            {submitting
              ? 'Guardando…'
              : stepIdx === totalSteps - 1
                ? 'Terminar'
                : 'Continuar'}
          </button>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Step components ---------- */

function StepTitle({
  title,
  sub,
}: {
  title: string;
  sub?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
        {title}
      </h1>
      {sub && <p className="mt-2 text-ink/60">{sub}</p>}
    </div>
  );
}

function PersonalStep({
  q,
  update,
}: {
  q: QuizResponses;
  update: <K extends keyof QuizResponses>(k: K, v: QuizResponses[K]) => void;
}) {
  return (
    <>
      <StepTitle title="Empecemos por ti." />
      <div className="space-y-4">
        <Field label="Tu nombre">
          <input
            className="input"
            placeholder="Juan"
            value={q.firstName}
            onChange={(e) => update('firstName', e.target.value)}
            autoFocus
          />
        </Field>
        <Field label="Tu apellido">
          <input
            className="input"
            placeholder="Perez"
            value={q.lastName}
            onChange={(e) => update('lastName', e.target.value)}
          />
        </Field>
        <Field label="Tu edad">
          <input
            className="input"
            inputMode="numeric"
            placeholder="24"
            value={q.age}
            onChange={(e) =>
              update('age', e.target.value.replace(/[^0-9]/g, ''))
            }
          />
        </Field>
        <Field label="Tu WhatsApp">
          <input
            className="input"
            inputMode="tel"
            placeholder="51 924923921"
            value={q.whatsapp}
            onChange={(e) => update('whatsapp', e.target.value)}
          />
        </Field>
      </div>
    </>
  );
}

function WorldsStep({
  q,
  update,
}: {
  q: QuizResponses;
  update: <K extends keyof QuizResponses>(k: K, v: QuizResponses[K]) => void;
}) {
  const toggle = (id: World) => {
    const has = q.selectedWorlds.includes(id);
    let next = has
      ? q.selectedWorlds.filter((w) => w !== id)
      : [...q.selectedWorlds, id];
    if (next.length > MAX_WORLDS) next = next.slice(0, MAX_WORLDS);
    update('selectedWorlds', next);
  };

  const otrosSelected = q.selectedWorlds.includes('otros');

  return (
    <>
      <StepTitle
        title="Elige lo que más amas."
        sub={`Elige hasta ${MAX_WORLDS} mundos.`}
      />
      <div className="flex flex-wrap gap-2.5">
        {WORLDS.map((w) => {
          const active = q.selectedWorlds.includes(w.id);
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => toggle(w.id)}
              className={`chip ${active ? 'chip-active' : 'chip-idle'}`}
            >
              <span>{w.emoji}</span>
              <span>{w.label}</span>
            </button>
          );
        })}
      </div>

      {otrosSelected && (
        <div className="mt-6 animate-step-in">
          {q.selectedWorlds.filter((w) => w !== 'otros').length === 0 && (
            <p className="mb-3 text-xs text-coral/80">
              También elige al menos un mundo de arriba para continuar.
            </p>
          )}
          <Field label="¿Cuáles? Cuéntanos qué te apasiona">
            <textarea
              className="input min-h-[100px]"
              placeholder="Moda, arte, astronomía, etc."
              value={q.otrosMundos || ''}
              onChange={(e) => update('otrosMundos', e.target.value)}
            />
          </Field>
        </div>
      )}

      <p className="mt-6 text-ink/50 text-sm">
        Seleccionados: {q.selectedWorlds.length}/{MAX_WORLDS}
      </p>
    </>
  );
}

function CategoryChips({
  options,
  value,
  onChange,
  label = 'Marca todos los que amas.',
}: {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
}) {
  const toggle = (opt: string) => {
    onChange(value.includes(opt) ? value.filter((o) => o !== opt) : [...value, opt]);
  };
  return (
    <Field label={label}>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`chip ${active ? 'chip-active' : 'chip-idle'}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </Field>
  );
}

function WorldStep({
  world,
  q,
  updateWorld,
}: {
  world: Exclude<World, 'otros'>;
  q: QuizResponses;
  updateWorld: <W extends Exclude<World, 'otros'>>(
    w: W,
    patch: Partial<NonNullable<QuizResponses[W]>>
  ) => void;
}) {
  if (world === 'musica') {
    const v = q.musica || { categories: [], topArtists: '', exploring: '' };
    return (
      <>
        <StepTitle title="🎧 Música" sub="Lo que te hace vibrar." />
        <div className="space-y-6">
          <CategoryChips
            options={CATEGORIES.musica}
            value={v.categories}
            onChange={(next) => updateWorld('musica', { categories: next })}
          />
          <Field label="Un artista que ames de cada género seleccionado 👇 (puedes poner más, o saltar)">
            <textarea
              className="input min-h-[80px]"
              placeholder="ej. Arctic Monkeys"
              value={v.topArtists}
              onChange={(e) =>
                updateWorld('musica', { topArtists: e.target.value })
              }
            />
          </Field>
          <Field label="¿Qué artistas (o género) estás explorando último?">
            <textarea
              className="input min-h-[90px]"
              placeholder="Lo que tengas en repeat ahora"
              value={v.exploring}
              onChange={(e) =>
                updateWorld('musica', { exploring: e.target.value })
              }
            />
          </Field>
        </div>
      </>
    );
  }
  if (world === 'series') {
    const v = q.series || { categories: [], rewatch: '', recent: '' };
    return (
      <>
        <StepTitle title="📺 Series" />
        <div className="space-y-6">
          <CategoryChips
            options={CATEGORIES.series}
            value={v.categories}
            onChange={(next) => updateWorld('series', { categories: next })}
          />
          <Field label="Una serie que ames de cada tipo que marcaste 👇 (puedes poner más, o saltar)">
            <textarea
              className="input min-h-[80px]"
              placeholder="ej. Stranger Things"
              value={v.rewatch}
              onChange={(e) =>
                updateWorld('series', { rewatch: e.target.value })
              }
            />
          </Field>
          <Field label="¿Qué serie te atrapó hace poco?">
            <input
              className="input"
              placeholder="The Bear, Severance, …"
              value={v.recent}
              onChange={(e) =>
                updateWorld('series', { recent: e.target.value })
              }
            />
          </Field>
        </div>
      </>
    );
  }
  if (world === 'peliculas') {
    const v = q.peliculas || { categories: [], favorites: '', recent: '' };
    return (
      <>
        <StepTitle title="🎬 Películas" />
        <div className="space-y-6">
          <CategoryChips
            options={CATEGORIES.peliculas}
            value={v.categories}
            onChange={(next) => updateWorld('peliculas', { categories: next })}
          />
          <Field label="Una película o director que ames de cada tipo que marcaste 👇 (puedes poner más, o saltar)">
            <textarea
              className="input min-h-[80px]"
              placeholder="ej. Tarantino, o Interestelar"
              value={v.favorites}
              onChange={(e) =>
                updateWorld('peliculas', { favorites: e.target.value })
              }
            />
          </Field>
          <Field label="¿Qué película te atrapó hace poco?">
            <input
              className="input"
              placeholder="Past Lives, Anatomy of a Fall, …"
              value={v.recent}
              onChange={(e) =>
                updateWorld('peliculas', { recent: e.target.value })
              }
            />
          </Field>
        </div>
      </>
    );
  }
  if (world === 'anime') {
    const v =
      q.anime ||
      { categories: [], preference: 'ambos' as AnimeMangaPref, favorites: '', current: '' };
    const opts: { id: AnimeMangaPref; label: string }[] = [
      { id: 'anime', label: 'Anime' },
      { id: 'manga', label: 'Manga' },
      { id: 'ambos', label: 'Ambos' },
    ];
    return (
      <>
        <StepTitle title="🀄 Anime / Manga" />
        <div className="space-y-6">
          <CategoryChips
            options={CATEGORIES.anime}
            value={v.categories}
            onChange={(next) => updateWorld('anime', { categories: next })}
          />
          <Field label="¿Qué prefieres?">
            <div className="flex flex-wrap gap-2">
              {opts.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => updateWorld('anime', { preference: o.id })}
                  className={`chip ${
                    v.preference === o.id ? 'chip-active' : 'chip-idle'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Un anime o manga que ames de cada tipo que marcaste 👇 (puedes poner más, o saltar)">
            <textarea
              className="input min-h-[80px]"
              placeholder="ej. One Piece"
              value={v.favorites}
              onChange={(e) =>
                updateWorld('anime', { favorites: e.target.value })
              }
            />
          </Field>
          <Field label="¿Qué estás viendo o leyendo últimamente?">
            <input
              className="input"
              placeholder="Chainsaw Man, Frieren, Vagabond, …"
              value={v.current}
              onChange={(e) =>
                updateWorld('anime', { current: e.target.value })
              }
            />
          </Field>
        </div>
      </>
    );
  }
  if (world === 'libros') {
    const v = q.libros || { categories: [], topBooks: '', recent: '' };
    return (
      <>
        <StepTitle title="📚 Libros" />
        <div className="space-y-6">
          <CategoryChips
            options={CATEGORIES.libros}
            value={v.categories}
            onChange={(next) => updateWorld('libros', { categories: next })}
          />
          <Field label="Un libro o autor que ames de cada tipo que marcaste 👇 (puedes poner más, o saltar)">
            <textarea
              className="input min-h-[80px]"
              placeholder="ej. Borges, o Dune"
              value={v.topBooks}
              onChange={(e) =>
                updateWorld('libros', { topBooks: e.target.value })
              }
            />
          </Field>
          <Field label="¿Qué libro estás leyendo / leíste hace poco que te atrapó?">
            <input
              className="input"
              placeholder="Kafka en la orilla, Pachinko, …"
              value={v.recent}
              onChange={(e) =>
                updateWorld('libros', { recent: e.target.value })
              }
            />
          </Field>
        </div>
      </>
    );
  }
  if (world === 'deportes') {
    const v = q.deportes || { selected: [] as Sport[] };
    const toggle = (id: Sport) => {
      const has = v.selected.includes(id);
      const sel = has ? v.selected.filter((s) => s !== id) : [...v.selected, id];
      updateWorld('deportes', { selected: sel });
    };
    return (
      <>
        <StepTitle
          title="⚽ Deportes"
          sub="Como fan, no como práctica. Elige los que te encanta ver."
        />
        <div className="flex flex-wrap gap-2.5">
          {SPORTS.map((s) => {
            const active = v.selected.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggle(s.id)}
                className={`chip ${active ? 'chip-active' : 'chip-idle'}`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        {v.selected.includes('otros') && (
          <div className="mt-5 animate-step-in">
            <Field label="Otros deportes">
              <input
                className="input"
                placeholder="Dinos cuáles"
                value={v.otros || ''}
                onChange={(e) =>
                  updateWorld('deportes', { otros: e.target.value })
                }
              />
            </Field>
          </div>
        )}
      </>
    );
  }
  if (world === 'videojuegos') {
    const v = q.videojuegos || { categories: [], favorites: '' };
    return (
      <>
        <StepTitle title="🎮 Videojuegos" />
        <div className="space-y-6">
          <CategoryChips
            options={CATEGORIES.videojuegos}
            value={v.categories}
            onChange={(next) => updateWorld('videojuegos', { categories: next })}
          />
          <Field label="Un juego que ames de cada tipo que marcaste 👇 (puedes poner más, o saltar)">
            <textarea
              className="input min-h-[80px]"
              placeholder="ej. Zelda, o League of Legends"
              value={v.favorites}
              onChange={(e) =>
                updateWorld('videojuegos', { favorites: e.target.value })
              }
            />
          </Field>
        </div>
      </>
    );
  }
  return null;
}

function ClosingStep({
  q,
  update,
}: {
  q: QuizResponses;
  update: <K extends keyof QuizResponses>(k: K, v: QuizResponses[K]) => void;
}) {
  const diningOpts: { id: DiningStyle; label: string }[] = [
    { id: 'hablar', label: 'Hablar bastante' },
    { id: 'escuchar', label: 'Escuchar más' },
    { id: 'depende', label: 'Depende de con quién' },
  ];
  const dietOpts: { id: Dietary; label: string }[] = [
    { id: 'ninguna', label: 'Ninguna' },
    { id: 'vegetariano', label: 'Vegetariano' },
    { id: 'vegano', label: 'Vegano' },
    { id: 'alergia', label: 'Alergias' },
  ];
  const expOpts: { id: ExpPreference; label: string }[] = [
    { id: 'solo_amigos', label: 'Solo con mis amigos' },
    { id: 'plus_one', label: 'Normal si llevan un +1' },
    { id: 'cualquiera', label: 'Cualquiera está bien' },
  ];

  return (
    <>
      <StepTitle title="Lo último." sub="Para armar planes que se sientan tuyos." />

      <Field label="En una mesa con amigos, sueles:">
        <div className="flex flex-wrap gap-2">
          {diningOpts.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => update('diningStyle', o.id)}
              className={`chip ${
                q.diningStyle === o.id ? 'chip-active' : 'chip-idle'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Field>

      <div className="mt-6">
        <Field label="¿Tienes alguna restricción alimentaria?">
          <div className="flex flex-wrap gap-2">
            {dietOpts.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => update('dietary', o.id)}
                className={`chip ${
                  q.dietary === o.id ? 'chip-active' : 'chip-idle'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          {q.dietary === 'alergia' && (
            <input
              className="input mt-3"
              placeholder="¿Qué alergia? Escríbela."
              value={q.dietaryNote || ''}
              onChange={(e) => update('dietaryNote', e.target.value)}
            />
          )}
        </Field>
      </div>

      <div className="mt-6">
        <Field label="Si lanzamos una experiencia para ti, preferirías:">
          <div className="flex flex-wrap gap-2">
            {expOpts.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => update('expPreference', o.id)}
                className={`chip ${
                  q.expPreference === o.id ? 'chip-active' : 'chip-idle'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Field>
      </div>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink/80 mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}
