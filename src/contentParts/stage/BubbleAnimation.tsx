import React, { useEffect, useRef } from "react";
import { useIsMobile } from "src/hooks";

export const BubblesAnimation: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile(true);

    // Background circles data
    const backgroundCircles = useRef<
        Array<{
            x: number;
            y: number;
            radius: number;
            color: string;
            speed: number;
            angle: number;
        }>
    >([]);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const backgroundCanvas = backgroundCanvasRef.current!;
        const container = containerRef.current!;
        if (!canvas || !backgroundCanvas || !container) return;
        const ctx = canvas.getContext("2d")!;
        const bgCtx = backgroundCanvas.getContext("2d")!;
        if (!ctx || !bgCtx) return;

        const baseBubbleCount = isMobile ? 15 : 50;
        const bubbles = [] as Array<{
            x: number;
            y: number;
            radius: number;
            speed: number;
            angle: number;
            wobble: number;
            wobbleSpeed: number;
            amplitude: number;
        }>;

        let animationFrameId: number;
        let lastTime = 0;
        const targetFPS = 30;
        const frameInterval = 1000 / targetFPS;

        function resizeCanvas() {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            backgroundCanvas.width = container.offsetWidth;
            backgroundCanvas.height = container.offsetHeight;
        }

        function createBubble() {
            const r = Math.random();
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = r * 1 + 0.5;
            const speed = r * 2 + 0.4;
            const angle = Math.random() * Math.PI * 2;
            const wobble = r * Math.PI * 10;
            const wobbleSpeed = r * 0.5 + 0.04;
            const amplitude = Math.random() * 3 + 2;
            bubbles.push({
                x,
                y,
                radius,
                speed,
                angle,
                wobble,
                wobbleSpeed,
                amplitude,
            });
        }

        function updateBubbles() {
            for (let i = 0; i < bubbles.length; i++) {
                const bubble = bubbles[i];

                bubble.wobble += bubble.wobbleSpeed;
                bubble.y -= bubble.speed;
                bubble.x += Math.sin(bubble.wobble) * bubble.amplitude * 0.1;

                if (bubble.y < -10) {
                    bubble.y = canvas.height + 10;
                    bubble.x = Math.random() * canvas.width;
                }

                if (bubble.x < 0) bubble.x = canvas.width;
                if (bubble.x > canvas.width) bubble.x = 0;
            }
        }

        function drawBubbles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < bubbles.length; i++) {
                const bubble = bubbles[i];
                ctx.beginPath();
                ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                ctx.fill();
            }
        }

        function initBackgroundCircles() {
            const colors = [
                "rgba(255, 0, 0, 0.15)",
                "rgba(0, 0, 255, 0.15)",
                "rgba(255, 255, 0, 0.15)",
                "rgba(255, 0, 255, 0.15)",
                "rgba(0, 255, 255, 0.15)",
            ];

            for (let i = 0; i < 10; i++) {
                backgroundCircles.current.push({
                    x: Math.random() * backgroundCanvas.width,
                    y: Math.random() * backgroundCanvas.height,
                    radius: Math.random() * 300 + 200,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    speed: 0,
                    angle: 0,
                });
            }
        }

        function updateBackgroundCircles() {
            backgroundCircles.current.forEach((circle) => {
                circle.angle += circle.speed * 0.01;
                circle.x += Math.cos(circle.angle) * circle.speed;
                circle.y += Math.sin(circle.angle) * circle.speed;

                // Wrap around the canvas
                if (circle.x < -circle.radius)
                    circle.x = backgroundCanvas.width + circle.radius;
                if (circle.x > backgroundCanvas.width + circle.radius)
                    circle.x = -circle.radius;
                if (circle.y < -circle.radius)
                    circle.y = backgroundCanvas.height + circle.radius;
                if (circle.y > backgroundCanvas.height + circle.radius)
                    circle.y = -circle.radius;
            });
        }

        function drawBackgroundCircles() {
            bgCtx.clearRect(
                0,
                0,
                backgroundCanvas.width,
                backgroundCanvas.height,
            );

            backgroundCircles.current.forEach((circle) => {
                bgCtx.beginPath();
                bgCtx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
                bgCtx.fillStyle = circle.color;
                bgCtx.fill();
            });
        }

        function animate(currentTime: number) {
            if (!lastTime) lastTime = currentTime;
            const elapsed = currentTime - lastTime;

            if (elapsed >= frameInterval) {
                lastTime = currentTime - (elapsed % frameInterval);

                updateBubbles();
                updateBackgroundCircles();
                drawBackgroundCircles();
                drawBubbles();
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        function init() {
            resizeCanvas();
            initBackgroundCircles();
            for (let i = 0; i < baseBubbleCount; i++) {
                createBubble();
            }
            animate(0);
        }

        window.addEventListener("resize", resizeCanvas);
        init();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isMobile]);

    return (
        <div
            id="container"
            ref={containerRef}
            style={{ position: "relative", width: "100%", height: "100%" }}
        >
            <div
                className="background absolute inset-0"
                style={{
                    background: "black",
                }}
            ></div>
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    filter: isMobile ? "blur(20px)" : "blur(50px)",
                    overflow: "hidden",
                }}
            >
                <canvas
                    id="backgroundCanvas"
                    ref={backgroundCanvasRef}
                    style={{ position: "absolute", top: 0, left: 0 }}
                ></canvas>
            </div>
            <canvas
                id="canvas"
                ref={canvasRef}
                style={{ position: "absolute", top: 0, left: 0 }}
            ></canvas>
        </div>
    );
};
