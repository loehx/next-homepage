import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import styles from "./iPhone3D.module.css";

type iPhone3DProps = {
  imageUrl?: string;
  isVisible?: boolean;
  isLoaded?: boolean;
  onLoad?: () => void;
};

export function iPhone3D({
  imageUrl = "/storybook-iphone-screenshot.png",
  isVisible = true,
  isLoaded,
  onLoad,
}: iPhone3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isModelReady, setIsModelReady] = useState(false);
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const rotationRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const clockRef = useRef(new THREE.Clock());
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragStartRotationRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastMoveTimeRef = useRef<number | null>(null);
  const lastPointerPosRef = useRef({ x: 0, y: 0 });
  const lastTargetRotationRef = useRef({ x: 0, y: 0 });
  
  // Rotation settings
  const rotationLerpSpeed = 0.15; // Smooth interpolation speed (0-1, higher = faster)
  const floatingAmplitude = { x: 0.03, y: 0.04 };
  const dragSensitivity = 0.01; // Sensitivity for delta-based rotation
  const frictionFactor = 0.92; // Friction for momentum (0-1, lower = more friction)
  const minVelocity = 0.0005; // Minimum velocity threshold to stop momentum
  const zLerpSpeed = 0.1; // Smooth interpolation speed for Z position animation
  const zFarDistance = -50; // Z position when iPhone is far away (not visible)
  
  // Use isLoaded if provided, otherwise use isVisible
  const visible = isLoaded !== undefined ? isLoaded : isVisible;
  
  // Initialize refs based on visible state (not just isVisible)
  const zPositionRef = useRef(visible ? 0 : zFarDistance);
  const targetZPositionRef = useRef(visible ? 0 : zFarDistance);
  const baseYRotationRef = useRef(visible ? 0 : -Math.PI / 4);
  const targetBaseYRotationRef = useRef(visible ? 0 : -Math.PI / 4);
  const textureRef = useRef<THREE.Texture | null>(null);
  const screenMeshRef = useRef<THREE.Mesh | null>(null);
  const dracoLoaderRef = useRef<DRACOLoader | null>(null);

  // Handle pointer events for drag-based rotation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      
      // Check if pointer is within container bounds
      const isInside = 
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      
      if (!isInside) return;

      isDraggingRef.current = true;
      dragStartRef.current.x = e.clientX;
      dragStartRef.current.y = e.clientY;
      
      // Store current rotation state when drag starts
      dragStartRotationRef.current.x = rotationRef.current.x;
      dragStartRotationRef.current.y = rotationRef.current.y;
      
      // Reset velocity tracking for new drag
      velocityRef.current.x = 0;
      velocityRef.current.y = 0;
      lastMoveTimeRef.current = performance.now();
      lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
      lastTargetRotationRef.current.x = targetRotationRef.current.x;
      lastTargetRotationRef.current.y = targetRotationRef.current.y;
      
      // Prevent default to avoid text selection
      e.preventDefault();
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;

      const currentTime = performance.now();
      const currentPos = { x: e.clientX, y: e.clientY };

      // Calculate delta from start position
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      
      // Apply rotation based on delta from start position
      // Drag right → rotate right (positive Y rotation)
      // Drag left → rotate left (negative Y rotation)
      // Drag down → tilt down (positive X rotation)
      // Drag up → tilt up (negative X rotation)
      const newRotationY = dragStartRotationRef.current.y + deltaX * dragSensitivity;
      const newRotationX = dragStartRotationRef.current.x + deltaY * dragSensitivity;
      
      // Calculate velocity for momentum based on target rotation change
      if (lastMoveTimeRef.current !== null) {
        const deltaTime = (currentTime - lastMoveTimeRef.current) / 1000; // Convert to seconds
        if (deltaTime > 0 && deltaTime < 0.1) { // Only calculate if deltaTime is reasonable (avoid spikes)
          const rotationDeltaX = newRotationX - lastTargetRotationRef.current.x;
          const rotationDeltaY = newRotationY - lastTargetRotationRef.current.y;
          
          // Calculate velocity (radians per second)
          const newVelocityX = rotationDeltaX / deltaTime;
          const newVelocityY = rotationDeltaY / deltaTime;
          
          // Smooth velocity using exponential moving average (0.7 = 70% new, 30% old)
          // This helps handle irregular pointer events and provides smoother momentum
          const smoothingFactor = 0.7;
          velocityRef.current.x = velocityRef.current.x * (1 - smoothingFactor) + newVelocityX * smoothingFactor;
          velocityRef.current.y = velocityRef.current.y * (1 - smoothingFactor) + newVelocityY * smoothingFactor;
          
        }
      }
      
      lastMoveTimeRef.current = currentTime;
      lastPointerPosRef.current = currentPos;
      
      // Apply rotation without limits (infinite rotation)
      targetRotationRef.current.y = newRotationY;
      targetRotationRef.current.x = newRotationX;
      
      // Update last target rotation for next velocity calculation
      lastTargetRotationRef.current.x = newRotationX;
      lastTargetRotationRef.current.y = newRotationY;
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      // Keep velocity for momentum - don't reset it
      if (Math.abs(velocityRef.current.x) > minVelocity || Math.abs(velocityRef.current.y) > minVelocity) {
        console.log('Momentum started:', { 
          vx: velocityRef.current.x.toFixed(4), 
          vy: velocityRef.current.y.toFixed(4) 
        });
      }
      // Reset lastMoveTimeRef so next drag starts fresh
      lastMoveTimeRef.current = null;
    };

    container.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      container.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  // Update target Z position and base Y rotation based on visible state
  useEffect(() => {
    const newTargetZ = visible ? 0 : zFarDistance;
    const newTargetBaseY = visible ? 0 : -Math.PI / 4;
    
    const prevTargetBaseY = targetBaseYRotationRef.current;
    const prevBaseY = baseYRotationRef.current;
    
    console.log('[iPhone3D] Visibility changed:', {
      visible,
      isLoaded,
      isVisible,
      newTargetZ,
      newTargetBaseY: `${(newTargetBaseY * 180 / Math.PI).toFixed(1)}°`,
      currentBaseY: `${(baseYRotationRef.current * 180 / Math.PI).toFixed(1)}°`,
      currentTargetBaseY: `${(targetBaseYRotationRef.current * 180 / Math.PI).toFixed(1)}°`,
      prevTargetBaseY: `${(prevTargetBaseY * 180 / Math.PI).toFixed(1)}°`,
      willChange: newTargetBaseY !== prevTargetBaseY,
    });
    
    targetZPositionRef.current = newTargetZ;
    targetBaseYRotationRef.current = newTargetBaseY;
    
    console.log('[iPhone3D] Targets updated:', {
      targetZPosition: targetZPositionRef.current,
      targetBaseYRotation: `${(targetBaseYRotationRef.current * 180 / Math.PI).toFixed(1)}°`,
      currentBaseY: `${(baseYRotationRef.current * 180 / Math.PI).toFixed(1)}°`,
      difference: `${(Math.abs(baseYRotationRef.current - targetBaseYRotationRef.current) * 180 / Math.PI).toFixed(1)}°`,
    });
    
    // Force immediate application if group is ready (for testing)
    if (groupRef.current) {
      const testY = baseYRotationRef.current + rotationRef.current.y;
      console.log('[iPhone3D] Group rotation test:', {
        groupRotationY: `${(groupRef.current.rotation.y * 180 / Math.PI).toFixed(2)}°`,
        calculatedY: `${(testY * 180 / Math.PI).toFixed(2)}°`,
      });
    }
  }, [visible, isLoaded, isVisible]);

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
    group.rotation.set(0, 0, 0.02);
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

      // Apply momentum when not dragging
      if (!isDraggingRef.current) {
        const deltaTime = clockRef.current.getDelta();
        
        // Apply velocity to target rotation
        if (Math.abs(velocityRef.current.x) > minVelocity || Math.abs(velocityRef.current.y) > minVelocity) {
          const prevTargetX = targetRotationRef.current.x;
          const prevTargetY = targetRotationRef.current.y;
          
          targetRotationRef.current.x += velocityRef.current.x * deltaTime;
          targetRotationRef.current.y += velocityRef.current.y * deltaTime;
          
          // Apply friction to gradually slow down
          velocityRef.current.x *= frictionFactor;
          velocityRef.current.y *= frictionFactor;
          
          // Stop momentum when velocity is very small
          if (Math.abs(velocityRef.current.x) < minVelocity) {
            velocityRef.current.x = 0;
          }
          if (Math.abs(velocityRef.current.y) < minVelocity) {
            velocityRef.current.y = 0;
          }
        }
      }

      // Smoothly interpolate current rotation toward target rotation
      rotationRef.current.x = THREE.MathUtils.lerp(
        rotationRef.current.x,
        targetRotationRef.current.x,
        rotationLerpSpeed
      );
      rotationRef.current.y = THREE.MathUtils.lerp(
        rotationRef.current.y,
        targetRotationRef.current.y,
        rotationLerpSpeed
      );

      // Smoothly interpolate Z position toward target Z position
      zPositionRef.current = THREE.MathUtils.lerp(
        zPositionRef.current,
        targetZPositionRef.current,
        zLerpSpeed
      );

      // Smoothly interpolate base Y rotation toward target base Y rotation
      const prevBaseY = baseYRotationRef.current;
      baseYRotationRef.current = THREE.MathUtils.lerp(
        baseYRotationRef.current,
        targetBaseYRotationRef.current,
        zLerpSpeed
      );
      
      // Debug logging when base Y rotation changes significantly or every 60 frames
      const frameCount = Math.floor(t * 60);
      if (Math.abs(baseYRotationRef.current - prevBaseY) > 0.001 || frameCount % 60 === 0) {
        console.log('[Animation Loop] Base Y rotation interpolated:', {
          prev: `${(prevBaseY * 180 / Math.PI).toFixed(2)}°`,
          current: `${(baseYRotationRef.current * 180 / Math.PI).toFixed(2)}°`,
          target: `${(targetBaseYRotationRef.current * 180 / Math.PI).toFixed(2)}°`,
          zPosition: zPositionRef.current.toFixed(2),
          targetZPosition: targetZPositionRef.current.toFixed(2),
          lerpSpeed: zLerpSpeed,
          difference: `${(Math.abs(baseYRotationRef.current - targetBaseYRotationRef.current) * 180 / Math.PI).toFixed(2)}°`,
        });
      }

      // Floating animation + base rotation
      group.position.y = Math.sin(t * 0.8) * 0.08;
      group.position.z = zPositionRef.current;
      
      // Apply rotation to group - DIRECTLY in animation loop to ensure refs are current
      const baseY = baseYRotationRef.current;
      const userY = rotationRef.current.y;
      const floatY = Math.sin(t * 0.5) * floatingAmplitude.y;
      const finalY = baseY + userY + floatY;
      
      group.rotation.x = rotationRef.current.x + Math.sin(t * 0.5) * floatingAmplitude.x;
      group.rotation.y = finalY;
      
      // Debug logging every 60 frames (~1 second at 60fps)
      if (Math.floor(t * 60) % 60 === 0) {
        console.log('[Animation Loop] Y rotation applied:', {
          baseY: `${(baseY * 180 / Math.PI).toFixed(2)}°`,
          userY: `${(userY * 180 / Math.PI).toFixed(2)}°`,
          floatY: `${(floatY * 180 / Math.PI).toFixed(2)}°`,
          finalY: `${(finalY * 180 / Math.PI).toFixed(2)}°`,
          groupRotationY: `${(group.rotation.y * 180 / Math.PI).toFixed(2)}°`,
          targetBaseY: `${(targetBaseYRotationRef.current * 180 / Math.PI).toFixed(2)}°`,
        });
      }

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
      }}
    >
      {!isModelReady && (
        <div className={styles.loader}>Loading 3D iPhone...</div>
      )}
    </div>
  );
}
