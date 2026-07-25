const DEFAULT_CATEGORIES = {
  // Productivity
  'github.com': 'Productivity',
  'gitlab.com': 'Productivity',
  'bitbucket.org': 'Productivity',
  'stackoverflow.com': 'Productivity',
  'google.com': 'Productivity',
  'docs.google.com': 'Productivity',
  'sheets.google.com': 'Productivity',
  'slides.google.com': 'Productivity',
  'drive.google.com': 'Productivity',
  'linkedin.com': 'Productivity',
  'notion.so': 'Productivity',
  'slack.com': 'Productivity',
  'teams.microsoft.com': 'Productivity',
  'zoom.us': 'Productivity',
  'trello.com': 'Productivity',
  'asana.com': 'Productivity',
  'chatgpt.com': 'Productivity',
  'claude.ai': 'Productivity',
  'gemini.google.com': 'Productivity',

  // Social Media
  'facebook.com': 'Social Media',
  'instagram.com': 'Social Media',
  'twitter.com': 'Social Media',
  'x.com': 'Social Media',
  'reddit.com': 'Social Media',
  'tiktok.com': 'Social Media',
  'pinterest.com': 'Social Media',

  // Entertainment
  'youtube.com': 'Entertainment',
  'netflix.com': 'Entertainment',
  'spotify.com': 'Entertainment',
  'twitch.tv': 'Entertainment',
  'disneyplus.com': 'Entertainment',
  'primevideo.com': 'Entertainment',
  'hulu.com': 'Entertainment',

  // News & Info
  'wikipedia.org': 'News & Info',
  'medium.com': 'News & Info',
  'bbc.com': 'News & Info',
  'cnn.com': 'News & Info',
  'nytimes.com': 'News & Info',
  'reuters.com': 'News & Info',
  'guardian.com': 'News & Info',
  'news.google.com': 'News & Info',

  // Shopping
  'amazon.com': 'Shopping',
  'amazon.in': 'Shopping',
  'ebay.com': 'Shopping',
  'aliexpress.com': 'Shopping',
  'etsy.com': 'Shopping',
  'target.com': 'Shopping',
  'walmart.com': 'Shopping'
};

function getCategory(domain, customCategories = {}) {
  if (customCategories && customCategories[domain]) {
    return customCategories[domain];
  }
  
  if (DEFAULT_CATEGORIES[domain]) {
    return DEFAULT_CATEGORIES[domain];
  }
  
  const parts = domain.split('.');
  if (parts.length > 2) {
    const baseDomain = parts.slice(-2).join('.');
    if (DEFAULT_CATEGORIES[baseDomain]) {
      return DEFAULT_CATEGORIES[baseDomain];
    }
  }
  
  return 'Other';
}
