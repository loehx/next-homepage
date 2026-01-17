# Scene2

## Purpose
Redesign Scene 2 to create a split-screen layout with animated phone on left and sequential text reveals on right, enhancing visual hierarchy and user engagement.

## Requirements
- Split screen: left side (phone with portrait image), right side (text content)
- Phone flies in from left at position 0.5
- First text appears 500ms after phone animation completes
- Show one text item at a time (sequential reveals)
- Text appears with ChatGPT-style typewriter effect (character-by-character)
- Fully responsive (desktop, tablet, mobile)
- All existing Scene2 text content preserved

## Acceptance Criteria
- [ ] Split screen layout works on desktop (left/right)
- [ ] Phone displays with portrait image overlay
- [ ] Phone animates from left at pos=0.5
- [ ] First text appears 500ms after phone animation
- [ ] Only one text item visible at a time
- [ ] Text types out character-by-character
- [ ] Fully responsive (desktop, tablet, mobile)
- [ ] All existing Scene2 text content preserved
- [ ] Tested via Playwright at http://localhost:8080/?pos=0.5
