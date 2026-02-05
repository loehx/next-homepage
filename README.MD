# Astro + Preact + Storybook Project

Modern website built with Astro, Preact components, BEM CSS, and Storybook for component development.

## Tech Stack

- **Astro** - Static site generator with island architecture
- **Preact** - Lightweight React alternative for interactive components
- **Storybook** - Component development and documentation
- **BEM CSS** - Block Element Modifier methodology for styling
- **Contentful** - Headless CMS for images and content

## Project Structure

```
├── src/
│   ├── components/       # Preact components (with .stories.tsx)
│   ├── layouts/          # Astro layouts
│   ├── pages/            # Astro pages
│   ├── styles/           # Global and component CSS (BEM)
│   └── data/             # Static JSON and Contentful utilities
├── public/               # Static assets
├── stories/              # Additional Storybook stories
└── .storybook/           # Storybook configuration
```

## Getting Started

### Install dependencies

```bash
npm install
```

### Configure Contentful (optional)

Copy `.env.example` to `.env` and add your Contentful credentials:

```bash
cp .env.example .env
```

### Development

Run Astro dev server (port 8080):

```bash
npm run dev
```

Run Storybook (port 6006):

```bash
npm run storybook
```

### Build

Build Astro site:

```bash
npm run build
```

Build Storybook:

```bash
npm run build-storybook
```

## Component Development Workflow

1. Create component in `src/components/` with `.tsx` extension
2. Create CSS file using BEM methodology (`.css`)
3. Create Storybook story (`.stories.tsx`)
4. Develop and preview in Storybook
5. Integrate into Astro pages with `client:*` directives

## BEM CSS Naming Convention

- **Block**: `.button`
- **Element**: `.button__icon`
- **Modifier**: `.button--primary`, `.button--large`

## Astro Client Directives

- `client:load` - Hydrate on page load
- `client:idle` - Hydrate when browser is idle
- `client:visible` - Hydrate when component is visible
- `client:only="preact"` - Only render on client

## Example Component

See `src/components/Button.tsx` and `src/components/Button.stories.tsx` for a complete example.
