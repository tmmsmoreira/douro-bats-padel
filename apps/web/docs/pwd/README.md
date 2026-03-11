# Progressive Web App (PWA) Documentation

Welcome to the PWA documentation for **Douro Bats Padel**. This directory contains comprehensive documentation about the Progressive Web App implementation, including setup, features, and usage guides.

## 📚 Documentation Structure

### 🚀 [Quick Start Guide](./QUICK_START.md)

**Start here if you want to test the PWA features immediately.**

- Quick testing instructions for development and production
- Feature overview
- Common customizations
- Debugging tips
- Troubleshooting checklist

**Best for:** Developers who want to quickly test and verify PWA functionality.

---

### 📋 [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)

**High-level overview of what was implemented.**

- Complete feature list
- Files created and modified
- Testing instructions
- Customization options
- Internationalization details

**Best for:** Understanding what's been implemented and how to customize it.

---

### 🔧 [PWA Setup Guide](./PWA_SETUP.md)

**Complete PWA configuration and setup details.**

- PWA plugin configuration
- Web app manifest
- Meta tags and metadata
- Icon generation
- Installation testing
- Deployment considerations

**Best for:** Understanding the core PWA setup and configuration.

---

### 💻 [Technical Details](./LOADING_AND_OFFLINE.md)

**In-depth technical documentation.**

- Component architecture
- Service worker caching strategies
- API reference
- Configuration options
- Advanced customization

**Best for:** Developers who need detailed technical information.

---

## 🎯 Key Features

### ✨ Loading Screen

- Branded splash screen with smooth animations
- Configurable minimum display duration (800ms)
- Prevents jarring flashes on fast connections

### 🌐 Offline Detection

- Real-time network status monitoring
- Visual indicators when offline/online
- Auto-dismissing notifications
- Fully internationalized (EN/PT)

### 💾 Service Worker Caching

- Smart caching strategies for different resource types
- Offline-first approach for static assets
- Network-first for API calls with cache fallback
- 10-second timeout before falling back to cache

### 📱 PWA Features

- Installable on all platforms (iOS, Android, Desktop)
- Works offline after first visit
- Beautiful offline fallback page
- Auto-reconnect when network restored

### 🔄 Pull-to-Refresh

- Native mobile gesture - swipe down to refresh
- Visual feedback with animated indicator
- Smart threshold detection
- Smooth animations with progress bar
- Works on all pages automatically

---

## 🎨 Visual Flow Diagrams

### Application Loading & Offline Flow

```mermaid
graph TD
    Start([User Opens App]) --> Loading[AppLoadingScreen Shows]
    Loading --> Hydrate[App Hydrates]
    Hydrate --> MinDuration{Min Duration<br/>Passed?}
    MinDuration -->|No| Wait[Wait...]
    Wait --> MinDuration
    MinDuration -->|Yes| FadeOut[Fade Out Loading Screen]
    FadeOut --> AppReady[App Ready]

    AppReady --> Online{Network<br/>Status?}
    Online -->|Online| NormalOp[Normal Operation]
    Online -->|Offline| ShowBanner[Show Offline Banner]

    NormalOp --> NetworkChange{Network<br/>Change?}
    NetworkChange -->|Goes Offline| ShowBanner
    NetworkChange -->|Stays Online| NormalOp

    ShowBanner --> OfflineMode[Offline Mode]
    OfflineMode --> TryCache{Resource<br/>in Cache?}
    TryCache -->|Yes| ServeCache[Serve from Cache]
    TryCache -->|No| OfflinePage[Show Offline Page]

    OfflineMode --> Reconnect{Network<br/>Restored?}
    Reconnect -->|Yes| BackOnline[Show 'Back Online' Banner]
    Reconnect -->|No| OfflineMode

    BackOnline --> AutoDismiss[Auto-dismiss after 3s]
    AutoDismiss --> NormalOp

    ServeCache --> Display[Display Content]
    OfflinePage --> RetryBtn[Retry Button]
    RetryBtn --> Reconnect

    style Start fill:#e1f5ff
    style AppReady fill:#c8e6c9
    style NormalOp fill:#c8e6c9
    style ShowBanner fill:#ffccbc
    style BackOnline fill:#c8e6c9
    style OfflinePage fill:#ffccbc
    style Loading fill:#fff9c4
```

### Service Worker Caching Strategy

```mermaid
graph LR
    Request[Resource Request] --> Type{Resource<br/>Type?}

    Type -->|Fonts| CacheFirst[Cache First]
    Type -->|Images| SWR1[Stale While Revalidate]
    Type -->|JS/CSS| SWR2[Stale While Revalidate]
    Type -->|API| NetworkFirst1[Network First]
    Type -->|Other| NetworkFirst2[Network First]

    CacheFirst --> InCache1{In Cache?}
    InCache1 -->|Yes| Return1[Return Cached]
    InCache1 -->|No| Fetch1[Fetch & Cache]

    SWR1 --> InCache2{In Cache?}
    InCache2 -->|Yes| Return2[Return Cached<br/>+ Update in Background]
    InCache2 -->|No| Fetch2[Fetch & Cache]

    SWR2 --> InCache3{In Cache?}
    InCache3 -->|Yes| Return3[Return Cached<br/>+ Update in Background]
    InCache3 -->|No| Fetch3[Fetch & Cache]

    NetworkFirst1 --> TryNetwork1{Network<br/>Available?}
    TryNetwork1 -->|Yes| Fetch4[Fetch & Cache]
    TryNetwork1 -->|No/Timeout| InCache4{In Cache?}
    InCache4 -->|Yes| Return4[Return Cached]
    InCache4 -->|No| Offline1[Offline Page]

    NetworkFirst2 --> TryNetwork2{Network<br/>Available?}
    TryNetwork2 -->|Yes| Fetch5[Fetch & Cache]
    TryNetwork2 -->|No/Timeout| InCache5{In Cache?}
    InCache5 -->|Yes| Return5[Return Cached]
    InCache5 -->|No| Offline2[Offline Page]

    style Request fill:#e1f5ff
    style CacheFirst fill:#c8e6c9
    style SWR1 fill:#fff9c4
    style SWR2 fill:#fff9c4
    style NetworkFirst1 fill:#ffccbc
    style NetworkFirst2 fill:#ffccbc
    style Offline1 fill:#ef9a9a
    style Offline2 fill:#ef9a9a
```

---

## 🚦 Quick Start

### Development Mode

```bash
pnpm dev
```

- ✅ Loading screen works
- ✅ Offline indicator works
- ❌ Service worker disabled

### Production Mode

```bash
pnpm build && pnpm start
```

- ✅ All features enabled
- ✅ Service worker active
- ✅ Full offline support

---

## 📂 File Structure

```
apps/web/
├── docs/pwd/
│   ├── README.md                    # This file
│   ├── QUICK_START.md              # Quick testing guide
│   ├── IMPLEMENTATION_SUMMARY.md   # What was implemented
│   ├── PWA_SETUP.md                # Core PWA setup
│   └── LOADING_AND_OFFLINE.md      # Technical details
├── src/
│   ├── components/shared/
│   │   ├── app-loading-screen.tsx  # Loading screen component
│   │   └── offline-indicator.tsx   # Offline banner component
│   ├── hooks/
│   │   └── use-online-status.ts    # Network status hook
│   └── app/[lang]/
│       └── layout.tsx               # Main layout with PWA components
├── public/
│   ├── manifest.json                # PWA manifest
│   ├── offline.html                 # Offline fallback page
│   └── icons/                       # PWA icons
└── next.config.js                   # PWA configuration
```

---

## 🔗 Quick Links

- **Test Offline:** DevTools → Network → Offline
- **View Service Worker:** DevTools → Application → Service Workers
- **View Cache:** DevTools → Application → Cache Storage
- **Test Installation:** Look for install icon in browser address bar

---

## 📞 Need Help?

- Check the [Troubleshooting section](./IMPLEMENTATION_SUMMARY.md#-troubleshooting) in the Implementation Summary
- Review the [Quick Start Guide](./QUICK_START.md) for common issues
- See [Technical Details](./LOADING_AND_OFFLINE.md) for advanced configuration

---

**Last Updated:** March 2026
