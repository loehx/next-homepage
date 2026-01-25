# Scene2 3D iPhone - Research & Best Practices

## 3D Model Source
- Sketchfab iPhone 15 Pro Max by MajdyModels - 18.8k downloads, 8.5k triangles
- License: CC Attribution (free to use with credit)
- URL: https://sketchfab.com/3d-models/iphone-15-pro-max-5b7b35513a154ac69619dc2b2fe15686
- Format: GLB/GLTF
- Size: Optimized with only 8.5k triangles (lightweight)

## Threepipe Integration Best Practices
- Framework-agnostic - works with React without special wrapper
- Client-side only - initialize in useEffect hook, not SSR
- Requires canvas element in DOM before initialization
- ThreeViewer class is main entry point
- Supports dynamic image loading via assetManager

## Next.js SSR Handling
- Defer Threepipe initialization to client-side (useEffect)
- Use dynamic import with { ssr: false } for Threepipe components
- Ensure canvas element exists before ThreeViewer instantiation
- No server-side 3D rendering needed

## Performance Targets
- Model: < 10k triangles (8.5k is optimal)
- File size: < 2MB for GLB
- FPS target: 60fps during scroll animations
- Load time: < 500ms for model + texture

## Material Configuration
- Use emissiveMap for phone screen (not map)
- Set emissive color to white (1,1,1) for proper glow
- Adjust roughness (~0.2) and metalness (~0.8) for realism
- ColorSpace: SRGBColorSpace for images

## Animation Approach
- Avoid animating materials directly (performance cost)
- Use CSS filters on canvas element for hue rotation
- Apply CSS transforms for entrance animation
- Let Threepipe handle internal camera/object transforms
