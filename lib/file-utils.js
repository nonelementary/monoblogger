const fs = require('fs');
const path = require('path');

/**
 * Create necessary directories if they don't exist
 */
const createDirs = () => {
  const dirs = ['posts', 'pages', 'public', 'public/posts', 'public/images'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

/**
 * Copy all post assets (images, files) to public directory
 */
const copyPostAssets = (postDir, slug) => {
  const publicPostDir = path.join('public', 'images', slug);
  
  // Create post-specific images directory
  if (!fs.existsSync(publicPostDir)) {
    fs.mkdirSync(publicPostDir, { recursive: true });
  }
  
  let copiedCount = 0;
  
  // Get all files in the post directory
  const files = fs.readdirSync(postDir);
  
  files.forEach(file => {
    const filePath = path.join(postDir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile() && !file.endsWith('.md')) {
      // Copy non-markdown files (images, etc.)
      const destPath = path.join(publicPostDir, file);
      fs.copyFileSync(filePath, destPath);
      copiedCount++;
    } else if (stat.isDirectory()) {
      // Handle subdirectories recursively
      const subDir = path.join(publicPostDir, file);
      if (!fs.existsSync(subDir)) {
        fs.mkdirSync(subDir, { recursive: true });
      }
      
      const subFiles = fs.readdirSync(filePath);
      subFiles.forEach(subFile => {
        const subFilePath = path.join(filePath, subFile);
        const subDestPath = path.join(subDir, subFile);
        
        if (fs.statSync(subFilePath).isFile()) {
          fs.copyFileSync(subFilePath, subDestPath);
          copiedCount++;
        }
      });
    }
  });
  
  return copiedCount;
};

/**
 * Create example post structure if posts directory doesn't exist
 */
const createExamplePost = (config) => {
  const postsDir = 'posts';
  
  if (!fs.existsSync(postsDir)) {
    console.log('No posts directory found. Creating example structure...');
    fs.mkdirSync(postsDir, { recursive: true });
    
    // Create example post directory structure
    const exampleDir = path.join(postsDir, 'welcome');
    fs.mkdirSync(exampleDir, { recursive: true });
    
    const examplePost = `---
title: Welcome to ${config.site.name}
date: ${new Date().toISOString().split('T')[0]}
excerpt: Welcome to my new blog with organized post structure!
---

# Welcome!

This is an example post for ${config.site.name}.

## Images in this post

You can include images that are stored right alongside this post:

![Example image](./example.jpg)

Or in subfolders:

![Another image](./images/subfolder-image.png)

## Organization

Each post can be either:
- A single \`.md\` file in the posts directory
- A folder containing \`index.md\` (or \`README.md\`) plus images and other assets

You can delete this post and create your own!`;
    
    fs.writeFileSync(path.join(exampleDir, 'index.md'), examplePost);
    
    // Create a simple example image placeholder
    const placeholderText = 'This would be an example image file. Replace with your actual images.';
    fs.writeFileSync(path.join(exampleDir, 'example.jpg.txt'), placeholderText);
    
    console.log('Created example post structure in posts/welcome/');
    return true;
  }
  
  return false;
};

/**
 * Write files to the public directory
 */
const writePublicFile = (filename, content) => {
  fs.writeFileSync(path.join('public', filename), content);
};

/**
 * Copy the configured favicon (if any) from the project root into public/
 */
const copyFavicon = (faviconPath) => {
  if (!faviconPath || !fs.existsSync(faviconPath)) {
    return false;
  }

  fs.copyFileSync(faviconPath, path.join('public', path.basename(faviconPath)));
  return true;
};

module.exports = {
  createDirs,
  copyPostAssets,
  createExamplePost,
  writePublicFile,
  copyFavicon
};