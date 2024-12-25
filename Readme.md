# Chirag Auth Validator 🔧

A robust Node.js/TypeScript authentication system providing:

- **Secure OTP generation/validation**
- **JWT-based authentication**
- **Password reset flows**
- **Prisma-based database integration**
- **Redis caching for OTP/session management**

---

## 📙 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Requirements](#requirements)
4. [Environment Configuration](#environment-configuration)
5. [Local Development](#local-development)
   - [Database & Redis Setup](#database--redis-setup)
6. [Docker Deployment](#docker-deployment)
   - [Using Docker Compose](#using-docker-compose)
7. [Email Services](#email-services)
8. [Scripts & Commands](#scripts--commands)
9. [Testing via Swagger](#testing-via-swagger)
10. [Contributing](#contributing)
11. [License](#license)
12. [Contact](#contact)

---

## 🔎 Overview

**Chirag Auth Validator** is an all-in-one, developer-friendly solution for OTP-based email validation and JWT-based authentication. It uses **PostgreSQL** for persistent storage, **Redis** for caching, and integrates with **Prisma** for schema-based ORM functionality. The project also includes a Swagger UI hosted at [chiragcodes.com](https://chiragcodes.com) for easy API testing and documentation.

---

## ⚡ Features

- **OTP Generation & Validation**
- **JWT Authentication**
- **Password Reset**
- **Prisma Integration**
- **Redis Support**
- **Flexible Email Providers**

---

## ✅ Requirements

- **Node.js** (v16+ recommended)
- **pnpm** (for package management)
- **PostgreSQL** (local or via Docker)
- **Redis** (local or via Docker)
- **Docker & Docker Compose** (for containerized deployment)

---

## 🛠️ Environment Configuration

1. **Copy `.env.example` to `.env`:**
   ```bash
   cp .env.example .env
   ```
2. **Set the Environment Mode:**
   - For development:
     ```dotenv
     NODE_ENV="development"
     ```
   - For production:
     ```dotenv
     NODE_ENV="production"
     ```
3. **Fill in the required fields:**
   - `DATABASE_URL`: Connection string for PostgreSQL.
   - `REDIS_URL`: Connection string for Redis.
   - `JWT_SECRET`: Secret key for JWT tokens.
   - `RESEND_API_KEY`: API key for Resend email service.
4. **Keep `.env` private:**
   - Ensure `.env` is listed in `.gitignore` to avoid committing sensitive data.

---

## 🧑‍💻 Local Development

### Steps

1. **Install Dependencies:**
   ```bash
   pnpm install
   ```
2. **Prisma Migrations & Generation:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```
3. **Run Development Server:**
   ```bash
   pnpm run dev
   ```
   This starts the app on `PORT=8080` (by default) or whatever port you set in `.env`.

### Database & Redis Setup

- **PostgreSQL** (Local or Docker):

  ```bash
  docker run --name pg-container \
    -e POSTGRES_PASSWORD=mysecretpassword \
    -p 5432:5432 \
    -d postgres
  ```

  Or install locally and update `.env`:

  ```dotenv
  DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres?schema=public"
  ```

- **Redis** (Local or Docker):
  ```bash
  docker run --name redis-container \
    -p 6379:6379 \
    -d redis
  ```
  Or install locally and update `.env`:
  ```dotenv
  REDIS_URL="redis://localhost:6379"
  ```

---

## 🐳 Docker Deployment

### Using Docker Compose

Docker Compose simplifies running multiple containers (PostgreSQL, Redis, and your application) together.

1. **Ensure Your `.env` File is Configured**

   Update `.env` to reference the service names defined in `docker-compose.yml`:

   ```dotenv
   DATABASE_URL="postgresql://postgres:mysecretpassword@postgres:5432/postgres?schema=public"
   REDIS_URL="redis://redis:6379"
   ```

2. **Make the Entrypoint Script Executable**
   Ensure the `docker-entrypoint.sh` file is executable:

   ```bash
   chmod +x docker-entrypoint.sh
   ```

3. **Run the Containers**

   ```bash
   docker-compose up --build -d
   ```

4. **Apply Prisma Migrations**

   ```bash
   docker-compose exec app pnpm prisma migrate deploy
   docker-compose exec app pnpm prisma generate
   ```

5. **Verify the Setup**
   - **Check Logs (Optional):**
     ```bash
     docker-compose logs -f app
     ```
   - **Stop the Containers:**
     ```bash
     docker-compose down
     ```

---

## ✉️ Email Services

- **Resend**:
  - Set `RESEND_API_KEY` in `.env`.
  - The library uses this key to send OTP and password reset emails.

---

## 🚜 Scripts & Commands

| Command                         | Description                                                        |
| ------------------------------- | ------------------------------------------------------------------ |
| `pnpm install`                  | Install dependencies                                               |
| `pnpm run dev`                  | Start dev server on specified `PORT`                               |
| `pnpm run build`                | Compile TypeScript into `dist/`                                    |
| `pnpm run lint`                 | Run ESLint checks                                                  |
| `pnpm run lint:fix`             | Autofix lint errors where possible                                 |
| `pnpm run format`               | Format code with Prettier                                          |
| `pnpm prisma migrate deploy`    | Apply DB migrations in production                                  |
| `pnpm prisma generate`          | Re-generate Prisma client                                          |
| `docker build -t <image> .`     | Build Docker image from `Dockerfile`                               |
| `docker-compose up --build -d`  | Build & start all services (Postgres, Redis, app) in detached mode |
| `docker-compose exec app <cmd>` | Execute `<cmd>` inside the `app` container                         |
| `docker-compose logs -f app`    | Follow the logs of the `app` container                             |
| `docker-compose down`           | Stop & remove all containers, networks, and volumes                |

---

## 🔬 Testing via Swagger

1. **Hosted Swagger**

   - Test all API endpoints on [chiragcodes.com](https://chiragcodes.com).

2. **Local Swagger**
   - Update the `servers:` section in `openapi.yml` to:
     ```yaml
     servers:
       - url: http://localhost:8080/api
         description: Local Development Server
     ```
   - Then navigate to [http://localhost:8080/docs](http://localhost:8080/docs) to test endpoints.

---

## 🧬 Contributing

1. **Fork the Repo**

2. **Create a Branch**
   ```bash
   git checkout -b feature/new-feature
   ```
3. **Make Changes & Test**

4. **Commit & Push**
   ```bash
   git commit -m "Add new feature"
   git push origin feature/new-feature
   ```
5. **Open a Pull Request** on GitHub

---

## 📒 License

This project is licensed under the [MIT License](./LICENSE).

---

## 📧 Contact

- **Website**: [chiragcodes.com](https://chiragcodes.com)
- **Email**: [chirag@chiragcodes.com](mailto:chirag@chiragcodes.com)
- **Alternate**: [er.chiragsharma.atemail@gmail.com](mailto:er.chiragsharma.atemail@gmail.com)

For issues or suggestions, feel free to open a GitHub issue or reach out via email.
