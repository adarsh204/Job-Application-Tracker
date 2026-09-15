package com.jobtracker.service;

import com.jobtracker.dto.DashboardStatsResponse;
import com.jobtracker.entity.ApplicationStatus;
import com.jobtracker.entity.JobApplication;
import com.jobtracker.entity.JobType;

import java.util.List;

/**
 * Defines the business operations available for job applications.
 * The controller depends on this interface, not the implementation directly,
 * which keeps the layers loosely coupled and easy to unit test.
 */
public interface JobApplicationService {

    JobApplication createApplication(JobApplication application);

    List<JobApplication> getAllApplications();

    JobApplication getApplicationById(Long id);

    JobApplication updateApplication(Long id, JobApplication updatedData);

    void deleteApplication(Long id);

    List<JobApplication> searchApplications(
            String company,
            String role,
            ApplicationStatus status,
            JobType jobType,
            String location,
            String sortBy,
            String sortDirection
    );

    DashboardStatsResponse getDashboardStats();
}
