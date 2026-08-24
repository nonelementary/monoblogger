const marked = require('marked');

// Escape XML entities
const escapeXML = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Convert relative URLs to absolute URLs in content
const makeAbsoluteUrls = (content, baseUrl) => {
  if (!content) return '';
  return content.replace(/\b(?:src|href)="([^"]+)"/g, (m, url) => {
    // Leave absolute/protocol-relative/anchors/mailto/tel/data alone
    if (
      /^https?:\/\//i.test(url) ||
      /^\/\//.test(url) ||
      /^#/.test(url) ||
      /^mailto:/i.test(url) ||
      /^tel:/i.test(url) ||
      /^data:/i.test(url)
    ) return m;

    // Resolve against base; handles ./, ../, and leading /
    let absolute;
    try {
      absolute = new URL(url, baseUrl).toString();
    } catch {
      return m; // if something odd, don't mutate
    }
    return m.replace(url, absolute);
  });
};

// Ensure self-closing tags so HTML becomes well-formed XHTML
const toXHTML = (html) => {
  if (!html) return '';
  return html
    // self-close common void elements that may appear in posts
    .replace(/<img([^>]*?)>(?!\s*<\/img>)/gi, '<img$1 />')
    .replace(/<br([^>]*?)>(?!\s*<\/br>)/gi, '<br$1 />')
    .replace(/<hr([^>]*?)>(?!\s*<\/hr>)/gi, '<hr$1 />');
};

/**
 * Generate RSS 2.0 feed
 */
const generateRSSFeed = (posts, config) => {
  const buildDate = new Date();
  const buildDateStr = buildDate.toUTCString();
  const feedPosts = posts.slice(0, 10);
  const baseUrl = config.site.baseUrl;

  const rssItems = feedPosts.map(post => {
    const postUrl = `${baseUrl}/posts/${post.slug}.html`;
    const contentHtml = makeAbsoluteUrls(marked.parse(post.content), baseUrl);

    return `    <item>
      <title>${escapeXML(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${post.date.toUTCString()}</pubDate>
      <dc:creator>${escapeXML(config.author.name)}</dc:creator>
      ${post.categories.length > 0 ? post.categories.map(cat => `<category>${escapeXML(cat)}</category>`).join('\n      ') : ''}
      <description>${escapeXML(post.excerpt || post.title)}</description>
      <content:encoded><![CDATA[${contentHtml}]]></content:encoded>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXML(config.site.name)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXML(config.site.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${buildDateStr}</lastBuildDate>
    <pubDate>${(feedPosts[0] ? feedPosts[0].date : buildDate).toUTCString()}</pubDate>
    <ttl>60</ttl>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>`;
};

/**
 * Generate Atom 1.0 feed
 */
const generateAtomFeed = (posts, config) => {
  const buildDate = new Date();
  const buildDateISO = buildDate.toISOString();
  const feedPosts = posts.slice(0, 10);
  const baseUrl = config.site.baseUrl;

  const atomEntries = feedPosts.map(post => {
    const postUrl = `${baseUrl}/posts/${post.slug}.html`;

    // Convert Markdown → HTML, fix relative URLs, then make it XHTML-friendly
    const html = marked.parse(post.content);
    const absoluteHtml = makeAbsoluteUrls(html, baseUrl);
    const xhtml = toXHTML(absoluteHtml);

    const iso = post.date.toISOString();

    return `  <entry>
    <id>${postUrl}</id>
    <title type="html">${escapeXML(post.title)}</title>
    <link href="${postUrl}" rel="alternate" type="text/html" />
    <published>${iso}</published>
    <updated>${iso}</updated>
    <author>
      <name>${escapeXML(config.author.name)}</name>
    </author>
    ${post.categories.length > 0 ? post.categories.map(cat => `<category term="${escapeXML(cat)}" />`).join('\n    ') : ''}
    <summary type="html">${escapeXML(post.excerpt || post.title)}</summary>
    <content type="xhtml">
      <div xmlns="http://www.w3.org/1999/xhtml">
${xhtml}
      </div>
    </content>
  </entry>`;
  }).join('\n');

  const updatedISO = (feedPosts[0] ? feedPosts[0].date : buildDate).toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXML(config.site.name)}</title>
  <link href="${baseUrl}" rel="alternate" type="text/html" />
  <link href="${baseUrl}/atom.xml" rel="self" type="application/atom+xml" />
  <id>${baseUrl}/</id>
  <updated>${updatedISO}</updated>
  <subtitle>${escapeXML(config.site.description)}</subtitle>
  <author>
    <name>${escapeXML(config.author.name)}</name>
  </author>
  <generator>Monoblogger</generator>
${atomEntries}
</feed>`;
};

module.exports = {
  generateRSSFeed,
  generateAtomFeed,
  escapeXML,
  makeAbsoluteUrls,
  toXHTML
};