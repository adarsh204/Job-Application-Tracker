package com.jobtracker.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Plain data-carrier object returned by GET /api/applications/stats.
 * Kept separate from the JobApplication entity because this represents
 * aggregated numbers, not a database row.
 */
@Getter
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalApplications;
    private long applied;
    private long shortlisted;
    private long interviews;
    private long selected;
    private long rejected;
    private double selectionRate; // percentage, e.g. 8.0 means 8%
}
