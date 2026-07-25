let currentTracking = null; // { domain: string, startTime: number }
let isIdle = false;

function getDomain(url) {
  if (!url) return null;
  try {
    const tempUrl = new URL(url);
    if (tempUrl.protocol.startsWith('http') || tempUrl.protocol === 'file:') {
      let hostname = tempUrl.hostname;
      if (hostname.startsWith('www.')) {
        hostname = hostname.substring(4);
      }
      return hostname;
    }
  } catch (e) {
    // Ignore invalid/non-standard URLs
  }
  return null;
}

async function commitTime() {
  if (!currentTracking || isIdle) return;

  const now = Date.now();
  const elapsed = Math.round((now - currentTracking.startTime) / 1000);
  
  if (elapsed <= 0) {
    currentTracking.startTime = now;
    return;
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const domain = currentTracking.domain;

  const result = await chrome.storage.local.get(['stats']);
  const stats = result.stats || {};
  
  if (!stats[dateStr]) {
    stats[dateStr] = {};
  }
  if (!stats[dateStr][domain]) {
    stats[dateStr][domain] = 0;
  }
  stats[dateStr][domain] += elapsed;

  await chrome.storage.local.set({ stats });
  currentTracking.startTime = now;
}

async function startTracking(domain) {
  await commitTime();
  if (domain) {
    currentTracking = { domain, startTime: Date.now() };
  } else {
    currentTracking = null;
  }
}

async function updateTracking() {
  const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (activeTab && activeTab.url) {
    const domain = getDomain(activeTab.url);
    if (domain) {
      if (!currentTracking || currentTracking.domain !== domain) {
        await startTracking(domain);
      }
    } else {
      await startTracking(null);
    }
  } else {
    await startTracking(null);
  }
}

chrome.tabs.onActivated.addListener(async () => {
  await updateTracking();
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.url) {
    const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (activeTab && activeTab.id === tabId) {
      await updateTracking();
    }
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await startTracking(null);
  } else {
    await updateTracking();
  }
});

chrome.idle.setDetectionInterval(60); // 60s idle threshold
chrome.idle.onStateChanged.addListener(async (state) => {
  if (state === 'idle' || state === 'locked') {
    isIdle = true;
    await commitTime();
  } else {
    isIdle = false;
    if (currentTracking) {
      currentTracking.startTime = Date.now();
    } else {
      await updateTracking();
    }
  }
});

// Periodic commit every 10s
setInterval(async () => {
  await commitTime();
}, 10000);

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['stats', 'customCategories'], (result) => {
    if (!result.stats) chrome.storage.local.set({ stats: {}, customCategories: {} });
  });
});
