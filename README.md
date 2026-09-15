# Job Application Tracker

A full-stack web application that helps students and job seekers track every job they've applied to — company, role, status, interview dates and notes — all in one place, with a live dashboard showing how the search is going.

Built as a portfolio project to practice and demonstrate REST API design, relational database modeling, and vanilla JavaScript frontend integration — the kind of end-to-end CRUD app commonly discussed in fresher software-engineering interviews.

---

## Problem Statement

Job hunting usually means applying to dozens of companies across email threads, spreadsheets, and sticky notes. It's easy to lose track of:

- Which companies you've already applied to
- What stage each application is at (applied, interview, rejected, etc.)
- When your next interview is
- How well your search is actually going (selection rate, drop-off by stage)

**Job Application Tracker** solves this with a single dashboard: add an application once, and always know where things stand.

---

## Features

- **Dashboard** — total applications, per-status counts, and selection rate, with a live bar chart, updated automatically after every add/edit/delete.
- **Add Application** — form with company, role, dates, job type, status, URL, and notes, validated both client- and server-side.
- **View Applications** — a clean, responsive table with color-coded status badges.
- **Search & Filter** — search by company or role, filter by status/type/location, sort by date — all dynamic, no page reloads.
- **Edit Application** — update any field; dashboard and table refresh automatically.
- **Delete Application** — with a confirmation dialog before anything is removed.
- **Application Details** — a full read-only view of a single application.
- **Empty states, loading indicators, error banners, and toast notifications** throughout.

---

## Technologies Used

| Layer      | Technology                                   |
|------------|-----------------------------------------------|
| Frontend   | HTML5, CSS3, Vanilla JavaScript (ES6+, `fetch`) |
| Backend    | Java 17, Spring Boot 3 (Web, Data JPA, Validation) |
| Database   | MySQL 8                                       |
| Build tool | Maven                                         |

No frontend framework and no ORM/query-builder beyond Spring Data JPA were used, by design — the goal was to demonstrate the fundamentals without a framework doing the thinking.

---

## System Architecture

```
┌───────────────────┐        HTTP / JSON        ┌───────────────────────────┐        JDBC        ┌─────────────┐
│   Frontend (SPA)  │  ───────────────────────▶  │   Spring Boot REST API   │  ─────────────────▶ │    MySQL    │
│ HTML/CSS/vanilla  │  ◀───────────────────────  │ Controller → Service     │  ◀───────────────── │ job_tracker │
│      JS fetch()   │                            │  → Repository → Entity   │                     │  database   │
└───────────────────┘                            └───────────────────────────┘                     └─────────────┘
```

The backend follows a classic layered architecture:

- **Controller** — exposes REST endpoints, handles HTTP concerns only.
- **Service** — business logic (e.g. selection-rate calculation, search/sort rules).
- **Repository** — Spring Data JPA interface for database access.
- **Entity** — `JobApplication`, mapped directly to the `applications` table.

A `GlobalExceptionHandler` centralizes error handling so every error response (validation failure, not-found, bad input) comes back in the same predictable JSON shape.

---

## Database Structure

Database: `job_tracker`
Table: `applications`

| Column            | Type                                                        | Notes                          |
|-------------------|-------------------------------------------------------------|---------------------------------|
| id                | BIGINT, AUTO_INCREMENT                                       | Primary key                    |
| company_name      | VARCHAR(150), NOT NULL                                       |                                 |
| job_role          | VARCHAR(150), NOT NULL                                       |                                 |
| location          | VARCHAR(150), NOT NULL                                       |                                 |
| job_type          | ENUM('Full-time','Internship','Part-time'), NOT NULL         |                                 |
| application_date  | DATE, NOT NULL                                                |                                 |
| status            | ENUM('Applied','Shortlisted','Interview','Selected','Rejected'), NOT NULL | Defaults to `Applied` |
| interview_date    | DATE, NULL                                                    | Optional                       |
| job_url           | VARCHAR(500), NULL                                            | Optional                       |
| notes             | TEXT, NULL                                                    | Optional                       |
| created_at        | TIMESTAMP, NOT NULL                                           | Set automatically               |
| updated_at        | TIMESTAMP, NOT NULL                                           | Refreshed automatically on edit |

Full SQL: [`database/database.sql`](database/database.sql). Indexes exist on `company_name`, `status`, `job_type`, `location`, and `application_date` to keep search/filter/sort fast.

---

## API Endpoints

Base URL: `http://localhost:8080/api/applications`

| Method | Endpoint                | Description                                          |
|--------|--------------------------|-------------------------------------------------------|
| POST   | `/`                      | Create a new application                              |
| GET    | `/`                      | Get all applications (or filtered/sorted, see below)  |
| GET    | `/stats`                 | Get dashboard statistics                              |
| GET    | `/{id}`                  | Get a single application by id                        |
| PUT    | `/{id}`                  | Update an application                                 |
| DELETE | `/{id}`                  | Delete an application                                 |

**Search / filter / sort** (all optional query params on `GET /`):

```
GET /api/applications?company=google&role=engineer&status=Interview&jobType=Internship&location=Bengaluru&sortBy=applicationDate&sortDirection=desc
```

**Sample request body** (POST/PUT):

```json
{
  "companyName": "Google",
  "jobRole": "Software Engineer Intern",
  "location": "Bengaluru, India",
  "jobType": "Internship",
  "applicationDate": "2026-09-01",
  "status": "Applied",
  "interviewDate": null,
  "jobUrl": "https://careers.google.com",
  "notes": "Referred by a senior."
}
```

**Error response shape** (validation failure, 400):

```json
{
  "timestamp": "2026-09-14T10:00:00",
  "status": 400,
  "error": "Validation Failed",
  "message": "One or more fields are invalid",
  "fieldErrors": { "companyName": "Company name is required" }
}
```

---

## Screenshots

_Add screenshots of the dashboard and applications page here after running the app locally._

```
screenshots/
├── dashboard.png
├── applications-table.png
├── add-application-form.png
└── application-details.png
```

---

## Installation Instructions

### Prerequisites

- Java 17+
- Maven 3.8+
- MySQL 8+
- A modern browser
- (Optional) VS Code with the "Live Server" extension, or Python 3, to serve the frontend

### MySQL Setup

1. Start your local MySQL server.
2. Run the schema script:
   ```bash
   mysql -u root -p < database/database.sql
   ```
   This creates the `job_tracker` database and `applications` table. (Alternatively, skip this step — Hibernate will create the table automatically on first backend startup, since `spring.jpa.hibernate.ddl-auto=update`.)

### Backend Setup

1. Open `backend/src/main/resources/application.properties` and set your MySQL username/password:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   ```
2. From the `backend/` folder, run:
   ```bash
   mvn spring-boot:run
   ```
3. The API will start on `http://localhost:8080`. Confirm it's up:
   ```bash
   curl http://localhost:8080/api/applications
   ```
   (You can also run `bash test-api.sh` from inside `backend/` for a full smoke test of every endpoint.)

### Frontend Setup

The frontend is plain static files — no build step, no npm install.

1. From the `frontend/` folder, serve it with any static server, for example:
   ```bash
   python3 -m http.server 5500
   ```
   or open the folder in VS Code and click "Go Live" (Live Server extension).
2. Visit `http://localhost:5500/index.html`.

> The frontend calls the backend at `http://localhost:8080` — make sure the backend is running first, and that the frontend's origin is listed in `app.cors.allowed-origins` in `application.properties` (ports 5500/5501 are pre-configured).

### How to Run the Project (quick summary)

```bash
# Terminal 1 - backend
cd backend
mvn spring-boot:run

# Terminal 2 - frontend
cd frontend
python3 -m http.server 5500
```

Then open `http://localhost:5500/index.html` in your browser.

---

## Project Structure

```
job-application-tracker/
├── backend/
│   ├── src/main/java/com/jobtracker/
│   │   ├── controller/       # REST endpoints
│   │   ├── service/          # Business logic
│   │   ├── repository/       # Spring Data JPA interfaces
│   │   ├── entity/           # JPA entities + enums + converters
│   │   ├── dto/              # Response objects (e.g. dashboard stats)
│   │   ├── exception/        # Custom exceptions + global handler
│   │   └── config/           # CORS configuration
│   ├── src/main/resources/application.properties
│   ├── test-api.sh           # curl-based smoke test for every endpoint
│   └── pom.xml
├── frontend/
│   ├── index.html            # Dashboard page
│   ├── applications.html     # Applications table + modals
│   ├── css/style.css
│   └── js/
│       ├── api.js            # All fetch() calls to the backend
│       ├── utils.js          # Shared formatting/UI helpers
│       ├── dashboard.js      # Dashboard page logic
│       └── applications.js   # Table, filters, modals, form validation
├── database/
│   └── database.sql
├── screenshots/
└── README.md
```

---

## What I Learned

- Designing and building REST APIs with Spring Boot, including proper use of HTTP status codes (`201`, `204`, `404`, `400`).
- Implementing full CRUD operations against a MySQL database using Spring Data JPA.
- Structuring a backend into controller/service/repository/entity layers instead of one big class.
- Mapping Java enums to human-readable database/JSON values with custom `AttributeConverter`s and Jackson annotations.
- Writing a dynamic, parameterized JPQL query to support optional search/filter combinations.
- Centralizing error handling with `@RestControllerAdvice` so the API always returns a consistent error shape.
- Consuming a REST API from vanilla JavaScript using `fetch()`, without any frontend framework.
- Client-side and server-side form validation, and how to reconcile the two (mapping backend field errors back onto form inputs).
- Designing a responsive UI with plain CSS (grid/flexbox, breakpoints) and building a simple data visualization without a charting library.
- Git/GitHub project structuring and writing developer-facing documentation.

---

## Future Improvements

- User authentication (so multiple people can use their own tracker)
- Multi-user support with per-user data isolation
- Email/SMS reminders for upcoming interviews
- Resume management (attach a resume version per application)
- Job recommendation system based on past applications
- Deeper analytics (time-to-response, funnel conversion over time)
- Export applications to CSV/PDF
- Dark mode

---

## License

This project is open for learning and personal portfolio use.
