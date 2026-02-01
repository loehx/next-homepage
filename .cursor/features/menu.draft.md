# Menu Feature

## Purpose
Provide a global navigation overlay that allows users to quickly access different sections of the page and navigate the site with an engaging, minimalist design.

## Requirements

### Menu Toggle Button
- Display "menu" link in the bottom-right corner
- Bold text with filter negative/inverted to contrast with background
- Not visible on first page (position 0.0-1.0)
- Visible from page 2 onwards (position >= 1.0)
- Transforms to "close" when menu is open

### Menu Overlay
- Full-page overlay with black background
- 50% opacity with slight blur effect on content behind
- White text color
- Smooth opacity transition when opening/closing
- Centered menu items

### Menu Items
- 5 navigation items:
  - STRT → START (pos:0)
  - ABOT → ABOUT (pos:1)
  - PROJ → PROJECTS (pos:2)
  - LNKS → LINKS (pos:3)
  - CONT → CONTACT (bottom of the page)
  - IMPR -> IMPRESSUM (link to: /imprint)
- Initially show only 4 characters
- Each character is a separate `<span>` element
- Hidden characters have `width: 0` (or similar technique)
- On hover, hidden characters expand to reveal full word
- Aria-labels for screen reader accessibility
- Items link to other pages OR scroll to sections on current page
- Font size should be relative using `vw` units

### Hover Effects
- Color shift on hover
- Each menu item has unique color inspired by scene 1 and 2 colors
- Smooth transition for character expansion

## Technical Approach

### Components
- Create `Menu` component with overlay and navigation items
- Create `MenuItem` component with expandable character logic
- Create `MenuButton` component for toggle button

### Scroll Detection
- Use existing scroll position system to show/hide menu button
- Button visible when position >= 1.0

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
- [ ] Menu button has proper contrast with background (filter negative)
- [ ] Clicking menu button opens full-page overlay
- [ ] Overlay has black background with 50% opacity and blur
- [ ] Menu items display centered with 4-character abbreviations
- [ ] Hovering menu item reveals full word smoothly
- [ ] Each menu item has unique hover color
- [ ] Menu button changes to "close" when menu is open
- [ ] Clicking close button closes the menu
- [ ] All menu items have proper aria-labels
- [ ] Font size scales with viewport
- [ ] Menu items navigate/scroll appropriately
- [ ] Smooth transitions for all state changes
