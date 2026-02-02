# Menu Feature

## Purpose
Provide a global navigation overlay that allows users to quickly access different sections of the page and navigate the site with an engaging, minimalist design.

## Requirements

### Menu Toggle Button
- Display "menu" link in the bottom-right corner
- Bold text with `mix-blend-mode: difference` and `color: white` to contrast with background
- Not visible on first page (position 0.0-1.0)
- Visible from page 2 onwards (position >= 1.0)
- Once visible, stays visible even when scrolling back to top
- Transforms to "close" when menu is open
- Responsive spacing using vw/vh units from edges

### Menu Overlay
- Full-page overlay with black background
- 75% opacity with medium blur (8px) effect on content behind
- White text color
- Smooth opacity transition (500ms) when opening/closing
- Centered menu items (5 total)
- Menu items appear sequentially from top to bottom (100ms stagger per item)
- Clicking overlay backdrop closes the menu
- Page scrolling allowed while menu is open (updates active item highlight)

### Menu Items
- 5 navigation items:
  - INT → INTRO (scroll to pos: 0)
  - ABT → ABOUT (scroll to pos: 1)
  - PRJ → PROJECTS (scroll to pos: 2)
  - LNK → LINKS (scroll to pos: 3)
  - CNT → CONTACT (scroll to bottom of page)
- Initially show only 3 characters
- Use Vank display font for bold statement
- Each character is a separate `<span>` element
- Hidden characters have `width: 0` (or similar technique)
- On hover (desktop), hidden characters expand to reveal full word
- Aria-labels for screen reader accessibility
- Font size should be relative using `vw` units

### Mobile Scroll Behavior
- Current scroll position determines which menu item is "active" (hovered state)
- Page scrolling is allowed while menu is open
- Active item highlight updates dynamically as user scrolls
- No swipe gestures (use close button to dismiss)
- When user clicks a menu item:
  1. Item gets activated/hovered state
  2. Page scrolls smoothly to target position
  3. Menu overlay closes only after scroll animation completes

### Hover Effects
- Color shift on hover
- Each menu item has unique color inspired by scene 1 and 2 colors
- Hidden characters expand with width + fade in opacity animation
- Smooth transition for character expansion
- **Only one item can be active or hovered at a time**
- **When an item is hovered, the currently active item (from scroll position) is deactivated visually**

### Keyboard Navigation
- Full keyboard support:
  - Tab: Navigate between menu items
  - Arrow keys: Navigate up/down through items
  - Enter: Activate selected item
  - Escape: Close menu overlay

## Technical Approach

### Components
- Create `Menu` component with overlay and navigation items
- Create `MenuItem` component with expandable character logic
- Create `MenuButton` component for toggle button

### Scroll Detection
- Use existing scroll position system to show/hide menu button
- Button visible when position >= 1.0
- Track current scroll position to highlight active menu item on mobile

### State Management
- Track menu open/close state
- Handle overlay visibility and transitions

### Styling
- CSS modules for component styles
- CSS transitions for smooth animations
- Viewport-based sizing (vw units)
- Backdrop filter for blur effect

## Acceptance Criteria
- [ ] Menu button appears in bottom-right corner after page 1
- [ ] Menu button uses responsive vw/vh spacing from edges
- [ ] Menu button has proper contrast with background (mix-blend-mode: difference)
- [ ] Clicking menu button opens full-page overlay
- [ ] Overlay has black background with 75% opacity and 8px blur
- [ ] Overlay transitions in 500ms
- [ ] Menu items appear sequentially from top to bottom (200ms stagger)
- [ ] Menu items use Vank display font
- [ ] Menu items display centered with 3-character abbreviations
- [ ] Hovering menu item reveals full word with width + fade animation (desktop)
- [ ] Each menu item has unique hover color
- [ ] Menu button changes to "close" when menu is open
- [ ] Clicking close button closes the menu
- [ ] Clicking overlay backdrop closes the menu
- [ ] Page scrolling allowed while menu is open
- [ ] Active menu item updates dynamically as page scrolls
- [ ] All menu items have proper aria-labels
- [ ] Font size scales with viewport
- [ ] Menu items scroll to correct positions
- [ ] Current scroll position highlights active menu item on mobile
- [ ] Clicking menu item triggers smooth scroll and closes menu after scroll completes
- [ ] Keyboard navigation works (Tab, Arrow keys, Enter, Escape)
- [ ] Smooth transitions for all state changes
