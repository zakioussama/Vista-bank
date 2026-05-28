# Vista Data Migration Tool

Internal enterprise web application for **Vista Bank** that migrates user data from a legacy banking system to a new platform safely and efficiently.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express.js, Sequelize ORM |
| Frontend | React.js, Vite, Tailwind CSS |
| Database | MySQL |
| Auth | JWT (Admin & Operator roles) |

## Features

- **Authentication** – JWT login/logout, protected routes, role-based access
- **Dashboard** – Migration stats, charts, recent history
- **File Import** – CSV/Excel drag-and-drop upload with preview
- **Data Validation** – Required fields, duplicate emails, invalid phones/dates
- **Field Mapping** – Interactive dropdown mapping, reusable saved mappings
- **Migration Engine** – Start, cancel, rollback, progress tracking, reports
- **Logging** – Searchable, filterable, paginated system logs (Admin)
- **User Management** – Create and manage users (Admin)

## Project Structure

```
Vista bank/
├── backend/          # Express REST API
├── frontend/         # React SPA
├── database/         # SQL schema
├── sample-data/      # Sample CSV for testing
└── README.md
```

## Prerequisites

- Node.js 18+
- MySQL 8+

## Setup

### 1. Database

Create the MySQL database:

```sql
CREATE DATABASE vista_migration CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or run `database/schema.sql`.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials
npm install
npm run db:seed
npm run dev
```

API runs at **http://localhost:5000**

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vistabank.com | Admin@123 |
| Operator | operator@vistabank.com | Operator@123 |

## Sample Workflow

1. Log in as **operator@vistabank.com**
2. Go to **File Import** → upload `sample-data/banking_customers.csv`
3. Go to **Validation** → select the file → **Run Validation**
4. Go to **Field Mapping** → use **Banking CSV Direct Mapping** (seeded) or **Auto-suggest from file**
5. Go to **Migrations** → **New Migration** → **Preview Transformation** → **Create** → **Start**
6. Log in as **admin** to view **System Logs** and **Users**

### Banking CSV columns

`id`, `migration_id`, `customer_id`, `first_name`, `last_name`, `email`, `phone_number`, `account_number`, `account_type`, `balance`, `currency`, `branch_code`, `account_status`, `created_at`

Legacy codes (e.g. `CHK` → `checking`, `ACT` → `active`) are transformed automatically via value mappings.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/dashboard/stats | Dashboard statistics |
| POST | /api/files/upload | Upload CSV/Excel |
| POST | /api/validation/:fileId | Validate file |
| GET/POST | /api/mappings | Field mappings CRUD |
| GET/POST | /api/migrations | Migrations CRUD + start/cancel/rollback |
| GET | /api/logs | System logs (Admin) |
| GET/POST | /api/users | User management (Admin) |

## License

Internal use – Vista Bank
