import React, { useRef, useEffect } from "react";

// Three layered waterlines, each a single clean sine travelling left to right
// at its own speed. Wavelengths are expressed as "waves across the viewport"
// (~1.5) so they scale with the canvas width. A faint blue tint on the back
// layers adds depth.
interface Swell {
    amplitude: number;
    // Number of full waves to fit across the viewport width. The pixel
    // wavelength is derived from the canvas width at draw time, so the waves
    // scale with the viewport instead of being a fixed size.
    waves: number;
    speed: number;
    phase: number;
}

interface WaveConfig {
    color: string;
    yOffset: number;
    swells: Swell[];
}

const WAVE_CONFIGS: WaveConfig[] = [
    {
        color: "rgba(214, 230, 245, 0.35)",
        yOffset: 0,
        swells: [{ amplitude: 26, waves: 1.25, speed: -0.04, phase: 1.1 }],
    },
    {
        color: "rgba(232, 241, 250, 0.55)",
        yOffset: 0,
        swells: [{ amplitude: 32, waves: 1.75, speed: -0.07, phase: 2.4 }],
    },
    {
        color: "rgba(255, 255, 255, 1)",
        yOffset: 10,
        swells: [{ amplitude: 24, waves: 1.5, speed: -0.1, phase: 0 }],
        // front white is fastest; the two layers behind roll slower
    },
];

// On desktop we want somewhat more, tighter waves across the viewport than on
// mobile, where a couple of wide waves read better. The configured `waves`
// counts are the mobile baseline and get multiplied on wider screens.
const DESKTOP_BREAKPOINT_PX = 800;
const DESKTOP_WAVES_MULTIPLIER = 1.1;

// Canvas height as a fraction of the viewport height (25vh).
const CANVAS_HEIGHT_VH = 0.25;
const getCanvasHeight = () =>
    typeof window !== "undefined"
        ? Math.round(window.innerHeight * CANVAS_HEIGHT_VH)
        : 160;

// Intro sweep tuning: how long the wavefront takes to cross the full width,
// how wide the fade-in band at the front is, and how much later each successive
// layer starts so they build up one after another.
const INTRO_SEC = 5;
const INTRO_RAMP_PX = 360;
const LAYER_STAGGER_SEC = 0.9;

export const AnimatedWaves: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr =
            typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        let height = getCanvasHeight();
        let width = canvas.parentElement
            ? canvas.parentElement.offsetWidth
            : 1440;

        const setupCanvas = () => {
            height = getCanvasHeight();
            width = canvas.parentElement
                ? canvas.parentElement.offsetWidth
                : 1440;
            canvas.style.height = `${height}px`;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        setupCanvas();

        const handleResize = () => setupCanvas();
        window.addEventListener("resize", handleResize);

        const start = performance.now();

        function surfaceY(
            wave: WaveConfig,
            waveIndex: number,
            x: number,
            seconds: number,
        ) {
            const baseline = height * 0.5 + wave.yOffset;

            // Intro envelope: the surface starts flat and a wavefront sweeps in
            // from the left. Behind the front the water is fully wavy; ahead of
            // it it's still flat. The front advances rightward over INTRO_SEC,
            // revealing crests one after another (1, then 2, then 3...). Each
            // layer starts a little later so they build up in sequence.
            const local = seconds - waveIndex * LAYER_STAGGER_SEC;
            let env = 0;
            if (local > 0) {
                const frontX = (local / INTRO_SEC) * (width + INTRO_RAMP_PX);
                env = (frontX - x) / INTRO_RAMP_PX;
                env = env < 0 ? 0 : env > 1 ? 1 : env;
            }
            if (env <= 0) return baseline;

            // A single clean sine per layer, travelling left to right. Negative
            // speed advances the crests rightward over time.
            const wavesMultiplier =
                width >= DESKTOP_BREAKPOINT_PX ? DESKTOP_WAVES_MULTIPLIER : 1;
            let displacement = 0;
            for (let s = 0; s < wave.swells.length; s++) {
                const swell = wave.swells[s];
                const wavelength = width / (swell.waves * wavesMultiplier);
                const t =
                    (x / wavelength + seconds * swell.speed) * 2 * Math.PI +
                    swell.phase;
                displacement += Math.sin(t) * swell.amplitude;
            }
            return baseline + displacement * env;
        }

        function drawWaves(time: number) {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);
            const seconds = time / 1000;

            WAVE_CONFIGS.forEach((wave, waveIndex) => {
                ctx.beginPath();
                ctx.moveTo(0, height);
                ctx.lineTo(0, surfaceY(wave, waveIndex, 0, seconds));
                // A fine step keeps the smooth swell silhouette crisp.
                for (let x = 0; x <= width; x += 4) {
                    ctx.lineTo(x, surfaceY(wave, waveIndex, x, seconds));
                }
                ctx.lineTo(width, height);
                ctx.closePath();
                ctx.fillStyle = wave.color;
                ctx.fill();
            });
        }

        function animate(now: number) {
            if (!ctx) return;
            drawWaves(now - start);
            animationRef.current = requestAnimationFrame(animate);
        }
        animationRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("resize", handleResize);
            if (animationRef.current)
                cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{ width: "100%", height: "25vh", display: "block" }}
        />
    );
};

export default AnimatedWaves;
