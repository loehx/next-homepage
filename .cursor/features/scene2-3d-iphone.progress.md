# Scene2 3D iPhone - Progress Log

## 2026-01-25 - Feature Planning
- Created `.cursor/features/scene2-3d-iphone.draft.md` - requirements and acceptance criteria
- Created `.cursor/features/scene2-3d-iphone.tech.md` - technical analysis and folder structure
- Created `.cursor/features/scene2-3d-iphone.research.md` - model source and integration best practices
- Created `.cursor/features/scene2-3d-iphone.tasks.md` - implementation task checklist
- Reason: Following feature development workflow before implementation

## 2026-01-25 - Initial Implementation (Threepipe)
- Installed `threepipe@^0.0.33` package via npm
- Created `public/models/` directory for 3D assets
- Created `src/stage-v2/scenes/components/ThreepipePhone.tsx` - attempted Threepipe integration
- Created `src/stage-v2/scenes/components/ThreepipePhone.module.css` - canvas styling
- Modified `src/stage-v2/scenes/scene2.tsx` - replaced 2D phone frame
- Modified `src/stage-v2/scenes/scene2.module.css` - updated phone container
- Reason: Initial attempt at integration

## 2026-01-25 - Issue: Threepipe Incompatibility
- Found: Threepipe ES module exports not compatible with Next.js webpack
- Error: "ThreeViewer is not a constructor" - dynamic import issues with UMD/ESM
- Decision: Switch to React Three Fiber (@react-three/fiber) - better React/Next.js integration
- Reason: React Three Fiber is specifically designed for React and has better ecosystem support

## 2026-01-25 - React Three Fiber Implementation
- Uninstalled `threepipe` package
- Installed `@react-three/fiber@^8.0.0`, `@react-three/drei@^9.0.0`, `three@^0.150.0` with --legacy-peer-deps
- Rewrote `src/stage-v2/scenes/components/ThreepipePhone.tsx` - now uses React Three Fiber Canvas, PerspectiveCamera, useTexture
- Created fallback 3D cube with emissive texture mapping for when model file is missing
- Modified `src/stage-v2/scenes/scene2.tsx` - added Next.js dynamic import with SSR disabled
- Updated `src/stage-v2/scenes/components/ThreepipePhone.module.css` - added hint text styling
- Created `public/models/README.md` - download instructions for iPhone GLB model
- Reason: React Three Fiber works seamlessly with Next.js, provides fallback rendering, proper SSR handling

## 2026-01-25 - Testing
- Tested at pos=1: 3D cube with profile image renders correctly
- Tested at pos=0.5: Entrance animation works (slide from left)
- Tested at pos=1.2: Hue-rotate color filter applies correctly to canvas
- No console errors, smooth performance
- Reason: Verify all acceptance criteria met

## 2026-01-25 - iPhone-Shaped Model
- Modified `src/stage-v2/scenes/components/ThreepipePhone.tsx` - replaced simple cube with iPhone-shaped geometry
- Added realistic iPhone body (dark metallic finish)
- Added separate screen layer with emissive texture
- Added camera notch detail at top
- Added side buttons (volume and power)
- Improved lighting setup for better 3D depth
- Removed "See README" hint (no external download needed)
- Tested at pos=1, 0.5, 1.3 - all working perfectly
- Reason: User feedback - needed recognizable iPhone shape, not generic cube

## 2026-01-25 - Professional iPhone Model (FINAL)
- Downloaded Codrops threepipe demo repository (11.4MB)
- Extracted professional GLB model: `tabletop_macbook_iphone.glb` (3MB)
- Copied to `/public/models/tabletop_macbook_iphone.glb`
- Rewrote `ThreepipePhone.tsx` to use real Sketchfab iPhone 15 Pro Max model
- Applied texture to correct screen mesh (xXDHkMplTIDAXLN) from Codrops demo
- Adjusted camera position (fov=40, distance=5) for optimal view
- Scaled model 1.5x and positioned for perfect framing
- Enhanced lighting: 3 directional lights + 1 point light for realistic rendering
- Tested at pos=1: ✅ Professional high-quality iPhone with profile image on screen
- Tested at pos=0.5: ✅ Entrance animation works perfectly
- Reason: User requested professional model, not basic geometry - now using exact model from Codrops tutorial
