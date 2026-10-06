# WadrobeWave — Express + MongoDB + React (+ Stripe, Admin, Ratings)



## Features

- Product catalog with a searchable grid, detail pages, and size selection
- 5-star product ratings (one vote per product per browser)
- Persistent server-side cart with quantity controls
- Real checkout via Stripe Checkout (hosted payment page — no raw card data ever touches this codebase)
- Email/password accounts with JWT sessions
- Admin dashboard (role-gated) for adding, editing, and deleting products, including image uploads
- Dark, gold-accented UI matching a provided design


## Getting started
### Prerequisites

- Node.js (18+, works fine with Node 24)
- MongoDB (Atlas)
- A free Stripe account for checkout
- 
### 1. Server

```bash
cd server
npm install
cp .env.example .env
# fill in MONGODB_URI, JWT_SECRET, STRIPE_SECRET_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
npm run dev
```

The server seeds 8 starter products on first boot against an empty database, and creates one admin account from `ADMIN_EMAIL`/`ADMIN_PASSWORD` if no admin exists yet.

### 2. Client

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173**.

### Test payments

Use Stripe's test card: `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.

## API overview

| Route | Purpose |
|---|---|
| `GET /api/products` | List all products |
| `GET /api/products/:id` | Single product |
| `POST /api/products/:id/rate` | Submit a 1–5 star rating |
| `POST/PUT/DELETE /api/products` | Create/update/delete a product *(admin only)* |
| `GET/POST/PATCH/DELETE /api/cart` | Cart management |
| `POST /api/auth/signup` / `/login` / `GET /me` | Account creation, login, session check |
| `POST /api/upload` | Upload a product image *(admin only)* |
| `POST /api/checkout/create-session` | Create a Stripe Checkout session |



## License

MIT

