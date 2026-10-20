---
title: SEO Component
description: API reference for the SEO component - meta tags, Open Graph, and structured data
order: 10
---

# SEO Component

Manages meta tags, Open Graph data, structured data, and page titles for better search engine optimization and social media sharing.

**Live Examples**: See component demos for usage in context.

## Basic Usage

```astro
---
import SEO from '@lad-sapienza/scms-core/components/SEO/SEO.astro';
---

<head>
  <SEO 
    title="Page Title"
    description="Page description for search engines"
    image="/images/featured.jpg"
    isArticle={true}
    datePublished="2024-01-15"
    tags={['research', 'archaeology']}
  />
</head>
```

## Props API

### SEOProps Interface

```typescript
interface SEOProps {
  // Basic meta
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  
  // Content type
  isArticle?: boolean;
  datePublished?: string;
  dateModified?: string;
  
  // Classification
  tags?: string[];
  category?: string;
  
  // Social
  twitterHandle?: string;
  author?: string;
}
```

## Usage Patterns

```astro
<!-- Article/blog post -->
<SEO 
  title="Research Article Title"
  description="Summary of the research findings"
  image="/images/research-photo.jpg"
  isArticle={true}
  datePublished="2024-01-15"
  author="Dr. Researcher"
  tags={["archaeology", "excavation"]}
/>

<!-- Data visualization page -->
<SEO 
  title="Data Visualization | Site Name"
  description="Interactive charts and maps of archaeological data"
  image="/images/data-preview.jpg"
  category="data"
/>
```

## Related

- Used automatically in layout components
- Integrates with Astro's built-in SEO features
- Essential for content pages and data visualizations
  // ... other config
});


## Best Practices

### Image Optimization
- Use high-quality images (1200x630px recommended for social media)
- Provide absolute URLs for external sharing
- Include alt text and proper file formats

### Title Templates
- Use `%s` placeholder in `titleTemplate` for automatic title formatting
- Keep titles under 60 characters for best SEO results
- Make titles descriptive and unique

### Descriptions
- Write compelling descriptions 150-160 characters long
- Include primary keywords naturally
- Make each page description unique

### Article Metadata
- Always set `isArticle={true}` for blog posts and articles
- Provide accurate publication and modification dates
- Use relevant, specific tags

### Structured Data
- The component automatically generates JSON-LD structured data for articles
- This helps search engines understand your content better
- Improves rich snippet appearance in search results

## Troubleshooting

### Images Not Appearing in Social Media
- Verify image URLs are absolute
- Check image file size (under 5MB)
- Ensure proper image dimensions
- Test with social media debugging tools

### Missing Canonical URLs
- Set `site` in `astro.config.mjs`
- Provide explicit `canonical` prop if needed
- Verify URLs are properly formatted

### Structured Data Errors
- Validate JSON-LD with Google's Rich Results Test
- Ensure all required properties are provided for articles
- Check date formats are valid ISO strings

## Related Components

- **TableOfContents**: For article navigation
- **BaseLayout**: Foundation layout with SEO integration

See the [component demos](/en/docs) for live examples of SEO integration.