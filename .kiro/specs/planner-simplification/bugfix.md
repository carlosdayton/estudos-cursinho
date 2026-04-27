# Bugfix Requirements Document

## Introduction

The Study Planner module (Planner) is currently too complex for "leigos" (beginners/non-technical users) to use effectively. The interface presents multiple tabs, numerous separate inputs (7 daily hour inputs, priority/difficulty selectors per subject), technical terminology, and collapsible sections that hide important configuration. This complexity creates a barrier to entry for students who simply want to organize their ENEM study schedule. The fix will simplify the interface while maintaining the core functionality of automatic schedule generation based on priorities and available study hours.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a beginner user opens the Planner module THEN the system presents two separate tabs ("Cronograma" and "Configurar") requiring navigation between views to understand the full picture

1.2 WHEN a user needs to configure their study hours THEN the system requires 7 separate numeric inputs (one for each day of the week) making the configuration tedious and error-prone

1.3 WHEN a user views the configuration section THEN the system displays technical terminology like "Alocações", "Ritmo", "Tópicos/dia de estudo", and "Meta e Horas de Estudo" that are not intuitive for beginners

1.4 WHEN a user needs to set priorities THEN the system requires selecting both priority (3 levels: baixa/média/alta) AND difficulty (3 levels: fácil/médio/difícil) for each subject, creating decision fatigue

1.5 WHEN a user views the goal configuration THEN the system hides it in a collapsible section that must be manually expanded, obscuring critical setup information

1.6 WHEN a user views the pace indicator THEN the system displays detailed technical metrics (topicsPerStudyDay, remainingTopics, studyDaysLeft) with complex status logic that may overwhelm beginners

### Expected Behavior (Correct)

2.1 WHEN a beginner user opens the Planner module THEN the system SHALL present a single unified view showing both schedule and configuration without requiring tab navigation

2.2 WHEN a user needs to configure their study hours THEN the system SHALL provide a simplified input method that reduces the number of separate inputs while maintaining the ability to specify daily availability

2.3 WHEN a user views any section of the Planner THEN the system SHALL use simple, beginner-friendly language instead of technical terminology (e.g., "Seu Cronograma" instead of "Alocações", "Progresso" instead of "Ritmo")

2.4 WHEN a user needs to set priorities THEN the system SHALL provide a single, simplified priority selector per subject (removing the separate difficulty dimension) to reduce cognitive load

2.5 WHEN a user views the configuration section THEN the system SHALL display all critical setup information visibly by default without requiring interaction with collapsible sections

2.6 WHEN a user views the pace indicator THEN the system SHALL present progress information in a simple, encouraging format that focuses on actionable insights rather than detailed metrics

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the system generates the weekly schedule THEN the system SHALL CONTINUE TO distribute subjects across days based on priority weights (3:2:1 ratio for alta:média:baixa)

3.2 WHEN the system calculates pace indicators THEN the system SHALL CONTINUE TO compute topicsPerStudyDay, remainingTopics, and studyDaysLeft using the existing plannerEngine logic

3.3 WHEN a user configures daily hours THEN the system SHALL CONTINUE TO clamp values to the [0, 12] range and persist settings to localStorage

3.4 WHEN subjects are added or removed THEN the system SHALL CONTINUE TO synchronize the SubjectPriorityMap automatically via useStudyPlanning hook

3.5 WHEN the system displays subject allocations in the schedule grid THEN the system SHALL CONTINUE TO show subject colors, names, and allocated hours per day

3.6 WHEN a user sets a target date THEN the system SHALL CONTINUE TO calculate days remaining and show urgency indicators (colors based on time remaining)

3.7 WHEN the system detects all topics are completed THEN the system SHALL CONTINUE TO display the completion banner with Trophy icon

3.8 WHEN the target date has passed THEN the system SHALL CONTINUE TO show the "expired" status and prompt for a new date
