const fs = require('fs');
const marked = require('marked');

// Import our modules
const { loadConfig } = require('./lib/config');
const { generateHTML } = require('./lib/html-generator');
const { generateRSSFeed, generateAtomFeed } = require('./lib/feed-generator');
const { registerKatexMarkdown } = require('./lib/katex-markdown');
const {
  findContent,
  parsePost,
  filterPostsByDate,
  sortPostsByDate,
  extractCategories,
  formatDate
} = require('./lib/content-processor');
const {
  createDirs,
  copyPostAssets,
  createExamplePost,
  writePublicFile,
  copyFavicon
} = require('./lib/file-utils');

// Configure marked
marked.setOptions({ mangle: false, headerIds: false });
registerKatexMarkdown(marked);

/**
 * Process content (posts or pages) and generate HTML files
 */
const processContent = (contentDir, config, isPost = true) => {
  const foundContent = findContent(contentDir);
  const content = [];
  let totalAssetsCopied = 0;
  
  foundContent.forEach(contentInfo => {
    const fileContent = fs.readFileSync(contentInfo.path, 'utf-8');
    
    try {
      const item = parsePost(fileContent, contentInfo.slug); 
      item.slug = contentInfo.slug;
      
      // For posts, skip future-dated content
      if (isPost) {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        if (item.date > today) {
          console.log(`⏭ Skipping future post: ${item.title} (${formatDate(item.date, config.build.dateFormat)})`);
          return;
        }
      }
      
      // Copy assets if it's a directory-based content
      if (contentInfo.type === 'directory') {
        const assetsCopied = copyPostAssets(contentInfo.dirPath, contentInfo.slug);
        totalAssetsCopied += assetsCopied;
        
        if (assetsCopied > 0) {
          console.log(`📁 ${contentInfo.slug}: copied ${assetsCopied} assets`);
        }
      }
      
      // Convert markdown to HTML
      const htmlContent = marked.parse(item.content);
      
      // Generate HTML with or without post metadata
      const html = generateHTML(
        item.title,
        isPost ? 
          generatePostHTML(item, htmlContent, config) : 
          generatePageHTML(htmlContent),
        config,
        false,
        `/posts/${item.slug}.html`
      );
      
      // Write HTML file
      fs.writeFileSync(`public/posts/${item.slug}.html`, html);
      
      if (isPost) {
        content.push(item);
      }
      
      console.log(`✓ Built ${isPost ? 'post' : 'page'}: ${item.title}`);
    } catch (error) {
      console.error(`Error processing ${contentInfo.path}:`, error.message);
    }
  });
  
  return { content, totalAssetsCopied };
};

/**
 * Generate post HTML with metadata
 */
const generatePostHTML = (post, htmlContent, config) => {
  return `
    <article class="entry">
      <div class="post-meta">
        <span class="date-text"><time datetime="${post.date.toISOString()}">${formatDate(post.date, config.build.dateFormat)}</time></span>
        ${post.categories.length > 0 ? `
          <span class="categories">
            ${post.categories.map(cat => `<span class="category">${cat}</span>`).join(' ')}
          </span>` : ''}
      </div>
      <div class="content">
        ${htmlContent}
      </div>
    </article>
  `;
};

/**
 * Generate page HTML without metadata
 */
const generatePageHTML = (htmlContent) => {
  return `
    <article class="entry">
      <div class="content">
        ${htmlContent}
      </div>
    </article>
  `;
};

/**
 * Generate category filter HTML
 */
const generateCategoryFilter = (categories) => {
  if (categories.length === 0) return '';
  
  return `
    <div class="category-filter">
      <button class="category-btn active" data-category="all">All</button>
      ${categories.map(cat => `<button class="category-btn" data-category="${cat.toLowerCase()}">${cat}</button>`).join('')}
    </div>
  `;
};

/**
 * Generate home page content
 */
const generateHomeContent = (posts, config) => {
  const allCategories = extractCategories(posts);
  const displayedPosts = posts.slice(0, config.build.postsPerPage);
  const categoryFilter = generateCategoryFilter(allCategories);
  
  const postList = displayedPosts.map(post => `
    <li data-categories="${post.categories.map(cat => cat.toLowerCase()).join(' ')}">
      <h2 class="post-title">
        <a href="/posts/${post.slug}.html">${post.title}</a>
      </h2>
      <div class="post-date">
        <span class="date-text">${formatDate(post.date, config.build.dateFormat)}</span>
        ${post.categories.length > 0 ? `
          <span class="categories">
            ${post.categories.map(cat => `<span class="category">${cat}</span>`).join(' ')}
          </span>` : ''}
      </div>
      ${post.excerpt ? `<p class="post-excerpt">${post.excerpt}</p>` : ''}
    </li>
  `).join('');
  
  const pagination = posts.length > config.build.postsPerPage ? 
    `<p style="margin-top: 2rem; color: ${config.theme.accentColor};">Showing ${config.build.postsPerPage} of ${posts.length} posts</p>` : '';
  
  return `
    ${categoryFilter}
    <ul class="post-list">
      ${postList}
    </ul>
    ${pagination}
  `;
};

/**
 * Main build function
 */
const build = () => {
  const config = loadConfig();
  
  console.log(`Building blog for ${config.author.name}...`);
  console.log(`Site: ${config.site.name} (${config.site.domain})`);
  
  // Create necessary directories
  createDirs();

  // Copy favicon if configured
  copyFavicon(config.site.favicon);

  // Create example post if no posts exist
  createExamplePost(config);
  
  // Process posts
  const { content: posts, totalAssetsCopied: postAssets } = processContent('posts', config, true);
  
  // Process pages
  const { totalAssetsCopied: pageAssets } = processContent('pages', config, false);
  
  const totalAssetsCopied = postAssets + pageAssets;
  
  // Filter and sort posts
  const publishedPosts = sortPostsByDate(filterPostsByDate(posts));
  
  // Generate RSS and Atom feeds
  const rssXML = generateRSSFeed(publishedPosts, config);
  const atomXML = generateAtomFeed(publishedPosts, config);
  
  writePublicFile('rss.xml', rssXML);
  writePublicFile('atom.xml', atomXML);
  
  console.log(`📡 Generated RSS feed with ${Math.min(publishedPosts.length, 10)} posts`);
  console.log(`📡 Generated Atom feed with ${Math.min(publishedPosts.length, 10)} posts`);
  
  // Log categories
  const allCategories = extractCategories(publishedPosts);
  console.log(`📂 Found ${allCategories.length} categories:`, allCategories);
  publishedPosts.forEach(post => {
    console.log(`  ${post.title}: [${post.categories.join(', ')}]`);
  });
  
  // Generate home page
  const homeContent = generateHomeContent(publishedPosts, config);
  const homeHTML = generateHTML(config.site.name, homeContent, config, true, '/');
  
  writePublicFile('index.html', homeHTML);
  
  // Generate CNAME file for custom domain
  writePublicFile('CNAME', config.site.domain);
  
  console.log(`\n✅ Built ${publishedPosts.length} posts successfully!`);
  if (totalAssetsCopied > 0) {
    console.log(`📸 Total assets copied: ${totalAssetsCopied}`);
  }
  console.log(`📁 Deploy the "public" folder to GitHub Pages`);
  console.log(`🌐 Site will be available at: ${config.site.baseUrl}`);
  console.log(`📡 RSS feed: ${config.site.baseUrl}/rss.xml`);
  console.log(`📡 Atom feed: ${config.site.baseUrl}/atom.xml`);
};

// Run build if called directly
if (require.main === module) {
  build();
}

module.exports = { build };