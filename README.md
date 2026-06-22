# BusBuddy 🚌

A child-friendly Singapore bus navigation PWA for primary school children aged 7–12.

Designed to answer the questions children actually ask:
- **Is my bus arriving soon?**
- **Is this the correct bus?**
- **How many stops until I get off?**
- **I need help — how do I call Mum?**

---

## Files

| File | Purpose |
|---|---|
| `index.html` | Complete app (all CSS, HTML, JS) |
| `sw.js` | Service worker — enables offline shell |
| `manifest.json` | PWA manifest — enables "Add to Home Screen" |
| `README.md` | This file |

---

## Quick Start (Demo Mode)

Deploy all 4 files to GitHub Pages and open the URL. The app runs immediately in **demo mode** with sample bus data — no API keys needed to explore the interface.

For live Singapore bus data and AI features, complete the setup steps below.

---

## Setup Guide

### Step 1 — Deploy to GitHub Pages

1. Create a new GitHub repository (public)
2. Upload all 4 files to the repository root
3. Go to **Settings → Pages → Source → main branch → / (root)**
4. Your app is live at `https://yourusername.github.io/your-repo-name/`

### Step 2 — LTA Bus Arrival Data (optional, recommended)

BusBuddy uses Singapore's LTA DataMall API for real-time bus arrivals. Because DataMall doesn't support CORS for browser requests, you need a small proxy.

#### 2a. Get an LTA API key (free)

1. Register at [datamall.lta.gov.sg](https://datamall.lta.gov.sg)
2. Request an API key (approved within 1–2 working days)

#### 2b. Deploy a Cloudflare Worker proxy (free tier)

1. Sign up at [workers.cloudflare.com](https://workers.cloudflare.com) (free)
2. Create a new Worker and paste this code:

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        }
      });
    }

    if (url.pathname === '/bus-arrival') {
      const code = url.searchParams.get('BusStopCode') || '';
      const svc  = url.searchParams.get('ServiceNo')   || '';
      const ltaUrl = `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${code}&ServiceNo=${svc}`;

      const res = await fetch(ltaUrl, {
        headers: { 'AccountKey': env.LTA_KEY }
      });
      const data = await res.json();

      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    return new Response('Not found', { status: 404 });
  }
}
```

3. Add an environment variable `LTA_KEY` with your LTA API key
4. Deploy and copy your Worker URL (e.g. `https://busbuddy-proxy.yourname.workers.dev`)

#### 2c. Enter the proxy URL in BusBuddy

1. Open the app → tap **⚙️ Settings** → enter Parent PIN
2. Go to **API Setup** tab
3. Paste your Worker URL into **LTA Proxy URL**
4. Tap **Save API Settings**

### Step 3 — AI Helper (optional)

The AI Helper and camera bus scanning both use the Anthropic Claude API.

1. Get an API key at [console.anthropic.com](https://console.anthropic.com)
2. In BusBuddy → **⚙️ Settings → API Setup**, enter your key under **Anthropic API Key**
3. The AI Helper now answers natural-language questions; the 📸 Scan button uses vision to read bus numbers from photos

> **Note:** The API key is stored in your browser's localStorage — on a private family device this is fine. Don't share the device with untrusted users.

---

## How Children Use the App

### First launch (parent sets up)
1. Enter child's name and choose a picture
2. Create a 4-digit parent PIN
3. Add emergency contacts (Mum, Dad)
4. The child is ready to use the app

### Adding destinations (parent, via PIN)
1. Tap ⚙️ → enter PIN → **Destinations** tab → **+ Add Destination**
2. Choose a label (Home, School, Grandma's House, Tuition, or custom)
3. Enter the 5-digit bus stop code (found on the bus stop pole or [mytransport.sg](https://www.mytransport.sg))
4. Enter bus service numbers and number of stops to destination
5. Tap **Save**

### Child's daily flow
1. Open BusBuddy
2. Tap destination card (e.g. 🏠 Home)
3. See next bus arrivals on the LED board
4. Tap an arrival card to confirm boarding → Journey mode starts
5. Tap **📍 Just passed a stop** each time the bus stops
6. App alerts at 2 stops, 1 stop, and arrival

---

## Features

| Feature | Status |
|---|---|
| Destination cards with live bus arrivals | ✅ |
| LED-style arrival board (recognisable from SG bus stops) | ✅ |
| Journey mode with stop countdown | ✅ |
| 📸 Camera bus number scanner (requires Anthropic key) | ✅ |
| AI Helper — scripted decision tree | ✅ |
| AI Helper — free-form with Claude (requires Anthropic key) | ✅ |
| Emergency screen with Call Mum/Dad | ✅ |
| Location sharing from emergency screen | ✅ |
| Parent PIN-protected settings | ✅ |
| Offline shell (service worker) | ✅ |
| Installable PWA | ✅ |
| Demo mode (no API keys needed) | ✅ |

---

## ⚠️ Deploy Checklist

Run this every time you update `index.html`:

- [ ] Bump the cache name in `sw.js` — change `bb-v1` to `bb-v2` (then `bb-v3`, etc.)
- [ ] Upload **both** `index.html` and `sw.js` together — never one without the other
- [ ] Test in a private/incognito tab to confirm the new version loads
- [ ] Verify the correct app version on a second device

> **Why:** The service worker caches `index.html`. If you deploy a new `index.html` without changing the `sw.js` cache name, browsers will serve the old cached version indefinitely.

---

## Troubleshooting

**Bus arrivals not loading**
- Check that your Cloudflare Worker URL is correct in Settings → API Setup
- Try opening the Worker URL directly in a browser to test it
- If no proxy configured, the app shows demo/mock arrivals — this is expected

**App not updating after deploy**
- You forgot to bump the SW cache name — see Deploy Checklist above
- Force-refresh: on iOS, delete from Home Screen and re-add; on Android, clear site data in Chrome settings

**AI Helper not working**
- Check your Anthropic API key is entered correctly in Settings → API Setup
- The scripted (button-based) decision tree works without any API key

**Camera scan not working**
- The camera icon only appears on the arrival screen
- Requires an Anthropic API key to read bus numbers automatically
- Without a key, it shows a manual text prompt instead

**PIN forgotten**
- Open browser DevTools → Application → Local Storage → delete all `bb_` keys
- This resets the app completely; you will need to re-configure it

---

## Bus Stop Codes

Find the 5-digit bus stop code:
- On the bus stop pole (on the sign above the timetable)
- At [mytransport.sg](https://www.mytransport.sg/content/mytransport/home/busservice.html)
- On the Singapore Bus App

---

## Built With

- Vanilla HTML / CSS / JavaScript — no frameworks, no build step
- LTA DataMall v3 API (bus arrivals)
- Anthropic Claude API (AI chat + vision)
- Cloudflare Workers (CORS proxy)
- IndexedDB (arrival data cache)
- Web Geolocation API (journey GPS)
- Web Share API (emergency location sharing)
- PWA: Service Worker + Web App Manifest

---

*BusBuddy — built for confident little travellers 🚌*