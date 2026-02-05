import { useRef, useEffect, useState } from "preact/hooks";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

export function useThreepipePhone(
  containerRef: React.RefObject<HTMLDivElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  imageUrl: string,
  flipKey: number,
  onLoad?: () => void
) {
  const [isModelReady, setIsModelReady] = useState(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const iphoneRef = useRef<THREE.Object3D | null>(null);
  const screenMeshRef = useRef<THREE.Mesh | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const textureRef = useRef<THREE.Texture | null>(null);
  
  const flipState = useRef({ target: 0, current: 0, lastKey: flipKey });
  const pointerState = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    if (flipState.current.lastKey !== flipKey) {
      flipState.current.target += Math.PI * 2;
      flipState.current.lastKey = flipKey;
    }
  }, [flipKey]);

  useEffect(() => {
    if (!screenMeshRef.current || !imageUrl) return;
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = true;
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
      if (screenMeshRef.current) {
        screenMeshRef.current.material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
      }
      if (textureRef.current) textureRef.current.dispose();
      textureRef.current = texture;
    });
  }, [imageUrl]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const d1 = new THREE.DirectionalLight(0xffffff, 1.8); d1.position.set(5, 5, 8); scene.add(d1);
    const d2 = new THREE.DirectionalLight(0xffffff, 0.4); d2.position.set(-5, -3, -5); scene.add(d2);
    const p = new THREE.PointLight(0xffffff, 0.5); p.position.set(0, 3, 4); scene.add(p);

    const group = new THREE.Group(); scene.add(group); groupRef.current = group;
    
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    
    loader.load("/models/tabletop_macbook_iphone.glb", (gltf) => {
      const iphone = gltf.scene.getObjectByName("iphone");
      if (iphone) {
        iphone.scale.set(18, 18, 18); iphone.position.set(0.1, 0, 0);
        iphone.rotation.set(0.1, Math.PI + 0.08, 0.02); group.add(iphone); iphoneRef.current = iphone;
        const screen = gltf.scene.getObjectByName("xXDHkMplTIDAXLN") as THREE.Mesh;
        if (screen) screenMeshRef.current = screen;
        console.log("Model loaded successfully");
        setIsModelReady(true); onLoad?.();
      }
    }, undefined, (error) => {
      console.error("Error loading GLTF model:", error);
    });

    const mm = (e: MouseEvent) => { pointerState.current.x = (e.clientX / window.innerWidth) * 2 - 1; pointerState.current.y = -((e.clientY / window.innerHeight) * 2 - 1); };
    const tm = (e: TouchEvent) => { if (e.touches[0]) { pointerState.current.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1; pointerState.current.y = -((e.touches[0].clientY / window.innerHeight) * 2 - 1); } };
    window.addEventListener("mousemove", mm); window.addEventListener("touchmove", tm, { passive: true });

    let rafId: number; const clock = new THREE.Clock();
    const animate = () => {
      rafId = requestAnimationFrame(animate); const t = clock.getElapsedTime();
      pointerState.current.targetX += (pointerState.current.x - pointerState.current.targetX) * 0.05;
      pointerState.current.targetY += (pointerState.current.y - pointerState.current.targetY) * 0.05;
      if (cameraRef.current) { cameraRef.current.position.x = pointerState.current.targetX * 2.5; cameraRef.current.position.y = pointerState.current.targetY * 1.8; cameraRef.current.lookAt(0, 0, 0); }
      if (groupRef.current) {
        const diff = flipState.current.target - flipState.current.current; flipState.current.current += diff * 0.08;
        groupRef.current.position.y = Math.sin(t * 0.8) * 0.08;
        groupRef.current.rotation.y = flipState.current.current + Math.sin(t * 0.5) * 0.04;
        groupRef.current.rotation.x = Math.sin(t * 0.7) * 0.03;
      }
      renderer.render(scene, camera);
    };
    animate();

    const rs = () => { if (!containerRef.current || !cameraRef.current || !rendererRef.current) return; const w = containerRef.current.clientWidth, h = containerRef.current.clientHeight; cameraRef.current.aspect = w / h; cameraRef.current.updateProjectionMatrix(); rendererRef.current.setSize(w, h); };
    window.addEventListener("resize", rs);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("mousemove", mm); window.removeEventListener("touchmove", tm); window.removeEventListener("resize", rs); renderer.dispose(); if (textureRef.current) textureRef.current.dispose(); dracoLoader.dispose(); };
  }, []);

  return { isModelReady };
}
