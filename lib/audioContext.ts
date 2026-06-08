/**
 * Page-level AudioContext singleton for the video card soundtrack.
 *
 * iOS Safari rule: AudioContext.resume() and Audio.play() require a user
 * gesture. We can't autoplay the soundtrack when the share screen mounts
 * (it's inside a React useEffect, by definition outside a gesture).
 *
 * Strategy:
 *   1. Call `unlockAndPreload()` from a real user gesture — specifically the
 *      "Terminar" click in the quiz, which the user makes ~1-2 seconds before
 *      the share screen appears. That call:
 *        - Creates the AudioContext
 *        - Resumes it (now allowed because we're in a gesture)
 *        - Fetches + decodes the mp3 into an AudioBuffer
 *   2. Once unlocked, the AudioContext stays resumed for the page session.
 *      The StoryCard's recordVideo() can later play the buffer through a
 *      MediaStreamAudioDestinationNode and mix it into the canvas recording
 *      without needing any further gesture.
 *   3. If unlock fails (or never runs), `getAudioBuffer()` returns null and
 *      recordVideo() falls back to a silent recording. UX still works.
 */

let _ctx: AudioContext | null = null;
let _buffer: AudioBuffer | null = null;
let _preloadPromise: Promise<void> | null = null;
let _keepAlive: AudioBufferSourceNode | null = null;

const AUDIO_URL = '/video-card-music.mp3';

/**
 * iOS Safari auto-suspends AudioContext after a few seconds of inactivity,
 * even after resume(). To keep it alive between the quiz-Terminar click and
 * the share screen mount (which can be 3-5s due to submit+navigate), we play
 * a long silent buffer in a loop. Stopped when real audio kicks in.
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

function getCtx(): AudioContext | null {
  if (_ctx) return _ctx;
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    _ctx = new Ctor();
  } catch {
    return null;
  }
  return _ctx;
}

/**
 * MUST be called inside a user-gesture handler (e.g. button onClick) to
 * succeed on iOS Safari. Idempotent — safe to call multiple times.
 */
export async function unlockAndPreload(): Promise<void> {
  if (_preloadPromise) return _preloadPromise;
  const ctx = getCtx();
  if (!ctx) return;
  _preloadPromise = (async () => {
    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      // Keep ctx alive across the quiz->share navigation so the soundtrack
      // is audible during the live preview on mobile (iOS auto-suspends).
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
 * Build a MediaStream that carries the soundtrack audio, plus play it through
 * the speakers so the user hears it during the live preview/recording.
 * Returns null if audio isn't unlocked yet.
 */
export function createAudioStreamForRecording(): {
  stream: MediaStream;
  source: AudioBufferSourceNode;
} | null {
  const ctx = _ctx;
  const buf = _buffer;
  if (!ctx || !buf) return null;

  // Defensive: try to resume if still suspended. Won't always succeed if
  // gesture is gone, but doesn't hurt.
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  // Stop the silent keep-alive so it doesn't fight the real audio.
  stopKeepAlive();

  const source = ctx.createBufferSource();
  source.buffer = buf;
  const dest = ctx.createMediaStreamDestination();
  source.connect(dest);
  source.connect(ctx.destination); // also play through speakers
  return { stream: dest.stream, source };
}
