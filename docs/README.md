# QuickBite Application Documentation

## Overview

QuickBite is a web-based restaurant pickup application designed for a single restaurant. It allows users to browse a menu, add items to a cart, pay online (via PayHere) or choose cash-on-pickup, and receive real-time order status updates. It also includes a simple admin dashboard for the restaurant to manage orders and menu items.

## Project Structure

-   `/quickbite-app`: Contains the React frontend application (Vite, Material-UI, PWA).
-   `/quickbite-backend`: Contains the Node.js backend application (Express.js).
-   `/docs`: Contains project documentation.
-   `/.github/workflows`: Contains GitHub Actions for CI/CD (linting, testing).

## Setup and Installation

### Prerequisites

-   Node.js (v18+ recommended)
-   npm or yarn
-   Access to a Supabase project
-   Access to a Firebase project (for FCM)
-   PayHere merchant account (sandbox for testing)

### Frontend (`quickbite-app`)

1.  Navigate to the `quickbite-app` directory: `cd quickbite-app`
2.  Install dependencies: `npm install`
3.  Create a `.env` file by copying `.env.example` and fill in the required environment variables:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
    *   `VITE_FIREBASE_API_KEY`
    *   `VITE_FIREBASE_AUTH_DOMAIN`
    *   `VITE_FIREBASE_PROJECT_ID`
    *   `VITE_FIREBASE_STORAGE_BUCKET`
    *   `VITE_FIREBASE_MESSAGING_SENDER_ID`
    *   `VITE_FIREBASE_APP_ID`
    *   `VITE_PAYHERE_MERCHANT_ID`
    *   `VITE_FIREBASE_VAPID_KEY` (This is your FCM Web Push Certificate Key Pair - obtain from Firebase project settings > Cloud Messaging > Web configuration)
4.  Run the development server: `npm run dev` (usually at `http://localhost:5173`)

### Backend (`quickbite-backend`)

1.  Navigate to the `quickbite-backend` directory: `cd quickbite-backend`
2.  Install dependencies: `npm install`
3.  Create a `.env` file by copying `.env.example` and fill in the required environment variables:
    *   `PORT` (e.g., 3001)
    *   `SUPABASE_URL`
    *   `SUPABASE_SERVICE_ROLE_KEY`
    *   `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string of your Firebase service account key)
    *   `PAYHERE_MERCHANT_SECRET`
4.  Run the development server: `npm run dev` (usually at `http://localhost:3001`)

## API Documentation

API documentation is generated using Swagger and is available at `/api-docs` when the backend server is running (e.g., `http://localhost:3001/api-docs`).

## Deployment

-   **Frontend**: Intended for Cloudflare Pages.
-   **Backend**: Intended for Railway.
-   **Database**: Supabase.

(CI/CD workflows for automated deployment via GitHub Actions are planned.)

## Key Features Implemented

-   Menu browsing
-   Cart functionality (add/remove)
-   User authentication (Email/Password, Google, Guest)
-   Order placement (Cash on Pickup, PayHere sandbox)
-   Real-time order status updates (client-side listening)
-   Admin dashboard (Menu CRUD, Order RUD - status update)
-   PWA setup (manifest, service worker for basic caching, offline fallback page)
-   PayHere webhook processing (backend)
-   Basic FCM notification sending endpoint (backend)

## Known Issues / TODOs

-   Implement robust role-based access control for the Admin Dashboard.
-   Secure the PayHere hash generation on the backend for production.
-   Enhance PWA offline capabilities (e.g., offline ordering if feasible).
-   Complete Jest test coverage for all components and APIs.
-   Refine UI/UX based on further testing.
-   Add detailed error logging and monitoring.
-   Set up production deployment workflows.
-   The `VITE_FIREBASE_VAPID_KEY` needs to be correctly sourced and used in `NotificationContext.tsx`.