package com.jobtracker.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents one job application record.
 * Maps directly to the "applications" table in the job_tracker database.
 *
 * Bean Validation annotations (@NotBlank, @NotNull, etc.) are enforced by
 * Spring when this entity is used as a @RequestBody in the controller.
 */
@Entity
@Table(name = "applications")
@Getter
@Setter
@NoArgsConstructor
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Company name is required")
    @Size(max = 150, message = "Company name must be under 150 characters")
    @Column(name = "company_name", nullable = false, length = 150)
    private String companyName;

    @NotBlank(message = "Job role is required")
    @Size(max = 150, message = "Job role must be under 150 characters")
    @Column(name = "job_role", nullable = false, length = 150)
    private String jobRole;

    @NotBlank(message = "Location is required")
    @Size(max = 150, message = "Location must be under 150 characters")
    @Column(name = "location", nullable = false, length = 150)
    private String location;

    @NotNull(message = "Job type is required")
    @Column(name = "job_type", nullable = false, length = 20)
    private JobType jobType;

    @NotNull(message = "Application date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "application_date", nullable = false)
    private LocalDate applicationDate;

    @NotNull(message = "Status is required")
    @Column(name = "status", nullable = false, length = 20)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    // Interview date is optional - not every application reaches this stage yet
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "interview_date")
    private LocalDate interviewDate;

    @Size(max = 500, message = "Job URL must be under 500 characters")
    @Column(name = "job_url", length = 500)
    private String jobUrl;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Automatically set timestamps right before the record is first saved.
     */
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    /**
     * Automatically refresh updated_at every time the record is modified.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
