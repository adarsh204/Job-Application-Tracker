package com.jobtracker.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Represents the type of job being applied for.
 *
 * The enum constant names (FULL_TIME) are Java-friendly, but the frontend
 * and database both use human-readable labels ("Full-time"). @JsonValue /
 * @JsonCreator make Jackson serialize/deserialize using the label, and
 * JobTypeConverter (see the same package) does the equivalent for JPA/MySQL.
 */
public enum JobType {
    FULL_TIME("Full-time"),
    INTERNSHIP("Internship"),
    PART_TIME("Part-time");

    private final String label;

    JobType(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static JobType fromLabel(String label) {
        for (JobType type : values()) {
            if (type.label.equalsIgnoreCase(label)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown job type: " + label);
    }
}
