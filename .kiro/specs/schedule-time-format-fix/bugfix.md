# Bugfix Requirements Document

## Introduction

The schedule/cronograma display currently shows time slots using availability-based hours (0h, 1h, 2h, etc.) instead of actual 24-hour clock time format. Users expect to see standard time format (08:00, 09:00, 10:00, etc.) with one-hour intervals between each time slot line, making the schedule more intuitive and aligned with real-world time expectations.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the schedule grid displays time slots THEN the system shows availability-based hour labels (0h, 1h, 2h, etc.)
1.2 WHEN users view the schedule THEN the system displays time slots that don't correspond to actual clock time
1.3 WHEN the schedule shows hour intervals THEN the system uses sequential numbering starting from 0 instead of actual time format

### Expected Behavior (Correct)

2.1 WHEN the schedule grid displays time slots THEN the system SHALL show actual 24-hour time format (08:00, 09:00, 10:00, etc.)
2.2 WHEN users view the schedule THEN the system SHALL display time slots that correspond to real clock time with proper formatting
2.3 WHEN the schedule shows hour intervals THEN the system SHALL use one-hour separation between each time slot line in 24-hour format

### Unchanged Behavior (Regression Prevention)

3.1 WHEN users interact with schedule cells THEN the system SHALL CONTINUE TO allow adding/removing subjects from time slots
3.2 WHEN the schedule configuration is modified THEN the system SHALL CONTINUE TO update the visible hours and available days correctly
3.3 WHEN the auto-generation feature is used THEN the system SHALL CONTINUE TO distribute subjects based on progress and priority settings
3.4 WHEN the schedule is exported THEN the system SHALL CONTINUE TO generate text output with proper subject assignments
3.5 WHEN the schedule grid layout is rendered THEN the system SHALL CONTINUE TO maintain proper responsive design and visual styling