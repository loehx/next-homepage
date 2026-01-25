# Scene2 3D iPhone Integration

## Purpose
Replace the 2D phone frame image with a fully interactive 3D iPhone model to create a more immersive and professional presentation of the profile image.

## Requirements
- Replace phone-frame.webp with actual 3D iPhone model
- Display profile image on the iPhone screen as emissive texture
- Maintain existing scroll-triggered entrance animation
- Maintain color filter animations that change with content
- Keep responsive behavior and performance

## Technical Approach
- Use Threepipe library for 3D rendering
- Load GLB iPhone model
- Apply profile image as emissive texture to screen material
- Integrate with existing React/Next.js architecture
- Preserve scroll hooks and animation timing

## Acceptance Criteria
- [ ] 3D iPhone model renders correctly
- [ ] Profile image displays on phone screen with realistic glow
- [ ] Entrance animation works with scroll position 0.5
- [ ] Hue rotation filter applies to 3D model
- [ ] Performance remains acceptable (no lag during scroll)
- [ ] Works on desktop and mobile viewports
