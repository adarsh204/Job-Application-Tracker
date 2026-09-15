package com.jobtracker.repository;

import com.jobtracker.entity.ApplicationStatus;
import com.jobtracker.entity.JobApplication;
import com.jobtracker.entity.JobType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Data access layer for JobApplication.
 *
 * Extending JpaRepository gives us save(), findAll(), findById(), deleteById()
 * etc. for free. We only need to declare the extra query methods that Spring
 * Data JPA can't derive automatically (or that would be too complex to name).
 */
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    /**
     * Single flexible query that backs the search/filter/sort feature.
     * Any parameter left as NULL is ignored (see the SQL below) so the
     * frontend can call this with only the filters the user actually set.
     *
     * company / role are matched case-insensitively with partial matching
     * (LIKE %term%), while status/type/location are exact matches.
     */
    @Query("SELECT a FROM JobApplication a WHERE " +
            "(:company IS NULL OR LOWER(a.companyName) LIKE LOWER(CONCAT('%', :company, '%'))) AND " +
            "(:role IS NULL OR LOWER(a.jobRole) LIKE LOWER(CONCAT('%', :role, '%'))) AND " +
            "(:status IS NULL OR a.status = :status) AND " +
            "(:jobType IS NULL OR a.jobType = :jobType) AND " +
            "(:location IS NULL OR LOWER(a.location) = LOWER(:location))")
    List<JobApplication> search(
            @Param("company") String company,
            @Param("role") String role,
            @Param("status") ApplicationStatus status,
            @Param("jobType") JobType jobType,
            @Param("location") String location
    );

    /**
     * Used by the dashboard to count applications in a given status,
     * e.g. countByStatus(ApplicationStatus.SELECTED).
     */
    long countByStatus(ApplicationStatus status);
}
