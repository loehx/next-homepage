# Intro Component

## Purpose
Port the original `Scene1` from `v1` to the new architecture as an `Intro` component. This component features randomized text animation and scroll-based progress.

## Requirements
- Port `v1/src/stage-v2/scenes/scene1.tsx` to `src/components/intro/Intro.tsx`.
- Use **Static CSS + BEM** naming convention instead of CSS Modules.
- Component must be fully isolated for Storybook.
- Support scroll-based progress (adapt from `v1`'s `useScroll` to the new system if necessary, or provide a prop for manual testing in Storybook).
- Include randomized text animation logic.
- Support dynamic salutation based on time of day.

## Technical Approach
- Create `src/components/intro/Intro.tsx` and `src/components/intro/Intro.css`.
- Extract `useRandomizedText` and `getCurrentSalutation` as internal helpers or local hooks within the file (following the < 150 lines rule).
- Implement BEM classes (e.g., `intro`, `intro__line-wrapper`, `intro__text`).
- Create `src/components/intro/Intro.stories.tsx` to verify in Storybook.
- Mock or handle scroll interaction to allow testing progress in Storybook.

## Acceptance Criteria
- [ ] Component renders correctly in Storybook at `http://localhost:6006/`.
- [ ] Text randomization animation works as expected.
- [ ] BEM CSS is applied and follows project standards.
- [ ] Salutation updates correctly based on simulated time.
- [ ] Scroll progress integration is functional.
