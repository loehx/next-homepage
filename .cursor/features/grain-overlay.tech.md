# Grain Overlay - Technical Analysis

## Available Components/Composables
- `V2Layout` (`src/layout/index.tsx`) - The root layout component where the overlay will be integrated.
- `DarkWavyBackground` (`src/components/wallpaper/DarkWavyBackground.tsx`) - Existing background logic.

## Reusable Code
- `src/styles/global.css` - Global styles where utility classes or root-level pseudo-elements can be defined.

## Third-Party Libraries
- None required. We will use native CSS and SVG filters.

## Technical Constraints
- **Performance**: `mix-blend-mode` can be GPU-intensive. We must ensure the overlay doesn't cause lag on mobile or low-end devices.
- **Interactivity**: The overlay must use `pointer-events: none` to ensure it doesn't block clicks or touch events on the content below.
- **Visuals**: The grain should be subtle enough that it doesn't distract from the content but adds to the atmosphere.

## Proposed Folder Structure
```
src/
├── components/
│   └── grain-overlay/
│       ├── index.tsx
│       └── GrainOverlay.module.css
└── styles/
    └── global.css (to include the SVG filter definition)
```

## Implementation Strategy
1. Create a `GrainOverlay` component that renders a full-viewport `div`.
2. Use an inline SVG within the component to define an `<feTurbulence>` filter.
3. Apply the filter to the `div` via CSS.
4. Add the `GrainOverlay` component to `V2Layout`.
