const { generateCSS } = require('./css-generator');
const { escapeXML } = require('./feed-generator');

/**
 * Generate navigation links
 */
const generateNavigation = (config) => {
  const socialLinks = [];

  if (config.social.github) {
    socialLinks.push(`<a href="${config.social.github}" target="_blank" rel="noopener">GitHub</a>`);
  }
  if (config.social.twitter) {
    socialLinks.push(`<a href="${config.social.twitter}" target="_blank" rel="noopener">Twitter</a>`);
  }
  if (config.social.linkedin) {
    socialLinks.push(`<a href="${config.social.linkedin}" target="_blank" rel="noopener">LinkedIn</a>`);
  }
  if (config.social.scholar) {
    socialLinks.push(`<a href="${config.social.scholar}" target="_blank" rel="noopener">Google Scholar</a>`);
  }

  const baseNav = '<a href="/">Home</a><a href="/posts/about.html">About</a>';

  // No extra spaces between anchors; CSS handles spacing
  return baseNav + socialLinks.join('');
};

/**
 * Generate client-side filtering script for home page
 */
const generateFilterScript = () => {
  return `
<script>
  // Category filter
  document.addEventListener('DOMContentLoaded', function () {
    const buttons = Array.from(document.querySelectorAll('.category-btn'));
    const items   = Array.from(document.querySelectorAll('.post-list li'));

    function setActive(btn) {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    function applyFilter(category) {
      const cat = (category || 'all').toLowerCase();
      items.forEach(li => {
        const categoriesStr = (li.dataset.categories || '').toLowerCase();
        if (cat === 'all' || categoriesStr.includes(cat)) {
          li.classList.remove('hidden');
        } else {
          li.classList.add('hidden');
        }
      });
    }

    // Click -> filter
    buttons.forEach(btn => {
      btn.addEventListener('click', function () {
        setActive(this);
        applyFilter(this.dataset.category);
        // Optional: reflect in URL hash for shareability
        const c = this.dataset.category;
        history.replaceState(null, '', c === 'all' ? location.pathname : \`#cat=\${encodeURIComponent(c)}\`);
      });
    });

    // Optional: read initial filter from URL hash (#cat=ai)
    const m = location.hash.match(/#cat=([^&]+)/);
    if (m) {
      const wanted = decodeURIComponent(m[1]).toLowerCase();
      const btn = buttons.find(b => b.dataset.category === wanted);
      if (btn) { setActive(btn); applyFilter(wanted); return; }
    }

    // Default: All
    const defaultBtn = buttons.find(b => b.dataset.category === 'all');
    if (defaultBtn) { setActive(defaultBtn); applyFilter('all'); }
  });
</script>
`;
};

/**
 * Generate KaTeX CDN scripts and auto-render initialization
 */
const generateKatexScripts = () => {
  return `
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.18.4/dist/katex.min.js" integrity="sha384-ykMNcWQhhTUb0YV9SPpPUFURHZ+tWmubkakGBP+OgNK/UXdO2gtzglWx0Rj9hnO3" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.18.4/dist/contrib/auto-render.min.js" integrity="sha384-bjyGPfbij8/NDKJhSGZNP/khQVgtHUE5exjm4Ydllo42FwIgYsdLO2lXGmRBf5Mz" crossorigin="anonymous"></script>
<script>
  document.addEventListener('DOMContentLoaded', function () {
    if (typeof renderMathInElement === 'function') {
      renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    }
  });
</script>
`;
};

/**
 * Generate HTML template
 */
const generateHTML = (title, content, config, isHome = false, canonicalPath = '/') => {
  const pageTitle = isHome ? config.site.name : `${title} - ${config.site.name}`;
  const canonicalHref = `${config.site.baseUrl}${canonicalPath}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    <meta name="description" content="${config.site.description}">
    <meta name="author" content="${config.author.name}">
    <link rel="canonical" href="${canonicalHref}">
    <link rel="alternate" type="application/rss+xml" title="${config.site.name} RSS Feed" href="${config.site.baseUrl}/rss.xml">
    <link rel="alternate" type="application/atom+xml" title="${config.site.name} Atom Feed" href="${config.site.baseUrl}/atom.xml">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.18.4/dist/katex.min.css" integrity="sha384-u1zONI5gPXUx0UKI62c75/zww972y0v2rSK5ZYlVdS6xEuWDeZWUI66v6t1gvlXJ" crossorigin="anonymous">
    <style>${generateCSS(config.theme)}</style>
</head>
<body>
    <header>
      <h1><a href="/" style="color: inherit; text-decoration: none;">${escapeXML(config.site.name)}</a></h1>
      <p class="subtitle">${escapeXML(config.site.tagline)}</p>
      <nav>${generateNavigation(config)}</nav>
    </header>

    
    <main>
        ${content}
    </main>
    
    <footer>
        <p>&copy; ${new Date().getFullYear()} ${config.author.name}. All rights reserved.</p>
        <p><a href="/rss.xml">/rss</a> <a href="/atom.xml">/atom</a></p>
        <p>Powered by <a href="https://github.com/nonelementary/monoblogger">MonoBlogger</a></p>
    </footer>
    ${isHome ? generateFilterScript() : ''}
    ${generateKatexScripts()}
</body>
</html>`;
};

module.exports = {
  generateHTML,
  generateNavigation,
  generateFilterScript,
  generateKatexScripts
};