# Intro - Technical Analysis

## Available Components/Composables
- `useLenis` - `.storybook/lenis-react-mock.tsx` - Used to access the scroll instance.
- `classNames` - `classnames` package - Used for conditional BEM classes.

## Reusable Code
- `v1/src/stage-v2/scenes/scene1.tsx` - Logic for text randomization (`useRandomizedText`) and dynamic salutation.
- `v1/src/stage-v2/scenes/scene1.module.css` - Styles (to be converted to BEM).

## Third-Party Libraries
- `preact` - UI framework.
- `classnames` - Utility for CSS class management.
- `lenis` - Smooth scroll library.

## Technical Constraints
- Must use Preact (hooks from `preact/hooks`).
- Must use static CSS with BEM (no CSS modules as requested).
- File size limit: 150 lines.

## Proposed Folder Structure
src/components/intro/
├── Intro.tsx
├── Intro.css
└── Intro.stories.tsx

## Implementation Plan
1.  **CSS Conversion**: Convert `scene1.module.css` to `Intro.css` using BEM classes.
    - `.container` -> `.intro`
    - `.lineWrapper` -> `.intro__line`
    - `.text` -> `.intro__text`
    - `.progressBar` -> `.intro__progress-bar`
    - `.fadeIn`, `.scrollPhase`, `.paused` -> `.intro--fade-in`, `.intro--scrolling`, `.intro__progress-bar--paused`
2.  **Logic Porting**:
    - Adapt `useRandomizedText` for Preact.
    - Adapt `getCurrentSalutation`.
    - Adapt the main component to use `Intro` props for manual scroll progress testing in Storybook.
3.  **Storybook Story**:
    - Create `Intro.stories.tsx`.
    - Add a control for `progress` to test scroll animations.
    - Add a toggle for `isActive`.
