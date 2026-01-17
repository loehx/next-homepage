# Scene2 - Technical Analysis

## Available Components/Composables

### Animation Hooks
- `useActivationOnElement` - `@components/scrollHandler/useActivation` - triggers activation based on scroll position
- `useAnimatedActivationOnElementShorthand` - `@components/scrollHandler/useAnimatedActivation` - shorthand for animated activation
- `useSimpleTypewriter` - `@components/scrollHandler/extensions/simpleTypewriter` - typewriter text effect
- `useRandomReveal` - `@components/scrollHandler/extensions/randomReveal` - random character reveal
- `useMinTransitionTime` - `@components/scrollHandler/extensions/minTransitionTime` - minimum transition duration
- `useScroll` - `@components/scrollHandler` - scroll progress tracking

### UI Components
- `Window` - `@components/window` - window/card wrapper with markdown support
- Phone wrapper - `src/contentParts/stage/index.tsx` lines 129-174 - phone frame with image overlay

## Reusable Code

### Phone Wrapper
- **File**: `src/contentParts/stage/index.tsx`
- **Lines**: 129-174
- **What**: Complete phone frame component with portrait image overlay
- **Why**: Already handles phone frame image, avatar overlay, and responsive sizing

### Phone Frame Asset
- **File**: `src/contentParts/stage/phone-frame.webp`
- **What**: iPhone frame image
- **Why**: Needed for phone visualization

### Existing Scene2 Structure
- **File**: `src/stage-v2/scenes/scene2.tsx`
- **What**: Current scene with text details array and animation setup
- **Why**: Text content and animation hooks already configured

## Third-Party Libraries
- `classnames` (cx) - already in project - conditional CSS classes

## Technical Constraints
- Must trigger at pos=0.5 (existing Scene2 activation point)
- Phone wrapper extracts phoneImage from Contentful CMS
- Viewport width (vw) units required for responsive sizing
- Animation hooks expect element refs and CSS classes for state management

## Folder Structure

```
src/stage-v2/scenes/
├── scene2.tsx                    # Main scene component (modify existing)
├── scene2.module.css             # Scene styles (modify existing)
└── scene2/
    ├── PhoneSection.tsx          # Left side: phone wrapper + animation
    ├── TextSection.tsx           # Right side: text container + reveals
    ├── TextItem.tsx              # Individual text item with typewriter
    └── scene2-components.module.css
```
