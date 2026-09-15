package com.jobtracker.controller;

import com.jobtracker.dto.DashboardStatsResponse;
import com.jobtracker.entity.ApplicationStatus;
import com.jobtracker.entity.JobApplication;
import com.jobtracker.entity.JobType;
import com.jobtracker.service.JobApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API for managing job applications.
 *
 * Base path: /api/applications
 * All responses are JSON. CORS is configured globally in WebConfig so the
 * vanilla JS frontend (served from a different port) can call these endpoints.
 */
@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    private final JobApplicationService service;

    public JobApplicationController(JobApplicationService service) {
        this.service = service;
    }

    /**
     * POST /api/applications
     * Creates a new job application. Returns 201 Created with the saved record
     * (including its generated id) on success, or 400 Bad Request if validation fails.
     */
    @PostMapping
    public ResponseEntity<JobApplication> createApplication(@Valid @RequestBody JobApplication application) {
        JobApplication saved = service.createApplication(application);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * GET /api/applications
     * Returns all applications, OR a filtered/sorted subset when any query
     * params are supplied. This single endpoint backs both "View Applications"
     * and the search/filter/sort feature so the frontend doesn't need two calls.
     *
     * Example: /api/applications?company=google&status=Interview&sortBy=applicationDate&sortDirection=desc
     */
    @GetMapping
    public ResponseEntity<List<JobApplication>> getApplications(
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) JobType jobType,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDirection
    ) {
        boolean hasFilters = company != null || role != null || status != null
                || jobType != null || location != null || sortBy != null;

        List<JobApplication> applications = hasFilters
                ? service.searchApplications(company, role, status, jobType, location, sortBy, sortDirection)
                : service.getAllApplications();

        return ResponseEntity.ok(applications);
    }

    /**
     * GET /api/applications/stats
     * Returns aggregated dashboard numbers (totals per status + selection rate).
     * NOTE: declared before /{id} so Spring doesn't try to parse "stats" as a Long id.
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(service.getDashboardStats());
    }

    /**
     * GET /api/applications/{id}
     * Returns full details of a single application. 404 if it doesn't exist
     * (handled by GlobalExceptionHandler via ResourceNotFoundException).
     */
    @GetMapping("/{id}")
    public ResponseEntity<JobApplication> getApplicationById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getApplicationById(id));
    }

    /**
     * PUT /api/applications/{id}
     * Updates an existing application. Returns the updated record, or 404 if
     * the id doesn't exist, or 400 if the request body fails validation.
     */
    @PutMapping("/{id}")
    public ResponseEntity<JobApplication> updateApplication(
            @PathVariable Long id,
            @Valid @RequestBody JobApplication application
    ) {
        JobApplication updated = service.updateApplication(id, application);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/applications/{id}
     * Deletes an application. Returns 204 No Content on success, or 404 if
     * the id doesn't exist. The frontend confirmation dialog runs before this
     * request is ever sent.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        service.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
}
