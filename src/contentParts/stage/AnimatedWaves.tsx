import React, { useRef, useEffect } from "react";

// Each layer is built from several harmonics with deliberately incommensurate
// wavelengths/speeds (and some travelling in the opposite direction) so the
// crests never line up. This keeps the waterline looking organic and constantly
// out of sync instead of a single repeating sine.
interface Harmonic {
    amplitude: number;
    wavelength: number;
    speed: number;
    phase: number;
}

interface WaveConfig {
    opacity: number;
    yOffset: number;
    harmonics: Harmonic[];
}

const WAVE_CONFIGS: WaveConfig[] = [
    {
        opacity: 1,
        yOffset: 0,
        harmonics: [
            { amplitude: 20, wavelength: 620, speed: 0.22, phase: 0 },
            { amplitude: 11, wavelength: 290, speed: -0.31, phase: 1.7 },
            { amplitude: 6, wavelength: 150, speed: 0.47, phase: 4.1 },
        ],
    },
    {
        opacity: 0.5,
        yOffset: 14,
        harmonics: [
            { amplitude: 16, wavelength: 470, speed: -0.17, phase: 2.4 },
            { amplitude: 9, wavelength: 230, speed: 0.29, phase: 0.6 },
            { amplitude: 5, wavelength: 110, speed: -0.53, phase: 3.3 },
        ],
    },
    {
        opacity: 0.3,
        yOffset: 26,
        harmonics: [
            { amplitude: 13, wavelength: 540, speed: 0.13, phase: 5.0 },
            { amplitude: 7, wavelength: 270, speed: -0.23, phase: 1.1 },
            { amplitude: 4, wavelength: 130, speed: 0.41, phase: 2.7 },
        ],
    },
    {
        opacity: 0.18,
        yOffset: 40,
        harmonics: [
            { amplitude: 10, wavelength: 700, speed: -0.09, phase: 3.8 },
            { amplitude: 6, wavelength: 330, speed: 0.19, phase: 0.2 },
            { amplitude: 3, wavelength: 90, speed: -0.61, phase: 4.6 },
        ],
    },
];

const CANVAS_HEIGHT = 120;

export const AnimatedWaves: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = canvas.parentElement
            ? canvas.parentElement.offsetWidth
            : 1440;
        const height = CANVAS_HEIGHT;
        canvas.width = width;
        canvas.height = height;

        const handleResize = () => {
            width = canvas.parentElement
                ? canvas.parentElement.offsetWidth
                : 1440;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener("resize", handleResize);

        const start = performance.now();

        function drawWaves(time: number) {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);
            WAVE_CONFIGS.forEach((wave) => {
                ctx.save();
                ctx.globalAlpha = wave.opacity;
                ctx.beginPath();
                ctx.moveTo(0, height);
                const baseline = height - 40 - wave.yOffset;
                for (let x = 0; x <= width; x += 2) {
                    let y = baseline;
                    // Sum the harmonics; each drifts at its own speed/direction
                    // so the layer's surface keeps shifting shape over time.
                    for (let h = 0; h < wave.harmonics.length; h++) {
                        const harmonic = wave.harmonics[h];
                        const t =
                            (x / harmonic.wavelength +
                                (time * harmonic.speed) / 1000) *
                                2 *
                                Math.PI +
                            harmonic.phase;
                        y += Math.sin(t) * harmonic.amplitude;
                    }
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(width, height);
                ctx.closePath();
                ctx.fillStyle = "#fff";
                ctx.fill();
                ctx.restore();
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
            style={{ width: "100%", height: CANVAS_HEIGHT, display: "block" }}
            height={CANVAS_HEIGHT}
        />
    );
};

export default AnimatedWaves;
