# SOLESPHERE – setup
Structure: index.html (store), admin.html (admin), css/style.css, js/{firebase,store,admin}.js, firestore.rules, storage.rules

1. Firebase console → create project → add a Web app → copy config into js/firebase.js.
2. Build → Firestore Database → create (production mode) → Rules tab → paste firestore.rules → Publish.
3. Build → Storage → get started → Rules → paste storage.rules → Publish (image uploads; needs Blaze plan on new projects).
4. Build → Authentication → Sign-in method → enable Email/Password → Users → Add user (your admin email/password).
5. Copy that user's UID. In Firestore create collection `admins`, document ID = the UID, any field (e.g. active: true). Only these users can write data. No passwords exist in the code.
6. Run locally: `python3 -m http.server 8000` in this folder → open http://localhost:8000 (ES modules need http, not file://). Deploy: `firebase deploy` (Hosting) or Netlify/Vercel. Add your domain under Authentication → Settings → Authorized domains.
7. Open /admin.html, sign in, Products tab → "Load sample data" (qualities, categories, 6 sample shoes, settings). Then Settings tab: set store name, WhatsApp number (country code + digits, e.g. 919876543210), Instagram URL, contact info.
Orders are saved as Pending (never auto-paid), then WhatsApp opens with the prefilled message; the customer sends it manually. Change order status in Admin → Orders.
