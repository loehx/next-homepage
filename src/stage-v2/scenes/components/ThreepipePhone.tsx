import React, { Suspense, useRef, useEffect, useCallback } from "react";
import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";
import styles from "./ThreepipePhone.module.css";

// Shared pointer state (normalized -1 to 1)
const pointerState = { x: 0, y: 0 };

// Camera controller that follows pointer with smooth interpolation
function PointerCameraController() {
    const { camera } = useThree();
    const targetPos = useRef({ x: 0, y: 0 });

    useFrame(() => {
        // Smooth interpolation towards target
        targetPos.current.x += (pointerState.x - targetPos.current.x) * 0.05;
        targetPos.current.y += (pointerState.y - targetPos.current.y) * 0.05;

        // Apply camera offset based on pointer position
        camera.position.x = targetPos.current.x * 2.5;
        camera.position.y = targetPos.current.y * 1.8;
        camera.position.z = 5;
        camera.lookAt(0, 0, 0);
    });

    return null;
}

interface PhoneModelProps {
    imageUrl: string;
    flipKey: number;
}

interface PhoneModelInnerProps extends PhoneModelProps {
    onModelReady?: () => void;
}

// Professional iPhone Model with floating animation and flip
function RealPhoneModel({ imageUrl, flipKey, onModelReady }: PhoneModelInnerProps) {
    const { scene } = useGLTF("/models/tabletop_macbook_iphone.glb");
    const texture = useLoader(TextureLoader, imageUrl);
    const [iphone, setIphone] = React.useState<THREE.Object3D | null>(null);
    const groupRef = useRef<THREE.Group>(null);
    const { gl } = useThree();
    const hasNotifiedRef = useRef(false);

    // Track flip animation
    const flipState = useRef({ target: 0, current: 0, lastKey: flipKey });

    // Trigger flip when flipKey changes
    React.useEffect(() => {
        if (flipState.current.lastKey !== flipKey) {
            flipState.current.target += Math.PI * 2; // Add 360 degrees
            flipState.current.lastKey = flipKey;
        }
    }, [flipKey]);

    React.useEffect(() => {
        if (!scene) return;

        // Sharp texture settings
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.flipY = true;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.anisotropy = gl.capabilities.getMaxAnisotropy();

        // iPhone screen aspect ratio (approximate 19.5:9 for modern iPhones)
        const screenAspect = 9 / 19.5;
        // Image aspect ratio from loaded texture
        const imageAspect = texture.image.width / texture.image.height;

        // Apply "object-fit: cover" style cropping
        if (imageAspect > screenAspect) {
            // Image is wider than screen - crop horizontally
            texture.repeat.set(screenAspect / imageAspect, 1);
            texture.offset.set((1 - screenAspect / imageAspect) / 2, 0);
        } else {
            // Image is taller than screen - crop vertically
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
                // Use MeshBasicMaterial for exact color reproduction (no lighting)
                const basicMaterial = new THREE.MeshBasicMaterial({
                    map: texture,
                    toneMapped: false,
                });
                screenMesh.material = basicMaterial;
            }

            // Notify parent that model is ready
            if (!hasNotifiedRef.current && onModelReady) {
                hasNotifiedRef.current = true;
                onModelReady();
            }
        }
    }, [scene, texture, gl, onModelReady]);

    // Floating animation + flip animation
    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime;

        // Animate flip rotation (smooth easing)
        const flipDiff = flipState.current.target - flipState.current.current;
        flipState.current.current += flipDiff * 0.08;

        // Subtle floating up/down
        groupRef.current.position.y = Math.sin(t * 0.8) * 0.08;
        // Combine flip rotation with gentle wobble
        groupRef.current.rotation.y =
            flipState.current.current + Math.sin(t * 0.5) * 0.04;
        groupRef.current.rotation.x = Math.sin(t * 0.7) * 0.03;
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

interface ThreepipePhoneProps {
    imageUrl: string;
    hueRotate: number;
    isVisible: boolean;
    flipKey?: number;
    onLoad?: () => void;
}

export const ThreepipePhone: React.FC<ThreepipePhoneProps> = ({
    imageUrl,
    hueRotate,
    isVisible,
    flipKey = 0,
    onLoad,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isCanvasReady, setIsCanvasReady] = React.useState(false);
    const [isModelReady, setIsModelReady] = React.useState(false);

    const handleCanvasReady = useCallback(() => {
        setIsCanvasReady(true);
    }, []);

    const handleModelReady = useCallback(() => {
        setIsModelReady(true);
        onLoad?.();
    }, [onLoad]);

    // Track pointer position (mouse and touch)
    useEffect(() => {
        const updatePointer = (clientX: number, clientY: number) => {
            // Normalize to -1 to 1 based on screen center
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

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("touchmove", handleTouchMove, {
            passive: true,
        });

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={styles.container}
            style={{ visibility: isVisible ? "visible" : "hidden" }}
        >
            <Canvas
                className={styles.canvas}
                style={
                    { "--hue-rotate": `${hueRotate}deg` } as React.CSSProperties
                }
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: "high-performance",
                }}
                camera={{ position: [0, 0, 5], fov: 40 }}
                onCreated={handleCanvasReady}
            >
                <PointerCameraController />
                <ambientLight intensity={0.4} />
                <directionalLight position={[5, 5, 8]} intensity={1.8} />
                <directionalLight position={[-5, -3, -5]} intensity={0.4} />
                <pointLight
                    position={[0, 3, 4]}
                    intensity={0.5}
                    color="#ffffff"
                />
                <Suspense
                    fallback={
                        <mesh>
                            <boxGeometry args={[0.8, 1.7, 0.08]} />
                            <meshStandardMaterial color="#1a1a1a" />
                        </mesh>
                    }
                >
                    <RealPhoneModel
                        imageUrl={imageUrl}
                        flipKey={flipKey}
                        onModelReady={handleModelReady}
                    />
                </Suspense>
            </Canvas>
            {!isModelReady && (
                <div className={styles.loader}>Loading 3D iPhone...</div>
            )}
        </div>
    );
};

// Preload the model
useGLTF.preload("/models/tabletop_macbook_iphone.glb");
