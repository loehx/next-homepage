# Capabilities - Technical Analysis

## Available Components/Composables
- `preact/hooks` - For state management.
- `classnames` - For BEM class management.

## Reusable Code
- `v1/src/stage-v2/scenes/scene2.tsx` - Typewriter and text parsing logic.
- `v1/src/stage-v2/scenes/scene2.module.css` - Styles (to be converted to BEM).

## Third-Party Libraries
- `preact`
- `classnames`

## Technical Constraints
- File size limit: 150 lines. I may need to split the `Detail` component into a separate file or keep it very concise.
- Three.js dependencies missing. Initial implementation will use a placeholder for the 3D phone to avoid adding heavy dependencies immediately.

## Proposed Folder Structure
src/components/capabilities/
├── Capabilities.tsx
├── Capabilities.css
├── Detail.tsx (if needed for line limit)
└── Capabilities.stories.tsx

## Implementation Plan
1.  **CSS Conversion**: Port `scene2.module.css` to `Capabilities.css` using BEM.
2.  **Logic Porting**:
    -   `parseTextSegments`: Extract logic to handle `*bold*` text.
    -   `useTypewriter`: Adapt for Preact.
    -   `Capabilities`: Main component handling cycling and layout.
3.  **Storybook**:
    -   Create story with controls for `activeIndex`, `isPlaying`, and `progress`.
    -   Use a styled `div` as a placeholder for the phone visual.
