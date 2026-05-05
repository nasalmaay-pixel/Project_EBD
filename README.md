# CandleX - From Waste to Glow

A full-stack circular economy platform where sellers submit used cooking oil, CandleX processes it into aromatherapy candles, and buyers shop premium candle products.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- ShadCN-style reusable UI components
- Prisma ORM 7
- PostgreSQL
- JWT authentication

## Setup

1. Install dependencies:

```bash
npm install
```

2. Update `.env` if your local PostgreSQL credentials differ:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/candlex?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
```

3. Create and apply the database migration:

```bash
npx prisma migrate dev
```

4. Seed demo data:

```bash
npx prisma db seed
```

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo Users

- Admin: `admin@candlex.id` / `admin123`
- Seller: `seller@candlex.id` / `seller123`
- Buyer: `buyer@candlex.id` / `buyer123`

## Routes

- `/` - Awwwards-style landing page
- `/marketplace` - Candle listing
- `/marketplace/[id]` - Product detail
- `/sell-oil` - Jelantah submission flow
- `/checkout` - Cart and manual payment placeholder
- `/dashboard` - Seller and buyer dashboard
- `/admin` - Admin overview

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET|POST /api/products`
- `GET|PATCH|DELETE /api/products/[id]`
- `GET|POST|PATCH /api/oil-submissions`
- `GET|POST|PATCH /api/orders`
- `GET|POST|PATCH /api/cart`
- `GET /api/admin/users`
- `GET|POST /api/admin/products`
- `GET|PATCH /api/admin/orders`
- `GET|PATCH /api/admin/oil-submissions`
