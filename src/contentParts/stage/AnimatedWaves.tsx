import React, { useRef, useEffect } from "react";

const WAVE_CONFIGS = [
    {
        amplitude: 24,
        wavelength: 500,
        speed: 0.2,
        opacity: 1,
        phase: 0,
        yOffset: 0,
    },
    {
        amplitude: 18,
        wavelength: 350,
        speed: 0.15,
        opacity: 0.5,
        phase: Math.PI / 2,
        yOffset: 12,
    },
    {
        amplitude: 14,
        wavelength: 300,
        speed: 0.1,
        opacity: 0.3,
        phase: Math.PI,
        yOffset: 24,
    },
    {
        amplitude: 10,
        wavelength: 250,
        speed: 0.1,
        opacity: 0.2,
        phase: Math.PI * 1.5,
        yOffset: 36,
    }, // slowest, most transparent
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
            WAVE_CONFIGS.forEach((wave, i) => {
                ctx.save();
                ctx.globalAlpha = wave.opacity;
                ctx.beginPath();
                ctx.moveTo(0, height);
                // Draw the wave
                for (let x = 0; x <= width; x += 2) {
                    // Use a combination of sine and cosine for a more organic look
                    const t =
                        (x / wave.wavelength + (time * wave.speed) / 1000) *
                            2 *
                            Math.PI +
                        wave.phase;
                    const y =
                        Math.sin(t) * wave.amplitude +
                        Math.cos(t * 0.7) * (wave.amplitude * 0.3) +
                        height -
                        40 -
                        wave.yOffset;
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
