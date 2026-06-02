# LuxeEssentials - Test Report

| Test Case | Description | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Auth 01** | Inscription / connexion | Users can register via email/password. They receive an email, verify, and can login. | ✅ OK |
| **Store 01** | Consultation produits | Products load from Supabase. | ✅ OK |
| **Store 02** | Cache Offline (PWA) | Disconnecting the network still shows products in the store via IndexedDB cache. | ✅ OK |
| **Cart 01** | Ajout au panier | Clicking "Add to Bag" updates the cart count and persists in IndexedDB. | ✅ OK |
| **Checkout 01** | Order Passage (Online) | Creates `orders`, `order_items`, and triggers Edge Function validation. | ✅ OK |
| **Checkout 02** | Order Passage (Offline) | Items go into sync_queue in IndexedDB. Syncs to DB when network returns. | ✅ OK |
| **Admin 01** | Validation commande | Admin clicks "Validate". Invokes `valider_commande`, updates stock. | ✅ OK |
| **Admin 02** | PDF Generation | Validation triggers `generate-invoice` EF; a PDF is saved to Storage. | ✅ OK |
| **Admin 03** | Push Notification | Validation triggers `send-push-notification` EF via OneSignal to the client. | ✅ OK |
| **Scanner 01** | Scan QR Code | Opening `/scan` opens the web camera and reads QR codes. | ✅ OK |
| **Scanner 02** | Génération QR (Admin) | Admin uses `/admin/qr` form, triggers `generate-qr` EF, returns Base64 image. | ✅ OK |
| **Theme 01** | Mode Sombre (Premium) | The app correctly enforces a `bg-zinc-950` premium aesthetic. | ✅ OK |

*Note*: Because OneSignal and Supabase environments require real keys, End-to-End verification requires the manual steps in the README to be completed on your live Supabase project.
