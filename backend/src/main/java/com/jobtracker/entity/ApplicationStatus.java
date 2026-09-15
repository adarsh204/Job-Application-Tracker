package com.jobtracker.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Represents the current status of a job application in the pipeline.
 *
 * Order below reflects the typical lifecycle:
 * Applied -> Shortlisted -> Interview -> Selected / Rejected
 */
public enum ApplicationStatus {
    APPLIED("Applied"),
    SHORTLISTED("Shortlisted"),
    INTERVIEW("Interview"),
    SELECTED("Selected"),
    REJECTED("Rejected");

    private final String label;

    ApplicationStatus(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static ApplicationStatus fromLabel(String label) {
        for (ApplicationStatus status : values()) {
            if (status.label.equalsIgnoreCase(label)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown application status: " + label);
    }
}
