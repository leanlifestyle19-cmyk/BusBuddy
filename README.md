# BusBuddy 🚌

A child-friendly Singapore bus navigation PWA for primary school children aged 7–12.

Designed to answer what children actually ask:
- **Is my bus arriving soon?**
- **Is this the correct bus?**
- **How many stops until I get off?**
- **I need help — how do I call Mum?**

---

## Files

| File | Purpose |
|---|---|
| `index.html` | Complete app — all CSS, HTML, JS in one file |
| `sw.js` | Service worker — offline shell |
| `manifest.json` | PWA manifest — "Add to Home Screen" |
| `README.md` | This file |

---

## Setup — Two Steps

### Step 1 — Deploy to GitHub Pages

1. Create a new GitHub repository (public or private)
2. Upload all 4 files to the root
3. Settings → Pages → Source → main → / (root)
4. Open your URL — the app is live with **real bus data immediately**

No API keys needed. Live Singapore bus arrivals work out of the box.

### Step 2 — Add Anthropic Key (optional)

Without a key, the AI Helper uses a scripted button-based decision tree — perfectly functional for most children.

Add a key to unlock:
- **Free-form AI chat** — child types any destination and gets guidance
- **📸 Camera bus scan** — photograph an approaching bus to confirm the number

1. Get a key at [console.anthropic.com](https://console.anthropic.com)
2. Open BusBuddy → ⚙️ Settings → enter Parent PIN → **API Setup**
3. Paste the key and tap **Save**

> The key is stored in your browser's localStorage on this device only. It is never sent anywhere except to Anthropic's API. Don't share the device with untrusted users.

That's it. No Cloudflare, no DataMall registration, no server to manage.

---

## How It Works

**Bus arrival data** is fetched from [arrivelah2.busrouter.sg](https://arrivelah2.busrouter.sg) — a free community service by [Cheeaun](https://github.com/cheeaun) that wraps the LTA DataMall API with CORS support. It requires no authentication and has been running since 2015. If it's unreachable, the app falls back to animated mock data automatically.

---

## 🔒 Privacy & Data Risks

BusBuddy has no server and no cloud account. Everything is stored locally in your browser's `localStorage` — but that comes with its own risks that you should understand before putting this on a child's device.

### What the app stores (all on-device, plaintext)

| Data | Where | Risk if device is accessed |
|---|---|---|
| Child's name and emoji | localStorage | Low — not sensitive |
| Parent PIN | localStorage, **plaintext** | Medium — 4-digit PIN offers minimal protection |
| Mum/Dad phone numbers | localStorage | Medium — reveals contact info |
| Destination names + bus stop codes | localStorage | Medium — reveals child's routine and home/school locations |
| Anthropic API key (if entered) | localStorage | High — usable by anyone who reads it |
| Arrival data cache | IndexedDB | Low — stale bus timing data, auto-expires |

**Plaintext PIN:** The parent PIN is not hashed. It is stored as `"parentPin": "1234"`. Anyone who opens browser DevTools → Application → Local Storage on this device can read it. The PIN protects children from accidentally changing settings, not from determined adults.

**Anthropic API key:** If entered, it is visible under LocalStorage in DevTools. It can be read by any JavaScript running on the same origin (your GitHub Pages domain). It is sent directly to `api.anthropic.com` in API requests — visible in the Network tab. To limit exposure, set a monthly spending cap at [console.anthropic.com](https://console.anthropic.com) so a leaked key can't run up large bills.

**Camera photos (if AI scan is used):** When your child photographs a bus, that image is sent to Anthropic's API for processing. Anthropic's [privacy policy](https://www.anthropic.com/legal/privacy) applies. The image should only contain the bus itself. Do not use the camera feature to photograph people.

**GPS location:** Only requested when the child opens the Emergency screen or when journey mode is active. Coordinates are shown on screen and can be shared via the device's native share sheet (SMS, WhatsApp, etc.) when the child taps "Share My Location". GPS data is **not stored** after the session.

**Movement pattern:** The combination of your home bus stop, school bus stop, and grandma's bus stop — stored in localStorage — represents your child's daily routine. This data never leaves the device, but physical access to the device exposes it.

### Bottom line

This app is designed for a **dedicated family device or a parent's phone used by one child**. It is not appropriate for a shared device, a school-issued device, or anywhere the child's classmates or strangers might access the browser.

If the device is lost or stolen, clear your Anthropic API key immediately at [console.anthropic.com](https://console.anthropic.com) → API Keys → Revoke.

---

## ⚠️ arrivelah2 / busrouter.sg — Service Reliability

**The honest picture:** `arrivelah2.busrouter.sg` is a community project maintained by a single developer ([Cheeaun](https://github.com/cheeaun)). It is not a government service and carries no uptime guarantee.

**Reasons for confidence:**
- Has been running continuously since 2015 — over 10 years
- Actively maintained: busrouter.sg (which depends on it) was last updated March 2026
- Widely used by other Singapore transit apps and tools
- Open source — the community can fork and self-host it if needed

**Reasons for caution:**
- One maintainer. If Cheeaun stops maintaining it, there is no fallback unless someone forks it
- It depends on LTA's own DataMall API. If LTA changes their API format or authentication, arrivelah2 could break before Cheeaun patches it
- No SLA. It could be down for hours or days with no notice

**What happens if it goes down:**
- The app detects the failure silently and switches to animated mock arrival times
- Journey mode (manual stop counting), the AI Helper, and the Emergency screen all continue to work normally
- Your child can still use the app — they just won't see real arrival times until the service recovers

**Self-hosting fallback (for maximum reliability):**

If arrivelah2 ever goes down permanently, you can run your own LTA proxy. Deploy this Cloudflare Worker (free tier), then add the URL under Settings → API Setup → Custom Proxy:

```javascript
// Cloudflare Worker — paste at workers.cloudflare.com
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/bus-arrival') return new Response('Not found', { status: 404 });
    const code = url.searchParams.get('BusStopCode') || '';
    const res = await fetch(
      `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${code}`,
      { headers: { 'AccountKey': env.LTA_KEY } }
    );
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
```

Set `LTA_KEY` as a Worker environment secret (your free LTA DataMall key from [datamall.lta.gov.sg](https://datamall.lta.gov.sg)). Your API key never reaches the browser — it stays inside Cloudflare.

---

## Parent Setup Guide

### First launch
1. Enter your child's name and choose a picture
2. Create a 4-digit parent PIN (you need this to access Settings later)
3. Add emergency contacts — Mum and Dad phone numbers
4. Done — the app shows example destinations to explore

### Adding real destinations
Open ⚙️ Settings → enter PIN → **Destinations** tab → **+ Add Destination**

| Field | What to enter |
|---|---|
| Label | Home / School / Grandma's House / Tuition / custom |
| Bus Stop Code | 5-digit code from the bus stop pole |
| Bus Stop Name | Friendly name shown to the child |
| Bus numbers | Comma-separated services (e.g. `74, 65`) |
| Stops to destination | How many stops from this stop to the drop-off |

**Finding bus stop codes:** look at the blue sign on the bus stop pole, or visit [mytransport.sg](https://www.mytransport.sg).

---

## Features

| Feature | Requires API key? |
|---|---|
| Live bus arrivals (real Singapore data) | No |
| Destination cards | No |
| LED arrival board | No |
| Journey mode with stop countdown | No |
| AI Helper (button-based, scripted) | No |
| Emergency screen — Call Mum/Dad | No |
| Location sharing from emergency screen | No |
| Offline shell (installable PWA) | No |
| AI Helper — free-form chat | Anthropic key |
| 📸 Camera bus number scanner | Anthropic key |

---

## ⚠️ Deploy Checklist

Every time you update `index.html`:

- [ ] Open `sw.js` and bump the cache name: `bb-v1` → `bb-v2` → `bb-v3` etc.
- [ ] Upload **both** `index.html` and `sw.js` — never one without the other
- [ ] Test in a private/incognito tab to confirm the update loaded

**Why this matters:** The service worker caches `index.html`. If you deploy new HTML without bumping the SW cache name, every browser continues serving the old cached version until the cache is manually cleared.

---

## Troubleshooting

**Bus arrivals not loading**
- Check you have an internet connection
- The arrivelah2 service may be briefly down — the app shows demo data as fallback
- Arrivals automatically refresh every 60 seconds

**App not updating after deploy**
- You forgot to bump the SW cache name — see Deploy Checklist above
- Hard reset on iOS: delete from Home Screen, re-add; on Android: Chrome → site settings → clear storage

**AI Helper not working**
- The scripted (button-based) tree needs no API key and always works
- Free-form and camera features need an Anthropic key in Settings → API Setup

**PIN forgotten**
- Browser DevTools → Application → Local Storage → delete all `bb_` entries
- This resets the app fully; reconfigure from scratch

---

## Tech Stack

Vanilla HTML / CSS / JavaScript — no build step, no frameworks

- **Bus data:** [arrivelah2.busrouter.sg](https://arrivelah2.busrouter.sg) (free community LTA proxy)
- **AI:** Anthropic Claude API (haiku model — fast, low cost)
- **Storage:** localStorage + IndexedDB (arrival cache)
- **PWA:** Service Worker + Web App Manifest
- **GPS:** Web Geolocation API (journey tracking)
- **Share:** Web Share API (emergency location)

---

*BusBuddy — for confident little travellers 🚌*