# Scene2 3D iPhone - Technical Analysis

## Implementation Decision: React Three Fiber (Final)

After attempting Threepipe integration, switched to React Three Fiber due to:
- Better Next.js/React compatibility
- Native ES module support
- Simpler API for React developers
- Strong ecosystem (@react-three/drei for utilities)

## Available Components/Composables
- `useScroll` - src/components/scrollHandler/index.tsx - scroll position tracking
- `useAnimatedActivationOnElementShorthand` - src/components/scrollHandler/useAnimatedActivation.ts - CSS class activation
- `Scene2` component - src/stage-v2/scenes/scene2.tsx - current implementation

## Reusable Code
- Scroll trigger logic at position 0.5 - preserved
- Phone entrance animation CSS - working with 3D transforms
- Color filter system using CSS hue-rotate - applied to canvas element
- Detail carousel and typewriter components - no changes needed

## Third-Party Libraries (Final)
- `@react-three/fiber@^8.0.0` - React renderer for Three.js
- `@react-three/drei@^9.0.0` - Helper components (PerspectiveCamera, useTexture, etc.)
- `three@^0.150.0` - Core 3D library
- iPhone GLB model - Optional (fallback cube provided)

## Technical Constraints
- Next.js SSR compatibility - solved with dynamic import { ssr: false }
- Canvas rendering performance - optimized with MSAA and proper lighting
- Model file optional - fallback 3D cube with emissive texture
- Color filter animations - CSS hue-rotate on canvas element works perfectly

## Implemented Folder Structure
src/stage-v2/scenes/
├── scene2.tsx (modified - dynamic import for 3D component)
├── scene2.module.css (modified - updated phone container)
└── components/
    ├── ThreepipePhone.tsx (new - React Three Fiber implementation)
    └── ThreepipePhone.module.css (new - canvas styling)

public/models/
├── README.md (new - download instructions)
└── iphone.glb (optional - user downloads separately)
