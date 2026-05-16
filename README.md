# GrowPal

GrowPal is a full-stack plant and gardening platform: product discovery, shopping, personalized plant experiences, expert consultation, and an admin area for managing users, products, and feedback. The app combines a **Next.js** frontend with **MySQL** (via **Prisma**) and **PHP** endpoints under XAMPP for legacy auth and email flows.

**Repository:** [github.com/GrowPal-team/GrowPal](https://github.com/GrowPal-team/GrowPal)

---

## Tech stack

| Layer | Technology |
|--------|------------|
| UI | Next.js (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, Radix UI, shadcn-style components |
| Data | Prisma ORM, MySQL |
| Auth / mail bridge | PHP (`api/`, `includes/`) + Next API routes |
| Maps | Leaflet / React-Leaflet (climate zones) |

---

## Features (overview)

- **Shop** — catalog, product detail, cart, checkout, wishlist  
- **Account** — login, register, password reset, email verification (PHP + APIs)  
- **My plant / My space** — gamified plant journey and space profiles  
- **Expert area** — dashboard, chat threads, billing, profile  
- **Community feedback** — ratings and featured feedback  
- **Admin** — protected routes for users, products, experts, feedback (`/admin`)  
- **Marketing pages** — impact, story, workshops, climate zones, etc.

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)  
- **npm**  
- **XAMPP** (or similar) with **Apache + MySQL + PHP**  
- **Composer** (for PHP dependencies such as PHPMailer)

---

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/GrowPal-team/GrowPal.git
cd GrowPal
```

### 2. Install Node dependencies

```bash
npm install
```

### 3. Environment variables

Create a `.env` file in the project root (do not commit secrets). You can start from `.env.example`. At minimum Prisma expects:

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/DATABASE_NAME"
```

Adjust user, password, host, port, and database name to match your MySQL setup.

### 4. Database

```bash
npx prisma generate
npx prisma db push
```

Optional: use `npm run verify-db` to sanity-check DB connectivity.

Prepare production-ready shop data and reward codes:

```bash
npm run setup:reward-codes
npm run seed:shop
```

PHP-side migrations and seeds (admin, feedback, etc.) live under `scripts/` when you need them.

### 5. Run the Next.js app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. PHP / XAMPP

Point your virtual host or document root so that PHP files under this project (`api/`, `index.php`, etc.) are served by Apache. Configure DB credentials in `config/database.php` (and related config) to match your environment.

For the Next.js API bridge, set:

```env
PHP_API_BASE_URL="http://localhost/GrowPal/api"
GROWPAL_SITE_URL="http://localhost:3000"
```

---

## NPM scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js in development (webpack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run verify-db` | Quick DB check |
| `npm run seed:shop` | Seed or refresh the Prisma shop catalog |
| `npm run setup:reward-codes` | Create the reward code table used by My Plant coupons |
| `npm run prepare:deploy` | Verify DB, prepare reward codes, seed shop data, and build production |

---

## Project layout (high level)

```
app/           Next.js App Router pages and API routes
components/    React components (UI, admin, expert, home, …)
lib/           Shared TS utilities (Prisma, sessions, shop, …)
prisma/        Schema and migrations
api/           PHP endpoints (auth, profile, …)
config/        PHP config (database, email)
public/        Static assets
scripts/       PHP/Node maintenance and seed scripts
```

---

## What GitHub does (and does not) include

Cloning gives you the **source tree** tracked in Git. Teammates still need to create or install locally:

| Item | Action |
|------|--------|
| `node_modules/` | Run `npm install` |
| `.next/` | Created when you run `npm run dev` or `npm run build` |
| `.env` | Create from your team’s template; never commit secrets |
| `vendor/` (PHP) | Run `composer install` in the project root (uses `composer.json` / `composer.lock`) |

If Apache/PHP cannot find PHPMailer or other Composer packages, `vendor/` is almost always missing until you run `composer install`.

---

## Production deployment

GrowPal is a hybrid full-stack app. It is not suitable for GitHub Pages because it needs:

- Next.js server rendering and API routes
- PHP endpoints for auth/mail bridge
- MySQL
- Persistent uploads

### Environment checklist

Make sure production defines at least:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/growpal_db"
DB_HOST="HOST"
DB_PORT="3306"
DB_NAME="growpal_db"
DB_USERNAME="USER"
DB_PASSWORD="PASSWORD"
DB_ROOT_PASSWORD="ROOT_PASSWORD"
GROWPAL_SITE_URL="https://your-domain.example"
PHP_API_BASE_URL="https://your-domain.example/php-api"
SESSION_SECRET="replace-with-a-long-random-secret"
GROWPAL_CODE_SECRET="replace-with-a-second-random-secret"
SMTP_ENABLED="true"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USERNAME="your-smtp-user"
SMTP_PASSWORD="your-smtp-password"
SMTP_SECURE="tls"
MAIL_FROM_EMAIL="no-reply@your-domain.example"
MAIL_FROM_NAME="GrowPal"
MAIL_REPLY_TO="support@your-domain.example"
```

### Docker option

This repository now includes:

- `Dockerfile` for Next.js production
- `docker/php/Dockerfile` for PHP + Apache
- `docker/nginx/default.conf` to route `/` to Next and `/php-api/*` to PHP
- `docker-compose.yml` for `proxy + next + php + mysql`

Typical deployment flow:

```bash
cp .env.example .env
docker compose build
docker compose up -d db
docker compose run --rm next npm run prepare:deploy
docker compose up -d php next proxy
```

Then point your domain to the server and set:

```env
GROWPAL_SITE_URL="https://your-domain.example"
PHP_API_BASE_URL="https://your-domain.example/php-api"
```

### Railway deployment

Railway is the easiest match for the current GrowPal stack because it supports MySQL directly.

Recommended layout in one Railway project:

1. `db` service: provision **MySQL**
2. `php` service: deploy from `docker/php/Dockerfile`
3. `next` service: deploy from root `Dockerfile`

Suggested flow:

1. Push this repo to GitHub.
2. In Railway, create a new project from the repo.
3. Add a MySQL service.
4. Create a `php` service using the repo and set its Dockerfile path to `docker/php/Dockerfile`.
5. Create a `next` service using the repo root `Dockerfile`.
6. Set the `next` service as the public service and attach a domain or use the generated Railway subdomain.
7. Set env vars on both app services:

```env
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/growpal_db
DB_HOST=HOST
DB_PORT=3306
DB_NAME=growpal_db
DB_USERNAME=USER
DB_PASSWORD=PASSWORD
GROWPAL_SITE_URL=https://your-next-service.up.railway.app
PHP_API_BASE_URL=https://your-php-service.up.railway.app/api
SESSION_SECRET=replace-with-a-long-random-secret
GROWPAL_CODE_SECRET=replace-with-a-second-random-secret
```

Then run on the `next` service once:

```bash
npm run prepare:deploy
```

Health checks:

- Next: `/api/health`
- PHP: `/api/health.php`

Reference: [Railway deployment guides](https://docs.railway.com/guides/docker-compose)

### Render deployment

Render can also host GrowPal, but it is slightly more manual than Railway because you must wire multiple services yourself.

Recommended layout:

1. `growpal-mysql`: private MySQL service with persistent disk
2. `growpal-php`: private Docker service using `docker/php/Dockerfile`
3. `growpal-next`: public Docker web service using root `Dockerfile`

Set on `growpal-next`:

```env
GROWPAL_SITE_URL=https://your-render-domain.onrender.com
PHP_API_BASE_URL=http://growpal-php:80/api
```

Set matching database and SMTP vars on both app services.

After first deploy, open a Render shell for the Next service and run:

```bash
npm run prepare:deploy
```

Use `/api/health` as the public health check path.

References:

- [Render Docker docs](https://render-web.app.render.com/docs/docker)
- [Render MySQL docs](https://render.com/docs/deploy-mysql)

### Shop readiness notes

- The Next.js storefront under `/shop` is the production storefront.
- Legacy PHP `shop.php` / `cart.php` / `checkout.php` should be treated as fallback or migration-era pages.
- Catalog image fallbacks were updated to use deploy-safe remote images when legacy `/Web/*` and `/images/*` assets are missing.

**Multiple people, one computer:** set Git identity **inside this repo** so commits match the right GitHub account:

```bash
git config user.name "Your GitHub name"
git config user.email "your-verified-email@example.com"
```

---

## License

Private project — all rights reserved unless otherwise stated by the owners.
