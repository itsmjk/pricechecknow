# PWA Setup Guide for Amazon Price Checker

## Current Status
Your web app is **partially set up as a PWA** but needs some final steps to be fully functional and installable.

## What's Already Done ✅
- ✅ Manifest.json with proper configuration
- ✅ Service worker (sw.js) created
- ✅ Service worker registration in main.tsx
- ✅ PWA meta tags in index.html
- ✅ Proper form_factor configuration for both mobile and desktop

## What Needs to Be Done 🔧

### 1. Generate PNG Icons
You have two options:

#### Option A: Use the Icon Converter (Recommended)
1. Open `icon-converter.html` in your browser
2. Click "Convert to PNG" for both icon sizes
3. Right-click on each canvas and "Save image as..."
4. Save as `icon-192.png` and `icon-512.png` in your `public` folder

#### Option B: Manual Creation
- Create `icon-192.png` (192x192 pixels)
- Create `icon-512.png` (512x512 pixels)
- Use any image editing software (Photoshop, GIMP, Canva, etc.)

### 2. Take Screenshots
1. **Mobile Screenshot**: 
   - Set your browser to mobile view (390x844)
   - Take a screenshot of your app
   - Save as `screenshot-mobile.png` in `public` folder

2. **Desktop Screenshot**:
   - Set your browser to desktop view (1280x720)
   - Take a screenshot of your app
   - Save as `screenshot-desktop.png` in `public` folder

### 3. Replace Placeholder Files
Delete these placeholder files and replace with actual images:
- `public/icon-192.png` (placeholder)
- `public/icon-512.png` (placeholder)
- `public/screenshot-mobile.png` (placeholder)
- `public/screenshot-desktop.png` (placeholder)

## Testing Your PWA

### 1. Build and Serve
```bash
npm run build
npm run preview
```

### 2. Check PWA Status
1. Open Chrome DevTools
2. Go to Application tab
3. Check Manifest section - should show no errors
4. Check Service Workers section - should show registered worker

### 3. Install Prompt
- Look for the install button in Chrome's address bar
- Or check the Application tab for installability status

## PWA Features You'll Get

✅ **Installable**: Users can install your app on their device
✅ **Offline Support**: Basic caching through service worker
✅ **App-like Experience**: Standalone window, no browser UI
✅ **Home Screen Icon**: Custom icon on device home screen
✅ **Splash Screen**: Loading screen when app launches

## Troubleshooting

### Common Issues:
1. **Icons not loading**: Make sure PNG files exist and are properly sized
2. **Service worker not registering**: Check browser console for errors
3. **Install prompt not showing**: Verify all PWA requirements are met

### PWA Requirements Checklist:
- [ ] HTTPS or localhost
- [ ] Valid manifest.json
- [ ] Service worker registered
- [ ] Icons (at least 192x192 and 512x512)
- [ ] Screenshots for both form factors
- [ ] Proper meta tags

## Next Steps After Setup

1. **Test Installation**: Try installing on different devices
2. **Test Offline**: Disconnect internet and test app functionality
3. **Performance**: Use Lighthouse to audit PWA score
4. **Deploy**: Deploy to HTTPS hosting for production use

## Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Manifest Generator](https://app-manifest.firebaseapp.com/)
- [PWA Builder](https://www.pwabuilder.com/)

---

**Note**: After completing these steps, your app will be a fully functional, installable PWA that users can add to their home screen and use offline! 