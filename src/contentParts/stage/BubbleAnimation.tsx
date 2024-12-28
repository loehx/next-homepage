import React, { useEffect, useRef } from "react";
import { useIsMobile } from "src/hooks";

export const BubblesAnimation: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile(true);
    const cursorRef = useRef({ x: 0, y: 0 });
    const hasMouseMoved = useRef(false);
    const cursorBubblesCreated = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const container = containerRef.current!;
        if (!canvas || !container) return;
        const ctx = canvas.getContext("2d")!;
        if (!ctx) return;

        const baseBubbleCount = isMobile ? 25 : 250;
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

        function resizeCanvas() {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
        }

        function createBubble(nearCursor = false) {
            const x =
                nearCursor && cursorRef.current.x
                    ? getRandomX()
                    : Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 1.5 + 0.5;
            const speed = Math.random() * 1.2 + 0.4;
            const angle = Math.random() * Math.PI * 2;
            const wobble = Math.random() * Math.PI * 2;
            const wobbleSpeed = Math.random() * 0.08 + 0.04;
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
                    bubble.x =
                        i >= baseBubbleCount
                            ? getRandomX()
                            : Math.random() * canvas.width;
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

        function animate() {
            updateBubbles();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBubbles();
            requestAnimationFrame(animate);
        }

        function createCursorBubbles() {
            if (cursorBubblesCreated.current) return;
            for (let i = 0; i < baseBubbleCount * 2; i++) {
                createBubble(true);
            }
            cursorBubblesCreated.current = true;
        }

        function init() {
            resizeCanvas();
            for (let i = 0; i < baseBubbleCount; i++) {
                createBubble(false);
            }
            createCursorBubbles();
            animate();
        }

        function handleMouseMove(e: MouseEvent) {
            cursorRef.current = {
                x: e.clientX,
                y: e.clientY,
            };

            if (!hasMouseMoved.current) {
                hasMouseMoved.current = true;
            }
        }

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("resize", resizeCanvas);
        init();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            window.removeEventListener("mousemove", handleMouseMove);
            hasMouseMoved.current = false;
            cursorBubblesCreated.current = false;
        };
    }, [isMobile]);

    function getRandomX() {
        const range = 200;
        return cursorRef.current.x + (gaussianRand() * range - range / 2);
    }

    function gaussianRand(r = 10) {
        let rand = 0;
        for (let i = 0; i < r; i += 1) {
            rand += Math.random();
        }
        return rand / r;
    }

    return (
        <div
            id="container"
            ref={containerRef}
            style={{ position: "relative", width: "100%", height: "100%" }}
        >
            <div
                className="background absolute inset-0"
                style={{
                    background:
                        "linear-gradient(30deg, #9a2461 0%, #0182de 120%)",
                    animation: "hue-rotate-animation 10s infinite linear",
                }}
            ></div>
            <canvas
                id="canvas"
                ref={canvasRef}
                style={{ position: "absolute", top: 0, left: 0 }}
            ></canvas>
        </div>
    );
};
