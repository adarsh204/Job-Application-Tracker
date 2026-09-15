package com.jobtracker.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Tells JPA/Hibernate to store JobType in the database as its label
 * ("Full-time") instead of the enum constant name ("FULL_TIME").
 * autoApply = true means this is used automatically for every JobType field.
 */
@Converter(autoApply = true)
public class JobTypeConverter implements AttributeConverter<JobType, String> {

    @Override
    public String convertToDatabaseColumn(JobType jobType) {
        return jobType == null ? null : jobType.getLabel();
    }

    @Override
    public JobType convertToEntityAttribute(String dbValue) {
        return dbValue == null ? null : JobType.fromLabel(dbValue);
    }
}
