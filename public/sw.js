self.addEventListener('install', (e) => {
    console.log('Service Worker: Installed');
});

self.addEventListener('fetch', (e) => {
    // လောလောဆယ် Offline mode မပါသေးဘဲ Network ကိုပဲ သုံးခိုင်းထားမယ်
    e.respondWith(fetch(e.request));
});