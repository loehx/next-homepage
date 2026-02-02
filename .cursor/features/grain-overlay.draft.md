# Grain Overlay

## Purpose
Add a subtle grain/noise effect to the entire website to provide a more tactile, organic, and film-like aesthetic.

## Requirements
- Fixed overlay covering the entire viewport.
- Subtle, non-intrusive grain pattern.
- Performance-efficient implementation (no large assets).
- Correct blending with background content.
- Support for responsive design (seamless coverage).

## Technical Approach
- Use an **SVG Filter** for generating high-quality Perlin noise.
- Implement the overlay via a **CSS pseudo-element** (`::after`) on the root layout container.
- Use `mix-blend-mode: overlay` or `soft-light` to blend the grain with the underlying content.
- Use a **Data URI** for the SVG noise to keep the implementation self-contained and avoid extra network requests.

## Acceptance Criteria
- [ ] Grain is visible but subtle across the entire page.
- [ ] Overlay does not interfere with user interactions (pointer-events: none).
- [ ] No significant performance degradation during scrolling or animations.
- [ ] Consistent appearance across different page sections.
