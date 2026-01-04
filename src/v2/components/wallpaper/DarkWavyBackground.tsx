import React, { useRef, useEffect } from "react";
import styles from "./DarkWavyBackground.module.css";

const vertexShaderSource = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_uv = a_position * 0.5 + 0.5;
}
`;

// Scene generation shader - creates the base scene with depth
const sceneFragmentShaderSource = `
precision highp float;

#define uFar 12.0

uniform float u_time;
uniform vec2 u_resolution;

varying vec2 v_uv;

// Pseudo-random function for dithering
float random(vec2 uv) {
    return fract(sin(dot(uv.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

// Procedural color generator with gradient - darker grey
vec3 getGradientColor(vec2 uv) {
    // Gradient from left-top grey to bottom-right black
    // v_uv (0,1) is top-left, (1,0) is bottom-right
    float t = clamp((1.0 - uv.x + uv.y) * 0.5, 0.0, 1.0);
    return mix(vec3(0.007, 0.007, 0.007), vec3(0.19, 0.19, 0.19), t);
}

void main() {
    vec2 uv = v_uv;
    vec2 shiftedUv = uv - 0.5;
    shiftedUv.x *= u_resolution.x / u_resolution.y;
    
    float initialUvY = shiftedUv.y;
    
    // Background radial gradient from top-left grey to bottom-right black - much darker
    float bgDist = length(uv - vec2(0.0, 1.0));
    vec3 col = mix(vec3(0.09, 0.09, 0.09), vec3(0.007, 0.007, 0.007), clamp(bgDist * 1.2, 0.0, 1.0));
    float finalDepth = 0.0;
    
    // 6 overlapping waves with decreasing size
    float numWaves = 5.0;
    
    for (int i = 0; i < 5; i++) {
        // Reduced vertical wobble for a "less wavy" / calmer look
        float verticalWobble = 0.015 * sin(u_time * 0.1 + float(i) * 1.5);
        
        // Base thickness decreases with i, matching the previous spread
        float thickness = 0.9 - float(i) * 0.15;
        if (i < 4) thickness *= 0.7;
        
        float amp = 0.32 - float(i) * 0.04;
        float freq = 0.7 + float(i) * 0.5;

        // f centers the wave band vertically at initialUvY = 0
        // Midpoint of the wave band is roughly at (amp - thickness) / 2 + thickness / 2 in currentUvY
        float f = amp * 0.5 - thickness * 0.5 + verticalWobble;
        
        float currentUvY = initialUvY + f;
        
        // Frequencies and amplitude reduced for a "less wavy" / calmer look
        float freqTop = freq;
        float freqBottom = freq * 0.8; // 20% longer wavelength for the bottom
        
        // Speeds halved again to 50% of previous
        float speed = (0.1 + float(i) * 0.05) * (mod(float(i), 2.0) == 0.0 ? 1.0 : -1.0) * 0.5;
        float phase = float(i) * 3.7;
        
        // Simplified waves with much less interference for a smoother appearance
        float falloff = 0.07 + float(i) * 0.02;
        float falloffExp = exp(-falloff * shiftedUv.x * shiftedUv.x);

        // Calculate top wave
        float waveTop = sin(freqTop * shiftedUv.x + u_time * speed + phase);
        float interferenceTop = 0.1 * sin(freqTop * 1.2 * shiftedUv.x - u_time * speed * 0.5);
        float waveCurveTop = amp * pow(waveTop + interferenceTop, 2.0) * falloffExp;
        
        // Calculate bottom wave
        float waveBottom = sin(freqBottom * shiftedUv.x + u_time * speed + phase);
        float interferenceBottom = 0.1 * sin(freqBottom * 1.2 * shiftedUv.x - u_time * speed * 0.5);
        float waveCurveBottom = amp * pow(waveBottom + interferenceBottom, 2.0) * falloffExp;
        
        float distTop = waveCurveTop - currentUvY;
        float distBottom = waveCurveBottom - currentUvY;
        
        // 1. Bright drop-shadow ABOVE the top edge
        float brightShadow = smoothstep(0.0, -0.005, distTop) * smoothstep(-0.06, -0.005, distTop);
        col = mix(col, vec3(0.32, 0.32, 0.32), brightShadow * 0.05);

        // 2. Dark drop-shadow BELOW the bottom edge
        float darkShadow = smoothstep(thickness, thickness + 0.005, distBottom) * smoothstep(thickness + 0.08, thickness + 0.005, distBottom);
        col = mix(col, vec3(0.0, 0.0, 0.0), darkShadow * 0.25);

        // 3. The wave band itself
        float edgeSharpness = 2.0 / u_resolution.y;
        float mask = smoothstep(0.0, edgeSharpness, distTop) * smoothstep(thickness, thickness - edgeSharpness, distBottom);
        
        if (mask > 0.01) {
            vec3 baseCol = getGradientColor(uv);
            // Gradient is now equal for all waves (no darkening, full opacity)
            col = mix(col, baseCol, mask);
            finalDepth = mix(finalDepth, float(i) / numWaves, mask);
        }
    }
    
    // Apply dithering to reduce banding in dark gradients
    // We add a tiny amount of noise (1/255th) to smooth out the steps
    float dither = (random(v_uv + fract(u_time)) - 0.5) / 255.0;
    col += dither;
    
    gl_FragColor = vec4(col, finalDepth);
}
`;

// Depth of field shader - applies the blur effect
const dofFragmentShaderSource = `
precision highp float;

#define DISPLAY_GAMMA 1.9

#define GOLDEN_ANGLE 2.39996323
#define MAX_BLUR_SIZE 30.0

#define RAD_SCALE 0.5
#define uFar 12.0
#define FOCUS_SCALE 35.0

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_inputTexture;

varying vec2 v_uv;

// Pseudo-random function for dithering
float random(vec2 uv) {
    return fract(sin(dot(uv.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float getBlurSize(float depth, float focusPoint, float focusScale) {
    float coc = clamp((1.0 / focusPoint - 1.0 / depth) * focusScale, -1.0, 1.0);
    return abs(coc) * MAX_BLUR_SIZE;
}

vec3 depthOfField(vec2 texCoord, float focusPoint, float focusScale) {
    vec4 Input = texture2D(u_inputTexture, texCoord).rgba;
    float centerDepth = Input.a * uFar;
    float centerSize = getBlurSize(centerDepth, focusPoint, focusScale);
    vec3 color = Input.rgb;
    float tot = 1.0;
    
    vec2 texelSize = 1.0 / u_resolution;

    float radius = RAD_SCALE;
    float ang = 0.0;
    for (int i = 0; i < 200; i++) {
        if (radius >= MAX_BLUR_SIZE) break;
        
        vec2 tc = texCoord + vec2(cos(ang), sin(ang)) * texelSize * radius;
        
        vec4 sampleInput = texture2D(u_inputTexture, tc).rgba;

        vec3 sampleColor = sampleInput.rgb;
        float sampleDepth = sampleInput.a * uFar;
        float sampleSize = getBlurSize(sampleDepth, focusPoint, focusScale);
        
        if (sampleDepth > centerDepth) {
            sampleSize = clamp(sampleSize, 0.0, centerSize * 2.0);
        }

        float m = smoothstep(radius - 0.5, radius + 0.5, sampleSize);
        color += mix(color / tot, sampleColor, m);
        tot += 1.0;
        
        ang += GOLDEN_ANGLE;
        radius += RAD_SCALE / radius;
    }
    
    return color / tot;
}

void main() {
    vec2 uv = v_uv;
    
    float focusPoint = 58.0 - sin(u_time * 0.075) * 20.0;
    vec4 color = texture2D(u_inputTexture, uv);
    color.rgb = depthOfField(uv, focusPoint, FOCUS_SCALE);

    // Tone mapping
    color.rgb = vec3(1.7) * color.rgb / (1.0 + color.rgb);
    
    // Apply dithering before gamma correction
    float dither = (random(uv + fract(u_time)) - 0.5) / 255.0;
    color.rgb += dither;
    
    // Inverse gamma correction
    gl_FragColor = vec4(pow(color.rgb, vec3(1.0 / DISPLAY_GAMMA)), 1.0);
}
`;

export const DarkWavyBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const sceneProgramRef = useRef<WebGLProgram | null>(null);
    const dofProgramRef = useRef<WebGLProgram | null>(null);
    const inputTextureRef = useRef<WebGLTexture | null>(null);
    const framebufferRef = useRef<WebGLFramebuffer | null>(null);
    const positionBufferRef = useRef<WebGLBuffer | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl =
            (canvas.getContext("webgl2", { antialias: true }) as
                | WebGLRenderingContext
                | WebGL2RenderingContext) ||
            (canvas.getContext("webgl", { antialias: true }) as
                | WebGLRenderingContext
                | WebGL2RenderingContext);
        if (!gl) {
            console.error("WebGL not supported");
            return;
        }

        glRef.current = gl;

        // Set canvas size
        const resizeCanvas = () => {
            const container = canvas.parentElement;
            if (container) {
                const dpr = window.devicePixelRatio || 1;
                canvas.width =
                    (container.offsetWidth || window.innerWidth) * dpr;
                canvas.height =
                    (container.offsetHeight || window.innerHeight) * dpr;
                gl.viewport(0, 0, canvas.width, canvas.height);

                // Resize texture
                if (inputTextureRef.current) {
                    gl.bindTexture(gl.TEXTURE_2D, inputTextureRef.current);
                    gl.texImage2D(
                        gl.TEXTURE_2D,
                        0,
                        gl.RGBA,
                        canvas.width,
                        canvas.height,
                        0,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        null,
                    );
                }
            }
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // Create shader helper
        const createShader = (
            type: number,
            source: string,
        ): WebGLShader | null => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(
                    "Shader compile error:",
                    gl.getShaderInfoLog(shader),
                );
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        // Create scene generation program
        const sceneVertexShader = createShader(
            gl.VERTEX_SHADER,
            vertexShaderSource,
        );
        const sceneFragmentShader = createShader(
            gl.FRAGMENT_SHADER,
            sceneFragmentShaderSource,
        );
        if (!sceneVertexShader || !sceneFragmentShader) return;

        const sceneProgram = gl.createProgram();
        if (!sceneProgram) return;
        gl.attachShader(sceneProgram, sceneVertexShader);
        gl.attachShader(sceneProgram, sceneFragmentShader);
        gl.linkProgram(sceneProgram);
        if (!gl.getProgramParameter(sceneProgram, gl.LINK_STATUS)) {
            console.error(
                "Scene program link error:",
                gl.getProgramInfoLog(sceneProgram),
            );
            return;
        }
        sceneProgramRef.current = sceneProgram;

        // Create depth-of-field program
        const dofVertexShader = createShader(
            gl.VERTEX_SHADER,
            vertexShaderSource,
        );
        const dofFragmentShader = createShader(
            gl.FRAGMENT_SHADER,
            dofFragmentShaderSource,
        );
        if (!dofVertexShader || !dofFragmentShader) return;

        const dofProgram = gl.createProgram();
        if (!dofProgram) return;
        gl.attachShader(dofProgram, dofVertexShader);
        gl.attachShader(dofProgram, dofFragmentShader);
        gl.linkProgram(dofProgram);
        if (!gl.getProgramParameter(dofProgram, gl.LINK_STATUS)) {
            console.error(
                "DOF program link error:",
                gl.getProgramInfoLog(dofProgram),
            );
            return;
        }
        dofProgramRef.current = dofProgram;

        // Create quad geometry
        const positionBuffer = gl.createBuffer();
        if (!positionBuffer) return;
        positionBufferRef.current = positionBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = new Float32Array([
            -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        // Create framebuffer for input texture
        const inputTexture = gl.createTexture();
        const framebuffer = gl.createFramebuffer();
        if (!inputTexture || !framebuffer) return;
        inputTextureRef.current = inputTexture;
        framebufferRef.current = framebuffer;

        gl.bindTexture(gl.TEXTURE_2D, inputTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            canvas.width,
            canvas.height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
        );

        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            inputTexture,
            0,
        );

        // Render loop
        const startTime = Date.now();
        const render = () => {
            if (!gl || !sceneProgram || !dofProgram) return;

            const time = (Date.now() - startTime) / 1000.0;

            // Render scene directly to screen (no depth-of-field blur)
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.useProgram(sceneProgram);

            const scenePositionLocation = gl.getAttribLocation(
                sceneProgram,
                "a_position",
            );
            gl.enableVertexAttribArray(scenePositionLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(
                scenePositionLocation,
                2,
                gl.FLOAT,
                false,
                0,
                0,
            );

            const sceneTimeLocation = gl.getUniformLocation(
                sceneProgram,
                "u_time",
            );
            const sceneResolutionLocation = gl.getUniformLocation(
                sceneProgram,
                "u_resolution",
            );
            gl.uniform1f(sceneTimeLocation, time * 0.5);
            gl.uniform2f(sceneResolutionLocation, canvas.width, canvas.height);

            gl.drawArrays(gl.TRIANGLES, 0, 6);

            animationRef.current = requestAnimationFrame(render);
        };

        animationRef.current = requestAnimationFrame(render);

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (inputTextureRef.current) {
                gl.deleteTexture(inputTextureRef.current);
            }
            if (framebufferRef.current) {
                gl.deleteFramebuffer(framebufferRef.current);
            }
            if (positionBufferRef.current) {
                gl.deleteBuffer(positionBufferRef.current);
            }
            if (sceneProgramRef.current) {
                gl.deleteProgram(sceneProgramRef.current);
            }
            if (dofProgramRef.current) {
                gl.deleteProgram(dofProgramRef.current);
            }
        };
    }, []);

    return (
        <div className={styles.container}>
            <canvas ref={canvasRef} className={styles.canvas} />
        </div>
    );
};
