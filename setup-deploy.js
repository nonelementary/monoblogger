const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load configuration
const loadConfig = () => {
  try {
    const configPath = path.join(__dirname, 'config.json');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(configContent);
  } catch (error) {
    console.error('❌ Error loading config.json:', error.message);
    console.log('Please ensure config.json exists and is valid JSON');
    process.exit(1);
  }
};

const setupDeploy = () => {
  const config = loadConfig();
  
  console.log('🚀 Setting up deployment for your blog...\n');
  console.log(`📝 Blog: ${config.site.name}`);
  console.log(`🌐 Domain: ${config.site.domain}`);
  console.log(`👤 Author: ${config.author.name}\n`);
  
  // Check if public directory exists
  if (!fs.existsSync('public')) {
    console.log('📁 Creating public directory...');
    fs.mkdirSync('public');
  }
  
  // Check if public is already a git repository
  const isGitRepo = fs.existsSync('public/.git');
  
  if (!isGitRepo) {
    console.log('🔧 Initializing git repository in public/ folder...');
    
    try {
      // Initialize git in public directory
      process.chdir('public');
      execSync('git init', { stdio: 'inherit' });
      
      // Create initial commit structure
      fs.writeFileSync('README.md', `# ${config.site.name}\n\nGenerated blog site for ${config.site.domain}\n`);
      
      execSync('git add README.md', { stdio: 'inherit' });
      execSync('git commit -m "Initial commit"', { stdio: 'inherit' });
      
      // Go back to parent directory
      process.chdir('..');
      
      console.log('✅ Git repository initialized in public/\n');
      
    } catch (error) {
      console.error('❌ Error setting up git:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Git repository already exists in public/\n');
  }
  
  console.log('🎯 Next steps:');
  console.log('');
  console.log('1. Create your GitHub repository:');
  console.log(`   - Repository name: ${config.author.name.toLowerCase().replace(/\s+/g, '')}.github.io`);
  console.log('   - Or any name for project pages');
  console.log('');
  console.log('2. Connect your local public/ folder to GitHub:');
  console.log('   cd public');
  console.log('   git remote add origin https://github.com/yourusername/yourusername.github.io.git');
  console.log('   cd ..');
  console.log('');
  console.log('3. Build and deploy your first version:');
  console.log('   npm run build');
  console.log('   npm run deploy');
  console.log('');
  console.log('4. Configure GitHub Pages:');
  console.log('   - Go to repository Settings → Pages');
  console.log('   - Set source to "Deploy from a branch"');
  console.log('   - Select "main" branch and "/ (root)" folder');
  console.log(`   - Set custom domain to: ${config.site.domain}`);
  console.log('');
  console.log('5. Set up DNS for your domain:');
  console.log('   Add these A records:');
  console.log('   @ → 185.199.108.153');
  console.log('   @ → 185.199.109.153');
  console.log('   @ → 185.199.110.153');
  console.log('   @ → 185.199.111.153');
  console.log(`   www → yourusername.github.io (CNAME)`);
  console.log('');
  console.log('🎉 After setup, you can deploy anytime with: npm run deploy');
  console.log('');
  console.log('💡 Pro tip: Use "npm run deploy-msg \'Your commit message\'" for custom commit messages');
};

if (require.main === module) {
  setupDeploy();
}

module.exports = { setupDeploy };