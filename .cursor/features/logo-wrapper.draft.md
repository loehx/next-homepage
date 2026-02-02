# Logo Wrapper

## Purpose
A fixed-position wrapper for the Logo component that becomes visible after scrolling halfway through the first page (scroll position 0.5) and stays visible thereafter.

## Requirements
- Position: Fixed, top-left corner.
- Visibility: Becomes visible at scroll position 0.5 and STAYS visible.
- Style: `mix-blend-mode: difference`, matching the `MenuButton`.
- Transitions: Smooth opacity transition for visibility.
- Consistency: Padding/margins should match `MenuButton`.

## Technical Approach
- Component: `LogoWrapper` wrapping the existing `Logo` component.
- Scroll Tracking: Use `useLenis` from `lenis/react` for scroll position.
- State: `hasBeenVisible` state to maintain visibility after the trigger.
- Trigger: `scrollPos / window.innerHeight >= 0.5`.
- CSS: CSS Modules for styling, using `mix-blend-mode: difference`.

## Acceptance Criteria
- [x] Component is fixed at top-left.
- [x] Component is invisible initially.
- [x] Component becomes visible when scrolling past 0.5 VH.
- [x] Component remains visible when scrolling back up.
- [x] Style matches `MenuButton` (blend mode, padding).
- [x] Storybook stories cover initial and visible states.
