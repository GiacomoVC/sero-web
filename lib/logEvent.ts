import { createAdminClient, supabaseConfigured } from '@/lib/supabase/admin';

/**
 * The ONE instrumentation entrypoint. Every later session calls this to record
 * surface events into the `events` table — never inserts into `events` directly.
 *
 * Reserved top-level columns are pulled out of `props`; everything else is
 * stored as JSON in `events.props`.
 *
 * Fire-and-forget by design: it logs its own failures and never throws into the
 * caller's path, so instrumentation can never break a user-facing request.
 *
 *   await logEvent('reaction_curious', {
 *     handle: 'ana-perez',
 *     source_ref: signalId,
 *     world: 'musica',
 *     reaction_type: 'curious',
 *   });
 */
export interface LogEventProps {
  /** Actor's handle (users.handle). */
  handle?: string;
  /** The thing the event is about — a signal/obsesion/reaction id, etc. */
  source_ref?: string;
  /** World tag (worlds.id) so events aggregate per world. */
  world?: string;
  /** Any additional structured fields → stored in events.props. */
  [key: string]: unknown;
}

export async function logEvent(
  event_name: string,
  props: LogEventProps = {}
): Promise<void> {
  if (!supabaseConfigured()) {
    console.log('[logEvent] (no Supabase env)', event_name, props);
    return;
  }
  const { handle, source_ref, world, ...rest } = props;
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('events').insert({
      event_name,
      handle: handle ?? null,
      source_ref: source_ref ?? null,
      world: world ?? null,
      props: rest,
    });
    if (error) console.error('[logEvent]', event_name, error.message);
  } catch (e) {
    console.error('[logEvent] failed', event_name, e instanceof Error ? e.message : e);
  }
}
