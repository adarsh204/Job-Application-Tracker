#!/bin/bash
# ============================================================
# Manual API test script for the Job Application Tracker backend.
# Run this AFTER starting the Spring Boot app (mvn spring-boot:run).
# Usage: bash test-api.sh
# ============================================================

BASE_URL="http://localhost:8080/api/applications"

echo "1) CREATE a valid application (expect 201 Created)"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
        "companyName": "Google",
        "jobRole": "Software Engineer Intern",
        "location": "Bengaluru, India",
        "jobType": "Internship",
        "applicationDate": "2026-09-01",
        "status": "Applied",
        "jobUrl": "https://careers.google.com",
        "notes": "Referred by a senior."
      }')
echo "$CREATE_RESPONSE"
NEW_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
echo "Created application with id: $NEW_ID"
echo "------------------------------------------------------------"

echo "2) CREATE an INVALID application, missing required fields (expect 400 + field errors)"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{ "notes": "missing everything else" }'
echo ""
echo "------------------------------------------------------------"

echo "3) GET all applications (expect 200 + array with our new record)"
curl -s "$BASE_URL"
echo ""
echo "------------------------------------------------------------"

echo "4) GET dashboard stats (expect totalApplications >= 1)"
curl -s "$BASE_URL/stats"
echo ""
echo "------------------------------------------------------------"

echo "5) GET single application by id (expect 200)"
curl -s "$BASE_URL/$NEW_ID"
echo ""
echo "------------------------------------------------------------"

echo "6) GET a non-existent id (expect 404)"
curl -s -w "\nHTTP status: %{http_code}\n" "$BASE_URL/999999"
echo "------------------------------------------------------------"

echo "7) UPDATE the application status to Interview (expect 200)"
curl -s -X PUT "$BASE_URL/$NEW_ID" \
  -H "Content-Type: application/json" \
  -d '{
        "companyName": "Google",
        "jobRole": "Software Engineer Intern",
        "location": "Bengaluru, India",
        "jobType": "Internship",
        "applicationDate": "2026-09-01",
        "status": "Interview",
        "interviewDate": "2026-09-20",
        "jobUrl": "https://careers.google.com",
        "notes": "Interview scheduled."
      }'
echo ""
echo "------------------------------------------------------------"

echo "8) SEARCH/filter by status=Interview (expect our record back)"
curl -s "$BASE_URL?status=Interview"
echo ""
echo "------------------------------------------------------------"

echo "9) DELETE the application (expect 204 No Content)"
curl -s -w "\nHTTP status: %{http_code}\n" -X DELETE "$BASE_URL/$NEW_ID"
echo "------------------------------------------------------------"

echo "10) GET the deleted id again (expect 404)"
curl -s -w "\nHTTP status: %{http_code}\n" "$BASE_URL/$NEW_ID"
