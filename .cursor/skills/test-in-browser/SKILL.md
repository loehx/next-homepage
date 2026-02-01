---
name: test-in-browser
description: Test features in browser using Playwright MCP with position-based navigation. Use when implementing visible features, testing UI changes, or verifying page sections.
---

# Test in Browser

Test visible features using Playwright MCP with position-based navigation.

## Configuration

- **Dev server:** `http://localhost:8080` (always running)
- **Position format:** `?pos=X` where X is decimal
- **Position system:** 0.0-1.0 = page 1, 1.0-2.0 = page 2, 2.5 = middle of page 3

## MCP Commands

```
browser_navigate    - Navigate to URL
browser_snapshot    - Get page structure/elements
browser_screenshot  - Take screenshot
browser_console     - Get console logs
browser_click       - Click elements
browser_close       - Close browser
```

## Testing Workflow

**1. Navigate to position**
```
browser_navigate http://localhost:8080?pos=2.5
```

Position examples:
- `pos=0` - Top of page 1
- `pos=0.5` - Middle of page 1  
- `pos=1.5` - Middle of page 2
- `pos=2.0` - Start of page 3

**2. Take snapshot** (before interactions)
```
browser_snapshot
```

**3. Take screenshot**
```
browser_screenshot
```
Verify: layout, styles, content, no visual bugs.

**4. Check console**
```
browser_console
```
Look for errors, warnings.

**5. Test interactions** (if needed)
```
browser_snapshot           # Get element refs
browser_click [element]    # Interact
browser_screenshot         # Verify
```

**6. Close browser**
```
browser_close
```

## Position Calculation

- Start of page N: `pos=N-1`
- Middle of page N: `pos=N-0.5`
- End of page N: `pos=N`

## Complete Example

Testing section at position 2.3:

```
1. browser_navigate http://localhost:8080?pos=2.3
2. browser_snapshot
3. browser_screenshot → verify rendering
4. browser_console → check errors
5. browser_close
```

## Checklist

- [ ] Navigate to correct position
- [ ] Take screenshot
- [ ] Verify visual appearance
- [ ] Check console for errors
- [ ] Close browser

**IMPORTANT:** Only mark tasks complete after successful browser test.

## Debug Tips

Add temporary debug styles:
```css
.section { border: 2px solid rgba(255, 0, 0, 0.5); }
```

Add console logs:
```typescript
console.log('Section rendered at position 2.3')
```
