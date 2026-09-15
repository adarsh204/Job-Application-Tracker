-- ============================================================
-- Job Application Tracker - Database Setup Script
-- ============================================================
-- Run this script in MySQL to create the database and table
-- manually. (Note: if you run the Spring Boot backend with
-- spring.jpa.hibernate.ddl-auto=update, Hibernate will also
-- create/update this table automatically on startup.)
-- ============================================================

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS job_tracker
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE job_tracker;

-- 2. Create the applications table
CREATE TABLE IF NOT EXISTS applications (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_name      VARCHAR(150)  NOT NULL,
    job_role          VARCHAR(150)  NOT NULL,
    location          VARCHAR(150)  NOT NULL,
    job_type          ENUM('Full-time', 'Internship', 'Part-time') NOT NULL,
    application_date  DATE          NOT NULL,
    status            ENUM('Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected')
                          NOT NULL DEFAULT 'Applied',
    interview_date    DATE          NULL,
    job_url           VARCHAR(500)  NULL,
    notes             TEXT          NULL,
    created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                          ON UPDATE CURRENT_TIMESTAMP,

    -- Helpful indexes for search/filter/sort operations used by the app
    INDEX idx_company_name (company_name),
    INDEX idx_status (status),
    INDEX idx_job_type (job_type),
    INDEX idx_location (location),
    INDEX idx_application_date (application_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- (Optional) Sample data for manual testing.
-- Comment this block out if you don't want any pre-loaded rows -
-- the application itself does not rely on this data, and works
-- correctly with an empty table (see the Empty State in the UI).
-- ============================================================

-- INSERT INTO applications
--   (company_name, job_role, location, job_type, application_date, status, interview_date, job_url, notes)
-- VALUES
--   ('Google', 'Software Engineer Intern', 'Bengaluru, India', 'Internship', '2026-08-01', 'Interview', '2026-09-20', 'https://careers.google.com', 'Referred by a senior.'),
--   ('Microsoft', 'Associate Software Engineer', 'Hyderabad, India', 'Full-time', '2026-08-05', 'Shortlisted', NULL, 'https://careers.microsoft.com', 'Applied through campus placement.'),
--   ('Zomato', 'Backend Developer', 'Gurugram, India', 'Full-time', '2026-07-20', 'Rejected', NULL, 'https://zomato.com/careers', 'Rejected after first round.');
