# Logo Feature

## Purpose
Add a persistent logo to the top left corner of the screen that becomes visible once the user scrolls to a certain position (0.5) and remains visible thereafter.

## Requirements
- Logo should be positioned in the top left corner.
- Logo should become visible at scroll position 0.5 (halfway through the first page).
- Logo should remain visible once it has appeared (sticky/fixed).
- Logo should have a blend mode (`difference`) similar to the menu button.
- Use the existing SVG in `src/components/logo/index.tsx`.
- Follow a storybook-first development approach.

## Technical Approach
- Create a `LogoContainer` component that handles the scroll visibility logic.
- Reuse the `Logo` SVG component.
- Create a Storybook story for the `LogoContainer`.
- Implement visibility logic using `useLenis` or standard scroll events (consistent with `Menu` component).
- Use CSS modules for styling and blend mode.

## Acceptance Criteria
- [ ] Logo is visible in the top left corner.
- [ ] Logo appears only after scrolling to position 0.5.
- [ ] Logo remains visible after the initial appearance.
- [ ] Logo has `mix-blend-mode: difference`.
- [ ] Storybook story exists and works.
- [ ] Tested with Playwright.
