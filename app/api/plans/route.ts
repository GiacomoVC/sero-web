import { NextResponse } from 'next/server';
import { buildIndex, buildGraph, findPlans, findAllPlans, poolFor } from '@/lib/matching/engine';
import { DEMO_DATA, DEMO_EGO } from '@/lib/matching/demo';
import { loadExportData } from '@/lib/db/export';
import type { EdgeMode, ExportData, FindPlansOptions } from '@/lib/matching/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret') || '';
  const expected = process.env.WEBHOOK_SECRET;
  const demo = searchParams.get('demo') === '1';

  // Secret is enforced whenever one is configured (skipped only for demo).
  if (!demo && expected && secret !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let data: ExportData;
  try {
    data = demo ? DEMO_DATA : await loadExportData();
  } catch (e) {
    return NextResponse.json({ error: String(e instanceof Error ? e.message : e) }, { status: 502 });
  }

  const edgeMode = (searchParams.get('mode') as EdgeMode) || 'both';
  const opts: FindPlansOptions = {
    minSize: Number(searchParams.get('min')) || 4,
    maxSize: Number(searchParams.get('max')) || 9,
    requireEgo: searchParams.get('requireEgo') !== '0',
    edgeMode,
  };

  const idx = buildIndex(data);
  const adj = buildGraph(idx, data.friendships, edgeMode);

  const egoParam = searchParams.get('ego') || (demo ? DEMO_EGO : '');

  if (egoParam) {
    if (!idx.has(egoParam)) {
      return NextResponse.json(
        { error: `Unknown ego "${egoParam}"`, knownSlugs: [...idx.keys()] },
        { status: 404 }
      );
    }
    const poolSlugs = [...poolFor(egoParam, adj)];
    const clusters = findPlans(egoParam, idx, adj, opts);
    return NextResponse.json({
      mode: 'ego',
      ego: { slug: egoParam, name: idx.get(egoParam)!.name },
      userCount: idx.size,
      pool: poolSlugs.map((s) => ({ slug: s, name: idx.get(s)?.name || s })),
      clusters,
    });
  }

  const clusters = findAllPlans(idx, adj, opts);
  return NextResponse.json({
    mode: 'network',
    userCount: idx.size,
    egos: [...idx.keys()],
    clusters,
  });
}
