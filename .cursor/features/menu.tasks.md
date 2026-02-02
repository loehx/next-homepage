# Menu Feature - Tasks

## Phase 1: Atoms

### MenuButton
- [x] Create `src/components/menu/MenuButton.tsx` and `MenuButton.module.css`
- [x] Create `src/components/menu/MenuButton.stories.tsx`
- [x] Test `MenuButton` in Storybook using Playwright
- [x] Iterate until visual and code-wise perfect (mix-blend-mode: difference, color: white, no filter)
- [x] Implement abbreviation logic (MN -> MENU, CLS -> CLOSE) with hover expansion

### MenuItem
- [x] Create `src/components/menu/MenuItem.tsx` and `MenuItem.module.css`
- [x] Create `src/components/menu/MenuItem.stories.tsx`
- [x] Test `MenuItem` in Storybook using Playwright
- [x] Iterate until visual and code-wise perfect (Vank font, character splitting, hover expansion, unique colors)

## Phase 2: Molecules & Organisms

### MenuOverlay
- [x] Create `src/components/menu/MenuOverlay.tsx` and `MenuOverlay.module.css`
- [x] Create `src/components/menu/MenuOverlay.stories.tsx`
- [x] Test `MenuOverlay` in Storybook using Playwright
- [x] Iterate until visual and code-wise perfect (backdrop blur, 75% opacity, staggered item entrance)

### Menu (Main Orchestrator)
- [x] Create `src/components/menu/index.tsx`
- [x] Create `src/components/menu/Menu.stories.tsx`
- [x] Test `Menu` in Storybook using Playwright
- [x] Iterate until visual and code-wise perfect (state management, scroll tracking, smooth navigation)
- [x] Ensure only one item is active/hovered at a time (deactivate active when hovering another)
- [x] Update menu item wordings and abbreviations (INTRO, ABOUT, PROJECTS, LINKS, CONTACT)

## Phase 3: Integration & Final Verification

### App Integration
- [ ] Integrate `Menu` into `src/stage-v2/index.tsx`
- [ ] Test full navigation flow in the main application using Playwright
- [x] Verify button visibility logic (pos >= 1.0)
- [x] Ensure menu button stays visible once it appears for the first time
- [x] Update menu overlay background opacity to 75%
- [ ] Verify scroll tracking and active item highlighting
- [ ] Final check of responsive behavior and accessibility (aria-labels, keyboard nav)
