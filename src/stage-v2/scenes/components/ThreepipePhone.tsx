import React, { Suspense, useRef } from "react";
import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";
import styles from "./ThreepipePhone.module.css";

interface PhoneModelProps {
    imageUrl: string;
}

// Professional iPhone Model with floating animation
function RealPhoneModel({ imageUrl }: PhoneModelProps) {
    const { scene } = useGLTF("/models/tabletop_macbook_iphone.glb");
    const texture = useLoader(TextureLoader, imageUrl);
    const [iphone, setIphone] = React.useState<THREE.Object3D | null>(null);
    const groupRef = useRef<THREE.Group>(null);
    const { gl } = useThree();

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
        }
    }, [scene, texture, gl]);

    // Floating animation - subtle movement to show it's 3D
    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime;
        // Subtle floating up/down
        groupRef.current.position.y = Math.sin(t * 0.8) * 0.08;
        // Gentle rotation wobble (small offsets only)
        groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.04;
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
    onLoad?: () => void;
}

export const ThreepipePhone: React.FC<ThreepipePhoneProps> = ({
    imageUrl,
    hueRotate,
    isVisible,
    onLoad,
}) => {
    const [isLoaded, setIsLoaded] = React.useState(false);

    const handleLoad = React.useCallback(() => {
        setIsLoaded(true);
        onLoad?.();
    }, [onLoad]);

    if (!isVisible) return null;

    return (
        <div className={styles.container}>
            <Canvas
                className={styles.canvas}
                style={
                    {
                        "--hue-rotate": `${hueRotate}deg`,
                    } as React.CSSProperties
                }
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: "high-performance",
                }}
                onCreated={handleLoad}
            >
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={40} />
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
                    <RealPhoneModel imageUrl={imageUrl} />
                </Suspense>
            </Canvas>
            {!isLoaded && (
                <div className={styles.loader}>Loading 3D iPhone...</div>
            )}
        </div>
    );
};

// Preload the model
useGLTF.preload("/models/tabletop_macbook_iphone.glb");
