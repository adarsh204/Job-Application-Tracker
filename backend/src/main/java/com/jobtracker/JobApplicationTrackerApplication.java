package com.jobtracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point of the Job Application Tracker Spring Boot backend.
 *
 * Running this class starts an embedded Tomcat server on port 8080
 * and exposes the REST API defined in the controller package.
 */
@SpringBootApplication
public class JobApplicationTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(JobApplicationTrackerApplication.class, args);
    }
}
