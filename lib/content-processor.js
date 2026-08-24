const fs = require('fs');
const path = require('path');

/**
 * Find all content (both files and directories) in a given directory
 */
const findContent = (contentDir) => {
  if (!fs.existsSync(contentDir)) {
    return [];
  }
  
  const items = fs.readdirSync(contentDir);
  const content = [];
  
  items.forEach(item => {
    const itemPath = path.join(contentDir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isFile() && item.endsWith('.md')) {
      // Single markdown file
      content.push({
        type: 'file',
        path: itemPath,
        slug: path.basename(item, '.md')
      });
    } else if (stat.isDirectory()) {
      // Directory - look for index.md or README.md
      const possibleFiles = ['index.md', 'README.md', `${item}.md`];
      let markdownFile = null;
      
      for (const file of possibleFiles) {
        const mdPath = path.join(itemPath, file);
        if (fs.existsSync(mdPath)) {
          markdownFile = mdPath;
          break;
        }
      }
      
      if (markdownFile) {
        content.push({
          type: 'directory',
          path: markdownFile,
          dirPath: itemPath,
          slug: item
        });
      }
    }
  });
  
  return content;
};

/**
 * Parse post metadata from frontmatter
 */
const parsePost = (content, slug) => {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    throw new Error('Post must have frontmatter');
  }
  
  const frontmatter = {};
  const frontmatterContent = match[1];
  const markdownContent = match[2];
  
  frontmatterContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
      
      // Handle arrays (like categories)
      if (value.startsWith('[') && value.endsWith(']')) {
        frontmatter[key.trim()] = value.slice(1, -1)
          .split(',')
          .map(item => item.trim().replace(/^["']|["']$/g, ''))
          .filter(item => item.length > 0);
      } else {
        frontmatter[key.trim()] = value;
      }
    }
  });
  
  return {
    ...frontmatter,
    content: convertRelativePaths(markdownContent, slug), // This would be the actual change
    date: new Date(frontmatter.date),
    categories: frontmatter.categories || []
  };
};

/**
 * Filter posts by publication date (exclude future posts)
 */
const filterPostsByDate = (posts) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  return posts.filter(post => post.date <= today);
};

/**
 * Sort posts by date (newest first)
 */
const sortPostsByDate = (posts) => {
  return posts.sort((a, b) => b.date - a.date);
};

/**
 * Extract all unique categories from posts
 */
const extractCategories = (posts) => {
  return [...new Set(posts.flatMap(post => post.categories))].sort();
};

/**
 * Format date according to configuration
 */
const formatDate = (date, dateFormat = 'long') => {
  const options = {
    year: 'numeric',
    month: dateFormat === 'short' ? 'short' : 'long',
    day: 'numeric'
  };
  
  return date.toLocaleDateString('en-US', options);
};

// Convert ./image.jpg to /images/post-slug/image.jpg
const convertRelativePaths = (content, slug) => {
  return content.replace(/!\[([^\]]*)\]\(\.\/([^)]+)\)/g, `![$1](/images/${slug}/$2)`);
};

module.exports = {
  findContent,
  parsePost,
  filterPostsByDate,
  sortPostsByDate,
  extractCategories,
  formatDate
};