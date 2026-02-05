# Capabilities Component (Scene 2)

## Purpose
Port the original `Scene2` from `v1` to the new architecture as a `Capabilities` component. This component showcases professional skills and experience with a typewriter effect and a 3D phone visual.

## Requirements
- Port `v1/src/stage-v2/scenes/scene2.tsx` to `src/components/capabilities/Capabilities.tsx`.
- Use **Static CSS + BEM** naming convention.
- Component must be fully isolated for Storybook.
- Implement the typewriter effect with asterisk-based bold formatting.
- Implement automatic cycling through detail segments.
- Include a progress bar that tracks the total duration of the cycle.
- Support manual `activeIndex` and `progress` controls in Storybook.
- Handle the phone visual (initially as a placeholder or simplified version to ensure Preact compatibility).

## Technical Approach
- Create `src/components/capabilities/Capabilities.tsx` and `src/components/capabilities/Capabilities.css`.
- Port `parseTextSegments`, `renderTextSegments`, and `useTypewriter` logic.
- Implement BEM classes (e.g., `capabilities`, `capabilities__phone`, `capabilities__detail`, `capabilities__progress-bar`).
- Create `src/components/capabilities/Capabilities.stories.tsx`.
- For the phone, start with a placeholder to verify the layout and typewriter logic first.

## Acceptance Criteria
- [ ] Component renders correctly in Storybook.
- [ ] Typewriter effect works with bold formatting.
- [ ] Cycling through segments works automatically when `isPlaying` is true.
- [ ] Progress bar correctly reflects the cycle progress.
- [ ] BEM CSS is applied correctly.
