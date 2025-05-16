# Error Log & Known Issues

This document is used to log any significant errors encountered during development, their resolution, and any known outstanding issues.

## Development Errors & Resolutions

-   **Date:** YYYY-MM-DD
    -   **Error:** Brief description of the error.
    -   **Context:** Where the error occurred (e.g., Frontend - Menu Component, Backend - PayHere Webhook).
    -   **Resolution:** How the error was fixed.
    -   **Notes:** Any additional observations.

*(Add new entries as issues are encountered and resolved)*

## Known Outstanding Issues / Bugs

-   **(Placeholder)** Admin Dashboard: Role-based access control is not fully implemented. Currently, any authenticated user can access `/admin`.
    -   **Priority:** High
    -   **Details:** Need to integrate Supabase custom claims or roles to restrict admin access.
-   **(Placeholder)** PayHere Integration: Hash generation for payment requests is currently client-side for sandbox. This must be moved to the backend for production security.
    -   **Priority:** Critical for Production
-   **(Placeholder)** PWA: Offline ordering (adding to cart, placing order while offline to sync later) is not implemented.
    -   **Priority:** Medium (enhancement)
-   **(Placeholder)** Testing: Test coverage is not yet comprehensive. More unit and integration tests are needed for both frontend and backend.
    -   **Priority:** Medium-High
-   **(Placeholder)** Frontend: `VITE_FIREBASE_VAPID_KEY` in `quickbite-app/.env.example` needs to be correctly sourced from Firebase project settings (Web push certificates) and used in `NotificationContext.tsx` for `getToken`'s `vapidKey` option. The current placeholder `'YOUR_VAPID_KEY_HERE'` in `NotificationContext.tsx` will prevent FCM token generation.
    -   **Priority:** High (for push notifications to work)