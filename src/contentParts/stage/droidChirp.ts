/**
 * Plays a short, randomized R2-D2-style chirp using the Web Audio API.
 *
 * Why synthesize instead of bundling a sample: every R2-D2 sample I could
 * find online that is direct-downloadable is either copyright-infringing
 * (ripped from the films) or behind a login (freesound.org CC0). The
 * original R2-D2 sounds were synthesized on an ARP 2600 analog synth using
 * frequency-modulated square/triangle tones — which is exactly what we're
 * emulating here, license-clean and asset-free.
 *
 * If you ever drop a real WAV/MP3 into `public/`, switch this to an
 * `<audio>` element / `new Audio(...)` and call `.play()` instead.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
    if (!Ctor) return null;
    if (!audioCtx) {
        try {
            audioCtx = new Ctor();
        } catch {
            return null;
        }
    }
    return audioCtx;
}

/**
 * Fire a short droid chirp. Safe to call any number of times; each call
 * produces a slightly different sequence of 2–4 frequency-swept beeps so
 * the effect doesn't get stale on repeat asks.
 *
 * Browser audio policy requires this to be invoked from (or after) a user
 * gesture. In our flow the user has clicked "Wake up AI" before the first
 * chirp, so the context unlocks naturally.
 */
export function playDroidChirp(volume = 0.18): void {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
        void ctx.resume();
    }

    const chirpCount = 2 + Math.floor(Math.random() * 3); // 2–4 chirps
    let cursor = ctx.currentTime + 0.005;

    const master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);

    for (let i = 0; i < chirpCount; i++) {
        const duration = 0.05 + Math.random() * 0.12; // 50–170 ms
        const startFreq = 400 + Math.random() * 2200;
        const endFreq = 400 + Math.random() * 2200;
        const wave: OscillatorType =
            Math.random() < 0.5 ? "square" : "triangle";

        const osc = ctx.createOscillator();
        osc.type = wave;
        osc.frequency.setValueAtTime(startFreq, cursor);
        osc.frequency.exponentialRampToValueAtTime(
            Math.max(endFreq, 80),
            cursor + duration,
        );

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, cursor);
        gain.gain.exponentialRampToValueAtTime(1, cursor + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, cursor + duration);

        osc.connect(gain).connect(master);
        osc.start(cursor);
        osc.stop(cursor + duration);

        cursor += duration + 0.02 + Math.random() * 0.04;
    }
}
