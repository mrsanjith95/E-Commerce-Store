# E-Commerce Store

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=00C8FF)

A full-stack, production-grade MERN e-commerce web application featuring secure JWT authentication, product catalog browsing, search & filtering, wishlist, persistent cart, Razorpay Test Mode online payments, Cash on Delivery (COD) support, order status tracking, user reviews & ratings, and a comprehensive admin management dashboard.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [Authentication & Authorization](#authentication--authorization)
  - [Product Catalog](#product-catalog)
  - [Shopping Cart](#shopping-cart)
  - [Checkout & Payments](#checkout--payments)
  - [Orders](#orders)
  - [Reviews & Ratings](#reviews--ratings)
  - [Wishlist](#wishlist)
  - [Admin Dashboard](#admin-dashboard)
  - [Responsive UI](#responsive-ui)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Shopping & Order Flow](#shopping--order-flow)
- [Razorpay Test Mode](#razorpay-test-mode)
- [Environment Variables](#environment-variables)
- [Installation & Setup](#installation--setup)
- [Security](#security)
- [Testing / Verification](#testing--verification)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)
- [Author](#author)
- [License](#license)

---

## Overview

The **E-Commerce Store** is an end-to-end full-stack web application designed to deliver an intuitive online shopping experience. Built using modern web development best practices, it connects a fast React frontend powered by Vite with a Node.js/Express REST API and a MongoDB Atlas database.

Key capability highlights:
- **Customer Shopping Lifecycle:** Full catalog discovery, instant search, multi-criteria filtering, wishlist management, cart persistence, address checkout, and online/offline payment processing.
- **Razorpay Integration:** Full Razorpay Test Mode integration featuring server-side amount computation and HMAC-SHA256 signature verification.
- **Reviews & Ratings:** Verified user review submission with 1–5 star ratings and admin moderation.
- **Admin Operations:** Complete dashboard for catalog management (Product CRUD), order fulfillment, status tracking, and review moderation.

---

## Features

### Authentication & Authorization
- **User Registration & Login:** Email and password authentication with encrypted password storage.
- **JSON Web Tokens (JWT):** Stateless token-based session handling stored securely in client state.
- **Role-Based Access Control:** Strict role segregation between standard `Customer` users and `Admin` users.
- **Protected Routes:** Both frontend router guards and backend middleware enforce authorization.

### Product Catalog
- **Catalog Browsing:** Responsive product grid displaying titles, images, categories, prices, stock levels, and average star ratings.
- **Instant Search:** Keyword search across product names and descriptions.
- **Category Filtering:** Filter products by specific categories.
- **Flexible Sorting:** Sort catalog items by price (low-to-high, high-to-low) or alphabetically.
- **Product Detail View:** Detailed product view displaying full descriptions, inventory availability, review summaries, and wishlist/cart controls.

### Shopping Cart
- **Persistent Cart:** Cart items sync automatically with MongoDB for authenticated users.
- **Cart Management:** Add products, adjust quantities, remove items, or clear the entire cart.
- **Real-Time Price Calculations:** Dynamic computation of subtotal, estimated tax (18% GST), shipping, and overall total.
- **Stock Validation:** Prevents adding more items than available in product inventory.

### Checkout & Payments
- **Shipping Address Input:** Structured input for street address, city, state, postal code, and country.
- **Payment Method Selection:**
  - 💵 **Cash on Delivery (COD):** Direct order creation with pending payment status.
  - 💳 **Razorpay / Online Payment (Test Mode):** Secure checkout modal processing cards, UPI, netbanking, and test wallets.
- **Server-Side Price Integrity:** Order amounts are strictly computed on the backend from database prices.

### Orders
- **Order Creation:** Generates authoritative order records with snapshot item details, shipping address, and payment references.
- **Customer Order History:** Page displaying all past user orders with dates, items count, payment methods, and current statuses.
- **Order Detail Page:** Detailed invoice view displaying itemized costs, shipping information, payment method, payment timestamps, and status timeline.
- **Fulfillment Status Tracking:** Real-time visibility into order status (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).

### Reviews & Ratings
- **Customer Reviews:** Authenticated users can submit text reviews and 1–5 star ratings for products.
- **Duplicate Prevention:** Users are restricted to one review per product.
- **Rating Synchronization:** Product average ratings and review counts update dynamically.
- **Review Moderation:** Admin panel allows reviewing, approving, or rejecting submitted customer reviews.

### Wishlist
- **Toggle Wishlist:** Easily add or remove items from a user's personal wishlist with visual heart feedback.
- **Wishlist Counter:** Dynamic badge in the navigation bar displaying total saved items.
- **Direct Cart Transfer:** One-click option to move saved wishlist items directly into the shopping cart.
- **User Isolation:** Wishlists are privately tied to individual user accounts.

### Admin Dashboard
- **Dashboard Overview:** High-level metrics showing total catalog items, overall orders count, total revenue, and review counts.
- **Product CRUD Management:** Add new products, update existing pricing/stock/details, or remove products.
- **Order Fulfillment Center:** View all customer orders, filter by status, inspect customer details, and update shipment delivery statuses.
- **Review Moderation Panel:** Review customer feedback and toggle approval status.

### Responsive UI
- **Modern Design Aesthetics:** Built using modern CSS variable tokens, card layouts, clean typography, subtle animations, and accessible contrast ratios.
- **Cross-Device Optimization:** Optimized for mobile screens, tablets, and desktop displays.

---

## Tech Stack

### Frontend
- **React (v19)** — Component-driven user interface architecture
- **Vite (v8)** — Next-generation frontend toolchain and dev server
- **JavaScript (ES6+)** — Client-side application logic
- **React Router (v7)** — Client-side route management and navigation guards
- **Axios** — HTTP client with request/response interceptors for JWT injection
- **Vanilla CSS** — Custom responsive design system with CSS custom properties

### Backend
- **Node.js** — Asynchronous JavaScript runtime environment
- **Express.js (v5)** — Web framework for REST API route handling and middleware
- **MongoDB & Mongoose (v9)** — Document database and Object Data Modeling (ODM)
- **JSON Web Token (`jsonwebtoken`)** — Stateless authentication mechanism
- **`bcryptjs`** — Salted password hashing algorithm
- **`cors` & `dotenv`** — Cross-Origin Resource Sharing and environment configuration

### Payments
- **Razorpay Node.js SDK (v2)** — Official SDK for backend order creation
- **Razorpay Checkout SDK (`checkout.js`)** — Frontend modal interface for Test Mode payments

---

## System Architecture

### General Application Architecture

```text
User Browser
    ↓
React Frontend (Vite + React Router + Context API)
    ↓
Axios HTTP Client (Attaches Authorization: Bearer <JWT>)
    ↓
Express.js REST API Server
    ↓
Middleware (cors, json, protect, adminMiddleware)
    ↓
Controllers (Auth, Product, Cart, Order, Review, Wishlist, Payment)
    ↓
Mongoose Models (User, Product, Cart, Order, Review, Wishlist)
    ↓
MongoDB Atlas Database
```

### Razorpay Payment Flow Architecture

```text
User Clicks "Place Order" (Razorpay Selected)
    ↓
React CheckoutPage calls POST /api/payment/create-order
    ↓
Express backend fetches Cart from MongoDB & computes trusted amount (paise)
    ↓
Backend calls Razorpay SDK -> creates Razorpay Order ID
    ↓
Backend returns { id, amount, currency } to React
    ↓
React opens Razorpay Checkout Modal (https://checkout.razorpay.com/v1/checkout.js)
    ↓
User completes Test Mode payment -> Razorpay returns payment credentials
    ↓
React calls POST /api/payment/verify with signature & shipping details
    ↓
Backend performs HMAC SHA256 signature verification (razorpay_order_id + "|" + razorpay_payment_id)
    ↓
Signature Valid?
  ├── YES: Create Order (Paid), Decrement Stock, Clear Cart, Return Application Order
  └── NO: Return HTTP 400 Error (Cart & Stock remain untouched)
```

---

## Project Structure

```text
E-Commerce-Store/
│
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection initialization
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile logic
│   │   ├── cartController.js     # Cart fetch, item addition, quantity updates
│   │   ├── orderController.js    # COD order creation, user/admin order fetching
│   │   ├── paymentController.js  # Razorpay order creation & signature verification
│   │   ├── productController.js  # Product listing, search, filtering, CRUD
│   │   ├── reviewController.js   # Product review creation, fetch, & admin moderation
│   │   └── wishlistController.js # Wishlist toggle, fetch, & move-to-cart logic
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT token validation & admin authorization
│   │   └── errorMiddleware.js    # 404 handler & centralized error handler
│   ├── models/
│   │   ├── Cart.js               # User cart schema
│   │   ├── Order.js              # Order schema with Razorpay fields
│   │   ├── Product.js            # Product schema with stock & rating metrics
│   │   ├── Review.js             # Customer review & rating schema
│   │   ├── User.js               # User authentication schema
│   │   └── Wishlist.js           # User wishlist schema
│   ├── routes/
│   │   ├── authRoutes.js         # Authentication API endpoints
│   │   ├── cartRoutes.js         # Cart API endpoints
│   │   ├── orderRoutes.js        # Order API endpoints
│   │   ├── paymentRoutes.js      # Razorpay payment API endpoints
│   │   ├── productRoutes.js      # Product catalog API endpoints
│   │   ├── reviewRoutes.js       # Reviews API endpoints
│   │   └── wishlistRoutes.js     # Wishlist API endpoints
│   ├── .env.example              # Backend environment variable placeholders
│   ├── package.json              # Node.js dependencies and scripts
│   └── server.js                 # Express server bootstrap file
│
├── frontend/
│   ├── public/                   # Static public assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminRoute.jsx    # Guard component for admin-only routes
│   │   │   ├── Footer.jsx        # Site footer component
│   │   │   ├── Navbar.jsx        # Navigation bar with badges & user menu
│   │   │   ├── ProductCard.jsx   # Product card component
│   │   │   └── ProtectedRoute.jsx# Guard component for authenticated users
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Authentication state management
│   │   │   ├── CartContext.jsx   # Cart state & API synchronization
│   │   │   └── WishlistContext.jsx# Wishlist state & sync
│   │   ├── pages/
│   │   │   ├── AdminDashboardPage.jsx # Admin metrics overview
│   │   │   ├── AdminOrdersPage.jsx    # Admin order fulfillment management
│   │   │   ├── AdminProductsPage.jsx  # Admin product CRUD management
│   │   │   ├── AdminReviewsPage.jsx   # Admin review moderation panel
│   │   │   ├── CartPage.jsx           # Customer shopping cart page
│   │   │   ├── CheckoutPage.jsx       # Shipping & Razorpay/COD checkout page
│   │   │   ├── HomePage.jsx           # Hero page with featured catalog
│   │   │   ├── LoginPage.jsx          # User login page
│   │   │   ├── OrderDetailPage.jsx    # Itemized order invoice & status details
│   │   │   ├── OrdersPage.jsx         # User order history list
│   │   │   ├── ProductDetailPage.jsx  # Product detail & reviews page
│   │   │   ├── ProductsPage.jsx       # Catalog page with search, filter, & sort
│   │   │   ├── RegisterPage.jsx       # User registration page
│   │   │   └── WishlistPage.jsx       # Saved wishlist items page
│   │   ├── services/
│   │   │   └── api.js                 # Axios instance configured with JWT interceptor
│   │   ├── App.jsx                    # Root App component with routing setup
│   │   ├── index.css                  # Core CSS design tokens and component styles
│   │   └── main.jsx                   # React application entry point
│   ├── .env.example                  # Frontend environment variable placeholders
│   ├── package.json                  # React & Vite dependencies
│   └── vite.config.js                # Vite development server configuration
│
├── .gitignore                    # Excludes node_modules, dist, and .env files
└── README.md                     # Application documentation
```

---

## API Endpoints

### 1. Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve logged-in user profile |
| `GET` | `/api/auth/protected` | Private | Verify JWT authorization status |

### 2. Product Routes (`/api/products`)

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | Fetch product catalog (supports search, category filter, sort) |
| `GET` | `/api/products/:id` | Public | Fetch detailed product information by ID |
| `POST` | `/api/products` | Admin | Create a new product listing |
| `PUT` | `/api/products/:id` | Admin | Update existing product details, price, or stock |
| `DELETE` | `/api/products/:id` | Admin | Delete a product from the catalog |

### 3. Cart Routes (`/api/cart`)

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Private | Retrieve current user's shopping cart |
| `POST` | `/api/cart` | Private | Add product item to cart |
| `PUT` | `/api/cart/:productId` | Private | Update quantity of item in cart |
| `DELETE` | `/api/cart/:productId` | Private | Remove specific product from cart |
| `DELETE` | `/api/cart` | Private | Clear all items from cart |

### 4. Order Routes (`/api/orders`)

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Private | Create Cash on Delivery (COD) order |
| `GET` | `/api/orders/my-orders` | Private | Retrieve logged-in user's order history |
| `GET` | `/api/orders/:id` | Private | Retrieve detailed order invoice by ID |
| `GET` | `/api/orders` | Admin | Retrieve all customer orders across platform |
| `PUT` | `/api/orders/:id/status` | Admin | Update order status (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`) |

### 5. Payment Routes (`/api/payment`)

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payment/create-order` | Private | Generate Razorpay order based on server-calculated cart total |
| `POST` | `/api/payment/verify` | Private | Verify Razorpay HMAC signature & create paid application order |

### 6. Review Routes (`/api/reviews`)

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reviews/product/:productId` | Public | Fetch approved customer reviews for a product |
| `POST` | `/api/reviews/product/:productId` | Private | Submit product review and star rating |
| `DELETE` | `/api/reviews/:id` | Private/Admin | Delete a review (by author or admin) |
| `GET` | `/api/reviews/admin/all` | Admin | Fetch all submitted reviews for admin moderation |
| `PUT` | `/api/reviews/admin/:id/status` | Admin | Approve or reject a customer review |

### 7. Wishlist Routes (`/api/wishlist`)

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/wishlist` | Private | Fetch user's saved wishlist items |
| `POST` | `/api/wishlist/toggle` | Private | Add or remove product from wishlist |
| `DELETE` | `/api/wishlist/:productId` | Private | Remove product from wishlist |
| `POST` | `/api/wishlist/move-to-cart` | Private | Move item from wishlist directly into cart |

---

## Authentication Flow

1. **Registration & Password Hashing:** User registers with name, email, and password. `bcryptjs` automatically salts and hashes the password before saving to MongoDB.
2. **Login & JWT Generation:** Upon valid login credentials verification, the server generates a signed JWT payload containing user ID and admin role flag (`isAdmin`).
3. **Client Session Storage:** The React client stores the token in local storage and manages authentication state via `AuthContext`.
4. **Automated Interceptor:** Axios HTTP client attaches the JWT to request headers:
   ```http
   Authorization: Bearer <token>
   ```
5. **Backend Protection Middleware:** `protect` middleware decodes token validity. `adminMiddleware` ensures non-admin users cannot access administrative endpoints.

---

## Shopping & Order Flow

```text
1. Browse Catalog
   ├── Search by keyword
   ├── Filter by category
   └── Sort by price or name
        ↓
2. Add Product to Cart / Wishlist
   ├── Syncs with backend MongoDB document
   └── Updates persistent header badges
        ↓
3. Navigate to Checkout Page
   ├── Enter shipping address
   └── Select Payment Method (COD or Razorpay)
        ↓
4. Order Processing Flow:
   ├── Cash on Delivery (COD):
   │   └── POST /api/orders -> Order created (Pending) -> Clear Cart
   │
   └── Razorpay Online Payment:
       ├── POST /api/payment/create-order -> Calculates total & returns Razorpay Order ID
       ├── Razorpay Modal opens for user -> Payment completed in Test Mode
       ├── POST /api/payment/verify -> HMAC SHA256 Signature Verification
       └── Signature Valid? -> Order created (Paid) -> Stock decremented -> Clear Cart
        ↓
5. Order Invoice & Tracking Page (/orders/:id)
   └── Real-time status updates managed via Admin Dashboard
```

---

## Razorpay Test Mode

The application integrates Razorpay **TEST MODE** for online payment simulation.

### Payment Execution Steps:
1. **Initiation:** The frontend requests Razorpay order creation via `POST /api/payment/create-order`.
2. **Server Computation:** The backend fetches items directly from MongoDB, verifies inventory stock, computes tax/shipping/subtotal, and converts the total to paise (`amount * 100`).
3. **Razorpay Order ID:** The backend initializes Razorpay SDK and returns the generated Razorpay order ID to the client.
4. **Modal Launch:** Razorpay Checkout modal launches in the browser using the public `VITE_RAZORPAY_KEY_ID`.
5. **HMAC Signature Verification:** Upon payment completion, payment credentials (`razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`) are sent to `POST /api/payment/verify`.
6. **Confirmation:** The server verifies the signature using `HMAC-SHA256` generated from `${razorpay_order_id}|${razorpay_payment_id}` using `RAZORPAY_KEY_SECRET`.
7. **Order Finalization:** Only after verified signature match is the order created in MongoDB with `paymentStatus: 'Paid'`, stock decremented, and the cart cleared.

> **Security Guarantee:** The `RAZORPAY_KEY_SECRET` remains strictly server-side. Production keys should be supplied only via secure environment variables.

---

## Environment Variables

### Backend (`backend/.env`)

Configure environment variables in `backend/.env` (refer to `backend/.env.example`):

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce_store?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

### Frontend (`frontend/.env`)

Configure environment variables in `frontend/.env` (refer to `frontend/.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
```

---

## Installation & Setup

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (v9+ recommended)
- **MongoDB** (Local MongoDB server or MongoDB Atlas cluster)

### Step-by-Step Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/mrsanjith95/E-Commerce-Store.git
   cd E-Commerce-Store
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment Variables:**
   - Create `backend/.env` based on `backend/.env.example`.
   - Create `frontend/.env` based on `frontend/.env.example`.

5. **Start Development Servers:**

   - **Backend Server** (Terminal 1):
     ```bash
     cd backend
     npm run dev
     ```
     *Server runs at `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).*

   - **Frontend Application** (Terminal 2):
     ```bash
     cd frontend
     npm run dev
     ```
     *Application runs at `http://localhost:5173`.*

---

## Security

The project incorporates established application security standards:

- **Password Hashing:** Passwords encrypted using `bcryptjs` with auto-gen salted rounds.
- **Stateless Authorization:** Secure JWT token verification on all protected routes.
- **Dual-Tier Protection:** Endpoint validation using `protect` and `adminMiddleware` guards.
- **Resource Isolation:** Users can view and modify only their own cart, wishlist, and order documents.
- **Authoritative Server Computations:** All item prices, taxes, shipping, and totals computed server-side to prevent client-side price tampering.
- **Inventory Stock Validation:** Server checks ensure items cannot be ordered beyond current stock levels.
- **HMAC Signature Verification:** Razorpay payments verified server-side via HMAC-SHA256 signature matching.
- **Duplicate Payment Guard:** Prevents duplicate order creation if payment details have already been processed.
- **Environment Confidentiality:** All secret credentials excluded from version control via `.gitignore`.

---

## Testing / Verification

The application underwent full functional validation across all application modules:

- **Authentication Module:** Verified user registration, JWT login authentication, profile fetching, token expiration handling, and admin authorization.
- **Catalog & Discovery:** Verified product catalog rendering, title/description search, category filtering, price/alphabetical sorting, and product detail viewing.
- **Wishlist Module:** Verified adding/removing items, persistent wishlist storage, navbar counter badge, and wishlist-to-cart transfer.
- **Shopping Cart Module:** Verified cart persistence, stock availability checks, quantity updates, item deletion, and cart clearing.
- **Checkout & Payments:** Verified address form validation, COD order creation, Razorpay order generation, Razorpay Checkout modal launch, HMAC signature verification, stock decrement, and cart clearing.
- **Order Tracking:** Verified customer order history rendering, itemized order invoice views, and admin order fulfillment status updates.
- **Review System:** Verified review submission, 1–5 star ratings, duplicate submission prevention, product rating metric updates, and admin review moderation.
- **Admin Management:** Verified administrative access restrictions, product CRUD operations, customer order status management, and review moderation.
- **Build & Quality:** Verified 0 errors on production build (`npm run build`) and linting (`npx oxlint`).

---

## Screenshots

Screenshots showcasing key interface pages:

- **Home Page & Featured Products**
- **Catalog Page with Filters & Search**
- **Product Details & Customer Reviews**
- **Shopping Cart & Price Breakdown**
- **Checkout & Razorpay Test Payment Modal**
- **Order Invoice & Tracking Details**
- **User Wishlist Page**
- **Admin Management Dashboard & Order Fulfillment**

---

## Future Enhancements

- **Product Pagination & Infinite Scroll:** Server-side pagination for large product catalogs.
- **Advanced Multi-Facet Filtering:** Range sliders for price filtering and brand multi-select.
- **Transactional Email Notifications:** Automated emails for order confirmation and status changes via Nodemailer/SendGrid.
- **Promo Codes & Discount System:** Coupon code input during checkout for percentage/flat discounts.
- **Production Payment Configuration:** Webhook handlers for production Razorpay events.
- **Image Cloud Storage:** Integration with Cloudinary or AWS S3 for product image uploads.
- **Automated Testing Suite:** End-to-end testing with Cypress/Playwright and unit testing with Jest/Vitest.

---

## Author

**Sanjith K S**

- **GitHub:** [mrsanjith95](https://github.com/mrsanjith95)
- **LinkedIn:** [Sanjith K S](https://www.linkedin.com/in/sanjith-k-s-77b958325/)

---

## License

This project is open for educational and portfolio presentation purposes. All rights reserved by the author.
