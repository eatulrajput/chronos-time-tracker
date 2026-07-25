# ⏳ Chronos Time Tracker

> **A privacy-first, 100% local screen-time tracker and website categorizer for Chrome, Brave, and Edge.**

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Privacy First](https://img.shields.io/badge/Privacy-100%25%20Local-green.svg)](#-data-storage--privacy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#-license)
[![Platform](https://img.shields.io/badge/Platform-Chrome%20%7C%20Brave%20%7C%20Edge-orange.svg)](#-installation-guide)

---

## 📌 Overview

**Chronos Time Tracker** is a modern, lightweight browser extension designed to track your daily web usage and categorize screen time effortlessly without compromising your privacy. 

Unlike commercial web analytics extensions, Chronos operates **100% offline and locally on your device**—no remote telemetry, no external database servers, no account registration, and zero data tracking.

---

## ⚡ How It Works

Chronos uses Chrome's Manifest V3 background service worker (`background.js`) to record active browsing time per domain in real time:

```
[ Active Tab / Window ] ──> [ Domain Extraction ] ──> [ Idle State Filter ] ──> [ Local Storage Commit ]
```

1. **Tab & Window Focus Monitoring**: 
   Chronos Listens to browser tab activation and window focus events (`chrome.tabs.onActivated`, `chrome.tabs.onUpdated`, `chrome.windows.onFocusChanged`) to determine which tab and domain are currently visible to the user.
2. **Domain Normalization**:
   Full URLs are stripped down to clean base hostnames (e.g., `https://docs.google.com/document/d/...` -> `docs.google.com`).
3. **Smart Idle Detection**:
   Using Chrome's idle API (`chrome.idle`) with a 60-second threshold, tracking automatically pauses when you step away from your machine, lock your screen, or leave the browser inactive.
4. **Periodic Local Commit**:
   Active duration counters are accumulated and committed every 10 seconds (and on tab/window switches) to local storage.

---

## 🔥 Features

- ⏱️ **Real-Time Active Tracking**: Accurate domain-level tracking without background CPU drain.
- 💤 **Smart Idle Detection**: Auto-pauses screen time recording during user inactivity or system lock.
- 📊 **Full Analytics Dashboard**:
  - **Daily Activity**: Detailed breakdown of total screen time, top category, top website, and a complete site list.
  - **Weekly Overview**: Bar chart visualization comparing daily browsing trends across the current week.
  - **Monthly Heatmap**: GitHub-style activity density matrix showing usage patterns across days.
  - **Custom Category Manager**: Override default categories or assign custom category mappings to any domain.
- ⚡ **Quick Access Popup**: Instant toolbar preview showing today's screen time, top sites, and category breakdown bars.
- 🎨 **Modern Sleek UI**: Crafted with modern typography (*Outfit* font), subtle animations, and modern dark-theme glassmorphism aesthetics.
- 🛠️ **Full Data Ownership**: Clear or reset your data at any time with a single click.

---

## 🔒 Data Storage & Privacy

Chronos was built from the ground up with a strict **Privacy-First Architecture**.

### Where Data is Stored
All accumulated stats, site histories, and category configurations are stored **exclusively** inside your browser's internal local storage engine (`chrome.storage.local`). 

### Storage Data Schema
The extension maintains two simple JSON structures inside `chrome.storage.local`:

```json
{
  "stats": {
    "2026-07-25": {
      "github.com": 4820,
      "youtube.com": 1250,
      "stackoverflow.com": 940
    },
    "2026-07-24": {
      "github.com": 6200,
      "docs.google.com": 3100
    }
  },
  "customCategories": {
    "my-internal-tool.com": "Productivity",
    "reddit.com": "Entertainment"
  }
}
```

### Privacy Guarantee
- ❌ **Zero Remote Servers**: No network calls, telemetry, or external API endpoints.
- ❌ **No Ad Networks / Tracking**: Your web browsing habits are completely private to you.
- ❌ **No Account Needed**: Instant usage without registration or cloud sign-in.
- ✅ **100% User Control**: Wipe all data at any time directly from the Dashboard settings.

---

## 📂 Project Structure

```
.
├── manifest.json       # Chrome Extension Manifest V3 metadata
├── background.js       # Background service worker (tracking & idle state engine)
├── categories.js       # Default category definitions & mapping helper
├── popup.html          # Toolbar popup UI markup
├── popup.css           # Styling for toolbar popup UI
├── popup.js            # Controller script for toolbar popup
├── dashboard.html      # Full-page analytics dashboard markup
├── dashboard.css       # Styling for analytics dashboard
├── dashboard.js        # Analytics engine (Daily, Weekly, Monthly heatmaps, Categories)
├── make_icons.py       # Python script to generate extension PNG icon assets
└── icons/              # Extension icons (16x16, 48x48, 128x128)
```

---

## 🛠️ Installation Guide

Follow these simple steps to load **Chronos Time Tracker** into any Chromium-based browser (Chrome, Brave, Edge, Opera, Vivaldi):

1. **Clone or Download the Repository**:
   ```bash
   git clone https://github.com/your-username/chronos-time-tracker.git
   cd chronos-time-tracker
   ```
2. **Open Extensions Page in Browser**:
   - **Google Chrome**: Navigate to `chrome://extensions`
   - **Brave Browser**: Navigate to `brave://extensions`
   - **Microsoft Edge**: Navigate to `edge://extensions`
3. **Enable Developer Mode**:
   - Toggle the **Developer mode** switch in the top right corner.
4. **Load Unpacked Extension**:
   - Click the **Load unpacked** button.
   - Select the `chronos-time-tracker` repository folder.
5. **Pin to Toolbar**:
   - Click the puzzle piece extension icon in your browser toolbar and pin **Chronos**.

---

## 🎨 Icon Generator (Optional)

If you modify the extension icon design or need to regenerate the PNG icons, run the included Python utility script:

```bash
python3 make_icons.py
```
*(Requires `Pillow` library: `pip install Pillow`)*

---

## 🤝 Contributing

Contributions are welcome and appreciated! Whether reporting bugs, suggesting features, or expanding the default domain categories:

1. **Fork the Repository**
2. **Create a Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit Your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Guidelines
- Maintain pure JavaScript without external heavy dependencies.
- Ensure all storage operations strictly adhere to `chrome.storage.local`.
- Verify full compatibility with Manifest V3.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.
