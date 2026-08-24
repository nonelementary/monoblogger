# MonoBlogger

A minimal static site generator with terminal aesthetics for creating fast, customizable blogs with markdown content and automatic deployment to GitHub Pages.

## Features

- **Markdown-first authoring** with frontmatter support
- **Folder-based post organization** with automatic asset copying
- **Category filtering** with client-side JavaScript
- **Scheduled publishing** based on post dates
- **Custom themes** via configuration
- **Automatic deployment** to GitHub Pages
- **Terminal-inspired design** with ASCII aesthetics and monospace fonts
- **Mobile responsive** layout
- **RSS and Atom feeds** automatically generated
- **Modular architecture** for easy customization

## Quick Start

### Installation

```bash
git clone https://github.com/ajt-logic/monoblogger.git
cd monoblogger
npm install
```

### Configuration

Edit `config.json` with your details:

```json
{
  "site": {
    "name": "Your Blog Name",
    "tagline": "Your tagline here",
    "description": "Your blog description",
    "domain": "yourdomain.com",
    "baseUrl": "https://yourdomain.com"
  },
  "author": {
    "name": "Your Name",
    "email": "your@email.com"
  },
  "social": {
    "github": "https://github.com/username",
    "twitter": "https://twitter.com/username"
  }
}
```

### Create Your First Post

```bash
mkdir posts/hello-world
```

Create `index.md` in `posts/hello-world/`:

```markdown
---
title: Hello World
date: 2024-01-01
excerpt: My first blog post
categories: [General]
---

# Hello World

This is my first post!

You can include images stored alongside this post:
![Example](./image.jpg)
```

### Build and Preview

```bash
npm run build
npm run dev
```

Visit http://localhost:3000 to see your blog.

## Content Organization

### Posts

Posts can be organized in two ways:

**Folder-based** (recommended for posts with assets):
```
posts/
├── my-post/
│   ├── index.md
│   ├── image.png
│   └── data/
│       └── chart.csv
```

**Single files** (for simple text posts):
```
posts/
├── simple-post.md
└── another-post.md
```

### Pages

Static pages like About go in the `pages/` folder:

```
pages/
└── about/
    ├── index.md
    └── photo.jpg
```

Pages are excluded from the blog post listing but accessible via direct URLs (`/posts/about.html`).

### Frontmatter

All content requires frontmatter with these fields:

```yaml
---
title: Post Title
date: 2024-01-01
excerpt: Brief description for listings
categories: [Category1, Category2]  # Optional
---
```

### Scheduled Publishing

Posts with future dates are automatically excluded from builds until their publication date arrives.

## Deployment

### GitHub Pages Setup

1. Create a repository for your generated site (e.g., `username.github.io`)
2. Set up deployment:

```bash
npm run setup-deploy
cd public
git remote add origin https://github.com/username/username.github.io.git
cd ..
```

3. Deploy:

```bash
npm run deploy
```

### Custom Domain

1. Configure your domain in `config.json`
2. Set up DNS records pointing to GitHub Pages
3. Enable custom domain in your repository settings

## Commands

- `npm run build` - Generate static site
- `npm run dev` - Build and serve locally
- `npm run deploy` - Build and deploy to GitHub Pages
- `npm run deploy-msg "Custom message"` - Deploy with custom commit message
- `npm run setup-deploy` - One-time deployment setup
- `npm run sync-source` - Commit and push source code changes

## Customization

### Themes

Modify theme colors in `config.json`:

```json
{
  "theme": {
    "primaryColor": "#60a5fa",
    "backgroundColor": "#0f172a",
    "cardBackground": "rgba(30, 41, 59, 0.4)",
    "borderColor": "#334155",
    "textColor": "#e2e8f0",
    "textSecondary": "#cbd5e1",
    "textMuted": "#94a3b8",
    "accentColor": "#a78bfa"
  }
}
```

### Design Philosophy

MonoBlogger uses a terminal-inspired design with:
- **Monospace fonts** (Monaco, Menlo, Ubuntu Mono) for headers and UI elements
- **Sans-serif fonts** for body content readability
- **ASCII-style decorations** (hash marks, arrows, brackets)
- **Dark color scheme** optimized for readability
- **Minimalist aesthetic** focusing on content

### Navigation

Social links are automatically generated from your config. Edit `generateNavigation()` in `lib/html-generator.js` to customize further.

## Architecture

MonoBlogger uses a modular architecture for maintainability:

```
monoblogger/
├── lib/
│   ├── config.js           # Configuration loading and validation
│   ├── css-generator.js    # CSS generation with theme support
│   ├── feed-generator.js   # RSS and Atom feed generation
│   ├── html-generator.js   # HTML template generation
│   ├── content-processor.js # Content parsing and processing
│   └── file-utils.js       # File operations and asset copying
├── posts/                  # Blog posts
├── pages/                  # Static pages
├── public/                 # Generated site (deploy this)
├── build.js               # Main build orchestration
├── setup-deploy.js        # Deployment helper
├── config.json            # Site configuration
└── package.json           # Dependencies
```

## Technical Details

### Build Process

1. Validates configuration and applies defaults
2. Reads all markdown files from `posts/` and `pages/`
3. Parses frontmatter and content
4. Filters posts by publication date
5. Converts markdown to HTML
6. Applies templates with theme-based styling
7. Copies assets to appropriate locations
8. Generates category filters and navigation
9. Creates RSS and Atom feeds

### Dependencies

- **marked** - Markdown to HTML conversion
- **serve** - Local development server (dev dependency)

### Browser Support

Generated sites work in all modern browsers. JavaScript is only used for category filtering and is not required for basic functionality.

## Contributing

MonoBlogger welcomes contributions! Areas for improvement:

- Additional theme options
- New feed formats (JSON Feed, etc.)
- Enhanced markdown features
- Performance optimizations
- Documentation improvements

## Troubleshooting

### Build Issues

- Ensure all posts have valid frontmatter
- Check that dates are in YYYY-MM-DD format
- Verify markdown syntax
- Check for missing required config fields

### Deployment Issues

- Confirm GitHub Pages is enabled in repository settings
- Check repository permissions
- Verify custom domain DNS settings
- Ensure public folder is properly initialized as git repository

### Asset Issues

- Use relative paths in markdown: `![Image](./image.jpg)`
- Ensure images are in the same folder as the post
- Check that build process copies assets (look for copy confirmations in build output)
- Generated images use path: `/images/post-slug/image-name.jpg`

## License

MIT License - see LICENSE file for details.

## Credits

Created by [AJT](https://github.com/ajt-logic) for personal blogging with a focus on clean, readable design and developer-friendly workflow.