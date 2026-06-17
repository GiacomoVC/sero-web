'use client';

import { useState } from 'react';

interface Member { slug: string; name: string }
interface Cluster {
  members: Member[];
  size: number;
  titleTags: string[];
  categoryTags: string[];
  score: number;
  egos: string[];
}
interface PlansResponse {
  mode: 'ego' | 'network';
  ego?: Member;
  userCount: number;
  pool?: Member[];
  egos?: string[];
  clusters: Cluster[];
  error?: string;
}

export default function PlansAdminPage() {
  const [secret, setSecret] = useState('');
  const [ego, setEgo] = useState('');
  const [mode, setMode] = useState<'both' | 'confirmed' | 'referral'>('both');
  const [requireEgo, setRequireEgo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PlansResponse | null>(null);
  const [error, setError] = useState('');

  const run = async (demo: boolean) => {
    setLoading(true);
    setError('');
    setData(null);
    const qs = new URLSearchParams({ mode, requireEgo: requireEgo ? '1' : '0' });
    if (demo) qs.set('demo', '1');
    else {
      qs.set('secret', secret);
      if (ego.trim()) qs.set('ego', ego.trim());
    }
    try {
      const res = await fetch(`/api/plans?${qs.toString()}`);
      const json = (await res.json()) as PlansResponse;
      if (!res.ok || json.error) setError(json.error || `Error ${res.status}`);
      else setData(json);
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream text-ink px-5 py-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-black tracking-tight">Plans · matching</h1>
      <p className="mt-2 text-ink/55 text-sm">
        Clusters of friends &amp; friends-of-friends who share taste. Pick which to make real.
      </p>

      {/* Controls */}
      <div className="mt-6 grid gap-3 bg-white/70 border border-ink/10 rounded-2xl p-5">
        <label className="text-xs font-bold uppercase tracking-widest text-ink/40">Secret</label>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="WEBHOOK_SECRET"
          className="rounded-xl border-2 border-ink/10 bg-white px-3 py-2 text-sm focus:outline-none focus:border-plum"
        />

        <label className="text-xs font-bold uppercase tracking-widest text-ink/40 mt-2">
          Ego slug <span className="font-normal normal-case text-ink/35">— blank = whole network</span>
        </label>
        <input
          value={ego}
          onChange={(e) => setEgo(e.target.value)}
          placeholder="ej. ana-perez"
          className="rounded-xl border-2 border-ink/10 bg-white px-3 py-2 text-sm focus:outline-none focus:border-plum"
        />

        <div className="flex flex-wrap items-center gap-4 mt-2">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-ink/50">Grafo:</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as typeof mode)}
              className="rounded-lg border-2 border-ink/10 bg-white px-2 py-1 text-sm"
            >
              <option value="both">Referidos + confirmados</option>
              <option value="confirmed">Solo confirmados</option>
              <option value="referral">Solo referidos</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={requireEgo} onChange={(e) => setRequireEgo(e.target.checked)} />
            <span className="text-ink/60">El ego debe estar en cada grupo</span>
          </label>
        </div>

        <div className="flex gap-3 mt-2">
          <button
            onClick={() => run(false)}
            disabled={loading}
            className="rounded-xl bg-ink text-white px-4 py-2.5 text-sm font-bold disabled:opacity-40"
          >
            {loading ? 'Calculando…' : 'Buscar planes'}
          </button>
          <button
            onClick={() => run(true)}
            disabled={loading}
            className="rounded-xl bg-plum/10 text-plum px-4 py-2.5 text-sm font-bold disabled:opacity-40"
          >
            Ver demo (ejemplo A–I)
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-5 rounded-xl bg-coral/10 text-coral px-4 py-3 text-sm">{error}</p>
      )}

      {data && (
        <div className="mt-7">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold">
              {data.clusters.length} plan{data.clusters.length === 1 ? '' : 'es'} posible
              {data.clusters.length === 1 ? '' : 's'}
            </h2>
            <span className="text-xs text-ink/45">
              {data.mode === 'ego' && data.ego
                ? `pool de ${data.ego.name}: ${data.pool?.length ?? 0} personas`
                : `${data.userCount} usuarios`}
            </span>
          </div>

          <div className="mt-4 grid gap-4">
            {data.clusters.map((c, i) => (
              <div key={i} className="bg-white/80 border border-ink/10 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-ink/35">
                    {c.size} personas
                  </span>
                  <span className="text-xs text-ink/35">score {c.score.toFixed(1)}</span>
                </div>

                {/* Shared interests */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.titleTags.map((t) => (
                    <span key={t} className="rounded-full bg-plum text-white text-xs font-semibold px-2.5 py-1">
                      {t}
                    </span>
                  ))}
                  {c.categoryTags.map((t) => (
                    <span key={t} className="rounded-full bg-ink/8 text-ink/70 text-xs font-medium px-2.5 py-1">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Members */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.members.map((m) => (
                    <span key={m.slug} className="rounded-lg bg-cream border border-ink/10 text-ink text-sm px-2.5 py-1">
                      {m.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
