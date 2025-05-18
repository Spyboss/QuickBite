# QuickBite

![QuickBite Logo](docs/images/logo.png)

QuickBite is a food ordering application for Sri Lanka that allows customers to browse menus, place orders, and make payments using PayHere payment gateway.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Running the Application](#-running-the-application)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- **User Authentication**: Email/password, Google login, and guest checkout
- **Menu Browsing**: View food items by category with images and descriptions
- **Cart Management**: Add, remove, and update quantities
- **Checkout Process**: Address input and payment method selection
- **Payment Integration**: PayHere payment gateway (Sandbox mode)
- **Order Tracking**: Real-time order status updates
- **Admin Dashboard**: Manage menu items and orders
- **Responsive Design**: Works on mobile, tablet, and desktop
- **PWA Support**: Installable on mobile devices

## 🛠 Tech Stack

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI
- **State Management**: React Context API
- **Routing**: React Router
- **API Client**: Axios
- **Testing**: Vitest + React Testing Library
- **PWA**: Workbox

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payment Gateway**: PayHere
- **Notifications**: Firebase Cloud Messaging
- **Testing**: Jest + Supertest

## 📁 Project Structure

```
quickbite/
├── .github/                # GitHub Actions workflows
├── docs/                   # Documentation files
├── quickbite-app/          # Frontend React application
│   ├── public/             # Static assets
│   ├── src/                # Source code
│   │   ├── assets/         # Images, fonts, etc.
│   │   ├── components/     # React components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── .env.example        # Example environment variables
│   └── package.json        # Frontend dependencies
├── quickbite-backend/      # Backend Express application
│   ├── routes/             # API routes
│   ├── controllers/        # Route controllers
│   ├── services/           # Business logic
│   ├── middleware/         # Express middleware
│   ├── utils/              # Utility functions
│   ├── .env.example        # Example environment variables
│   └── package.json        # Backend dependencies
├── supabase/               # Supabase configuration
│   ├── migrations/         # Database migrations
│   └── seed.sql            # Seed data
└── package.json            # Root package.json for scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Supabase account
- PayHere merchant account (for payment processing)
- Firebase project (for notifications)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Spyboss/QuickBite.git
   cd QuickBite
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   # Install root dependencies
   npm install

   # Install frontend dependencies
   cd quickbite-app
   npm install

   # Install backend dependencies
   cd ../quickbite-backend
   npm install
   ```

### Environment Variables

#### Frontend (.env file in quickbite-app)

Create a `.env` file in the `quickbite-app` directory based on `.env.example`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PAYHERE_MERCHANT_ID=your_payhere_merchant_id
VITE_API_URL=http://localhost:3001
```

#### Backend (.env file in quickbite-backend)

Create a `.env` file in the `quickbite-backend` directory based on `.env.example`:

```
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PAYHERE_MERCHANT_ID=your_payhere_merchant_id
PAYHERE_MERCHANT_SECRET=your_payhere_merchant_secret
PAYHERE_APP_ID=your_payhere_app_id
PAYHERE_APP_SECRET=your_payhere_app_secret
CORS_ORIGIN=http://localhost:5173
```

## 🏃‍♂️ Running the Application

### Development Mode

1. Start the backend server:
   ```bash
   cd quickbite-backend
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd quickbite-app
   npm run dev
   ```

### Production Build

1. Build the frontend:
   ```bash
   cd quickbite-app
   npm run build
   ```

2. Start the backend in production mode:
   ```bash
   cd quickbite-backend
   npm start
   ```

## 🧪 Testing

### Frontend Tests

```bash
cd quickbite-app
npm test
```

### Backend Tests

```bash
cd quickbite-backend
npm test
```

## 🚢 Deployment

### Frontend (Cloudflare Pages)

1. Log in to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Click "Create a project" and connect your GitHub repository
3. Configure the build settings:
   - **Project name**: quickbite (or your preferred name)
   - **Production branch**: master (or main)
   - **Build command**: `cd quickbite-app && npm install && npm run build`
   - **Build output directory**: `quickbite-app/dist`
4. Add the required environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `VITE_PAYHERE_MERCHANT_ID`: Your PayHere merchant ID
   - `VITE_API_URL`: Your backend API URL (after deploying to Railway)
5. Click "Save and Deploy"

Cloudflare Pages will automatically deploy your frontend whenever you push changes to your GitHub repository.

### Backend (Railway)

1. Log in to [Railway](https://railway.app/)
2. Click "New Project" and select "Deploy from GitHub repo"
3. Connect your GitHub repository
4. Configure the deployment settings:
   - **Root Directory**: `quickbite-backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add the required environment variables:
   - `PORT`: 3001 (or your preferred port)
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `PAYHERE_MERCHANT_ID`: Your PayHere merchant ID
   - `PAYHERE_MERCHANT_SECRET`: Your PayHere merchant secret
   - `PAYHERE_APP_ID`: Your PayHere app ID
   - `PAYHERE_APP_SECRET`: Your PayHere app secret
   - `CORS_ORIGIN`: Your frontend URL (from Cloudflare Pages)
6. Click "Deploy"

Railway will automatically deploy your backend whenever you push changes to your GitHub repository.

## 📚 API Documentation

API documentation is available at `/api-docs` when the backend server is running (e.g., `http://localhost:3001/api-docs`).

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
