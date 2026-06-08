'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '../ui/Logo';
import { ProgressBar } from './ProgressBar';
import {
  CATEGORIES,
  MAX_WORLDS,
  MUSIC_ERAS,
  PELICULA_TIPOS,
  SERIES_REGIONS,
  SPORTS,
  WORLDS,
  suggestionsFor,
} from '@/lib/worlds';
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
import { PreparingScreen } from './PreparingScreen';
import { Confetti } from '../ui/Confetti';
import { StickerNote } from '../ui/StickerNote';
import { unlockAndPreload } from '@/lib/audioContext';

type Step =
  | { kind: 'personal' }
  | { kind: 'worlds' }
  | { kind: 'world'; world: Exclude<World, 'otros'> }
  | { kind: 'closing' };

function emptyResponses(): QuizResponses {
  return {
    firstName: '',
    lastName: '',
    city: '',
    age: '',
    whatsapp: '',
    selectedWorlds: [],
    diningStyle: 'hablar',
    dietary: 'ninguna',
    expPreference: 'solo_amigos',
  };
}

// ── Quiz state persistence (mobile refresh-safety) ──────────────────────────
// Bump the version when QuizResponses' shape changes so stale data is dropped.
const QUIZ_STORAGE_KEY = 'sero_quiz_state_v2';

type SavedQuizState = {
  q: QuizResponses;
  stepIdx: number;
  result: SubmitResult | null;
};

function loadSavedState(): SavedQuizState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(QUIZ_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedQuizState;
  } catch {
    return null;
  }
}

function saveState(state: SavedQuizState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / disabled — fail silently */
  }
}

function clearSavedState() {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(QUIZ_STORAGE_KEY); } catch {}
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
  const [storyBlob, setStoryBlob] = useState<File | null>(null);
  const [storyReady, setStoryReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Restore quiz state from localStorage on first mount. Runs AFTER SSR to
  // avoid hydration mismatch — for the first paint we render the empty form
  // (or a transient null), then swap in the saved state.
  useEffect(() => {
    const saved = loadSavedState();
    if (saved) {
      setQ((prev) => ({ ...saved.q, referredBy: saved.q.referredBy ?? prev.referredBy }));
      setStepIdx(saved.stepIdx);
      if (saved.result) {
        setResult(saved.result);
        setStoryReady(true); // skip PreparingScreen — go straight to ShareScreen
      }
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save on any change (debounced) so a refresh mid-quiz doesn't lose
  // progress. Skipped before hydration to avoid clobbering the saved blob
  // with the initial empty state.
  useEffect(() => {
    if (!hydrated) return;
    const id = setTimeout(() => {
      saveState({ q, stepIdx, result });
    }, 400);
    return () => clearTimeout(id);
  }, [q, stepIdx, result, hydrated]);

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
        q.city.trim().length > 0 &&
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
          if (!q.series?.categories?.length) return false;
          if (q.series.categories.includes('Otro') && !q.series.seriesOtro?.trim()) return false;
          return true;
        case 'peliculas':
          return !!(q.peliculas?.categories?.length);
        case 'anime':
          // favorites es opcional; preference defaults to 'ambos' (matches the UI default)
          return !!(
            q.anime?.categories?.length &&
            (q.anime?.preference ?? 'ambos') &&
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
    // Unlock the soundtrack AudioContext synchronously inside this click
    // handler — iOS Safari only allows AudioContext.resume() / decodeAudioData
    // playback inside a user-gesture. We're about to navigate to the share
    // screen which renders the soundtrack-aware StoryCard.
    unlockAndPreload();

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

      // Show PreparingScreen while the story image generates in the background
      setResult(data);
      setSubmitting(false);

      const resolvedStoryUrl = data.igUrl.replace(/^https?:\/\/[^/]+/, window.location.origin);
      try {
        const imgRes = await Promise.race<Response>([
          fetch(resolvedStoryUrl),
          new Promise<Response>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 8000)
          ),
        ]);
        const blob = await imgRes.blob();
        setStoryBlob(new File([blob], `sero-story-${data.slug}.png`, { type: 'image/png' }));
      } catch { /* timeout — show share screen anyway */ }

      setStoryReady(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
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

  // Avoid a flash of the empty quiz on mobile refresh while we hydrate the
  // saved state from localStorage. Renders null briefly (the Suspense
  // fallback wrapping <Quiz/> already provides a blank backdrop).
  if (!hydrated) return null;

  if (result && storyReady) {
    return <ShareScreen result={result} firstName={q.firstName} initialBlob={storyBlob} />;
  }
  if (result && !storyReady) {
    return <PreparingScreen />;
  }

  return (
    <div className="relative min-h-[100svh] flex flex-col bg-cream overflow-hidden">
      {/* Subtle confetti backdrop — light density so it doesn't distract */}
      <Confetti density="light" className="opacity-70" />

      <header className="relative z-10 px-6 pt-8 sm:pt-12 max-w-2xl w-full mx-auto">
        {current?.kind === 'personal' && (
          <div className="relative flex flex-col items-center gap-3 mb-8">
            <Logo width={180} priority />
            <p className="text-ink/60 text-sm tracking-wide">
              Mismos gustos, mejores planes.
            </p>
            <div className="hidden sm:block absolute -right-2 top-0">
              <StickerNote color="butter" tilt={8} arrow="down-left">
                empezamos<br />por ti →
              </StickerNote>
            </div>
          </div>
        )}
        <ProgressBar value={progress} />
      </header>

      <main className="relative z-10 flex-1 px-6 py-10 max-w-2xl w-full mx-auto">
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

      <footer className="relative z-10 sticky bottom-0 bg-cream/90 backdrop-blur border-t border-ink/10 px-6 py-4">
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
        <Field label="Tu ciudad">
          <input
            className="input"
            placeholder="Lima"
            value={q.city}
            onChange={(e) => update('city', e.target.value)}
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

/**
 * Quick-pick chips driven by the user's selected categories. Hidden until at
 * least one category is chosen, since the suggestion list depends on it.
 */
function PicksChips({
  world,
  selectedCategories,
  value,
  onChange,
  label,
}: {
  world: Exclude<World, 'otros' | 'deportes'>;
  selectedCategories: string[];
  value: string[];
  onChange: (next: string[]) => void;
  label: string;
}) {
  const options = useMemo(
    () => suggestionsFor(world, selectedCategories),
    [world, selectedCategories],
  );
  if (options.length === 0) return null;
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
    const v = { categories: [] as string[], eras: [] as string[], topArtists: '', picks: [] as string[], ...q.musica };
    return (
      <>
        <StepTitle title="🎧 Música" />
        <div className="space-y-6">
          <CategoryChips
            options={CATEGORIES.musica}
            value={v.categories}
            onChange={(next) => updateWorld('musica', { categories: next })}
          />
          <PicksChips
            world="musica"
            selectedCategories={v.categories}
            value={v.picks ?? []}
            onChange={(next) => updateWorld('musica', { picks: next })}
            label="¿Cuáles de estos te encantan?"
          />
          <CategoryChips
            label="¿Qué épocas te gustan más?"
            options={MUSIC_ERAS}
            value={v.eras}
            onChange={(next) => updateWorld('musica', { eras: next })}
          />
          <Field label="(OPCIONAL) ¿Algún artista más que amas y no está arriba?">
            <input
              className="input"
              placeholder="ej, Billie Eilish, Elton John"
              value={v.topArtists}
              onChange={(e) =>
                updateWorld('musica', { topArtists: e.target.value })
              }
            />
          </Field>
        </div>
      </>
    );
  }
  if (world === 'series') {
    const v = { categories: [] as string[], seriesOtro: '', region: [] as string[], favorites: '', picks: [] as string[], ...q.series };
    return (
      <>
        <StepTitle title="📺 Series" />
        <div className="space-y-6">
          <CategoryChips
            options={CATEGORIES.series}
            value={v.categories}
            onChange={(next) => updateWorld('series', { categories: next })}
          />
          {v.categories.includes('Otro') && (
            <Field label="¿Qué otro género?">
              <input
                className="input"
                placeholder="Escribe aquí"
                value={v.seriesOtro || ''}
                onChange={(e) =>
                  updateWorld('series', { seriesOtro: e.target.value })
                }
              />
            </Field>
          )}
          <PicksChips
            world="series"
            selectedCategories={v.categories}
            value={v.picks ?? []}
            onChange={(next) => updateWorld('series', { picks: next })}
            label="¿Cuáles de estas te enganchan?"
          />
          <CategoryChips
            label="Región de tus series favoritas:"
            options={SERIES_REGIONS}
            value={v.region}
            onChange={(next) => updateWorld('series', { region: next })}
          />
          <Field label="(OPCIONAL) ¿Alguna otra serie?">
            <input
              className="input"
              placeholder="ej, The Bear, Severance"
              value={v.favorites || ''}
              onChange={(e) =>
                updateWorld('series', { favorites: e.target.value })
              }
            />
          </Field>
        </div>
      </>
    );
  }
  if (world === 'peliculas') {
    const v = { categories: [] as string[], tipo: [] as string[], favorites: '', picks: [] as string[], ...q.peliculas };
    return (
      <>
        <StepTitle title="🎬 Películas" />
        <div className="space-y-6">
          <CategoryChips
            options={CATEGORIES.peliculas}
            value={v.categories}
            onChange={(next) => updateWorld('peliculas', { categories: next })}
          />
          <PicksChips
            world="peliculas"
            selectedCategories={v.categories}
            value={v.picks ?? []}
            onChange={(next) => updateWorld('peliculas', { picks: next })}
            label="¿Cuáles de estas te marcaron?"
          />
          <CategoryChips
            label="¿Qué tipo? Todas las que te gusten"
            options={PELICULA_TIPOS}
            value={v.tipo}
            onChange={(next) => updateWorld('peliculas', { tipo: next })}
          />
          <Field label="(OPCIONAL) ¿Alguna otra peli o director que amas?">
            <input
              className="input"
              placeholder="ej. Tarantino, Interestelar, El padrino…"
              value={v.favorites}
              onChange={(e) =>
                updateWorld('peliculas', { favorites: e.target.value })
              }
            />
          </Field>
        </div>
      </>
    );
  }
  if (world === 'anime') {
    const v =
      { categories: [] as string[], preference: 'ambos' as AnimeMangaPref, favorites: '', current: '', picks: [] as string[], ...q.anime };
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
          <PicksChips
            world="anime"
            selectedCategories={v.categories}
            value={v.picks ?? []}
            onChange={(next) => updateWorld('anime', { picks: next })}
            label="¿Cuáles te has clavado?"
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
          <Field label="Pon 1 o más favoritos (puedes saltar)">
            <textarea
              className="input min-h-[60px]"
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
    const v = { categories: [] as string[], topBooks: '', recent: '', picks: [] as string[], ...q.libros };
    return (
      <>
        <StepTitle title="📚 Libros" />
        <div className="space-y-6">
          <CategoryChips
            options={CATEGORIES.libros}
            value={v.categories}
            onChange={(next) => updateWorld('libros', { categories: next })}
          />
          <PicksChips
            world="libros"
            selectedCategories={v.categories}
            value={v.picks ?? []}
            onChange={(next) => updateWorld('libros', { picks: next })}
            label="¿Cuáles de estos autores / libros te gustan?"
          />
          <Field label="(OPCIONAL) Otros libros o autores que amas">
            <textarea
              className="input min-h-[60px]"
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
        <StepTitle title="⚽ Deportes" />
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
    const v = { categories: [] as string[], favorites: '', picks: [] as string[], ...q.videojuegos };
    return (
      <>
        <StepTitle title="🎮 Videojuegos" />
        <div className="space-y-6">
          <CategoryChips
            options={CATEGORIES.videojuegos}
            value={v.categories}
            onChange={(next) => updateWorld('videojuegos', { categories: next })}
          />
          <PicksChips
            world="videojuegos"
            selectedCategories={v.categories}
            value={v.picks ?? []}
            onChange={(next) => updateWorld('videojuegos', { picks: next })}
            label="¿Cuáles de estos juegas o te marcaron?"
          />
          <Field label="(OPCIONAL) Otros juegos favoritos">
            <textarea
              className="input min-h-[60px]"
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
  ];
  const dietOpts: { id: Dietary; label: string }[] = [
    { id: 'ninguna', label: 'Ninguna' },
    { id: 'vegetariano', label: 'Vegetariano' },
    { id: 'vegano', label: 'Vegano' },
    { id: 'alergia', label: 'Alergias' },
  ];
  const expOpts: { id: ExpPreference; label: string }[] = [
    { id: 'solo_amigos', label: 'ir solo' },
    { id: 'plus_one',    label: 'llevar un +1' },
    { id: 'cualquiera',  label: 'cualquiera' },
  ];

  return (
    <>
      <StepTitle title="Lo último." sub="Para armar planes que se sientan tuyos." />

      <Field label="eres de">
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
