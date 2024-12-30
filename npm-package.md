# @thischirag/auth 🔧

**Latest Version: 1.0.3**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/npm/v/@thischirag/auth)
![Node.js](https://img.shields.io/badge/node.js-16%2B-green.svg)

**Chirag Auth Validator** is a robust Node.js/TypeScript authentication system available as an npm package. It provides secure OTP generation/validation, JWT-based authentication, password reset flows, Prisma-based database integration, Redis caching for OTP/session management, and rate limiting to protect your application from excessive requests. Easily integrate it into your projects to handle user authentication and security with ease.

You can directly test all the endpoints at [auth.chiragcodes.com](https://auth.chiragcodes.com) and check what the required body should be sent by the user.

## 📙 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Available Endpoints](#available-endpoints)
   - [Authentication Routes](#authentication-routes)
   - [Password Management](#password-management)
   - [Protected Routes](#protected-routes)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Environment Configuration](#environment-configuration)
7. [Prisma Integration](#prisma-integration)
8. [Rate Limiting](#rate-limiting)
9. [Local Development](#local-development)
   - [Database & Redis Setup](#database--redis-setup)
10. [Email Services](#email-services)
11. [Usage](#usage)
    - [Import Routes](#import-routes)
    - [Middleware](#middleware)
    - [Controllers](#controllers)
    - [TypeScript Usage](#typescript-usage)
12. [Testing](#testing)
13. [Contributing](#contributing)
14. [License](#license)
15. [Contact](#contact)
16. [Package Contents](#package-contents)

---

## 🔎 Overview

**Chirag Auth Validator** is an all-in-one, developer-friendly solution for OTP-based email validation and JWT-based authentication. It uses **PostgreSQL** for persistent storage, **Redis** for caching, and integrates with **Prisma** for schema-based ORM functionality. The package also includes comprehensive documentation to facilitate easy integration and usage.

For testing purposes, you can access the Swagger UI at [auth.chiragcodes.com](https://auth.chiragcodes.com).

---

## ⚡ Features

- **OTP Generation & Validation**
- **JWT Authentication**
- **Password Reset**
- **Prisma Integration**
- **Redis Support**
- **Rate Limiting**
- **Flexible Email Providers**
- **Configurable and Easy to Use**

---

## Available Endpoints

### Authentication Routes

| Method | Endpoint                          | Description                     |
| ------ | --------------------------------- | ------------------------------- |
| POST   | `/api/v1/auth/login`              | Login with email/username       |
| POST   | `/api/v1/auth/signup/request-otp` | Request OTP for sign-up         |
| POST   | `/api/v1/auth/signup/verify-otp`  | Verify OTP and complete sign-up |

### Password Management

| Method | Endpoint                                   | Description                     |
| ------ | ------------------------------------------ | ------------------------------- |
| POST   | `/api/v1/users/password/request-otp`       | Request OTP for password change |
| POST   | `/api/v1/users/password/verify-otp`        | Verify OTP and change password  |
| POST   | `/api/v1/users/password/reset/request-otp` | Request OTP for password reset  |
| POST   | `/api/v1/users/password/reset/verify-otp`  | Verify OTP and reset password   |

### Protected Routes

| Method | Endpoint       | Description            |
| ------ | -------------- | ---------------------- |
| GET    | `/api/v1/home` | Access protected route |

**Note:** The above endpoints are predefined. If you prefer to use different route paths or need more control over your routing, you can directly import and use the controllers provided by the package. Refer to the [Usage](#usage) section to see how to add your own paths.

---

## ✅ Prerequisites

- **Node.js** (v16+ recommended)
- **pnpm** or **npm** (for package management)
- **PostgreSQL** (local installation)
- **Redis** (local installation)

---

## 📦 Installation

Install the package via npm or pnpm:

```bash
npm install @thischirag/auth
```

or

```bash
pnpm add @thischirag/auth
```

---

## 🛠️ Environment Configuration

1. **Copy `.env.example` to `.env`:**

   ```bash
   cp node_modules/@thischirag/auth/.env.example .env
   ```

   _Note: Ensure that this command does not overwrite your existing `.env` file. If you already have a `.env` file, consider backing it up or merging the contents instead._

2. **Fill in the Required Fields:**

   ```dotenv
   # JWT Secret Key
   JWT_SECRET="your_jwt_secret_here"

   # Resend API Key
   RESEND_API_KEY="your_resend_api_key_here"

   # Application Port
   PORT=3000

   # Environment
   NODE_ENV="development"

   # Salt Rounds for Password Hashing
   SALT_ROUNDS=10

   # Length of OTP for Email Verification
   OTP_LENGTH=6

   # JWT Configuration
   JWT_ACCESS_TOKEN_EXPIRATION=3600
   JWT_ISSUER="https://yourdomain.com"
   JWT_AUDIENCE="yourdomain.com"
   JWT_TTL=3600

   # OTP TTL
   OTP_TTL=300

   # Your Domain Name
   YOUR_DOMAIN="your_email@yourdomain.com"

   # Database Connection String
   # DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?schema=public"

   # Redis Connection String
   # REDIS_URL="redis://redis:6379"

   # Debugging (Optional)
   DEBUG="true"
   ```

3. **Keep `.env` Private:**

   Ensure `.env` is listed in `.gitignore` to avoid committing sensitive data.

---

## 📚 Required Environment Variables

Ensure the following variables are set in your `.env` file:

- `JWT_SECRET`
- `RESEND_API_KEY`
- `PORT`
- `NODE_ENV`
- `SALT_ROUNDS`
- `OTP_LENGTH`
- `JWT_ACCESS_TOKEN_EXPIRATION`
- `JWT_ISSUER`
- `JWT_AUDIENCE`
- `JWT_TTL`
- `OTP_TTL`
- `YOUR_DOMAIN`
- `DATABASE_URL`
- `REDIS_URL`

You can refer to `.env.example` for the complete list and default values.

---

## 🛠️ Prisma Integration

This package uses Prisma for database operations. Make sure to install @prisma/client before moving forward. Follow the steps below to integrate the provided schema. You have two options:

### Option 1: Copy the Schema File

1. **Copy the Schema File from the Package:**

   ```bash
   mkdir -p prisma && cp node_modules/@thischirag/auth/prisma/schema.prisma prisma/schema.prisma
   ```

2. **Run Prisma Migrations:**

   Apply the migrations to your database:

   ```bash
   npx prisma migrate dev --name init --schema=prisma/schema.prisma
   ```

3. **Generate Prisma Client:**

   Generate the Prisma client for your project:

   ```bash
   npx prisma generate --schema=prisma/schema.prisma
   ```

### Option 2: Directly Run Prisma Commands with Provided Schema Path

1. **Run Prisma Migrations and Generate:**

   Apply the migrations and generate the Prisma client using the schema path provided by the package:

   ```bash
   npx prisma migrate dev --name init --schema=node_modules/@thischirag/auth/prisma/schema.prisma
   npx prisma generate --schema=node_modules/@thischirag/auth/prisma/schema.prisma
   ```

2. **Ensure Model Naming:**

   Ensure the Prisma schema includes the `Chirag_Auth_User` model as shown below:

   ```prisma
   model Chirag_Auth_User {
     id         String    @id @default(uuid())
     username   String    @unique @db.VarChar(50)
     email      String    @unique @db.VarChar(255)
     password   String    @db.VarChar(255)
     name       String    @db.VarChar(100)
     created_at DateTime  @default(now()) @db.Timestamptz(6)
     updated_at DateTime  @updatedAt @db.Timestamptz(6)
   }
   ```

---

## 🛡️ Rate Limiting

To protect your application from excessive requests, **Chirag Auth Validator** includes rate limiting functionality using Redis.

---

### Database & Redis Setup

- **PostgreSQL** (Local Installation):

  Ensure PostgreSQL is installed on your machine. Update `.env` with your PostgreSQL credentials:

  ```dotenv
  DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres?schema=public"
  ```

- **Redis** (Local Installation):

  Ensure Redis is installed on your machine. Update `.env` with your Redis credentials:

  ```dotenv
  REDIS_URL="redis://localhost:6379"
  ```

---

## ✉️ Email Services

- **Resend**:
  - Set `RESEND_API_KEY` in `.env`.
  - The library uses this key to send OTP and password reset emails.

---

## 📚 Usage

### Import Routes

Integrate the authentication routes into your Express application:

```javascript
const express = require('express');
const { userRoutes } = require('@thischirag/auth');
require('dotenv').config();

const app = express();
app.use(express.json());

// Use the routes provided by the package
app.use('/api', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### Middleware

The `/api/v1/home` endpoint already utilizes the `authenticateToken` middleware provided by the package. You can apply this middleware to other routes as needed to protect them.

#### Using Middleware in Other Routes

```javascript
const { authenticateToken } = require('@thischirag/auth');

app.use('/api/v1/secure', authenticateToken, secureRoutes);
```

### Controllers

If you prefer to use different route paths or need more control over your routing, you can directly import and use the controllers provided by the package.

#### Available Controllers:

- **Middleware:**

  - `authenticateToken`

- **Prisma Utilities:**

  - `getPrismaClient`
  - `setPrismaClient`

- **Authentication Controllers:**

  - `changePassword`
  - `forgotPassword`
  - `requestOtp`
  - `verifyOtp`
  - `verifyOtpForChangePassword`
  - `verifyOtpForgotPassword`

- **Other Controllers:**
  - `home`
  - `login`

#### Example: Using Controllers Directly

```javascript
const express = require('express');
const {
  authenticateToken,
  changePassword,
  forgotPassword,
  requestOtp,
  verifyOtp,
  verifyOtpForChangePassword,
  verifyOtpForgotPassword,
  home,
  login,
} = require('@thischirag/auth');

require('dotenv').config();

const app = express();
app.use(express.json());

// Custom Routes
app.post('/custom/login', login);
app.post('/custom/signup/request-otp', requestOtp);
app.post('/custom/signup/verify-otp', verifyOtp);
app.post('/custom/password/change', authenticateToken, changePassword);
app.post('/custom/password/forgot', forgotPassword);
app.post('/custom/password/forgot/verify-otp', verifyOtpForgotPassword);

// Protected Route
app.get('/custom/home', authenticateToken, home);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### TypeScript Usage

**Chirag Auth Validator** is fully compatible with TypeScript, providing type definitions for enhanced developer experience. Here's how you can integrate it into a TypeScript project:

1. **Install TypeScript and Necessary Types:**

   If you haven't already, install TypeScript and types for Express:

   ```bash
   npm install typescript @types/node @types/express --save-dev
   ```

   or

   ```bash
   pnpm add typescript @types/node @types/express --save-dev
   ```

2. **Configure TypeScript:**

   Initialize a `tsconfig.json` if you don't have one:

   ```bash
   npx tsc --init
   ```

3. **Import and Use in TypeScript:**

   Here's an example of how to use **Chirag Auth Validator** in a TypeScript Express application:

   ```typescript
   import express, { Request, Response } from 'express';
   import { userRoutes, authenticateToken } from '@thischirag/auth';
   import dotenv from 'dotenv';

   dotenv.config();

   const app = express();
   app.use(express.json());

   // Use the routes provided by the package
   app.use('/api', userRoutes);

   // Example of a protected route
   app.get('/api/v1/home', authenticateToken, (req: Request, res: Response) => {
     res.send('Access to protected route granted!');
   });

   const PORT: number = Number(process.env.PORT) || 3000;
   app.listen(PORT, () => {
     console.log(`Server is running on port ${PORT}`);
   });
   ```

4. **Using Controllers Directly in TypeScript:**

typescript

```typescript
import express, { Request, Response } from 'express';
import {
  authenticateToken,
  changePassword,
  forgotPassword,
  requestOtp,
  verifyOtp,
  verifyOtpForChangePassword,
  verifyOtpForgotPassword,
  home,
  login,
} from '@thischirag/auth';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Custom Routes
app.post('/custom/login', login);
app.post('/custom/signup/request-otp', requestOtp);
app.post('/custom/signup/verify-otp', verifyOtp);
app.post('/custom/password/change', authenticateToken, changePassword);
app.post('/custom/password/forgot', forgotPassword);
app.post('/custom/password/forgot/verify-otp', verifyOtpForgotPassword);

// Protected Route
app.get('/custom/home', authenticateToken, home);

const PORT: number = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

Ensure that your TypeScript files have the `.ts` extension and are properly compiled before running.

🧬 Testing
For immediate testing, you can access the Swagger UI at [auth.chiragcodes.com](https://auth.chiragcodes.com).

Additionally, you can test the package locally or in your environment by making API requests to the routes mentioned above.

- **Local:** Use `http://localhost:<PORT>` as the base URL.
- **Production:** Replace with your domain, e.g., `https://yourdomain.com`.

Use tools like [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/) to interact with the API endpoints.

📒 License
This project is licensed under the [MIT License](./LICENSE).

📧 Contact

- **Website**: [chiragcodes.com](https://chiragcodes.com)
- **Email**: [chirag@chiragcodes.com](mailto:chirag@chiragcodes.com)
- **Alternate**: [er.chiragsharma.atemail@gmail.com](mailto:er.chiragsharma.atemail@gmail.com)

For issues or suggestions, feel free to [open an issue](https://github.com/ThisChirag/chirag-auth-validator/issues) in the GitHub repository or reach out via email.

📄 Package Contents
The **@thischirag/auth** package includes:

- **License**: MIT License.
- **README.md**: This documentation file.
- **Prisma Schema**: Located in `node_modules/@thischirag/auth/prisma/schema.prisma`.

Ensure you have copied the schema file to your project's Prisma directory and applied the necessary migrations as outlined in the [Prisma Integration](#prisma-integration) section.

---

_Happy Coding! 🚀_
