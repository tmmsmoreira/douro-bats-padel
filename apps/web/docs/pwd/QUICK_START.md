# Quick Start - Loading Screen & Offline Features

## 🚀 Quick Test Guide

### 1. Test in Development Mode

```bash
# Start the development server
pnpm dev
```

**What you'll see:**

- ✅ Loading screen on first load
- ✅ Offline indicator when you go offline
- ❌ Service worker is disabled in dev mode

**To test offline detection:**

1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Change throttling to "Offline"
4. See the red offline banner appear
5. Change back to "Online"
6. See the green "Back online" banner

### 2. Test in Production Mode

```bash
# Build the app
pnpm build

# Start production server
pnpm start
```

**What you'll see:**

- ✅ Loading screen on first load
- ✅ Offline indicator when you go offline
- ✅ Service worker caching
- ✅ Offline page when no cache available

**To test full offline functionality:**

1. Visit the app and navigate around
2. Open DevTools → Application → Service Workers
3. Verify service worker is registered
4. Go offline (Network tab → Offline)
5. Refresh the page - should load from cache
6. Navigate to previously visited pages - should work
7. Try a new page - should show offline fallback

## 📱 Features Overview

### Loading Screen

- **Location:** Appears on every page load
- **Duration:** Minimum 800ms (configurable)
- **Customizable:** Logo, colors, duration

### Offline Indicator

- **Appears:** When network connection is lost
- **Dismisses:** Automatically after 3s when back online
- **Languages:** English & Portuguese

### Service Worker

- **Caches:** Fonts, images, JS, CSS, API responses
- **Strategies:** CacheFirst, StaleWhileRevalidate, NetworkFirst
- **Fallback:** Shows offline.html when no cache available

## 🎨 Quick Customizations

### Change Loading Duration

```tsx
// apps/web/src/app/[lang]/layout.tsx
<AppLoadingScreen minDuration={1200} /> // Change from 800 to 1200ms
```

### Change Offline Banner Auto-Dismiss Time

```tsx
// apps/web/src/hooks/use-online-status.ts (line 30)
setTimeout(() => setWasOffline(false), 5000); // Change from 3000 to 5000ms
```

### Customize Loading Screen Logo

```tsx
// apps/web/src/components/shared/app-loading-screen.tsx (lines 68-76)
// Replace the SVG with your own logo
```

### Adjust Cache Duration

```js
// apps/web/next.config.js
// Find the resource type you want to adjust and change maxAgeSeconds
expiration: {
  maxAgeSeconds: 48 * 60 * 60, // Change from 24 to 48 hours
}
```

## 🔍 Debugging

### Check Service Worker Status

1. Open DevTools → Application
2. Click "Service Workers" in left sidebar
3. Should see status: "activated and is running"

### View Cached Resources

1. Open DevTools → Application
2. Click "Cache Storage" in left sidebar
3. Expand to see cached files

### Clear Service Worker Cache

1. Open DevTools → Application
2. Click "Clear storage" in left sidebar
3. Check "Unregister service workers"
4. Click "Clear site data"

### Check Network Requests

1. Open DevTools → Network
2. Look for "(from ServiceWorker)" in Size column
3. These requests are served from cache

## 📚 Documentation Files

- **IMPLEMENTATION_SUMMARY.md** - What was implemented and how to use it
- **LOADING_AND_OFFLINE.md** - Detailed technical documentation
- **PWA_SETUP.md** - Original PWA setup guide
- **QUICK_START.md** - This file

## ✅ Checklist

Before deploying to production:

- [ ] Test loading screen appears and dismisses correctly
- [ ] Test offline indicator shows when offline
- [ ] Test "Back online" message appears when reconnected
- [ ] Build app and verify service worker is generated
- [ ] Test offline functionality in production mode
- [ ] Verify cached resources in DevTools
- [ ] Test on mobile devices (iOS & Android)
- [ ] Customize loading screen logo (optional)
- [ ] Adjust cache durations if needed (optional)
- [ ] Test PWA installation on mobile

## 🆘 Common Issues

**Loading screen doesn't show:**

- Clear browser cache and hard reload (Cmd+Shift+R / Ctrl+Shift+R)
- Check browser console for errors

**Offline indicator doesn't work:**

- Make sure you're testing in a browser (not SSR)
- Check that OfflineIndicator is in layout.tsx

**Service worker not working:**

- Only works in production mode (`pnpm build && pnpm start`)
- Requires HTTPS in production (localhost is exempt)
- Clear service worker cache and try again

**Offline page not showing:**

- Build the app first
- Visit a page you haven't visited before while offline
- Check that offline.html exists in public folder

## 🎯 Next Steps

1. **Customize** the loading screen with your logo
2. **Test** thoroughly in different network conditions
3. **Deploy** to production and test on real devices
4. **Monitor** service worker performance
5. **Iterate** based on user feedback

## 💡 Tips

- Test on real mobile devices, not just desktop
- Use Chrome DevTools device emulation for quick testing
- Monitor service worker updates in production
- Consider adding more offline-capable features
- Keep cache durations reasonable to avoid stale data

---

For more details, see the full documentation in LOADING_AND_OFFLINE.md
