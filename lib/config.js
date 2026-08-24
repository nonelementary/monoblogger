const fs = require('fs');
const path = require('path');

/**
 * Load and validate configuration from config.json
 */
const loadConfig = () => {
  try {
    const configPath = path.join(__dirname, '..', 'config.json');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    
    // Validate required fields
    validateConfig(config);
    
    // Apply defaults and normalize
    return normalizeConfig(config);
  } catch (error) {
    console.error('Error loading config.json:', error.message);
    console.log('Please ensure config.json exists and is valid JSON');
    process.exit(1);
  }
};

/**
 * Validate required configuration fields
 */
const validateConfig = (config) => {
  const required = [
    'site.name',
    'site.baseUrl',
    'author.name',
    'author.email'
  ];
  
  for (const field of required) {
    const value = getNestedProperty(config, field);
    if (!value) {
      throw new Error(`Required configuration field missing: ${field}`);
    }
  }
  
  // Validate baseUrl format
  if (!/^https?:\/\//i.test(config.site.baseUrl)) {
    throw new Error(`config.site.baseUrl must start with http(s):// — got: ${config.site.baseUrl}`);
  }
};

/**
 * Get nested property from object using dot notation
 */
const getNestedProperty = (obj, path) => {
  return path.split('.').reduce((current, key) => current && current[key], obj);
};

/**
 * Normalize and apply defaults to configuration
 */
const normalizeConfig = (config) => {
  // Normalize baseUrl (remove trailing slashes)
  config.site.baseUrl = config.site.baseUrl.replace(/\/+$/, '');
  
  // Apply theme defaults
  config.theme = {
    primaryColor: '#60a5fa',
    primaryHover: '#93c5fd',
    backgroundColor: '#0f172a',
    backgroundGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    cardBackground: 'rgba(30, 41, 59, 0.4)',
    borderColor: '#334155',
    textColor: '#e2e8f0',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    accentColor: '#a78bfa',
    ...config.theme
  };
  
  // Apply build defaults
  config.build = {
    postsPerPage: 10,
    dateFormat: 'long',
    enableComments: false,
    enableAnalytics: false,
    ...config.build
  };
  
  // Apply social defaults
  config.social = config.social || {};
  
  return config;
};

module.exports = {
  loadConfig,
  validateConfig,
  normalizeConfig
};