# E-Commerce Store

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

A full-stack e-commerce web application built using the MERN stack. The application provides product browsing, authentication, shopping cart functionality, checkout, order tracking, and role-based administration for managing products and orders.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [User Features](#user-features)
  - [Admin Features](#admin-features)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Order Workflow](#order-workflow)
- [Security](#security)
- [Testing](#testing)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)
- [Author](#author)

---

## Overview

The **E-Commerce Store** is a production-grade full-stack web application designed to deliver an end-to-end online shopping experience. It connects a modern, responsive React frontend with a secure Node.js/Express backend powered by MongoDB for persistent data storage.

The application provides:
- Product catalog browsing with detailed product view
- Search, category filtering, and price/alphabetical sorting
- User registration and login with JWT authentication
- Role-based access control separating customer and admin workflows
- Persistent shopping cart management (add, update quantities, remove, clear)
- Checkout workflow with shipping address input and payment-method selection
- Order creation, historical order tracking, and status viewing
- Comprehensive admin dashboard for full product CRUD operations and customer order status updates

---

## Features

### User Features

- **User Registration & Login:** Create a new account or log in securely with JWT token authentication.
- **Browse Products:** View all available products in a clean, responsive layout.
- **Search Products:** Instant search by product title or description.
- **Filter by Category:** Filter catalog items by specific product categories.
- **Sort Products:** Sort items by price (ascending/descending) or alphabetically.
- **View Product Details:** Detailed view displaying image, price, stock status, and description.
- **Add Products to Cart:** Add items to cart directly from catalog or product detail page.
- **Update Cart Quantities:** Adjust item quantities within the cart.
- **Remove Products from Cart:** Remove individual items or clear the cart.
- **Checkout:** Dedicated checkout page to review order items and total cost.
- **Shipping Address Management:** Input delivery details during checkout.
- **Payment Method Selection:** Choose between Cash on Delivery (COD) and Card options. *(Note: The current application provides payment-method selection UI and does not process real card payments).*
- **View Order History:** Access past orders placed by the user.
- **View Order Details:** Inspect items, pricing breakdown, shipping address, and current status for any order.
- **Track Order Status:** Real-time visibility into order status updates set by administrators.

### Admin Features

- **Admin Dashboard:** Centralized panel accessible only by authorized administrative users.
- **Product Listing:** View all catalog items with stock levels and price details.
- **Add Products:** Create new product listings with image URLs, categories, prices, and stock counts.
- **Edit Products:** Update product details, stock, pricing, and description.
- **Delete Products:** Remove obsolete or out-of-stock items from the catalog.
- **View All Customer Orders:** Monitor all customer orders across the platform.
- **Update Order Status:** Change order status (e.g., Pending, Processing, Shipped, Delivered, Cancelled).
- **View Customer Information:** Access buyer name, email, and shipping details associated with each order.
- **View Order Details:** Deep-dive into item lists, individual pricing, payment method, and timestamps.

---

## Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React | Component-based UI library |
| | Vite | Fast frontend build tool and dev server |
| | JavaScript (ES6+) | Core application logic |
| | React Router | Client-side page routing |
| | Axios | HTTP client for backend API communication |
| **Backend** | Node.js | JavaScript runtime environment |
| | Express.js | Web application framework for REST APIs |
| | REST APIs | Endpoint architecture for CRUD operations |
| | JWT (jsonwebtoken) | Stateless user authentication |
| | bcryptjs | Password hashing algorithm |
| **Database** | MongoDB | NoSQL document database |
| | Mongoose | Object Data Modeling (ODM) library for MongoDB |
| **Development** | Git & GitHub | Version control and repository hosting |
| | VS Code | Integrated Development Environment |

---

## Project Architecture

```text
Browser
   ↓
React Frontend (Vite, React Router, Axios)
   ↓
Axios / REST API HTTP Requests
   ↓
Express Backend (Middleware, Controllers, Routes)
   ↓
Mongoose ODM
   ↓
MongoDB Database
```

### Architecture Description

1. **Client Layer (Browser & React):** User interacts with the single-page application built with React components and managed with React Router.
2. **HTTP Layer (Axios):** Sends asynchronous HTTP requests carrying JSON payloads and JWT authorization tokens in headers (`Authorization: Bearer <token>`).
3. **Server Layer (Express.js):** Routes requests through authentication and authorization middleware to appropriate controller functions.
4. **Data Modeling Layer (Mongoose):** Enforces schemas, data validation, and business logic before querying or writing to the database.
5. **Database Layer (MongoDB):** Stores documents for users, products, carts, and orders.

---

## Project Structure

```text
E-Commerce-Store/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   └── productController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   └── productRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## Installation

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v16+ recommended)
- **npm** (v8+ recommended)
- **MongoDB** (Local instance or MongoDB Atlas account)
- **Git**

### Step-by-Step Setup

1. **Clone the repository:**
   ```powershell
   git clone https://github.com/mrsanjith95/E-Commerce-Store.git
   cd E-Commerce-Store
   ```

2. **Setup Backend:**
   ```powershell
   cd backend
   npm install
   ```

3. **Setup Frontend:**
   ```powershell
   cd ../frontend
   npm install
   ```

---

## Environment Variables

### Backend Configuration

Create a `.env` file inside the `backend` directory based on `backend/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce_store?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
```

### Frontend Configuration

Create a `.env` file inside the `frontend` directory based on `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

> **Note:** Do not commit `.env` files containing real secrets or database credentials to public repositories.

---

## Running the Application

### 1. Start Backend Server

From the root directory:

```powershell
cd backend
npm run dev
```

- Server runs on: `http://localhost:5000`
- API Health Check: `http://localhost:5000/api/health`

### 2. Start Frontend Application

In a new terminal, from the root directory:

```powershell
cd frontend
npm run dev
```

- Local Web Application: `http://localhost:5173`

---

## API Overview

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Private | Get profile details of logged-in user |
| `GET` | `/api/auth/protected` | Private | Verify JWT token authorization |

### Product Routes (`/api/products`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | Fetch all products (supports filtering & sorting) |
| `GET` | `/api/products/:id` | Public | Fetch single product by ID |
| `POST` | `/api/products` | Admin | Create a new product |
| `PUT` | `/api/products/:id` | Admin | Update existing product by ID |
| `DELETE` | `/api/products/:id` | Admin | Remove product by ID |

### Cart Routes (`/api/cart`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Private | Retrieve current user's shopping cart |
| `POST` | `/api/cart` | Private | Add product item to cart |
| `PUT` | `/api/cart/:productId` | Private | Update item quantity in cart |
| `DELETE` | `/api/cart/:productId` | Private | Remove specific product from cart |
| `DELETE` | `/api/cart` | Private | Clear all items from cart |

### Order Routes (`/api/orders`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Private | Create order from checkout cart |
| `GET` | `/api/orders/my-orders` | Private | Fetch logged-in user's order history |
| `GET` | `/api/orders/:id` | Private | Fetch specific order details by ID |
| `GET` | `/api/orders` | Admin | Fetch all orders across all customers |
| `PUT` | `/api/orders/:id/status` | Admin | Update order processing status |

---

## Authentication

The application enforces security using **JSON Web Tokens (JWT)**:

1. **User Login:** Upon successful credentials verification, the server generates a signed JWT containing user identity and role payload.
2. **Token Storage & Transmission:** The client stores the token and attaches it to authorization headers on subsequent HTTP requests:
   ```http
   Authorization: Bearer <your_jwt_token>
   ```
3. **Protected Routes:** Middleware validates token integrity and signature before allowing access to private resources.
4. **Role-Based Authorization:** Administrative routes (`/api/products` POST/PUT/DELETE and `/api/orders` GET/status update) check for `isAdmin` privileges.
5. **Password Hashing:** Passwords are hashed server-side using `bcryptjs` before storage in MongoDB.

---

## Order Workflow

```text
Browse Products
      ↓
Add to Cart
      ↓
Checkout Page (Shipping Details & Payment Selection)
      ↓
Create Order (Saved as 'Pending')
      ↓
Admin Updates Status:
  ├── Pending
  ├── Processing
  ├── Shipped
  └── Delivered
```

Order statuses are managed directly through the Admin Dashboard, enabling real-time status visibility for customers.

---

## Security

The project incorporates established backend and frontend security practices:

- **Password Encryption:** Hashing via `bcryptjs` with salt rounds.
- **Stateless Authentication:** Secure JWT validation on protected endpoints.
- **Route Authorization:** Dual-tier protection (`protect` for authenticated users, `adminMiddleware` for admin access).
- **Cart & Order Data Isolation:** Users can only view and modify their own carts and orders.
- **Price Integrity:** Server-side order total computation prevents client-side price manipulation.
- **Stock Validation:** Backend checks ensure orders do not exceed current inventory.
- **Environment Isolation:** Sensitive credentials stored exclusively in `.env` and kept out of version control via `.gitignore`.

---

## Testing

The application went through rigorous functional validation across all application flows:

- **Authentication:** Verified user registration, login authentication, token storage, and logout.
- **Product Management:** Verified product creation, editing, deletion, search querying, and category filtering.
- **Cart Management:** Tested adding items, quantity updates, item removal, and full cart clearance.
- **Checkout & Order Creation:** Tested order placement, address validation, payment selection, and stock deductions.
- **Order Tracking:** Validated user order list rendering and status tracking.
- **Admin Authorization:** Verified strict restriction of administrative endpoints and admin dashboard UI to authorized admin accounts.
- **Frontend UI & Error Handling:** Verified smooth navigation, loading states, and error handling across viewports.

---

## Screenshots

Screenshots of the application can be added here.

---

## Future Enhancements

- **Online Payment Gateway Integration:** Add live payment processing via Stripe or Razorpay.
- **Product Reviews & Ratings:** Allow verified buyers to leave reviews and star ratings.
- **Wishlist Management:** Save favorite products to a user wishlist for later purchasing.
- **Coupon & Discount System:** Implement promo codes and promotional pricing during checkout.
- **Email Notifications:** Automated transactional emails for order placement and status changes.
- **Production Cloud Deployment:** Host backend on Render/AWS and frontend on Vercel/Netlify.
- **Analytics Dashboard:** Graphical sales reports and revenue charts for administrators.

---

## Author

**Sanjith K S**

- **GitHub:** [mrsanjith95](https://github.com/mrsanjith95)
- **LinkedIn:** [Sanjith K S](https://www.linkedin.com/in/sanjith-k-s-77b958325/)
