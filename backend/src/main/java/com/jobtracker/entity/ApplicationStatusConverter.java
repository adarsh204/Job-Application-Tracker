package com.jobtracker.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Tells JPA/Hibernate to store ApplicationStatus in the database as its
 * label ("Shortlisted") instead of the enum constant name ("SHORTLISTED").
 */
@Converter(autoApply = true)
public class ApplicationStatusConverter implements AttributeConverter<ApplicationStatus, String> {

    @Override
    public String convertToDatabaseColumn(ApplicationStatus status) {
        return status == null ? null : status.getLabel();
    }

    @Override
    public ApplicationStatus convertToEntityAttribute(String dbValue) {
        return dbValue == null ? null : ApplicationStatus.fromLabel(dbValue);
    }
}
