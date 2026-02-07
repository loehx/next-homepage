# Storybook Structure Proposal

## Current Issues

1. **Inconsistent naming patterns:**
   - `Components/Capabilities` (flat)
   - `Components/Menu/Menu` (nested)
   - `Gradients` (no prefix)
   - `Components/Capability/iPhone3D` (mixed nesting)

2. **No clear organization by purpose:**
   - Page sections mixed with UI components
   - Visual effects scattered
   - 3D components not grouped

3. **Inconsistent component grouping:**
   - Menu components nested, others flat
   - Related components not grouped together

## Proposed Structure

Organize stories by **component purpose** rather than file structure:

### Structure Hierarchy

```
📁 Page Sections/
  ├── Intro
  ├── Capabilities
  └── Capability

📁 UI Components/
  ├── Menu/
  │   ├── Menu
  │   ├── MenuButton
  │   └── MenuOverlay

📁 Visual Effects/
  ├── Gradients
  └── CursorGradient

📁 3D Components/
  ├── iPhone3D
  └── Capability3D

📁 Utilities/
  └── Fonts
```

## Benefits

1. **Clear categorization** - Easy to find components by purpose
2. **Consistent naming** - All follow same pattern
3. **Logical grouping** - Related components together
4. **Scalable** - Easy to add new categories
5. **Better discoverability** - Developers know where to look

## Migration Plan

1. Update all story titles to new structure
2. Keep file locations unchanged (co-located with components)
3. Only change the `title` field in meta objects

## Example Changes

| Current Title | New Title |
|--------------|-----------|
| `Components/Capabilities` | `Page Sections/Capabilities` |
| `Components/Capability` | `Page Sections/Capability` |
| `Components/Menu/Menu` | `UI Components/Menu/Menu` |
| `Components/Menu/MenuButton` | `UI Components/Menu/MenuButton` |
| `Gradients` | `Visual Effects/Gradients` |
| `Components/CursorGradient` | `Visual Effects/CursorGradient` |
| `Components/Capability/iPhone3D` | `3D Components/iPhone3D` |
| `Components/Capability/Capability3D` | `3D Components/Capability3D` |
| `Components/Intro` | `Page Sections/Intro` |
