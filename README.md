# Finance Data Processing and Access Control Backend

A robust, secure, and documented finance backend built with Node.js, Express, and SQLite. This project implements a full-featured API with role-based access control (RBAC), data filtering, and dashboard analytics.

## Tech Stack

- **Node.js & Express.js**: Core framework for high-performance server-side logic.
- **SQLite (better-sqlite3)**: Chosen for its performance, simplicity (no external database server needed), and perfect fit for assessment/demonstration environments.
- **JWT (json-web-token)**: Secure authentication and session management.
- **Bcryptjs**: Robust password hashing for user security.
- **Express Validator**: Comprehensive request validation to ensure data integrity.
- **Security Middleware**: `helmet` for security headers, `cors` for cross-origin access, and `express-rate-limit` for DDoS protection.
- **Morgan**: Detailed request logging.

## Design Decisions

- **Soft Delete**: Transactions are never truly removed from the database; an `is_deleted` flag is used. This ensures auditability and historical data preservation.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions are enforced at the middleware layer (`roleGuard`), separating authentication from authorization.
- **Service Layer Pattern**: Business logic is decoupled from routes and controllers into dedicated services, making the codebase highly testable and maintainable.
- **Standardized Response Format**: All API responses follow a strict `{ success: true|false, data|error: ... }` structure for a predictable client integration.

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. **Seed the Database**:
   Initialize the SQLite database with sample users and transactions:
   ```bash
   node seed.js
   ```

4. **Start the Server**:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3000` (by default).

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port number for the server | `3000` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key` |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |
| `DATABASE_URL` | SQLite database file path | `database.sqlite` |
| `NODE_ENV` | Environment (development/production) | `development` |

## Role Permissions

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| View Transactions | ✅ | ✅ | ✅ |
| View Dashboard | ❌ | ✅ | ✅ |
| Create/Edit/Delete Transactions | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |

*Note: Inactive users are blocked from all authenticated routes.*

## API Reference

### Authentication
| Method | Path | Auth | Role | Request Body |
|--------|------|------|------|--------------|
| `POST` | `/api/auth/register` | No | - | `{ name, email, password }` |
| `POST` | `/api/auth/login` | No | - | `{ email, password }` |
| `GET` | `/api/auth/me` | Yes | All | - |

### User Management (Admin Only)
| Method | Path | Auth | Role | Request Body |
|--------|------|------|------|--------------|
| `GET` | `/api/users` | Yes | Admin | - |
| `GET` | `/api/users/:id` | Yes | Admin | - |
| `PUT` | `/api/users/:id/role` | Yes | Admin | `{ role: 'admin'\|'analyst'\|'viewer' }` |
| `PUT` | `/api/users/:id/status` | Yes | Admin | `{ status: 'active'\|'inactive' }` |
| `DELETE` | `/api/users/:id` | Yes | Admin | - |

### Transactions
| Method | Path | Auth | Role | Query Params / Body |
|--------|------|------|------|---------------------|
| `GET` | `/api/transactions` | Yes | All | `?type=income&page=1&limit=10&search=rent` |
| `GET` | `/api/transactions/:id` | Yes | All | - |
| `POST` | `/api/transactions` | Yes | Admin | `{ amount, type, category, date, notes }` |
| `PUT` | `/api/transactions/:id` | Yes | Admin | `{ amount, type, category, date, notes }` |
| `DELETE` | `/api/transactions/:id` | Yes | Admin | - |

### Dashboard
| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `GET` | `/api/dashboard/summary` | Yes | Admin, Analyst | Financial summary (income, expense, balance) |
| `GET` | `/api/dashboard/by-category` | Yes | Admin, Analyst | Breakdown by category |
| `GET` | `/api/dashboard/trends` | Yes | Admin, Analyst | Monthly trends (last 12 months) |
| `GET` | `/api/dashboard/recent` | Yes | Admin, Analyst | Last 10 transactions |

## Assumptions Made

- **Transaction Currency**: All amounts are treated as numeric values; currency type is assumed to be unified across the system.
- **Date Format**: Dates are expected in ISO (YYYY-MM-DD) format for all transaction inputs and filters.
- **Role Hierarchy**: Roles are strictly checked; "Admin" does not implicitly inherit "Analyst" unless explicitly granted in `roleGuard(['analyst', 'admin'])`.
- **Soft Delete**: Deleted transactions should never appear in dashboard analytics or list views.

## Example curl Commands

### 1. Register User
**PowerShell:**
```powershell
$body = @{ name = "New User"; email = "newuser@example.com"; password = "Password@123" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/auth/register" -ContentType "application/json" -Body $body
```

**Bash:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name": "New User", "email": "newuser@example.com", "password": "Password@123"}'
```

### 2. Login
**PowerShell:**
```powershell
$body = @{ email = "admin@finance.com"; password = "Admin@123" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/auth/login" -ContentType "application/json" -Body $body
```

**Bash:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@finance.com", "password": "Admin@123"}'
```

### 3. Get Dashboard Summary (Requires Token)
**PowerShell:**
```powershell
$headers = @{ Authorization = "Bearer <YOUR_TOKEN>" }
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/dashboard/summary" -Headers $headers
```

**Bash:**
```bash
curl -X GET http://localhost:3000/api/dashboard/summary \
     -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 4. Create Transaction (Admin Only)
**PowerShell:**
```powershell
$headers = @{ Authorization = "Bearer <YOUR_TOKEN>" }
$body = @{ amount = 1200.50; type = "expense"; category = "Rent"; date = "2024-03-01"; notes = "Monthly Rent" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/transactions" -Headers $headers -ContentType "application/json" -Body $body
```

**Bash:**
```bash
curl -X POST http://localhost:3000/api/transactions \
     -H "Authorization: Bearer <YOUR_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"amount": 1200.50, "type": "expense", "category": "Rent", "date": "2024-03-01", "notes": "Monthly Rent"}'
```
