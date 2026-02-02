# Menu Feature - Technical Analysis

## Available Components/Composables

- `useLenis` (lenis/react) - Access lenis instance for scrolling
- `useUrlPositionScroll` (src/hooks) - Position-to-scroll conversion pattern
- Vank font - Already loaded at `font-family: "Vank"`
- CSS Modules pattern - Used throughout codebase

## Reusable Code

**Scroll calculation** (from useUrlPositionScroll.ts):
```typescript
const targetScroll = position * window.innerHeight;
lenis.scrollTo(targetScroll, { duration: 1, immediate: false });
```

**Color palette** (from scene1.tsx):
```typescript
const COLORS = ["#f635df", "#35f686", "#bef635", "#f64b4b", "#4b9cf6"];
```

## Third-Party Libraries

No additional libraries needed. Use existing: lenis/react, classnames, react, next.

## Technical Constraints

- Position ranges: 0-0.5=START, 0.5-1.5=ABOUT, 1.5-2.5=PROJECTS, 2.5-3.5=LINKS, 3.5+=CONTACT
- Active item: `Math.round(scrollPos / vh)`
- Button visible when position >= 1.0
- Menu z-index: 1000, button z-index: 999
- Focus trap required when menu open
- Use CSS transforms/opacity for animations (GPU accelerated)

## Proposed Folder Structure

```
src/components/menu/
├── MenuButton.tsx         (~40 lines)
├── MenuButton.module.css
├── MenuOverlay.tsx        (~100 lines)
├── MenuOverlay.module.css
├── MenuItem.tsx           (~60 lines)
├── MenuItem.module.css
└── index.tsx             (~80 lines)
```

## Component Architecture

**Menu** - Orchestrates button + overlay, manages state, tracks scroll position
**MenuButton** - Toggle button, fixed bottom-right, shows "menu"/"close", mix-blend-mode: difference
**MenuOverlay** - Full-page backdrop (50% opacity, 8px blur), keyboard nav, staggered item entrance, **tracks hovered menu item index**
**MenuItem** - 4-char display, separate spans, width:0 for hidden chars, unique colors on hover/active state, **receives hover state from parent**

## Key Implementation

**State:**
```typescript
const [isMenuOpen, setIsMenuOpen] = useState(false);
const [currentPosition, setCurrentPosition] = useState(0);
const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
```

**State Logic:**
- `activeItemIndex` = `Math.round(currentPosition)`
- `MenuItem` logic: `isVisualActive = (hoveredIndex !== null) ? (hoveredIndex === index) : (activeItemIndex === index)`

**Track scroll:**
```typescript
useEffect(() => {
  if (!lenis) return;
  const update = () => setCurrentPosition(window.scrollY / window.innerHeight);
  lenis.on('scroll', update);
  return () => lenis.off('scroll', update);
}, [lenis]);
```

**Navigate:**
```typescript
lenis.scrollTo(targetPos * window.innerHeight, {
  duration: 1,
  onComplete: () => setIsMenuOpen(false)
});
```

**Menu items:**
```typescript
const ITEMS = [
  { label: 'START', hiddenIndexes: [2], targetPos: 0 },           // STRT (hide A)
  { label: 'ABOUT', hiddenIndexes: [3], targetPos: 1 },           // ABOT (hide U)
  { label: 'PROJECTS', hiddenIndexes: [4, 5, 6, 7], targetPos: 2 }, // PROJ
  { label: 'LINKS', hiddenIndexes: [1, 4], targetPos: 3 },        // LNKS (hide I, S)
  { label: 'CONTACT', hiddenIndexes: [4, 5, 6], targetPos: 999 }  // CONT
];
// Render: label.split('').map((char, i) => hiddenIndexes.includes(i) ? hidden : visible)
```

## CSS Key Styles

**Button:** `position: fixed; bottom: 2vh; right: 2vw; mix-blend-mode: difference; color: white;`
**Overlay:** `position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);`
**Item:** `font-family: Vank; font-size: 12vw; color: white;`
**Char hidden:** `width: 0; opacity: 0;`
**Stagger:** nth-child delays (0ms, 100ms, 200ms, 300ms, 400ms)

## Integration

Add to `/src/stage-v2/index.tsx`:
```typescript
import { Menu } from "@components/menu";
// Inside Stage component
<Menu />
```
