'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '../ui/Logo';
import { ProgressBar } from './ProgressBar';
import { Confetti } from '../ui/Confetti';
import {
  WORLDS,
  SECTION_ORDER,
  SECTIONS,
  PLATFORM_OPTIONS,
  OTRO_CARD,
  STOP_LOVES,
  STOP_PASS_STREAK,
  DISPONIBILIDAD,
  DIETAS,
  first,
  type SwipeWorldId,
  type WorldSection,
  type SubOption,
} from '@/lib/worlds';
import type { QuizSchema, Reaction, SubmitResult, TasteRecord, WorldId } from '@/lib/types';

// ─── Working draft ──────────────────────────────────────────────────────────
type Draft = Omit<QuizSchema, 'logistics'> & {
  logistics: {
    rol?: 'hablar' | 'escuchar';
    plus_one?: boolean;
    disponibilidad?: 'entre_semana' | 'fin_de_semana' | 'cualquiera';
    dieta: ('ninguna' | 'vegetariano' | 'vegano' | 'alergias')[];
    dieta_note?: string;
  };
};

function emptyDraft(): Draft {
  return { name: '', apellido: '', ciudad: '', edad: '', whatsapp: '', worlds: [], taste: {}, logistics: { dieta: [] } };
}

// ─── Flow phases ────────────────────────────────────────────────────────────
// On 'me encanta', the flow dives straight into THAT category's Layer 2 (sub-
// options + picks), then 'continuar' resumes the swipe at the next card. Layer 2
// is ONE page: its sub-options (with examples) AND the "¿qué … nos faltaron?"
// field together. `detail.ci` is the swipe-deck index of the just-loved card.
type Phase =
  | { kind: 'personal' }
  | { kind: 'worlds' }
  | { kind: 'swipe'; wi: number; ci: number }
  | { kind: 'otroCard'; wi: number }
  | { kind: 'detail'; wi: number; ci: number }
  | { kind: 'deportes' }
  | { kind: 'logistics' };

const STORAGE_KEY = 'sero_quiz_v5';
type Saved = { q: Draft; phase: Phase };

function loadSaved(): Saved | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}
function persist(s: Saved) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}
function clearSaved() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

const parseTyped = (s: string): string[] => s.split(/[,\n;]+/).map((x) => x.trim()).filter(Boolean);
function reactionOf(recs: TasteRecord[], name: string): Reaction | undefined {
  return recs.find((r) => r.category === name)?.reaction;
}

export function Quiz({ referredBy }: { referredBy?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const ref = referredBy || params.get('ref') || undefined;

  const [q, setQ] = useState<Draft>(() => ({ ...emptyDraft(), referred_by: ref }));
  const [phase, setPhase] = useState<Phase>({ kind: 'personal' });
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    const saved = loadSaved();
    if (saved) {
      setQ((prev) => ({ ...saved.q, referred_by: saved.q.referred_by ?? prev.referred_by }));
      setPhase(saved.phase);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || done) return;
    const id = setTimeout(() => persist({ q, phase }), 350);
    return () => clearTimeout(id);
  }, [q, phase, hydrated, done]);

  const activeSections = useMemo<WorldSection[]>(
    () => SECTION_ORDER.filter((id) => q.worlds.includes(id)).map((id) => SECTIONS[id]),
    [q.worlds],
  );
  const deportesSelected = q.worlds.includes('deportes');
  const otroSelected = q.worlds.includes('otro');

  const setWorldRecords = (world: SwipeWorldId, recs: TasteRecord[]) =>
    setQ((prev) => ({ ...prev, taste: { ...prev.taste, [world]: recs } }));
  const upsert = (world: SwipeWorldId, category: string, patch: Partial<TasteRecord>) =>
    setQ((prev) => {
      const recs = [...(prev.taste[world] ?? [])];
      const i = recs.findIndex((r) => r.category === category);
      if (i >= 0) recs[i] = { ...recs[i], ...patch };
      else recs.push({ category, reaction: 'pass', ...patch });
      return { ...prev, taste: { ...prev.taste, [world]: recs } };
    });

  const recsOf = (wi: number) => q.taste[activeSections[wi].id] ?? [];
  const isStop = (section: WorldSection, recs: TasteRecord[], ci: number): boolean => {
    let loves = 0;
    let streak = 0;
    for (let k = 0; k <= ci; k++) {
      const r = reactionOf(recs, section.cards[k].name);
      if (r === 'love') {
        loves++;
        streak = 0;
      } else if (r === 'pass') streak++;
    }
    const lastCard = ci >= section.cards.length - 1;
    return loves >= STOP_LOVES || (loves >= 1 && streak >= STOP_PASS_STREAK) || lastCard;
  };
  // A finished world's last screen is its ✨ Otro card (Layer 2s happen inline).
  const endOfWorld = (wi: number): Phase => ({ kind: 'otroCard', wi });
  const goToWorldOrBeyond = (nextWi: number) => {
    if (nextWi < activeSections.length) setPhase({ kind: 'swipe', wi: nextWi, ci: 0 });
    else if (deportesSelected) setPhase({ kind: 'deportes' });
    else setPhase({ kind: 'logistics' });
  };

  const onSwipe = (reaction: Reaction) => {
    if (phase.kind !== 'swipe') return;
    const { wi, ci } = phase;
    const section = activeSections[wi];
    const card = section.cards[ci];
    const recs = [...(q.taste[section.id] ?? [])];
    const i = recs.findIndex((r) => r.category === card.name);
    const base: TasteRecord = {
      category: card.name,
      reaction,
      ...(section.id === 'videojuegos' ? { plan_able: !!card.planAble } : {}),
    };
    if (i >= 0) recs[i] = { ...recs[i], ...base };
    else recs.push(base);
    setWorldRecords(section.id, recs);

    // Love → dive straight into this category's sub-options + picks.
    // Pass → next card (or ✨ Otro once the stop condition is met).
    if (reaction === 'love') {
      setPhase({ kind: 'detail', wi, ci });
      return;
    }
    setPhase(isStop(section, recs, ci) ? { kind: 'otroCard', wi } : { kind: 'swipe', wi, ci: ci + 1 });
  };

  const next = async () => {
    if (!canAdvance()) return;
    switch (phase.kind) {
      case 'personal':
        setPhase({ kind: 'worlds' });
        return;
      case 'worlds':
        if (activeSections.length > 0) setPhase({ kind: 'swipe', wi: 0, ci: 0 });
        else if (deportesSelected) setPhase({ kind: 'deportes' });
        else setPhase({ kind: 'logistics' });
        return;
      case 'otroCard':
        goToWorldOrBeyond(phase.wi + 1);
        return;
      case 'detail': {
        const { wi, ci } = phase;
        const section = activeSections[wi];
        setPhase(isStop(section, q.taste[section.id] ?? [], ci) ? { kind: 'otroCard', wi } : { kind: 'swipe', wi, ci: ci + 1 });
        return;
      }
      case 'deportes':
        setPhase({ kind: 'logistics' });
        return;
      case 'logistics':
        await submit();
        return;
    }
  };

  const back = () => {
    switch (phase.kind) {
      case 'personal':
        router.push('/');
        return;
      case 'worlds':
        setPhase({ kind: 'personal' });
        return;
      case 'swipe': {
        const { wi, ci } = phase;
        if (ci > 0) {
          const prev = activeSections[wi].cards[ci - 1];
          setPhase(reactionOf(recsOf(wi), prev.name) === 'love' ? { kind: 'detail', wi, ci: ci - 1 } : { kind: 'swipe', wi, ci: ci - 1 });
        } else if (wi > 0) setPhase(endOfWorld(wi - 1));
        else setPhase({ kind: 'worlds' });
        return;
      }
      case 'otroCard': {
        const { wi } = phase;
        const recs = recsOf(wi);
        const reacted = activeSections[wi].cards.filter((c) => reactionOf(recs, c.name)).length;
        const lastCi = Math.max(0, reacted - 1);
        const lastCard = activeSections[wi].cards[lastCi];
        setPhase(reactionOf(recs, lastCard.name) === 'love' ? { kind: 'detail', wi, ci: lastCi } : { kind: 'swipe', wi, ci: lastCi });
        return;
      }
      case 'detail':
        setPhase({ kind: 'swipe', wi: phase.wi, ci: phase.ci });
        return;
      case 'deportes':
        if (activeSections.length > 0) setPhase(endOfWorld(activeSections.length - 1));
        else setPhase({ kind: 'worlds' });
        return;
      case 'logistics':
        if (deportesSelected) setPhase({ kind: 'deportes' });
        else if (activeSections.length > 0) setPhase(endOfWorld(activeSections.length - 1));
        else setPhase({ kind: 'worlds' });
        return;
    }
  };

  const canAdvance = (): boolean => {
    switch (phase.kind) {
      case 'personal':
        return [q.name, q.apellido, q.ciudad, q.edad, q.whatsapp].every((v) => v.trim() !== '');
      case 'worlds':
        if (q.worlds.length === 0) return false;
        if (otroSelected && !q.taste.otro?.trim()) return false;
        return true;
      case 'logistics': {
        const L = q.logistics;
        if (!L.rol || L.plus_one === undefined || !L.disponibilidad) return false;
        if (L.dieta.includes('alergias') && !L.dieta_note?.trim()) return false;
        return true;
      }
      default:
        return true;
    }
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload: QuizSchema = {
        ...q,
        taste: pruneTaste(q.taste),
        logistics: {
          rol: q.logistics.rol!,
          plus_one: q.logistics.plus_one!,
          disponibilidad: q.logistics.disponibilidad!,
          dieta: q.logistics.dieta.length ? q.logistics.dieta : ['ninguna'],
          dieta_note: q.logistics.dieta_note,
        },
        created_at: new Date().toISOString(),
      };
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('No pudimos guardar tu respuesta.');
      const data: SubmitResult = await res.json();
      setResult(data);
      clearSaved();
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setSubmitting(false);
    }
  };

  const macroTotal = 2 + activeSections.length + (deportesSelected ? 1 : 0) + 1;
  const macroIndex = (): number => {
    switch (phase.kind) {
      case 'personal':
        return 0;
      case 'worlds':
        return 1;
      case 'swipe': {
        const len = activeSections[phase.wi].cards.length;
        return 2 + phase.wi + (phase.ci / (len + 1)) * 0.85;
      }
      case 'detail': {
        const len = activeSections[phase.wi].cards.length;
        return 2 + phase.wi + ((phase.ci + 0.5) / (len + 1)) * 0.85;
      }
      case 'otroCard':
        return 2 + phase.wi + 0.9;
      case 'deportes':
        return 2 + activeSections.length;
      case 'logistics':
        return 2 + activeSections.length + (deportesSelected ? 1 : 0);
    }
  };
  const progress = Math.min(0.98, Math.max(0.03, macroIndex() / macroTotal));

  if (!hydrated) return null;
  if (done) return <DoneScreen />;

  const isSwipe = phase.kind === 'swipe';

  return (
    <div className="relative h-[100svh] flex flex-col bg-cream overflow-hidden">
      <header className="relative z-10 px-6 pt-6 max-w-md w-full mx-auto shrink-0">
        <ProgressBar value={progress} />
      </header>

      <main className="relative z-10 flex-1 min-h-0 px-6 py-5 max-w-md w-full mx-auto overflow-hidden flex flex-col">
        <div key={phaseKey(phase)} className="animate-step-in flex-1 min-h-0 flex flex-col">
          {phase.kind === 'personal' && <PersonalStep q={q} setQ={setQ} />}
          {phase.kind === 'worlds' && <WorldsStep q={q} setQ={setQ} />}
          {phase.kind === 'swipe' && <SwipeStep section={activeSections[phase.wi]} ci={phase.ci} onSwipe={onSwipe} />}
          {phase.kind === 'otroCard' && <OtroCardStep section={activeSections[phase.wi]} q={q} upsert={upsert} />}
          {phase.kind === 'detail' && <DetailStep ci={phase.ci} section={activeSections[phase.wi]} q={q} upsert={upsert} />}
          {phase.kind === 'deportes' && <DeportesStep q={q} setQ={setQ} />}
          {phase.kind === 'logistics' && <LogisticsStep q={q} setQ={setQ} />}
        </div>
        {error && <p className="mt-3 text-coral text-sm text-center shrink-0">{error}</p>}
      </main>

      <footer className="relative z-10 px-6 pb-6 pt-2 max-w-md w-full mx-auto shrink-0 flex items-center justify-between gap-3">
        <button type="button" onClick={back} className="btn-ghost" disabled={submitting}>
          ← atrás
        </button>
        {!isSwipe && (
          <button type="button" onClick={next} className="btn-primary" disabled={!canAdvance() || submitting}>
            {submitting ? 'guardando…' : phase.kind === 'logistics' ? 'terminar' : 'continuar'}
          </button>
        )}
      </footer>
    </div>
  );
}

function phaseKey(p: Phase): string {
  switch (p.kind) {
    case 'swipe':
      return `swipe-${p.wi}-${p.ci}`;
    case 'detail':
      return `detail-${p.wi}-${p.ci}`;
    case 'otroCard':
      return `otro-${p.wi}`;
    default:
      return p.kind;
  }
}

function pruneTaste(taste: Draft['taste']): QuizSchema['taste'] {
  const out: QuizSchema['taste'] = { ...taste };
  (Object.keys(SECTIONS) as SwipeWorldId[]).forEach((w) => {
    const recs = out[w];
    if (!recs) return;
    const cleaned = recs.filter((r) => r.category !== OTRO_CARD || (r.otro && r.otro.trim() !== ''));
    if (cleaned.length) out[w] = cleaned;
    else delete out[w];
  });
  return out;
}

/* ─────────────────────────  Story-slide primitives  ───────────────────────── */

function SlideLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-ink/40 text-[11px] uppercase tracking-[0.25em] font-semibold shrink-0">{children}</p>;
}
function GhostField({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  inputMode?: 'numeric' | 'tel';
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider font-semibold text-ink/45 mb-1">{label}</span>
      <input
        className="input-ghost"
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

/* ─────────────────────────  Steps  ───────────────────────── */

// ── Page 1 ──
function PersonalStep({ q, setQ }: { q: Draft; setQ: React.Dispatch<React.SetStateAction<Draft>> }) {
  const set = (k: keyof Draft, v: string) => setQ((p) => ({ ...p, [k]: v }));
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex justify-center mb-6 shrink-0">
        <Logo width={130} priority />
      </div>
      <h1 className="text-4xl font-black tracking-tight leading-none mb-7 shrink-0">lo básico</h1>
      <div className="space-y-5">
        <GhostField label="nombre" value={q.name} onChange={(v) => set('name', v)} placeholder="Juan" autoFocus />
        <GhostField label="apellido" value={q.apellido} onChange={(v) => set('apellido', v)} placeholder="Pérez" />
        <GhostField label="ciudad" value={q.ciudad} onChange={(v) => set('ciudad', v)} placeholder="Lima" />
        <GhostField label="edad" value={q.edad} onChange={(v) => set('edad', v.replace(/[^0-9]/g, ''))} placeholder="24" inputMode="numeric" />
        <GhostField label="WhatsApp" value={q.whatsapp} onChange={(v) => set('whatsapp', v)} placeholder="999 111 222" inputMode="tel" />
      </div>
    </div>
  );
}

// ── Page 2 ──
function WorldsStep({ q, setQ }: { q: Draft; setQ: React.Dispatch<React.SetStateAction<Draft>> }) {
  const name = q.name.trim() || 'ti';
  const toggle = (id: WorldId) =>
    setQ((p) => ({ ...p, worlds: p.worlds.includes(id) ? p.worlds.filter((w) => w !== id) : [...p.worlds, id] }));
  const otroOn = q.worlds.includes('otro');

  // Shrink the title so a long name still fits on a single line.
  const title = `¿qué ama ${name}?`;
  const titleSize =
    title.length <= 16 ? 'text-4xl' : title.length <= 20 ? 'text-3xl' : title.length <= 26 ? 'text-2xl' : 'text-xl';

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <h1 className={`${titleSize} font-black tracking-tight leading-[1.05] mb-6 shrink-0 whitespace-nowrap`}>{title}</h1>
      <div className="grid grid-cols-2 gap-3">
        {WORLDS.map((w) => {
          const active = q.worlds.includes(w.id);
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => toggle(w.id)}
              className={`flex items-center gap-2.5 rounded-2xl px-4 py-4 text-base font-bold transition-all active:scale-[0.97] ${
                active ? 'bg-coral text-white shadow-[0_5px_0_rgba(91,45,130,0.18)] -translate-y-0.5' : 'bg-white/70 text-ink hover:bg-white'
              }`}
            >
              <span className="text-2xl">{w.emoji}</span>
              <span>{w.label}</span>
            </button>
          );
        })}
      </div>
      {otroOn && (
        <div className="mt-6 animate-step-in">
          <GhostField label="cuéntanos" value={q.taste.otro ?? ''} onChange={(v) => setQ((p) => ({ ...p, taste: { ...p.taste, otro: v } }))} placeholder="comida, arte…" autoFocus />
        </div>
      )}
    </div>
  );
}

// ── Layer 1 swipe — the genre IS the slide (no box) ──
function SwipeStep({ section, ci, onSwipe }: { section: WorldSection; ci: number; onSwipe: (r: Reaction) => void }) {
  const card = section.cards[ci];
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <SlideLabel>
        {section.emoji} {section.label} · {ci + 1}
      </SlideLabel>

      <div className="flex-1 min-h-0 flex flex-col justify-center">
        <h2 className="text-5xl font-black tracking-tight leading-[0.95]">
          {card.emoji ? `${card.emoji} ` : ''}
          {card.name}
        </h2>
        {section.id === 'musica' && card.subGenres ? (
          <ul className="mt-6 space-y-2.5">
            {card.subGenres.map((sg) => (
              <li key={sg.name} className="text-lg leading-tight">
                <span className="font-bold text-ink">{sg.name}</span>
                <span className="text-ink/35"> · {first(sg.examples)}</span>
              </li>
            ))}
          </ul>
        ) : card.example && card.example.includes(',') ? (
          <ul className="mt-5 space-y-2">
            {card.example.split(',').map((e) => (
              <li key={e} className="text-xl text-ink/40 leading-tight">
                {e.trim()}
              </li>
            ))}
          </ul>
        ) : (
          card.example && <p className="mt-5 text-2xl text-ink/35">{card.example}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 shrink-0">
        <button
          type="button"
          onClick={() => onSwipe('pass')}
          className="rounded-full border-2 border-ink/15 bg-transparent py-4 text-base font-bold text-ink/55 transition-all active:scale-95 hover:border-ink/30"
        >
          ✕ pasar
        </button>
        <button
          type="button"
          onClick={() => onSwipe('love')}
          className="rounded-full bg-coral py-4 text-base font-bold text-white shadow-[0_5px_0_rgba(91,45,130,0.18)] transition-all active:scale-95"
        >
          ♥ me encanta
        </button>
      </div>
    </div>
  );
}

// ── ✨ Otro card ──
function OtroCardStep({
  section,
  q,
  upsert,
}: {
  section: WorldSection;
  q: Draft;
  upsert: (w: SwipeWorldId, category: string, patch: Partial<TasteRecord>) => void;
}) {
  const rec = (q.taste[section.id] ?? []).find((r) => r.category === OTRO_CARD);
  const [text, setText] = useState(rec?.otro ?? '');
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <SlideLabel>
        {section.emoji} {section.label}
      </SlideLabel>
      <h1 className="text-4xl font-black tracking-tight leading-none mt-2 mb-7">nos faltó alguno?</h1>
      <input
        className="input-ghost"
        value={text}
        autoFocus
        onChange={(e) => {
          setText(e.target.value);
          upsert(section.id, OTRO_CARD, { reaction: 'love', otro: e.target.value });
        }}
      />
    </div>
  );
}

// ── Editorial selection row (no box — divider list, coral dot when on) ──
function OptionList({ options, value, onToggle }: { options: SubOption[]; value: string[]; onToggle: (n: string) => void }) {
  return (
    <div className="divide-y divide-ink/8 border-t border-b border-ink/8">
      {options.map((o) => {
        const active = value.includes(o.name);
        return (
          <button key={o.name} type="button" onClick={() => onToggle(o.name)} className="w-full text-left py-3 flex items-start gap-3 active:scale-[0.99] transition-transform">
            <span className={`mt-0.5 w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold transition-colors ${active ? 'bg-coral text-white' : 'border-2 border-ink/20 text-transparent'}`}>
              ✓
            </span>
            <span className="min-w-0">
              <span className={`block text-lg font-bold leading-tight ${active ? 'text-coral' : 'text-ink'}`}>{o.name}</span>
              {o.examples && <span className="block text-sm text-ink/40 leading-tight truncate">{o.examples}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Layer 2 — ONE page: sub-options (with examples) + "nos faltaron" field ──
function DetailStep({
  ci,
  section,
  q,
  upsert,
}: {
  ci: number;
  section: WorldSection;
  q: Draft;
  upsert: (w: SwipeWorldId, category: string, patch: Partial<TasteRecord>) => void;
}) {
  const recs = q.taste[section.id] ?? [];
  const card = section.cards[ci];
  const rec = recs.find((r) => r.category === card.name);

  let field: 'sub' | 'platform' = 'sub';
  let options: SubOption[] = [];
  if (section.id === 'musica' && card.subGenres) options = card.subGenres;
  else if (card.subAxis) options = card.subAxis;
  else if (card.platform) {
    options = PLATFORM_OPTIONS;
    field = 'platform';
  }
  const value = rec?.[field] ?? [];
  const toggle = (n: string) => {
    const cur = rec?.[field] ?? [];
    upsert(section.id, card.name, { [field]: cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n] });
  };

  const [typedText, setTypedText] = useState((rec?.typed ?? []).join(', '));

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <SlideLabel>
        {section.emoji} {section.label}
      </SlideLabel>
      <h1 className="text-4xl font-black tracking-tight leading-none mt-2 mb-5 shrink-0">
        {card.emoji ? `${card.emoji} ` : ''}
        {card.name}
      </h1>
      {options.length > 0 && <OptionList options={options} value={value} onToggle={toggle} />}
      <div className="mt-6">
        <span className="block text-xs uppercase tracking-wider font-semibold text-ink/45 mb-1">{section.typedLabel}</span>
        <input
          className="input-ghost"
          placeholder={section.typedPlaceholder}
          value={typedText}
          onChange={(e) => {
            setTypedText(e.target.value);
            upsert(section.id, card.name, { typed: parseTyped(e.target.value) });
          }}
        />
      </div>
    </div>
  );
}

// ── Deportes ──
function DeportesStep({ q, setQ }: { q: Draft; setQ: React.Dispatch<React.SetStateAction<Draft>> }) {
  const rel = q.taste.deportes?.relation ?? [];
  const typed = q.taste.deportes?.typed ?? [];
  const [typedText, setTypedText] = useState(typed.join(', '));
  const setDep = (patch: Partial<NonNullable<Draft['taste']['deportes']>>) =>
    setQ((p) => ({ ...p, taste: { ...p.taste, deportes: { relation: rel, typed, ...p.taste.deportes, ...patch } } }));
  const toggleRel = (r: 'practico' | 'veo') => setDep({ relation: rel.includes(r) ? rel.filter((x) => x !== r) : [...rel, r] });

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <h1 className="text-4xl font-black tracking-tight leading-none mb-6 shrink-0">🏆 deportes</h1>
      <div className="space-y-6">
        <div>
          <span className="block text-xs uppercase tracking-wider font-semibold text-ink/45 mb-2">¿eres de?</span>
          <div className="flex flex-wrap gap-2">
            {([['practico', 'lo practico'], ['veo', 'lo veo']] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => toggleRel(id)} className={`chip ${rel.includes(id) ? 'chip-active' : 'chip-idle'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <GhostField label="¿cuál?" value={typedText} placeholder="fútbol, NBA…" onChange={(v) => { setTypedText(v); setDep({ typed: parseTyped(v) }); }} />
      </div>
    </div>
  );
}

// ── Lo último ──
function LogisticsStep({ q, setQ }: { q: Draft; setQ: React.Dispatch<React.SetStateAction<Draft>> }) {
  const L = q.logistics;
  const setL = (patch: Partial<Draft['logistics']>) => setQ((p) => ({ ...p, logistics: { ...p.logistics, ...patch } }));
  const toggleDieta = (id: 'ninguna' | 'vegetariano' | 'vegano' | 'alergias') =>
    setL({ dieta: L.dieta.includes(id) ? L.dieta.filter((d) => d !== id) : [...L.dieta, id] });
  const Q = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <span className="block text-xs uppercase tracking-wider font-semibold text-ink/45 mb-2">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <h1 className="text-4xl font-black tracking-tight leading-none mb-6 shrink-0">lo último</h1>
      <div className="space-y-5">
        <Q label="eres de">
          {(['hablar', 'escuchar'] as const).map((r) => (
            <button key={r} type="button" onClick={() => setL({ rol: r })} className={`chip ${L.rol === r ? 'chip-active' : 'chip-idle'}`}>
              {r}
            </button>
          ))}
        </Q>
        <Q label="si te invitamos un plan, vas">
          {([['solo', false], ['con un +1', true]] as const).map(([label, val]) => (
            <button key={label} type="button" onClick={() => setL({ plus_one: val })} className={`chip ${L.plus_one === val ? 'chip-active' : 'chip-idle'}`}>
              {label}
            </button>
          ))}
        </Q>
        <Q label="¿qué noches sales?">
          {DISPONIBILIDAD.map((o) => (
            <button key={o.id} type="button" onClick={() => setL({ disponibilidad: o.id })} className={`chip ${L.disponibilidad === o.id ? 'chip-active' : 'chip-idle'}`}>
              {o.label}
            </button>
          ))}
        </Q>
        <Q label="restricción alimentaria">
          {DIETAS.map((d) => (
            <button key={d.id} type="button" onClick={() => toggleDieta(d.id)} className={`chip ${L.dieta.includes(d.id) ? 'chip-active' : 'chip-idle'}`}>
              {d.label}
            </button>
          ))}
        </Q>
        {L.dieta.includes('alergias') && (
          <input className="input-ghost" placeholder="¿cuál?" value={L.dieta_note ?? ''} onChange={(e) => setL({ dieta_note: e.target.value })} />
        )}
      </div>
    </div>
  );
}

// ── Completion placeholder ──
function DoneScreen() {
  return (
    <div className="relative h-[100svh] flex flex-col items-center justify-center bg-cream gap-6 px-6 overflow-hidden">
      <Confetti density="dense" />
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <Logo width={150} priority />
        <h1 className="text-3xl font-black tracking-tight">listo, ya estás en Sero 🎴</h1>
      </div>
    </div>
  );
}
