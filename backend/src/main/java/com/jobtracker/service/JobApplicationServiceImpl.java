package com.jobtracker.service;

import com.jobtracker.dto.DashboardStatsResponse;
import com.jobtracker.entity.ApplicationStatus;
import com.jobtracker.entity.JobApplication;
import com.jobtracker.entity.JobType;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

/**
 * Implements JobApplicationService using JobApplicationRepository.
 * All the actual business rules (e.g. "selection rate = selected/total * 100")
 * live here, keeping the controller thin and the repository purely data-focused.
 */
@Service
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JobApplicationRepository repository;

    // Constructor injection - Spring automatically supplies the repository bean.
    public JobApplicationServiceImpl(JobApplicationRepository repository) {
        this.repository = repository;
    }

    @Override
    public JobApplication createApplication(JobApplication application) {
        // id, createdAt, updatedAt are all managed automatically - ignore any
        // client-supplied values for those fields to avoid accidental overrides.
        application.setId(null);
        return repository.save(application);
    }

    @Override
    public List<JobApplication> getAllApplications() {
        return repository.findAll();
    }

    @Override
    public JobApplication getApplicationById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));
    }

    @Override
    public JobApplication updateApplication(Long id, JobApplication updatedData) {
        JobApplication existing = getApplicationById(id);

        // Copy over the editable fields only - id/createdAt must never change.
        existing.setCompanyName(updatedData.getCompanyName());
        existing.setJobRole(updatedData.getJobRole());
        existing.setLocation(updatedData.getLocation());
        existing.setJobType(updatedData.getJobType());
        existing.setApplicationDate(updatedData.getApplicationDate());
        existing.setStatus(updatedData.getStatus());
        existing.setInterviewDate(updatedData.getInterviewDate());
        existing.setJobUrl(updatedData.getJobUrl());
        existing.setNotes(updatedData.getNotes());

        return repository.save(existing);
    }

    @Override
    public void deleteApplication(Long id) {
        // Confirm it exists first so we can return a clean 404 instead of a
        // silent no-op if the frontend tries to delete something already gone.
        JobApplication existing = getApplicationById(id);
        repository.delete(existing);
    }

    @Override
    public List<JobApplication> searchApplications(
            String company,
            String role,
            ApplicationStatus status,
            JobType jobType,
            String location,
            String sortBy,
            String sortDirection
    ) {
        // Empty strings from query params should behave the same as "no filter".
        company = blankToNull(company);
        role = blankToNull(role);
        location = blankToNull(location);

        List<JobApplication> results = repository.search(company, role, status, jobType, location);

        if (sortBy != null && !sortBy.isBlank()) {
            Comparator<JobApplication> comparator = buildComparator(sortBy);
            if ("desc".equalsIgnoreCase(sortDirection)) {
                comparator = comparator.reversed();
            }
            results.sort(comparator);
        }

        return results;
    }

    @Override
    public DashboardStatsResponse getDashboardStats() {
        long total = repository.count();
        long applied = repository.countByStatus(ApplicationStatus.APPLIED);
        long shortlisted = repository.countByStatus(ApplicationStatus.SHORTLISTED);
        long interviews = repository.countByStatus(ApplicationStatus.INTERVIEW);
        long selected = repository.countByStatus(ApplicationStatus.SELECTED);
        long rejected = repository.countByStatus(ApplicationStatus.REJECTED);

        // Avoid divide-by-zero when there are no applications yet.
        double selectionRate = total == 0 ? 0.0 : (selected * 100.0) / total;

        return new DashboardStatsResponse(total, applied, shortlisted, interviews, selected, rejected, selectionRate);
    }

    /** Treats blank/empty query strings the same as "not provided". */
    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    /** Builds the sort comparator based on the requested field name. */
    private Comparator<JobApplication> buildComparator(String sortBy) {
        return switch (sortBy) {
            case "companyName" -> Comparator.comparing(JobApplication::getCompanyName, String.CASE_INSENSITIVE_ORDER);
            case "interviewDate" -> Comparator.comparing(
                    JobApplication::getInterviewDate,
                    Comparator.nullsLast(Comparator.naturalOrder())
            );
            case "applicationDate" -> Comparator.comparing(JobApplication::getApplicationDate);
            default -> Comparator.comparing(JobApplication::getApplicationDate);
        };
    }
}
