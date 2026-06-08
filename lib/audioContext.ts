/**
 * Soundtrack singleton for the video card.
 *
 * Why two parallel audio paths?
 *   - HTMLAudioElement.play() reliably reaches the iPhone speakers once
 *     unlocked by a user gesture. WebAudio output through `ctx.destination`
 *     is unreliable on iOS Safari (silent switch, ringer routing, partial
 *     context suspend mid-life). So: HTMLAudioElement = preview audible.
 *   - AudioBufferSourceNode → MediaStreamAudioDestinationNode gives us a
 *     proper audio track that MediaRecorder can mux into the mp4. So:
 *     WebAudio buffer = embedded in the shared video.
 *   Both are started at (nearly) the same instant so the preview and the
 *   recorded mp4 are in sync.
 *
 * iOS gesture rule:
 *   - AudioContext.resume() requires a user gesture for the very first call.
 *   - HTMLAudioElement.play() requires a gesture for the first call PER
 *     element. After that, subsequent play() calls work without one.
 *   We synchronously trigger BOTH (resume + audio.play()→pause()) inside the
 *   quiz "Terminar" click handler, then they stay unlocked for the rest of
 *   the session.
 */

let _ctx: AudioContext | null = null;
let _buffer: AudioBuffer | null = null;
let _audio: HTMLAudioElement | null = null;
let _preloadPromise: Promise<void> | null = null;
let _keepAlive: AudioBufferSourceNode | null = null;
let _audioUnlockTried = false;

const AUDIO_URL = '/video-card-music.mp3';

function getCtx(): AudioContext | null {
  if (_ctx) return _ctx;
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try { _ctx = new Ctor(); } catch { return null; }
  return _ctx;
}

function getAudio(): HTMLAudioElement | null {
  if (_audio) return _audio;
  if (typeof window === 'undefined') return null;
  const a = new Audio(AUDIO_URL);
  a.preload = 'auto';
  // playsinline avoids fullscreen takeover on iOS and signals media-style
  // playback (uses media volume rather than ringer volume).
  a.setAttribute('playsinline', '');
  a.setAttribute('webkit-playsinline', '');
  _audio = a;
  return _audio;
}

/**
 * Plays a silent loop on the WebAudio context to keep iOS from auto-suspending
 * it during the 3-5s gap between the quiz Terminar click and the share screen.
 */
function startKeepAlive(ctx: AudioContext) {
  if (_keepAlive) return;
  try {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 60, ctx.sampleRate);
    const source = ctx.createBufferSource();
    source.buffer = buf;
    source.loop = true;
    source.connect(ctx.destination);
    source.start(0);
    _keepAlive = source;
  } catch { /* ignore */ }
}

function stopKeepAlive() {
  if (_keepAlive) {
    try { _keepAlive.stop(); } catch { /* ignore */ }
    _keepAlive = null;
  }
}

/**
 * MUST be called inside a user-gesture handler (e.g. button onClick) to
 * succeed on iOS Safari. Idempotent — safe to call multiple times.
 *
 * Synchronously triggers both unlock paths so they each grab the gesture
 * context, then awaits their completion in the background.
 */
export function unlockAndPreload(): Promise<void> {
  if (_preloadPromise) return _preloadPromise;
  const ctx = getCtx();
  if (!ctx) return Promise.resolve();

  // ── 1. SYNCHRONOUS triggers, inside the gesture context ───────────────
  // AudioContext.resume() — return a Promise; the actual resume call is
  // synchronous from the gesture's perspective.
  const resumePromise =
    ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();

  // HTMLAudioElement unlock — muted play+pause cycle. Synchronously calls
  // .play() inside the gesture so iOS marks this element as "unlocked"
  // for future non-gesture play() calls in this session.
  let audioUnlockPromise: Promise<void> = Promise.resolve();
  if (!_audioUnlockTried) {
    _audioUnlockTried = true;
    const audio = getAudio();
    if (audio) {
      audio.muted = true;
      const p = audio.play();
      audioUnlockPromise = (p instanceof Promise ? p : Promise.resolve())
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
        })
        .catch(() => { /* couldn't unlock — fall back to silent recording */ });
    }
  }

  // ── 2. Background: wait for unlocks, keep ctx alive, fetch+decode mp3 ──
  _preloadPromise = (async () => {
    try {
      await Promise.all([resumePromise, audioUnlockPromise]);
      startKeepAlive(ctx);
      if (!_buffer) {
        const res = await fetch(AUDIO_URL);
        const ab = await res.arrayBuffer();
        _buffer = await ctx.decodeAudioData(ab);
      }
    } catch {
      // Silently ignore — recording will fall back to silent audio
    }
  })();
  return _preloadPromise;
}

export function getAudioContext(): AudioContext | null {
  return _ctx;
}

export function getAudioBuffer(): AudioBuffer | null {
  return _buffer;
}

/**
 * Builds the soundtrack apparatus for one recording:
 *   - `stream`: audio track for the MediaRecorder to mux into the mp4
 *   - `start()`: fires both speaker (HTMLAudioElement) and recording (Buffer)
 *     playback in sync
 *   - `stop()`: pauses speaker + stops recording source
 * Returns null if the soundtrack isn't ready yet (e.g. first paint on a
 * cold visitor who never clicked anything).
 */
export function createAudioStreamForRecording(): {
  stream: MediaStream;
  start: () => void;
  stop: () => void;
} | null {
  const ctx = _ctx;
  const buf = _buffer;
  const audio = getAudio();
  if (!ctx || !buf || !audio) return null;

  // Defensive resume — works without gesture if ctx was previously unlocked.
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  stopKeepAlive();

  // WebAudio path → ONLY MediaStream (not connected to ctx.destination since
  // iOS doesn't reliably route that to speakers). Speakers come from the
  // HTMLAudioElement below.
  const source = ctx.createBufferSource();
  source.buffer = buf;
  const dest = ctx.createMediaStreamDestination();
  source.connect(dest);

  return {
    stream: dest.stream,
    start: () => {
      try {
        audio.currentTime = 0;
        const p = audio.play();
        if (p instanceof Promise) p.catch(() => {});
      } catch { /* ignore */ }
      try { source.start(0); } catch { /* ignore */ }
    },
    stop: () => {
      try { audio.pause(); audio.currentTime = 0; } catch { /* ignore */ }
      try { source.stop(); } catch { /* ignore */ }
    },
  };
}
