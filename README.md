# EthioIntern — Ethiopian University & Company Internship Platform

## 1. Project Overview
**EthioIntern** is a full-stack JavaScript student internship platform purpose-built for Ethiopian public and accredited private universities and domestic employers. It connects university students with TIN-verified companies offering structured internships across Addis Ababa, Adama, Bahir Dar, Hawassa, Jimma, Mekelle, Gondar, and Arba Minch.

## 2. Problem Statement
> Students struggle to find legitimate internships, while companies struggle to find students with the right skills.

Across Ethiopian universities, students often rely on fragmented word-of-mouth referrals to secure mandatory industrial internships, exposing them to unverified postings. Conversely, Ethiopian companies struggle to filter candidates by university department, verified technical skills, and academic readiness.

## 3. Solution
EthioIntern provides a unified, role-based marketplace where:
- **Students** create structured academic profiles (First Name, Father Name, Grandfather Name, University, Department, Field of Study, Academic Level, Skills, Projects, Certifications), build/export CVs, view transparent skill match scores, apply, and track applications through a 5-stage timeline.
- **Companies** register (initial `PENDING` verification status), submit Ethiopian TIN and Ministry of Trade registration credentials, post internships in **ETB**, discover students with granular filters, review applications, and schedule conflict-checked interviews.
- **Administrators** verify companies (`APPROVED` / `REJECTED` / `SUSPENDED`), manage the configurable PostgreSQL catalog of Ethiopian universities, departments, and skills, resolve trust & safety reports, and monitor platform analytics via Recharts.

## 4. Features
- **Strict JavaScript & JSX Codebase**: 100% ES Module JavaScript (`.js`, `.jsx`) with zero TypeScript dependencies.
- **Transparent Rule-Based Skill Matching**: Computes deterministic skill compatibility (`Matching Skills / Required Skills`) alongside field of study, academic level, and location alignment.
- **Ethiopian University Registry**: Pre-configured with ASTU, AAU, AASTU, BDU, HU, JU, MU, UoG, and AMU, managed dynamically by administrators.
- **Company Verification Workflow**: Clear `✓ Verified Company` vs `Pending Verification` badges backed by administrative audit logs.
- **Student Privacy Protection**: Students control whether their portfolio is `Public` or `Private` and whether their personal phone/email are exposed in company student discovery before applying.
- **Professional CV Builder**: Real-time A4 CV preview and PDF print/download synchronized with the student's database profile.
- **Conflict-Aware Interview Scheduling**: Prevents overlapping interview time slots for both students and companies and triggers real-time notifications.

## 5. Technology Stack
- **Frontend**: React 19, Vite, JavaScript (JSX), React Router v7, Tailwind CSS v4, Recharts, Lucide Icons
- **Backend**: Node.js, Express.js, REST API architecture, JWT (`jsonwebtoken`), `bcryptjs`, `express-validator`, `helmet`, `cors`, `express-rate-limit`, `multer`
- **Database**: PostgreSQL schema & migrations (`server/database/migrations/001_initial_schema.sql`) with persistent relational adapter (`server/config/db.js`)
- **File Storage**: Pluggable object-storage abstraction (`server/services/storageService.js`) supporting `local`, `s3`, and `gcs` providers with 5MB size and MIME-type validation

## 6. Architecture
```text
internship-platform/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── utils/
│   │   ├── validations/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── repositories/
│   ├── validators/
│   ├── utils/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeds/
│   ├── tests/
│   ├── uploads/
│   ├── app.js
│   └── server.js
├── .env.example
├── package.json
└── README.md
```

## 7. Database Architecture
The relational schema (`server/database/migrations/001_initial_schema.sql`) defines 20 normalized tables with UUID primary keys, foreign keys, indexes, and unique constraints:
`users`, `universities`, `departments`, `fields_of_study`, `skills`, `student_profiles`, `student_skills`, `student_education`, `student_projects`, `student_certifications`, `companies`, `company_verifications`, `internships`, `internship_skills`, `applications` (`UNIQUE(student_id, internship_id)`), `interviews`, `notifications`, `saved_internships` (`UNIQUE(student_id, internship_id)`), `reports`, and `admin_actions`.

## 8. Installation (Windows PowerShell)
```powershell
git clone <repository-url>
cd internship-platform
npm install
```

## 9. Environment Variables
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```
Configure `PORT`, `JWT_SECRET`, `CLIENT_URL`, and `STORAGE_PROVIDER`.

## 10. Running Locally (Windows PowerShell)
```powershell
npm run seed
npm run dev
```
Open `http://localhost:3000` in your browser.

## 11. Database Setup & Migrations
To apply the PostgreSQL DDL schema and seed script against an external PostgreSQL instance:
```powershell
psql -U postgres -d ethiointern -f server/database/migrations/001_initial_schema.sql
psql -U postgres -d ethiointern -f server/database/seeds/001_seed_data.sql
```
Or reset the application seed data via:
```powershell
npm run seed
```

## 12. Seed Data (Development / Demo Accounts)
All demo accounts use password: `Password123!`
- **Student (ASTU)**: `eyob.aragie@astu.edu.et`
- **Student (AAU)**: `selamawit.tadesse@aau.edu.et`
- **Verified Company (Chapa)**: `careers@chapa.co`
- **Verified Company (Gebeya)**: `talent@gebeya.com`
- **Pending Company (BlueNile)**: `founders@blueniletech.et`
- **Administrator**: `admin@ethiointern.et`

## 13. API Documentation
- `POST /api/auth/register` — Register student or company account
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/catalog` — Fetch Ethiopian universities, departments, fields, and skills
- `GET /api/students/profile` / `PUT /api/students/profile` — Student profile CRUD
- `GET /api/internships` / `POST /api/internships` — Search, filter, paginate, and create internships
- `POST /api/internships/:id/apply` — Submit internship application (enforces duplicate check)
- `GET /api/applications` / `PUT /api/applications/:id/status` — Track or update application status
- `GET /api/companies/students` — Discover and filter students with skill match calculation
- `POST /api/companies/verify` — Submit company TIN verification request
- `POST /api/interviews` / `PUT /api/interviews/:id` — Schedule and respond to interviews
- `GET /api/notifications` / `PUT /api/notifications/:id/read` — Notification center
- `GET /api/admin/analytics` — Platform KPIs and Recharts time-series / distribution datasets

## 14. Testing (Windows PowerShell)
Run the automated integration test suite covering Authentication, Internships, Applications, and Role Authorization:
```powershell
npm test
```

## 15. Security
- Password hashing via `bcryptjs` (10 salt rounds)
- Stateless JWT bearer authentication & role-based access control (`STUDENT`, `COMPANY`, `ADMIN`)
- Request validation via `express-validator`
- HTTP security headers via `helmet` and rate limiting via `express-rate-limit`
- File upload MIME-type (`PDF`, `PNG`, `JPEG`, `WEBP`) and 5MB size enforcement
- Structured logging with automatic redaction of passwords, tokens, and secrets

## 16. Deployment
```powershell
npm run build
npm start
```

## 17. Future Improvements
- Integration with Ethiopian National ID (Fayda) for automated student identity verification
- University registrar transcript verification webhook integration
- Machine-learning collaborative filtering recommendation module plugging into `skillMatcher.js`
