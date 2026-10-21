# EthioIntern — Student Internship Platform

EthioIntern is a full-stack JavaScript platform designed to connect university students in Ethiopia with internship opportunities from companies. Students can build profiles and CVs, discover internships, apply, and track application progress. Companies can publish opportunities and review applicants, while administrators manage platform users, company verification, and platform information.

## Features

### Students

- Create an account and maintain an academic and professional profile.
- Add education, skills, projects, and certifications.
- Discover and save internship opportunities.
- View skill-based internship recommendations and match explanations.
- Apply for internships and track application status.
- Build a CV and manage portfolio visibility and contact privacy.

### Companies

- Register and maintain a company profile.
- Submit company information for verification.
- Create and manage internship listings.
- Discover students using profile and skill information.
- Review applications and arrange interviews.

### Administrators

- View platform analytics.
- Manage users, companies, internship listings, universities, departments, and skills.
- Review company verification requests and reports.

## Technology Stack

- **Frontend:** React 19, Vite, JavaScript/JSX, React Router, Tailwind CSS, Recharts, Lucide React
- **Backend:** Node.js, Express.js, REST API
- **Database:** PostgreSQL (including Supabase PostgreSQL)
- **Authentication:** JWT and bcryptjs
- **Validation and security:** express-validator, Helmet, CORS, express-rate-limit
- **File handling:** Multer and a configurable storage service
- **Optional AI integration:** Google Gemini API

## Project Structure

```text
ethiointern-platform/
├── client/
│   └── src/
│       ├── components/      # Reusable interface components
│       ├── context/         # Authentication context
│       ├── hooks/           # Custom React hooks
│       ├── layouts/         # Shared page layouts
│       ├── pages/           # Public, student, company, and admin pages
│       ├── services/        # Frontend API client
│       ├── utils/           # Frontend helpers
│       └── validations/     # Form validation schemas
├── server/
│   ├── config/              # Database configuration
│   ├── controllers/         # HTTP request handlers
│   ├── database/
│   │   ├── migrations/      # PostgreSQL schema migrations
│   │   ├── seeds/           # Initial/demo data
│   │   └── store.json       # Local fallback data store
│   ├── middleware/          # Authentication, upload, and error handling
│   ├── repositories/        # Data access logic
│   ├── routes/              # API routes
│   ├── scripts/             # Database test and migration scripts
│   ├── services/            # Business logic and storage service
│   ├── tests/               # Automated tests
│   ├── utils/               # Helpers and logging
│   ├── app.js
│   └── server.js
├── public/                  # Public assets
├── .env.example             # Environment variable template
├── package.json
└── README.md
```

## Requirements

Install the following before starting:

- Node.js (a current LTS release is recommended)
- npm
- A PostgreSQL database, such as Supabase, if you want to use PostgreSQL persistence
- Git (optional, for cloning and version control)

## Installation

Open a terminal in the project root—the folder containing the main `package.json`—and run:

```powershell
npm install
```

Create your local environment file from the example:

```powershell
Copy-Item .env.example .env
```

If `.env` already exists, edit it rather than overwriting it.

## Environment Configuration

Configure the values in `.env`. Never commit this file or share its secrets publicly.

```env
# PostgreSQL connection string. DATA_URL is checked first;
# DATABASE_URL is also supported.
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"

PORT=3000
NODE_ENV=development
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:3000"

STORAGE_PROVIDER="local"
STORAGE_BUCKET="ethiointern-assets"
STORAGE_ACCESS_KEY=""
STORAGE_SECRET_KEY=""

GEMINI_API_KEY=""
APP_URL="http://localhost:3000"
```

Replace the example values with your own. The PostgreSQL URL must use the connection details provided by your database provider. If the password contains URL-special characters such as `@`, `:`, `/`, `#`, or `%`, URL-encode those characters in the connection string. For Supabase, choose the connection method appropriate for your network and deployment, and enable SSL as required by the provider.

The server's database adapter checks `DATA_URL` first and then `DATABASE_URL`. If neither is configured, the project can use its local JSON fallback store (`server/database/store.json`). **Starting the website does not, by itself, prove that PostgreSQL is connected.**

## Run the Application

From the project root:

```powershell
npm run dev
```

When the server starts, open:

**http://localhost:3000**

The root development server runs Express and Vite together on port `3000`, so you normally do not need to start the frontend in a second terminal.

To stop the development server, focus its terminal and press `Ctrl + C`.

## Verify the PostgreSQL Connection

Run this from the project root in a separate terminal (you can stop the dev server first if needed):

```powershell
npm run db:test
```

A successful test reports that PostgreSQL connected and displays connection latency, server time, and the database engine. It also lists tables in the database. If the connection fails, check the URL, username/password, URL-encoded special characters, SSL settings, and the database provider's connection settings.

If the test says no PostgreSQL URL is configured, verify that `DATA_URL` or `DATABASE_URL` is set in the root `.env` file. The current adapter can fall back to the local JSON store, so a running website alone is not a database-connection confirmation.

## Database Schema and Migrations

The initial PostgreSQL schema is located at:

```text
server/database/migrations/001_initial_schema.sql
```

After configuring and testing the PostgreSQL connection, apply the schema with:

```powershell
npm run db:migrate
```

Then verify the connection and table list again:

```powershell
npm run db:test
```

Review the migration and back up important data before applying schema changes to a database containing production data.

> **Note:** `npm run seed` resets the project's built-in seed data in the local JSON store. Do not assume it populates the remote PostgreSQL database. Review the seed scripts and database schema before using them with important data.

## Available Scripts

| Command              | Purpose                                                         |
| -------------------- | --------------------------------------------------------------- |
| `npm run dev`        | Start the combined Express/Vite development server on port 3000 |
| `npm start`          | Start the server                                                |
| `npm run build`      | Build the frontend for production                               |
| `npm run preview`    | Run Vite's build preview                                        |
| `npm run db:test`    | Test the PostgreSQL connection and list public tables           |
| `npm run db:migrate` | Apply the initial PostgreSQL schema migration                   |
| `npm run seed`       | Reset the built-in local JSON seed data                         |
| `npm test`           | Run the automated Node.js test suite                            |
| `npm run lint`       | Run basic Node.js syntax checks for server entry files          |

## API Overview

The REST API is mounted under `/api`. Representative endpoints include:

| Method | Endpoint                     | Purpose                                                        |
| ------ | ---------------------------- | -------------------------------------------------------------- |
| `POST` | `/api/auth/register`         | Register a student or company account                          |
| `POST` | `/api/auth/login`            | Sign in and receive an authentication token                    |
| `GET`  | `/api/auth/me`               | Get the current authenticated user                             |
| `GET`  | `/api/catalog`               | Retrieve university, department, field, and skill catalog data |
| `GET`  | `/api/internships`           | Browse internship listings                                     |
| `POST` | `/api/internships`           | Create an internship (authorized company/admin)                |
| `POST` | `/api/internships/:id/apply` | Apply for an internship (student)                              |
| `GET`  | `/api/applications`          | View applications available to the authenticated user          |
| `GET`  | `/api/notifications`         | Retrieve notifications                                         |
| `GET`  | `/api/admin/analytics`       | Retrieve administrator analytics                               |

See `server/routes/apiRoutes.js` for the complete route list and authorization requirements.

## Testing

Run the automated tests from the project root:

```powershell
npm test
```

Test the database connection separately with `npm run db:test`. Application tests and a successful HTTP response do not necessarily prove that the remote database is being used.

## Security Notes

- Keep `.env` out of Git; `.gitignore` is configured to ignore `.env` files while allowing `.env.example`.
- Use a strong, unique `JWT_SECRET` and never commit credentials or API keys.
- Use HTTPS and production-appropriate database access controls when deploying.
- Validate and authorize requests on the server; do not rely only on frontend checks.
- Do not use demo accounts or sample passwords with real data.
- Keep database backups and review migrations before applying changes to a production database.

## Deployment Notes

Build the frontend and start the server in production mode:

```powershell
npm run build
$env:NODE_ENV="production"
npm start
```

Configure the hosting provider's environment variables securely and ensure PostgreSQL is reachable from the deployed server. The server serves the built `dist` directory when `NODE_ENV=production` and the build exists. Configure your host's port and health checks to match its deployment requirements; this project currently listens on port `3000` in `server/server.js`.

## Contributing

1. Create a branch for your change.
2. Keep changes focused and follow the existing JavaScript/JSX style.
3. Run `npm test`, `npm run lint`, and relevant database checks.
4. Do not include `.env`, local credentials, or private user data in commits.

## License

No license has been specified yet. Add a `LICENSE` file before distributing this project under an open-source license.
