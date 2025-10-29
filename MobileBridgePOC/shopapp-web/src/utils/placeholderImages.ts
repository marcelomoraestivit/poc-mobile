// Generate placeholder images as SVG data URLs
// These work reliably in WebView without external network requests

const gradients = [
  { start: '#667eea', end: '#764ba2', emoji: '📱' }, // Electronics
  { start: '#f093fb', end: '#f5576c', emoji: '🎧' }, // Audio
  { start: '#4facfe', end: '#00f2fe', emoji: '💻' }, // Computer
  { start: '#43e97b', end: '#38f9d7', emoji: '👟' }, // Sports
  { start: '#fa709a', end: '#fee140', emoji: '👔' }, // Fashion
  { start: '#30cfd0', end: '#330867', emoji: '🏠' }, // Home
  { start: '#a8edea', end: '#fed6e3', emoji: '☕' }, // Kitchen
  { start: '#ff9a9e', end: '#fecfef', emoji: '🏃' }, // Fitness
  { start: '#ffecd2', end: '#fcb69f', emoji: '💄' }, // Beauty
  { start: '#ff6e7f', end: '#bfe9ff', emoji: '⌚' }, // Watch
  { start: '#e0c3fc', end: '#8ec5fc', emoji: '📷' }, // Camera
  { start: '#f6d365', end: '#fda085', emoji: '🔊' }, // Speaker
];

export function generatePlaceholder(index: number = 0, emoji?: string): string {
  const gradient = gradients[index % gradients.length];
  const displayEmoji = emoji || gradient.emoji;

  // Create SVG with gradient background and emoji
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
      <defs>
        <linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${gradient.start};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${gradient.end};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="600" fill="url(#grad${index})" />
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="180" fill="white" opacity="0.9">${displayEmoji}</text>
    </svg>
  `.trim();

  // Convert to data URL
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');

  return `data:image/svg+xml,${encoded}`;
}

export function generateBannerPlaceholder(index: number, title: string): string {
  const gradient = gradients[index % gradients.length];

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
      <defs>
        <linearGradient id="banner${index}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${gradient.start};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${gradient.end};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="800" height="400" fill="url(#banner${index})" />
      <text x="50%" y="45%" text-anchor="middle" font-size="120" fill="white" opacity="0.9">${gradient.emoji}</text>
      <text x="50%" y="70%" text-anchor="middle" font-size="32" font-weight="bold" fill="white" opacity="0.95">${title}</text>
    </svg>
  `.trim();

  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');

  return `data:image/svg+xml,${encoded}`;
}

// Map of product IDs to their placeholder images
export const productPlaceholders: Record<string, string> = {
  'prod1': generatePlaceholder(0, '📱'),
  'prod2': generatePlaceholder(1, '🎧'),
  'prod3': generatePlaceholder(2, '💻'),
  'prod4': generatePlaceholder(3, '👟'),
  'prod5': generatePlaceholder(4, '👔'),
  'prod6': generatePlaceholder(5, '💡'),
  'prod7': generatePlaceholder(6, '☕'),
  'prod8': generatePlaceholder(7, '🏃'),
  'prod9': generatePlaceholder(8, '💄'),
  'prod10': generatePlaceholder(9, '⌚'),
  'prod11': generatePlaceholder(10, '📷'),
  'prod12': generatePlaceholder(11, '🔊'),
};

// Banner placeholders
export const bannerPlaceholders = [
  generateBannerPlaceholder(0, '🎉 Ofertas do Dia'),
  generateBannerPlaceholder(3, '🆕 Novo Lançamento'),
  generateBannerPlaceholder(6, '🚚 Frete Grátis'),
];
