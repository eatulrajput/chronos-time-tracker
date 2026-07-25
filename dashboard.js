let currentTab = 'daily';
let selectedDate = new Date().toISOString().split('T')[0];
let selectedMonth = new Date().getMonth();
let selectedYear = new Date().getFullYear();
let statsData = {};
let customCategories = {};

const CATEGORY_COLORS = {
  'Productivity': 'var(--productivity-color)',
  'Social Media': 'var(--social-color)',
  'Entertainment': 'var(--entertainment-color)',
  'News & Info': 'var(--news-color)',
  'Shopping': 'var(--shopping-color)',
  'Other': 'var(--other-color)'
};

const dateSelector = document.getElementById('date-selector');
const dateLabel = document.getElementById('date-label');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const currentMonthDisplay = document.getElementById('current-month-display');
const clearDataBtn = document.getElementById('clear-data');
const dailySearch = document.getElementById('daily-search');
const categoriesSearch = document.getElementById('categories-search');

document.querySelectorAll('.nav-menu .nav-item').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.nav-menu .nav-item').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    currentTab = button.dataset.tab;
    document.getElementById(`panel-${currentTab}`).classList.add('active');
    
    updateDashboardHeader();
    renderActiveTab();
  });
});

function updateDashboardHeader() {
  const title = document.getElementById('dashboard-title');
  const subtitle = document.getElementById('dashboard-subtitle');
  
  if (currentTab === 'daily') {
    title.innerText = 'Daily Browsing Activity';
    subtitle.innerText = 'Visualize your screen time patterns for a specific day';
    document.querySelector('.header-actions').style.display = 'flex';
    dateSelector.style.display = 'inline-block';
    dateLabel.style.display = 'inline-block';
  } else if (currentTab === 'weekly') {
    title.innerText = 'Weekly Screentime Trends';
    subtitle.innerText = 'Review your browsing statistics over the past 7 days';
    document.querySelector('.header-actions').style.display = 'flex';
    dateSelector.style.display = 'inline-block';
    dateLabel.style.display = 'inline-block';
  } else if (currentTab === 'monthly') {
    title.innerText = 'Monthly Screentime Heatmap';
    subtitle.innerText = 'Analyze long-term usage density and habits';
    document.querySelector('.header-actions').style.display = 'flex';
    dateSelector.style.display = 'none';
    dateLabel.style.display = 'none';
  } else if (currentTab === 'categories') {
    title.innerText = 'Category Settings';
    subtitle.innerText = 'Manage and reclassify automated domain mappings';
    document.querySelector('.header-actions').style.display = 'none';
  }
}

dateSelector.value = selectedDate;
dateSelector.addEventListener('change', (e) => {
  selectedDate = e.target.value;
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (selectedDate === todayStr) {
    dateLabel.innerText = 'Today';
  } else if (selectedDate === yesterdayStr) {
    dateLabel.innerText = 'Yesterday';
  } else {
    dateLabel.innerText = new Date(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
  
  renderActiveTab();
});

prevMonthBtn.addEventListener('click', () => {
  if (selectedMonth === 0) {
    selectedMonth = 11;
    selectedYear--;
  } else {
    selectedMonth--;
  }
  updateMonthDisplay();
  renderMonthlyTab();
});

nextMonthBtn.addEventListener('click', () => {
  if (selectedMonth === 11) {
    selectedMonth = 0;
    selectedYear++;
  } else {
    selectedMonth++;
  }
  updateMonthDisplay();
  renderMonthlyTab();
});

function updateMonthDisplay() {
  const date = new Date(selectedYear, selectedMonth, 1);
  currentMonthDisplay.innerText = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

dailySearch.addEventListener('input', renderDailyTab);
categoriesSearch.addEventListener('input', renderCategoriesTab);

clearDataBtn.addEventListener('click', async () => {
  if (confirm('Are you sure you want to permanently delete all local time tracking statistics? This action cannot be undone.')) {
    await chrome.storage.local.set({ stats: {} });
    loadDataAndRender();
  }
});

async function loadDataAndRender() {
  const result = await chrome.storage.local.get(['stats', 'customCategories']);
  statsData = result.stats || {};
  customCategories = result.customCategories || {};
  
  dateSelector.dispatchEvent(new Event('change'));
  updateMonthDisplay();
}

function renderActiveTab() {
  if (currentTab === 'daily') renderDailyTab();
  else if (currentTab === 'weekly') renderWeeklyTab();
  else if (currentTab === 'monthly') renderMonthlyTab();
  else if (currentTab === 'categories') renderCategoriesTab();
}

function formatTime(seconds) {
  if (!seconds || seconds <= 0) return '0s';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function formatTimeShort(seconds) {
  if (!seconds || seconds <= 0) return '0m';
  const hrs = seconds / 3600;
  if (hrs >= 1) return `${hrs.toFixed(1)}h`;
  const mins = Math.round(seconds / 60);
  return `${mins}m`;
}

function renderDailyTab() {
  const todayStats = statsData[selectedDate] || {};
  const searchVal = dailySearch.value.toLowerCase().trim();
  
  let totalSeconds = 0;
  const domains = [];
  const categorySeconds = {
    'Productivity': 0, 'Social Media': 0, 'Entertainment': 0,
    'News & Info': 0, 'Shopping': 0, 'Other': 0
  };

  for (const [domain, seconds] of Object.entries(todayStats)) {
    totalSeconds += seconds;
    const cat = getCategory(domain, customCategories);
    categorySeconds[cat] = (categorySeconds[cat] || 0) + seconds;
    
    if (!searchVal || domain.toLowerCase().includes(searchVal)) {
      domains.push({ domain, seconds, category: cat });
    }
  }

  domains.sort((a, b) => b.seconds - a.seconds);

  document.getElementById('summary-total-time').innerText = formatTime(totalSeconds);
  document.getElementById('summary-unique-sites').innerText = Object.keys(todayStats).length;

  let topDomain = 'None';
  let topDomainSecs = 0;
  for (const [domain, seconds] of Object.entries(todayStats)) {
    if (seconds > topDomainSecs) {
      topDomainSecs = seconds;
      topDomain = domain;
    }
  }
  document.getElementById('summary-top-site').innerText = topDomain !== 'None' ? `${topDomain} (${formatTimeShort(topDomainSecs)})` : 'None';

  let topCategory = 'None';
  let topCategorySecs = 0;
  for (const [cat, seconds] of Object.entries(categorySeconds)) {
    if (seconds > topCategorySecs) {
      topCategorySecs = seconds;
      topCategory = cat;
    }
  }
  document.getElementById('summary-top-category').innerText = topCategory !== 'None' ? `${topCategory} (${formatTimeShort(topCategorySecs)})` : 'None';

  const productiveSecs = categorySeconds['Productivity'];
  const productivePct = totalSeconds > 0 ? Math.round((productiveSecs / totalSeconds) * 100) : 0;
  document.getElementById('daily-radial-val').innerText = `${productivePct}%`;
  
  const circumference = 534;
  const offset = circumference - (productivePct / 100) * circumference;
  const ring = document.getElementById('daily-radial-ring');
  ring.style.strokeDashoffset = offset;

  const legendContainer = document.getElementById('daily-category-legend');
  legendContainer.innerHTML = '';

  const sortedCategories = Object.entries(categorySeconds)
    .filter(([_, time]) => time > 0)
    .sort((a, b) => b[1] - a[1]);

  if (sortedCategories.length === 0) {
    legendContainer.innerHTML = `<div style="font-size: 13px; color: var(--text-secondary); text-align: center; padding: 20px 0;">No browsing activity on this date.</div>`;
  } else {
    sortedCategories.forEach(([cat, time]) => {
      const pct = Math.round((time / totalSeconds) * 100);
      const dotColor = CATEGORY_COLORS[cat];
      const legendItemHtml = `
        <div class="legend-item">
          <div class="legend-label-box">
            <span class="legend-dot" style="background-color: ${dotColor};"></span>
            <span class="legend-name">${cat}</span>
          </div>
          <span class="legend-time">${formatTime(time)} (${pct}%)</span>
        </div>
      `;
      legendContainer.insertAdjacentHTML('beforeend', legendItemHtml);
    });
  }

  const tbody = document.getElementById('daily-sites-tbody');
  tbody.innerHTML = '';

  if (domains.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 40px 0;">No matching website tracking data.</td></tr>`;
  } else {
    domains.forEach(item => {
      const pct = totalSeconds > 0 ? Math.round((item.seconds / totalSeconds) * 100) : 0;
      const barColor = CATEGORY_COLORS[item.category];
      const faviconUrl = `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent('https://' + item.domain)}&size=32`;
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="domain-cell">
            <img class="domain-favicon" src="${faviconUrl}" onerror="this.style.display='none';" alt="">
            <span class="domain-text" title="${item.domain}">${item.domain}</span>
          </div>
        </td>
        <td>
          <span class="category-badge ${item.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}">${item.category}</span>
        </td>
        <td style="font-weight: 600;">${formatTime(item.seconds)}</td>
        <td>
          <div class="progress-bar-cell">
            <div class="progress-track">
              <div class="progress-fill" style="width: ${pct}%; background-color: ${barColor};"></div>
            </div>
            <span class="progress-pct">${pct}%</span>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

function renderWeeklyTab() {
  const days = [];
  const currentDate = new Date(selectedDate);
  
  for (let i = 6; i >= 0; i--) {
    const tempDate = new Date(currentDate);
    tempDate.setDate(tempDate.getDate() - i);
    days.push(tempDate.toISOString().split('T')[0]);
  }

  let grandTotal = 0;
  const dayTotals = {};
  const dayTopDomains = {};
  const categoryTotals = {
    'Productivity': 0, 'Social Media': 0, 'Entertainment': 0,
    'News & Info': 0, 'Shopping': 0, 'Other': 0
  };

  days.forEach(dayStr => {
    const dayStats = statsData[dayStr] || {};
    let daySum = 0;
    let topDom = 'None';
    let topDomSecs = 0;

    for (const [domain, seconds] of Object.entries(dayStats)) {
      daySum += seconds;
      grandTotal += seconds;
      
      const cat = getCategory(domain, customCategories);
      categoryTotals[cat] = (categoryTotals[cat] || 0) + seconds;

      if (seconds > topDomSecs) {
        topDomSecs = seconds;
        topDom = domain;
      }
    }
    dayTotals[dayStr] = daySum;
    dayTopDomains[dayStr] = { domain: topDom, seconds: topDomSecs };
  });

  const svg = document.getElementById('weekly-bar-chart');
  svg.innerHTML = '';

  const width = 700;
  const height = 280;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  let maxDaySum = Math.max(...Object.values(dayTotals));
  if (maxDaySum === 0) maxDaySum = 3600;

  const gridCount = 4;
  for (let i = 0; i <= gridCount; i++) {
    const yVal = maxDaySum * (i / gridCount);
    const yPos = height - paddingBottom - (yVal / maxDaySum) * chartHeight;
    
    const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    gridLine.setAttribute('x1', paddingLeft);
    gridLine.setAttribute('y1', yPos);
    gridLine.setAttribute('x2', width - paddingRight);
    gridLine.setAttribute('y2', yPos);
    gridLine.setAttribute('class', 'chart-grid-line');
    svg.appendChild(gridLine);

    const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yLabel.setAttribute('x', paddingLeft - 10);
    yLabel.setAttribute('y', yPos + 4);
    yLabel.setAttribute('fill', 'var(--text-secondary)');
    yLabel.setAttribute('font-size', '10px');
    yLabel.setAttribute('text-anchor', 'end');
    yLabel.setAttribute('font-family', 'Outfit');
    yLabel.textContent = formatTimeShort(yVal);
    svg.appendChild(yLabel);
  }

  const barGap = 20;
  const totalGapsWidth = barGap * (days.length - 1);
  const barWidth = (chartWidth - totalGapsWidth) / days.length;

  days.forEach((dayStr, index) => {
    const daySum = dayTotals[dayStr];
    const barHeight = (daySum / maxDaySum) * chartHeight;
    const xPos = paddingLeft + index * (barWidth + barGap);
    const yPos = height - paddingBottom - barHeight;

    if (daySum > 0) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', xPos);
      rect.setAttribute('y', yPos);
      rect.setAttribute('width', barWidth);
      rect.setAttribute('height', barHeight);
      rect.setAttribute('rx', 4);
      rect.setAttribute('class', 'chart-bar');
      rect.setAttribute('title', `${dayStr}: ${formatTime(daySum)}`);
      
      if (dayStr === selectedDate) {
        rect.setAttribute('style', 'fill: var(--accent-secondary); filter: drop-shadow(0 0 6px var(--accent-secondary)); opacity: 1;');
      }
      
      svg.appendChild(rect);

      const valText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valText.setAttribute('x', xPos + barWidth / 2);
      valText.setAttribute('y', yPos - 8);
      valText.setAttribute('class', 'chart-value-label');
      valText.textContent = formatTimeShort(daySum);
      svg.appendChild(valText);
    }

    const dateObj = new Date(dayStr);
    const dayLabelText = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
    const dayNumLabelText = dateObj.getDate();

    const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xLabel.setAttribute('x', xPos + barWidth / 2);
    xLabel.setAttribute('y', height - paddingBottom + 18);
    xLabel.setAttribute('class', 'chart-bar-label');
    xLabel.textContent = `${dayLabelText} ${dayNumLabelText}`;
    
    if (dayStr === selectedDate) {
      xLabel.setAttribute('style', 'fill: var(--accent-color); font-weight: 600;');
    }
    svg.appendChild(xLabel);
  });

  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', paddingLeft);
  xAxis.setAttribute('y1', height - paddingBottom);
  xAxis.setAttribute('x2', width - paddingRight);
  xAxis.setAttribute('y2', height - paddingBottom);
  xAxis.setAttribute('class', 'chart-axis-line');
  svg.appendChild(xAxis);

  const tbody = document.getElementById('weekly-days-tbody');
  tbody.innerHTML = '';

  days.slice().reverse().forEach(dayStr => {
    const sum = dayTotals[dayStr];
    const topDomInfo = dayTopDomains[dayStr];
    const dateObj = new Date(dayStr);
    const dateFormatted = dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

    let topCat = 'None';
    let maxCatSecs = 0;
    const dayStats = statsData[dayStr] || {};
    const catSecs = {};
    for (const [dom, secs] of Object.entries(dayStats)) {
      const c = getCategory(dom, customCategories);
      catSecs[c] = (catSecs[c] || 0) + secs;
      if (catSecs[c] > maxCatSecs) {
        maxCatSecs = catSecs[c];
        topCat = c;
      }
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 500; ${dayStr === selectedDate ? 'color: var(--accent-color);' : ''}">${dateFormatted}</td>
      <td style="font-weight: 600;">${formatTime(sum)}</td>
      <td>${topDomInfo.domain !== 'None' ? `<span style="font-weight: 500;">${topDomInfo.domain}</span> <span style="color: var(--text-secondary); font-size: 11px;">(${formatTimeShort(topDomInfo.seconds)})</span>` : 'None'}</td>
      <td>${topCat !== 'None' ? `<span class="category-badge ${topCat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}">${topCat}</span>` : 'None'}</td>
    `;
    tbody.appendChild(tr);
  });

  const catMixContainer = document.getElementById('weekly-category-mix');
  catMixContainer.innerHTML = '';

  const sortedWeeklyCats = Object.entries(categoryTotals)
    .filter(([_, time]) => time > 0)
    .sort((a, b) => b[1] - a[1]);

  if (sortedWeeklyCats.length === 0) {
    catMixContainer.innerHTML = `<div style="font-size: 13px; color: var(--text-secondary); text-align: center; padding: 20px 0;">No browsing activity recorded.</div>`;
  } else {
    sortedWeeklyCats.forEach(([cat, time]) => {
      const pct = Math.round((time / grandTotal) * 100);
      const barColor = CATEGORY_COLORS[cat];
      const mixHtml = `
        <div class="cat-bar-container">
          <div class="cat-info">
            <span class="cat-name">${cat}</span>
            <span class="cat-time">${formatTime(time)} (${pct}%)</span>
          </div>
          <div class="bar-bg">
            <div class="bar-fill" style="width: ${pct}%; background-color: ${barColor};"></div>
          </div>
        </div>
      `;
      catMixContainer.insertAdjacentHTML('beforeend', mixHtml);
    });
  }
}

function renderMonthlyTab() {
  const grid = document.getElementById('monthly-heatmap-grid');
  grid.innerHTML = '';

  const firstDay = new Date(selectedYear, selectedMonth, 1);
  const startDayOfWeek = firstDay.getDay();
  const numDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  for (let i = 0; i < startDayOfWeek; i++) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'heatmap-day empty-day';
    grid.appendChild(emptyDiv);
  }

  let monthTotal = 0;
  const monthDayTotals = {};
  const monthlyDomains = {};

  for (let day = 1; day <= numDays; day++) {
    const dateObj = new Date(selectedYear, selectedMonth, day);
    const dateStr = dateObj.toISOString().split('T')[0];
    
    const dayStats = statsData[dateStr] || {};
    let daySum = 0;
    for (const [domain, seconds] of Object.entries(dayStats)) {
      daySum += seconds;
      monthTotal += seconds;
      monthlyDomains[domain] = (monthlyDomains[domain] || 0) + seconds;
    }
    monthDayTotals[day] = daySum;

    const dayDiv = document.createElement('div');
    dayDiv.className = 'heatmap-day';
    
    let lvl = 0;
    if (daySum > 0) {
      if (daySum < 1800) lvl = 1;
      else if (daySum < 7200) lvl = 2;
      else if (daySum < 18000) lvl = 3;
      else lvl = 4;
    }
    dayDiv.classList.add(`lvl-${lvl}`);
    dayDiv.setAttribute('title', `${dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}: ${formatTime(daySum)}`);

    dayDiv.innerHTML = `
      <span class="day-num">${day}</span>
      <span class="day-val">${formatTimeShort(daySum)}</span>
    `;

    dayDiv.addEventListener('click', () => {
      selectedDate = dateStr;
      dateSelector.value = selectedDate;
      document.querySelector('.nav-item[data-tab="daily"]').click();
    });

    grid.appendChild(dayDiv);
  }

  const activeDaysCount = Object.values(monthDayTotals).filter(v => v > 0).length;
  const avgScreentime = activeDaysCount > 0 ? Math.round(monthTotal / activeDaysCount) : 0;
  
  const statsSummary = document.getElementById('monthly-stats-summary');
  statsSummary.innerHTML = `
    <div class="monthly-stat-row">
      <span class="stat-label">Month Total Screentime</span>
      <span class="stat-value" style="color: var(--accent-color); font-size: 16px;">${formatTime(monthTotal)}</span>
    </div>
    <div class="monthly-stat-row">
      <span class="stat-label">Days with browsing activity</span>
      <span class="stat-value">${activeDaysCount} days</span>
    </div>
    <div class="monthly-stat-row">
      <span class="stat-label">Daily Average (active days)</span>
      <span class="stat-value">${formatTime(avgScreentime)}</span>
    </div>
  `;

  const topDomList = document.getElementById('monthly-top-domains');
  topDomList.innerHTML = '';

  const sortedMonthlyDomains = Object.entries(monthlyDomains)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (sortedMonthlyDomains.length === 0) {
    topDomList.innerHTML = `<li style="text-align: center; color: var(--text-secondary); font-size: 13px; padding: 20px 0;">No data tracked for this month.</li>`;
  } else {
    sortedMonthlyDomains.forEach(([domain, seconds]) => {
      const li = document.createElement('li');
      li.className = 'monthly-domain-item';
      li.innerHTML = `
        <span class="monthly-domain-name">${domain}</span>
        <span class="monthly-domain-time">${formatTime(seconds)}</span>
      `;
      topDomList.appendChild(li);
    });
  }
}

function renderCategoriesTab() {
  const searchVal = categoriesSearch.value.toLowerCase().trim();
  const uniqueDomains = new Set();
  for (const dateStats of Object.values(statsData)) {
    for (const domain of Object.keys(dateStats)) {
      uniqueDomains.add(domain);
    }
  }
  for (const domain of Object.keys(customCategories)) {
    uniqueDomains.add(domain);
  }

  const tbody = document.getElementById('categories-tbody');
  tbody.innerHTML = '';

  const domainsList = Array.from(uniqueDomains).sort();
  const filteredDomains = domainsList.filter(domain => !searchVal || domain.toLowerCase().includes(searchVal));

  if (filteredDomains.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-secondary); padding: 40px 0;">No domains found.</td></tr>`;
    return;
  }

  const options = ['Productivity', 'Social Media', 'Entertainment', 'News & Info', 'Shopping', 'Other'];

  filteredDomains.forEach(domain => {
    const currentCat = getCategory(domain, customCategories);
    const tr = document.createElement('tr');
    
    const select = document.createElement('select');
    select.className = 'cat-select';
    
    options.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt;
      o.text = opt;
      if (opt === currentCat) o.selected = true;
      select.appendChild(o);
    });

    select.addEventListener('change', async (e) => {
      const newCat = e.target.value;
      customCategories[domain] = newCat;
      await chrome.storage.local.set({ customCategories });
      loadDataAndRender();
    });

    const tdDomain = document.createElement('td');
    tdDomain.innerHTML = `<span style="font-weight: 500;">${domain}</span>`;
    
    const tdCurrent = document.createElement('td');
    tdCurrent.innerHTML = `<span class="category-badge ${currentCat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}">${currentCat}</span>`;
    
    const tdChange = document.createElement('td');
    tdChange.appendChild(select);
    
    tr.appendChild(tdDomain);
    tr.appendChild(tdCurrent);
    tr.appendChild(tdChange);
    
    tbody.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', loadDataAndRender);
