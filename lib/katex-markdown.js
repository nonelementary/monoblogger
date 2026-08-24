/**
 * Marked extension that protects LaTeX math spans from markdown processing.
 *
 * Without this, marked's commonmark rules mangle math before KaTeX ever sees it:
 * underscores/asterisks inside $...$ get parsed as emphasis, and backslash-escaped
 * punctuation like \{ \} \\ gets its backslash stripped. Capturing $...$ and $$...$$
 * as raw tokens (at higher precedence than emphasis/escape parsing) keeps the LaTeX
 * source intact so KaTeX's auto-render can typeset it client-side.
 */
const escapeHtml = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

const katexBlockExtension = {
  name: 'katexBlock',
  level: 'block',
  start(src) {
    const match = src.match(/\$\$/);
    return match ? match.index : undefined;
  },
  tokenizer(src) {
    const match = /^\$\$([\s\S]+?)\$\$/.exec(src);
    if (match) {
      return {
        type: 'katexBlock',
        raw: match[0],
        text: match[1].trim()
      };
    }
  },
  renderer(token) {
    return `<div class="katex-display-wrapper">$$${escapeHtml(token.text)}$$</div>\n`;
  }
};

const katexInlineExtension = {
  name: 'katexInline',
  level: 'inline',
  start(src) {
    const match = src.match(/\$/);
    return match ? match.index : undefined;
  },
  tokenizer(src) {
    const match = /^\$([^\n$]+?)\$/.exec(src);
    if (!match) return;
    const text = match[1];
    // Skip if surrounded by whitespace (usually just a currency amount, not math)
    if (/^\s/.test(text) || /\s$/.test(text)) return;
    return {
      type: 'katexInline',
      raw: match[0],
      text: text.trim()
    };
  },
  renderer(token) {
    return `$${escapeHtml(token.text)}$`;
  }
};

/**
 * Register the KaTeX-protecting extensions on a marked instance
 */
const registerKatexMarkdown = (markedInstance) => {
  markedInstance.use({
    extensions: [katexBlockExtension, katexInlineExtension]
  });
};

module.exports = { registerKatexMarkdown };
