const CATEGORY_COLORS = {
  'Productivity': 'var(--productivity-color)',
  'Social Media': 'var(--social-color)',
  'Entertainment': 'var(--entertainment-color)',
  'News & Info': 'var(--news-color)',
  'Shopping': 'var(--shopping-color)',
  'Other': 'var(--other-color)'
};

document.getElementById('open-dashboard').addEventListener('click', () => {
  chrome.tabs.create({ url: 'dashboard.html' });
});

async function loadPopupStats() {
  const result = await chrome.storage.local.get(['stats', 'customCategories']);
  const stats = result.stats || {};
  const customCategories = result.customCategories || {};

  const today = new Date().toISOString().split('T')[0];
  const todayStats = stats[today] || {};

  let totalSeconds = 0;
  const domainTimes = [];
  const categoryTimes = {
    'Productivity': 0, 'Social Media': 0, 'Entertainment': 0,
    'News & Info': 0, 'Shopping': 0, 'Other': 0
  };

  for (const [domain, seconds] of Object.entries(todayStats)) {
    totalSeconds += seconds;
    const cat = getCategory(domain, customCategories);
    categoryTimes[cat] = (categoryTimes[cat] || 0) + seconds;
    domainTimes.push({ domain, seconds, category: cat });
  }

  domainTimes.sort((a, b) => b.seconds - a.seconds);
  document.getElementById('total-time').innerText = formatTime(totalSeconds);

  const categoryBarsContainer = document.getElementById('category-bars');
  categoryBarsContainer.innerHTML = '';
  
  const sortedCategories = Object.entries(categoryTimes)
    .filter(([_, time]) => time > 0)
    .sort((a, b) => b[1] - a[1]);

  if (sortedCategories.length === 0) {
    categoryBarsContainer.innerHTML = `<div style="font-size: 11px; color: var(--text-secondary); text-align: center; padding: 10px 0;">No active browsing tracked today.</div>`;
  } else {
    sortedCategories.forEach(([cat, time]) => {
      const percentage = totalSeconds > 0 ? Math.round((time / totalSeconds) * 100) : 0;
      const barColor = CATEGORY_COLORS[cat] || 'var(--other-color)';
      const barHtml = `
        <div class="cat-bar-container">
          <div class="cat-info">
            <span class="cat-name">${cat}</span>
            <span class="cat-time">${formatTime(time)} (${percentage}%)</span>
          </div>
          <div class="bar-bg">
            <div class="bar-fill" style="width: ${percentage}%; background-color: ${barColor};"></div>
          </div>
        </div>
      `;
      categoryBarsContainer.insertAdjacentHTML('beforeend', barHtml);
    });
  }

  const sitesListContainer = document.getElementById('sites-list');
  sitesListContainer.innerHTML = '';

  const topSites = domainTimes.slice(0, 4);

  if (topSites.length === 0) {
    sitesListContainer.innerHTML = `<li style="font-size: 11px; color: var(--text-secondary); text-align: center; padding: 10px 0;">Start browsing to view top websites.</li>`;
  } else {
    topSites.forEach(item => {
      const barColor = CATEGORY_COLORS[item.category] || 'var(--other-color)';
      const faviconUrl = `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent('https://' + item.domain)}&size=32`;
      const li = document.createElement('li');
      li.className = 'site-item';
      li.innerHTML = `
        <div class="site-domain-box">
          <img class="site-favicon" src="${faviconUrl}" onerror="this.style.display='none';" alt="">
          <span class="site-domain" title="${item.domain}">${item.domain}</span>
        </div>
        <div class="site-time-box">
          <span class="site-time">${formatTime(item.seconds)}</span>
          <span class="site-dot" style="background-color: ${barColor};"></span>
        </div>
      `;
      sitesListContainer.appendChild(li);
    });
  }
}

function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
}

document.addEventListener('DOMContentLoaded', loadPopupStats);
