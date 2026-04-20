# Loading Screen & Offline Handling

This document describes the loading screen and offline handling features implemented in the Douro Bats Padel PWA.

## ✨ Features Implemented

### 1. **Initial Loading Screen**

A branded splash screen that displays while the app is hydrating and loading.

**Location:** `src/components/shared/app-loading-screen.tsx`

**Features:**

- Smooth fade-in/fade-out animations
- Branded logo and app name
- Animated loading indicators
- Configurable minimum display duration
- Prevents jarring flash on fast connections

**Usage:**

```tsx
import { AppLoadingScreen } from '@/components/shared/state/app-loading-screen';

// In your layout
<AppLoadingScreen minDuration={800} />;
```

**Props:**

- `minDuration` (optional): Minimum time to show loading screen in ms (default: 1000)
- `show` (optional): Whether to show the loading screen (default: true)

### 2. **Offline Detection Hook**

A custom React hook that detects online/offline status and provides real-time updates.

**Location:** `src/hooks/use-online-status.ts`

**Features:**

- Listens to browser online/offline events
- Tracks when user comes back online
- Provides `isOnline` and `wasOffline` states

**Usage:**

```tsx
import { useOnlineStatus } from '@/hooks/use-online-status';

function MyComponent() {
  const { isOnline, wasOffline } = useOnlineStatus();

  if (!isOnline) {
    return <div>You are offline</div>;
  }

  return <div>Content</div>;
}
```

### 3. **Offline Indicator Component**

A visual indicator that appears when the user loses internet connection.

**Location:** `src/components/shared/offline-indicator.tsx`

**Features:**

- Slides down from top when offline
- Shows "Back online" message when connection restored
- Auto-dismisses after 3 seconds when back online
- Fully internationalized (supports EN/PT)
- Smooth animations

**Usage:**

```tsx
import { OfflineIndicator } from '@/components/shared/pwa/offline-indicator';

// In your layout
<OfflineIndicator />;
```

### 4. **Enhanced Service Worker Caching**

Improved PWA caching strategies for better offline experience.

**Location:** `next.config.js`

**Caching Strategies:**

| Resource Type                | Strategy             | Cache Duration |
| ---------------------------- | -------------------- | -------------- |
| Google Fonts (webfonts)      | CacheFirst           | 365 days       |
| Google Fonts (stylesheets)   | StaleWhileRevalidate | 7 days         |
| Static fonts                 | StaleWhileRevalidate | 7 days         |
| Images (jpg, png, svg, etc.) | StaleWhileRevalidate | 24 hours       |
| Next.js images               | StaleWhileRevalidate | 24 hours       |
| JavaScript files             | StaleWhileRevalidate | 24 hours       |
| CSS files                    | StaleWhileRevalidate | 24 hours       |
| Next.js data                 | StaleWhileRevalidate | 24 hours       |
| API calls (GET)              | NetworkFirst         | 24 hours       |
| Other resources              | NetworkFirst         | 24 hours       |

**Fallback Behavior:**

- When offline and no cache available → Shows `/offline.html`
- API calls timeout after 10 seconds → Falls back to cache
- Network-first strategy ensures fresh data when online

### 5. **Offline Fallback Page**

A static HTML page shown when the user is offline and the requested page isn't cached.

**Location:** `public/offline.html`

**Features:**

- Beautiful, branded design
- Auto-retry when connection restored
- Lists features available when back online
- Manual retry button
- No dependencies (pure HTML/CSS/JS)

## 🎯 How It Works Together

### On App Load:

1. **Loading Screen** appears immediately
2. App hydrates and loads data
3. Loading screen fades out after minimum duration
4. User sees the app content

### When Going Offline:

1. **Offline Indicator** slides down from top
2. Shows "No internet connection" message
3. Service worker serves cached content when available
4. If no cache → Shows offline fallback page

### When Coming Back Online:

1. **Offline Indicator** changes to "Back online"
2. Auto-dismisses after 3 seconds
3. Service worker fetches fresh data
4. App updates with latest content

## 🌍 Internationalization

All user-facing messages are internationalized:

**English (`en.json`):**

```json
{
  "offline": {
    "message": "No internet connection",
    "backOnline": "Back online",
    "checkConnection": "Please check your network connection and try again"
  }
}
```

**Portuguese (`pt.json`):**

```json
{
  "offline": {
    "message": "Sem ligação à internet",
    "backOnline": "Ligação restabelecida",
    "checkConnection": "Por favor, verifique a sua ligação de rede e tente novamente"
  }
}
```

## 🧪 Testing

### Test Loading Screen:

1. Clear browser cache
2. Open the app
3. You should see the loading screen for at least 800ms

### Test Offline Indicator:

1. Open the app
2. Open DevTools → Network tab
3. Set throttling to "Offline"
4. See the offline indicator appear
5. Set back to "Online"
6. See "Back online" message

### Test Offline Fallback:

1. Build the app: `pnpm build`
2. Start production server: `pnpm start`
3. Visit a page
4. Go offline (DevTools → Network → Offline)
5. Navigate to a new page
6. Should see offline fallback page

### Test Service Worker Caching:

1. Build and start production server
2. Visit the app while online
3. Go offline
4. Refresh the page
5. App should load from cache
6. Navigate to previously visited pages
7. Should work offline

## 📱 PWA Behavior

### Installation:

- Loading screen shows on first launch after installation
- Offline indicator works in standalone mode
- Service worker caches app shell for offline use

### Updates:

- Service worker updates automatically
- `skipWaiting: true` ensures immediate activation
- Users get new version on next visit

## 🔧 Configuration

### Adjust Loading Screen Duration:

```tsx
// In src/app/[lang]/layout.tsx
<AppLoadingScreen minDuration={1200} /> // 1.2 seconds
```

### Adjust Offline Indicator Dismiss Time:

```tsx
// In src/hooks/use-online-status.ts
setTimeout(() => setWasOffline(false), 5000); // 5 seconds
```

### Adjust Cache Durations:

```js
// In next.config.js
expiration: {
  maxEntries: 64,
  maxAgeSeconds: 48 * 60 * 60, // 48 hours
}
```

## 🎨 Customization

### Loading Screen Logo:

Edit the SVG in `src/components/shared/app-loading-screen.tsx`:

```tsx
<svg className="w-12 h-12 text-primary" ...>
  {/* Your custom logo SVG */}
</svg>
```

### Offline Page Design:

Edit `public/offline.html` to match your brand.

## 📚 Resources

- [PWA Setup Documentation](./PWA_SETUP.md)
- [Next PWA Documentation](https://github.com/shadowwalker/next-pwa)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Workbox Strategies](https://developer.chrome.com/docs/workbox/modules/workbox-strategies/)
