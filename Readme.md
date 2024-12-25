# Chirag Auth Validator

A robust Node.js/TypeScript authentication system providing:

- Secure OTP generation/validation  
- JWT-based authentication  
- Password reset flows  
- Prisma-based database integration  
- Redis caching for OTP/session management  

<br />

## Table of Contents

1. [Overview](#overview)  
2. [Features](#features)  
3. [Requirements](#requirements)  
4. [Environment Configuration](#environment-configuration)  
5. [Local Development](#local-development)  
   - [Database & Redis Setup](#database--redis-setup)  
6. [Docker Deployment](#docker-deployment)  
   - [Steps to Build & Run](#steps-to-build--run)  
7. [Email Services](#email-services)  
8. [Scripts & Commands](#scripts--commands)  
9. [Testing via Swagger](#testing-via-swagger)  
10. [Contributing](#contributing)  
11. [License](#license)  
12. [Contact](#contact)  

<br />

## Overview

**Chirag Auth Validator** is an all-in-one, developer-friendly solution for OTP-based email validation and JWT-based authentication. It uses **PostgreSQL** for persistent storage, **Redis** for caching, and integrates with **Prisma** for schema-based ORM functionality.

<br />

## Features

- **OTP Generation & Validation**  
- **JWT Authentication**  
- **Password Reset**  
- **Prisma Integration**  
- **Redis Support**  
- **Flexible Email Providers**  

<br />

## Requirements

- **Node.js** (v16+ recommended)  
- **pnpm** (for package management)  
- **PostgreSQL** (local or via Docker)  
- **Redis** (local or via Docker)  
- (Optional) **Docker** for containerized deployment  

<br />

## Environment Configuration

1. **Copy `.env.example` to `.env`:**  
   ```bash
   cp .env.example .env
   ```
2. Fill in the required fields:
   - `DATABASE_URL`: Connection string for PostgreSQL.
   - `REDIS_URL`: Connection string for Redis.
   - `JWT_SECRET`: Secret key for JWT tokens.
   - `RESEND_API_KEY` or other provider keys for email services.
3. **Keep `.env` private:**  
   Make sure your `.env` is listed in `.gitignore` to avoid committing sensitive data.

<br />

## Local Development

### Install Dependencies:
```bash
pnpm install
```

### Prisma Migrations & Generation:
```bash
npx prisma migrate dev
npx prisma generate
```

### Run Development Server:
```bash
pnpm run dev
```
This starts the app on `PORT=8080` (by default) or whatever port is in `.env`.

### Database & Redis Setup

#### PostgreSQL:
```bash
docker run --name pg-container \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -p 5432:5432 \
  -d postgres
```
Or install locally and update:
```dotenv
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres?schema=public"
```

#### Redis:
```bash
docker run --name redis-container \
  -p 6379:6379 \
  -d redis
```
Or install locally and update:
```dotenv
REDIS_URL="redis://localhost:6379"
```

<br />

## Docker Deployment

If you want to run everything in Docker containers:

### Steps to Build & Run

1. **Create `.env`:**
   ```bash
   cp .env.example .env
   ```
   Update the placeholders with valid credentials.

2. **Build Docker Image:**
   ```bash
   docker build -t chirag-auth-validator .
   ```

3. **Run DB & Redis:**
   ```bash
   docker run --name pg-container \
     -e POSTGRES_PASSWORD=mysecretpassword \
     -p 5432:5432 \
     -d postgres

   docker run --name redis-container \
     -p 6379:6379 \
     -d redis
   ```

4. **Run the App Container:**
   ```bash
   docker run --name chirag-auth-app \
     --env-file .env \
     -p 8080:8080 \
     chirag-auth-validator
   ```

5. **Apply Migrations (inside container):**
   ```bash
   docker exec -it chirag-auth-app npx prisma migrate dev
   docker exec -it chirag-auth-app npx prisma generate
   ```

<br />

## Email Services

- **Resend**, **Postmark**, or another provider:
  - Specify `RESEND_API_KEY` (or equivalent) in `.env`.
  - The library uses your credentials to send OTP and reset emails.

<br />

## Scripts & Commands

| Command                 | Description                              |
|-------------------------|------------------------------------------|
| `pnpm install`          | Install dependencies                    |
| `pnpm run dev`          | Start development server on specified PORT |
| `pnpm run build`        | Compile TypeScript into `dist/`         |
| `pnpm run lint`         | Run ESLint checks                       |
| `pnpm run lint:fix`     | Autofix lint errors where possible      |
| `pnpm run format`       | Format code with Prettier               |
| `npx prisma migrate dev`| Apply DB migrations in dev environment  |
| `npx prisma generate`   | Re-generate Prisma client               |
| `docker build -t <image> .`| Build Docker image from Dockerfile   |
| `docker run ...`        | Run containers in Docker                |

<br />

## Testing via Swagger

### Hosted Swagger
You can test all API endpoints directly on `chiragcodes.com`.

### Local Swagger
If running the project locally, you may need to update the `servers:` section in `openapi.yml` to:
```yaml
servers:
  - url: http://localhost:8080/api
    description: Local Development Server
```
This way, you can test endpoints at `http://localhost:8080/docs` (or wherever you set up Swagger UI).

<br />

## Contributing

1. **Fork the Repo**
2. **Create a Branch**
   ```bash
   git checkout -b feature/new-feature
   ```
3. **Make Changes & Commit**
   ```bash
   git commit -m "Add new feature"
   ```
4. **Push to Your Fork**
   ```bash
   git push origin feature/new-feature
   ```
5. **Open a Pull Request**

<br />

## License

This project is licensed under the MIT License.

<br />

## Contact

- Website: [chiragcodes.com](http://chiragcodes.com)  
- Email: chirag@chiragcodes.com  
- Alternate: er.chiragsharma.atemail@gmail.com
