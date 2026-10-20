---
title: TableOfContents Component
description: API reference for the TableOfContents component - automatic navigation generation
order: 11
---

# TableOfContents Component

Automatically generates navigation from page headings with smooth scrolling, progress tracking, and customizable styling.

**Live Examples**: See component demos for usage in context.

## Basic Usage

```astro
---
import { TableOfContents } from '@lad-sapienza/scms-core/components/TableOfContents';
---

<!-- Auto-detect headings -->
<TableOfContents />

<!-- Custom configuration -->
<TableOfContents 
  title="On This Page"
  minLevel={2}
  maxLevel={4}
  className="sticky top-8"
/>
```

## Props API

### TableOfContentsProps Interface

```typescript
interface TableOfContentsProps {
  // Display
  title?: string;           // Default: "Table of Contents"
  className?: string;       // Custom CSS classes
  
  // Heading selection
  minLevel?: number;        // Minimum heading level (default: 1)
  maxLevel?: number;        // Maximum heading level (default: 6)
  selector?: string;        // Custom heading selector
  
  // Features
  smooth?: boolean;         // Smooth scroll behavior (default: true)
  offset?: number;          // Scroll offset in pixels (default: 80)
  showProgress?: boolean;   // Show reading progress (default: false)
}
```

## Usage Patterns

```astro
<!-- Documentation page -->
<TableOfContents 
  title="Page Contents"
  minLevel={2}
  maxLevel={3}
  className="hidden lg:block sticky top-8 max-w-xs"
  showProgress
/>

<!-- Article with custom styling -->
<TableOfContents 
  title="Article Outline"
  smooth={true}
  offset={100}
  className="bg-light p-3 rounded"
/>

<!-- Mobile-friendly -->
<TableOfContents 
  title="Quick Navigation"
  maxLevel={2}
  className="block lg:hidden mb-6"
/>
```

## Accessibility

- Keyboard navigation support
- Screen reader friendly markup
- Focus management for link interactions
- Semantic navigation structure

## Related

- **SEO Component** - Enhances page structure for search engines
- Works automatically with markdown/MDX content
- Integrates with layout components for consistent placement

## Related Components

- **SEO**: For page metadata and structured navigation
- **BaseLayout**: Foundation layout for TOC integration

See the [documentation demo](/en/docs) for live examples of TableOfContents usage.