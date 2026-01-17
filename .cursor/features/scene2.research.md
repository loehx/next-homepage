# Scene2 - Research & Best Practices

## Performance Optimization
- Use CSS `transform` and `opacity` (GPU-accelerated) over `left/top/width/height`
- Apply `will-change` only during active animations, remove after completion
- Use `contain: layout style paint` for CSS containment
- Batch DOM reads before writes to avoid layout thrashing
- Use `requestAnimationFrame` for smooth 60 FPS animations

## CSS Animation Patterns
```css
/* Fade + slide entrance */
.fade-in { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
.fade-in.active { opacity: 1; transform: translateY(0); }

/* Stagger delays */
.item:nth-child(1) { transition-delay: 0ms; }
.item:nth-child(2) { transition-delay: 100ms; }
.item:nth-child(3) { transition-delay: 200ms; }
```

## CSS Repositories
- **Aceternity UI** - https://ui.aceternity.com - Modern animated React components
- **Animista** - https://animista.net - CSS animation generator
- **Easings.net** - https://easings.net - Easing function reference
- **Cubic Bezier** - https://cubic-bezier.com - Custom easing curve generator

## Project-Specific Patterns
```typescript
// Scroll activation hook (already in project)
const { ref, activated } = useActivationOnElement({ activateOnVisible: true });

// CSS class-based activation
const { ref } = useAnimatedActivationOnElementShorthand({
  activateClassName: styles.active,
  deactivateClassName: styles.inactive
});

// Text effects (already in project)
useSimpleTypewriter(elementRef, activated, { speed: 50 });
useRandomReveal(elementRef, activated, { duration: 1000 });
```

## Accessibility
```css
/* Respect motion preferences */
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```
