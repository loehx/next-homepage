import React, { Suspense, useRef, useEffect, useCallback } from "react";
import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei/core/Gltf";
import * as THREE from "three";
import { TextureLoader } from "three";
import styles from "./Phone3D.module.css";

// Shared pointer state (normalized -1..1, where 0,0 is screen centre).
// Updated from mouse, touch, gyroscope and scroll listeners.
const pointerState = { x: 0, y: 0, scrollY: 0 };

interface PhoneMeshProps {
    imageUrl: string;
    onModelReady?: () => void;
    livelyIdle: boolean;
}

function PhoneMesh({ imageUrl, onModelReady, livelyIdle }: PhoneMeshProps) {
    const { scene } = useGLTF("/models/tabletop_macbook_iphone.glb");
    const texture = useLoader(TextureLoader, imageUrl);
    const [iphone, setIphone] = React.useState<THREE.Object3D | null>(null);
    const groupRef = useRef<THREE.Group>(null);
    const { gl } = useThree();
    const hasNotifiedRef = useRef(false);

    // Smoothed target rotations so input feels buttery.
    const smoothed = useRef({ rotX: 0, rotY: 0, posZ: 0 });

    useEffect(() => {
        if (!scene) return;

        // Crisp screen texture
        texture.encoding = THREE.sRGBEncoding;
        texture.flipY = true;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.anisotropy = gl.capabilities.getMaxAnisotropy();

        // object-fit: cover on the iPhone screen aspect ratio (~19.5:9)
        const screenAspect = 9 / 19.5;
        const imageAspect = texture.image.width / texture.image.height;

        if (imageAspect > screenAspect) {
            texture.repeat.set(screenAspect / imageAspect, 1);
            texture.offset.set((1 - screenAspect / imageAspect) / 2, 0);
        } else {
            texture.repeat.set(1, imageAspect / screenAspect);
            texture.offset.set(0, (1 - imageAspect / screenAspect) / 2);
        }
        texture.needsUpdate = true;

        const iphoneObj = scene.getObjectByName("iphone");
        if (iphoneObj) {
            setIphone(iphoneObj);

            const screenMesh = scene.getObjectByName(
                "xXDHkMplTIDAXLN",
            ) as THREE.Mesh;

            if (screenMesh) {
                screenMesh.material = new THREE.MeshBasicMaterial({
                    map: texture,
                    toneMapped: false,
                });
            }

            if (!hasNotifiedRef.current && onModelReady) {
                hasNotifiedRef.current = true;
                onModelReady();
            }
        }
    }, [scene, texture, gl, onModelReady]);

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime;

        // Idle motion so the model is always subtly alive (more pronounced
        // when we don't have a pointer to follow, e.g. on mobile).
        const idleScale = livelyIdle ? 1.6 : 1;
        const idleRotX = Math.sin(t * 0.6) * 0.05 * idleScale;
        const idleRotY = Math.sin(t * 0.45 + 1.2) * 0.07 * idleScale;
        const idlePosY = Math.sin(t * 0.8) * 0.06 * idleScale;

        // Scroll adds a tiny dive downward as you scroll past
        const scrollTilt = Math.min(Math.max(pointerState.scrollY, 0), 1.2);

        // Target rotations driven by pointer / gyro
        // Negative on rotX because moving the mouse up should tilt the top
        // of the phone toward the viewer.
        const targetRotX = -pointerState.y * 0.28 - scrollTilt * 0.08;
        const targetRotY = pointerState.x * 0.42;
        const targetPosZ =
            (1 - Math.min(pointerState.x ** 2 + pointerState.y ** 2, 1)) * 0.15;

        // Critically damped feel via simple lerp
        const damp = 0.085;
        smoothed.current.rotX += (targetRotX - smoothed.current.rotX) * damp;
        smoothed.current.rotY += (targetRotY - smoothed.current.rotY) * damp;
        smoothed.current.posZ += (targetPosZ - smoothed.current.posZ) * damp;

        groupRef.current.rotation.x = smoothed.current.rotX + idleRotX;
        groupRef.current.rotation.y = smoothed.current.rotY + idleRotY;
        groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.015;
        groupRef.current.position.y = idlePosY - scrollTilt * 0.2;
        groupRef.current.position.z = smoothed.current.posZ;
    });

    if (!iphone) return null;

    return (
        <group ref={groupRef}>
            <primitive
                object={iphone}
                scale={18}
                position={[0.1, 0, 0]}
                rotation={[0.1, Math.PI + 0.08, 0.02]}
            />
        </group>
    );
}

interface Phone3DProps {
    imageUrl: string;
    onLoad?: () => void;
}

export const Phone3D: React.FC<Phone3DProps> = ({ imageUrl, onLoad }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isModelReady, setIsModelReady] = React.useState(false);
    const [isCoarsePointer, setIsCoarsePointer] = React.useState(false);
    const [inView, setInView] = React.useState(true);
    const [pageVisible, setPageVisible] = React.useState(true);

    const handleModelReady = useCallback(() => {
        setIsModelReady(true);
        onLoad?.();
    }, [onLoad]);

    // Detect coarse pointer (touch) devices so we can dial up the idle motion
    // and dial down the rendering cost.
    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return;
        const mq = window.matchMedia("(pointer: coarse)");
        setIsCoarsePointer(mq.matches);
        const onChange = (e: MediaQueryListEvent) =>
            setIsCoarsePointer(e.matches);
        if (mq.addEventListener) mq.addEventListener("change", onChange);
        else mq.addListener(onChange);
        return () => {
            if (mq.removeEventListener)
                mq.removeEventListener("change", onChange);
            else mq.removeListener(onChange);
        };
    }, []);

    // Stop rendering when the canvas scrolls off-screen. This is by far the
    // biggest perf win: with frameloop="never" R3F skips the entire WebGL
    // pipeline per frame.
    useEffect(() => {
        const el = containerRef.current;
        if (!el || typeof IntersectionObserver === "undefined") return;
        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) setInView(entry.isIntersecting);
            },
            { rootMargin: "150px" },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    // Pause when the tab is in the background.
    useEffect(() => {
        if (typeof document === "undefined") return;
        const onVis = () => setPageVisible(!document.hidden);
        document.addEventListener("visibilitychange", onVis);
        return () => document.removeEventListener("visibilitychange", onVis);
    }, []);

    // Pointer / scroll / gyroscope -> normalised input. Only wired up while
    // the canvas is on-screen so we don't keep doing input bookkeeping for
    // a phone the user can't see.
    useEffect(() => {
        if (!inView) return;

        const updatePointer = (clientX: number, clientY: number) => {
            pointerState.x = (clientX / window.innerWidth) * 2 - 1;
            pointerState.y = -((clientY / window.innerHeight) * 2 - 1);
        };

        const handleMouseMove = (e: MouseEvent) =>
            updatePointer(e.clientX, e.clientY);
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                updatePointer(e.touches[0].clientX, e.touches[0].clientY);
            }
        };
        const handleScroll = () => {
            pointerState.scrollY = window.scrollY / (window.innerHeight || 1);
        };

        // Gyroscope (where available, no iOS permission prompt; falls back
        // silently elsewhere). gamma is left-right tilt (-90..90),
        // beta is front-back tilt (-180..180).
        const handleOrientation = (e: DeviceOrientationEvent) => {
            if (e.gamma == null || e.beta == null) return;
            // Clamp to a comfortable range so the phone never spins wildly.
            const gx = Math.max(-30, Math.min(30, e.gamma)) / 30;
            const gy = (Math.max(-45, Math.min(45, e.beta - 35)) / 45) * -1;
            // Gentle blend so it adds on top of any explicit touch input.
            pointerState.x = pointerState.x * 0.4 + gx * 0.6;
            pointerState.y = pointerState.y * 0.4 + gy * 0.6;
        };

        window.addEventListener("mousemove", handleMouseMove, {
            passive: true,
        });
        window.addEventListener("touchmove", handleTouchMove, {
            passive: true,
        });
        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("deviceorientation", handleOrientation);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("deviceorientation", handleOrientation);
        };
    }, [inView]);

    return (
        <div
            ref={containerRef}
            className={styles.container}
            data-loaded={isModelReady}
        >
            <Canvas
                className={styles.canvas}
                // Cap DPR aggressively. Mobile retina screens push out 4x the
                // pixels for the same visible size, so we clamp lower there.
                dpr={isCoarsePointer ? [1, 1] : [1, 1.5]}
                frameloop={inView && pageVisible ? "always" : "never"}
                gl={{
                    antialias: false,
                    alpha: true,
                    powerPreference: "default",
                    stencil: false,
                    depth: true,
                }}
                camera={{ position: [0, 0, 5], fov: 40 }}
            >
                <ambientLight intensity={0.55} />
                <directionalLight position={[5, 5, 8]} intensity={1.8} />
                <Suspense fallback={null}>
                    <PhoneMesh
                        imageUrl={imageUrl}
                        onModelReady={handleModelReady}
                        livelyIdle={isCoarsePointer}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default Phone3D;

useGLTF.preload("/models/tabletop_macbook_iphone.glb");
