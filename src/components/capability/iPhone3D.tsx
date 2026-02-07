import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import styles from "./iPhone3D.module.css";

type iPhone3DProps = {
  imageUrl?: string;
  hueRotate?: number;
  isVisible?: boolean;
  isLoaded?: boolean;
  flipKey?: number;
  onLoad?: () => void;
};

export function iPhone3D({
  imageUrl = "/storybook-iphone-screenshot.png",
  hueRotate = 0,
  isVisible = true,
  isLoaded,
  flipKey = 0,
  onLoad,
}: iPhone3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isModelReady, setIsModelReady] = useState(false);
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const flipStateRef = useRef({ target: 0, current: 0, lastKey: flipKey });
  const rotationRef = useRef({ x: 0.1, y: Math.PI + 0.08 });
  const targetRotationRef = useRef({ x: 0.1, y: Math.PI + 0.08 });
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const horizontalDragAccumulatorRef = useRef(0);
  const clockRef = useRef(new THREE.Clock());
  const textureRef = useRef<THREE.Texture | null>(null);
  const screenMeshRef = useRef<THREE.Mesh | null>(null);
  const dracoLoaderRef = useRef<DRACOLoader | null>(null);

  // Use isLoaded if provided, otherwise use isVisible
  const visible = isLoaded !== undefined ? isLoaded : isVisible;

  // Handle flipKey changes
  useEffect(() => {
    if (flipStateRef.current.lastKey !== flipKey) {
      flipStateRef.current.target += Math.PI * 2;
      flipStateRef.current.lastKey = flipKey;
    }
  }, [flipKey]);

  // Handle pointer events for rotation
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - lastPointerRef.current.x;
      const deltaY = e.clientY - lastPointerRef.current.y;

      // Horizontal drag: accumulate and trigger flips
      horizontalDragAccumulatorRef.current += deltaX;
      const flipThreshold = 100; // pixels to trigger a full flip
      
      if (Math.abs(horizontalDragAccumulatorRef.current) >= flipThreshold) {
        const flipDirection = horizontalDragAccumulatorRef.current > 0 ? 1 : -1;
        flipStateRef.current.target += Math.PI * 2 * flipDirection;
        horizontalDragAccumulatorRef.current = 0;
      }

      // Vertical movement: rotate on X-axis (keep as is)
      const sensitivity = 0.005;
      targetRotationRef.current.x += deltaY * sensitivity;

      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      horizontalDragAccumulatorRef.current = 0;
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  // Apply texture to screen
  const applyTexture = useCallback((texture: THREE.Texture, renderer: THREE.WebGLRenderer) => {
    if (!screenMeshRef.current) return;

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const screenAspect = 9 / 19.5;
    const img = texture.image as HTMLImageElement;
    const imageAspect = img.width / img.height;

    if (imageAspect > screenAspect) {
      texture.repeat.set(screenAspect / imageAspect, 1);
      texture.offset.set((1 - screenAspect / imageAspect) / 2, 0);
    } else {
      texture.repeat.set(1, imageAspect / screenAspect);
      texture.offset.set(0, (1 - imageAspect / screenAspect) / 2);
    }
    texture.needsUpdate = true;

    const basicMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      toneMapped: false,
    });
    screenMeshRef.current.material = basicMaterial;
  }, []);

  // Handle imageUrl changes
  useEffect(() => {
    if (!imageUrl || !rendererRef.current) return;

    const loader = new THREE.TextureLoader();
    loader.load(
      imageUrl,
      (texture) => {
        textureRef.current = texture;
        if (isModelReady && rendererRef.current) {
          applyTexture(texture, rendererRef.current);
        }
      },
      undefined,
      (error) => {
        console.error("Failed to load texture:", error);
      }
    );
  }, [imageUrl, applyTexture, isModelReady]);

  // Main Three.js setup
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.className = styles.canvas;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
    directionalLight1.position.set(5, 5, 8);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, -3, -5);
    scene.add(directionalLight2);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(0, 3, 4);
    scene.add(pointLight);

    // Model group
    const group = new THREE.Group();
    group.scale.set(1, 1, 1);
    group.position.set(0.1, 0, 0);
    group.rotation.set(0.1, Math.PI + 0.08, 0.02);
    scene.add(group);
    groupRef.current = group;

    // Load GLB model
    const gltfLoader = new GLTFLoader();
    
    // Setup DRACO loader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    gltfLoader.setDRACOLoader(dracoLoader);
    dracoLoaderRef.current = dracoLoader;
    
    gltfLoader.load(
      "/models/iphone_only.glb",
      (gltf) => {
        // Add the entire loaded scene to our group
        const model = gltf.scene;
        group.add(model);
        
        // Find screen mesh for texture
        let screenMesh: THREE.Mesh | null = null;
        let bestScreenScore = -1;
        model.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            const materialName = obj.material.name || '';
            obj.geometry.computeBoundingBox();
            const size = new THREE.Vector3();
            obj.geometry.boundingBox?.getSize(size);
            
            // Identification score
            let score = 0;
            if (obj.name.toLowerCase().includes('screen')) score += 100;
            if (obj.name.toLowerCase().includes('display')) score += 100;
            if (materialName.toLowerCase().includes('screen')) score += 100;
            if (materialName.toLowerCase().includes('display')) score += 100;
            if (materialName.toLowerCase().includes('wallpaper')) score += 100;
            if (obj.name === 'Object_7') score += 50;

            // Physical characteristics score (for iPhone model)
            const isFlat = size.z < 0.01;
            const isPortrait = size.y > size.x;
            const isRightSize = size.y > 10 && size.y < 16 && size.x > 5 && size.x < 8;
            
            if (isFlat && isPortrait && isRightSize) {
              score += 200;
              // Prefer the "inner" mesh (slightly smaller than full frame)
              if (size.x < 7.4) score += 50;
            }

            if (score > bestScreenScore) {
              bestScreenScore = score;
              screenMesh = obj;
            }
          }
        });
        
        screenMeshRef.current = screenMesh;
        
        // Apply texture if already loaded
        if (textureRef.current && screenMesh) {
          applyTexture(textureRef.current, renderer);
        }
        
        setIsModelReady(true);
        onLoad?.();
      },
      undefined,
      (error) => {
        console.error("Failed to load GLB model:", error);
      }
    );

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (!camera || !group || !renderer) return;

      const t = clockRef.current.getElapsedTime();

      // Camera position fixed
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);

      // Smooth rotation interpolation
      rotationRef.current.x += (targetRotationRef.current.x - rotationRef.current.x) * 0.1;
      rotationRef.current.y += (targetRotationRef.current.y - rotationRef.current.y) * 0.1;

      // Flip animation
      const flipDiff = flipStateRef.current.target - flipStateRef.current.current;
      flipStateRef.current.current += flipDiff * 0.08;

      // Floating animation + base rotation
      group.position.y = Math.sin(t * 0.8) * 0.08;
      
      // Apply smooth rotation to group
      group.rotation.x = rotationRef.current.x + Math.sin(t * 0.7) * 0.03;
      group.rotation.y = rotationRef.current.y + flipStateRef.current.current + Math.sin(t * 0.5) * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (textureRef.current) {
        textureRef.current.dispose();
      }

      if (screenMeshRef.current?.material instanceof THREE.Material) {
        screenMeshRef.current.material.dispose();
      }

      if (group) {
        group.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
              if (Array.isArray(obj.material)) {
                obj.material.forEach((mat) => mat.dispose());
              } else {
                obj.material.dispose();
              }
            }
          }
        });
      }

      if (renderer) {
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }

      if (dracoLoaderRef.current) {
        dracoLoaderRef.current.dispose();
        dracoLoaderRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={styles.container}
      style={{
        visibility: visible ? "visible" : "hidden",
        filter: `hue-rotate(${hueRotate}deg)`,
      }}
    >
      {!isModelReady && (
        <div className={styles.loader}>Loading 3D iPhone...</div>
      )}
    </div>
  );
}
