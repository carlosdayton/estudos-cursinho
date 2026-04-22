# Requirements Document: Payment System

## Introduction

This document specifies the requirements for an automated payment system that enables users to purchase access to the study platform through Mercado Pago integration. The system automates the complete flow from payment to account creation and platform access, eliminating manual intervention and providing immediate access upon successful payment.

## Glossary

- **Payment_Gateway**: Mercado Pago API service that processes payment transactions
- **Webhook_Handler**: Supabase Edge Function that receives and processes payment notifications
- **Auth_Service**: Supabase authentication service that manages user accounts and sessions
- **Subscription_Database**: PostgreSQL database storing user subscription and payment records
- **Magic_Link**: Time-limited authentication URL sent via email for passwordless login
- **Landing_Page**: Public marketing page where users learn about the platform
- **Checkout_Page**: Page where users enter email and initiate payment
- **Success_Page**: Page displayed after payment completion
- **Payment_Preference**: Mercado Pago configuration object containing payment details and metadata

## Requirements

### Requirement 1: Landing Page Access

**User Story:** As a potential customer, I want to view a landing page describing the platform, so that I can understand the value proposition before purchasing.

#### Acceptance Criteria

1. THE Landing_Page SHALL display platform features and benefits
2. THE Landing_Page SHALL include a call-to-action button for subscription
3. WHEN a user clicks the subscription button, THE Landing_Page SHALL navigate to the Checkout_Page

### Requirement 2: Email Collection and Payment Initiation

**User Story:** As a potential customer, I want to enter my email and proceed to payment, so that I can purchase platform access.

#### Acceptance Criteria

1. THE Checkout_Page SHALL provide an email input field
2. WHEN a user enters an email, THE Checkout_Page SHALL validate the email format
3. WHEN an invalid email is provided, THE Checkout_Page SHALL display an error message and prevent payment initiation
4. WHEN a valid email is provided, THE Checkout_Page SHALL create a Payment_Preference with the email as metadata
5. WHEN the Payment_Preference is created, THE Payment_Gateway SHALL return a checkout URL
6. THE Checkout_Page SHALL redirect the user to the Payment_Gateway checkout URL

### Requirement 3: Payment Processing

**User Story:** As a customer, I want to complete payment securely through Mercado Pago, so that I can purchase platform access.

#### Acceptance Criteria

1. THE Payment_Gateway SHALL present a secure payment interface
2. THE Payment_Gateway SHALL accept credit card, debit card, and other payment methods
3. WHEN payment is submitted, THE Payment_Gateway SHALL process the transaction
4. WHEN payment is approved, THE Payment_Gateway SHALL send a webhook notification to the Webhook_Handler
5. WHEN payment is rejected or pending, THE Payment_Gateway SHALL send a webhook notification with the appropriate status

### Requirement 4: Webhook Security and Validation

**User Story:** As a system administrator, I want webhook requests to be authenticated, so that only legitimate payment notifications are processed.

#### Acceptance Criteria

1. WHEN a webhook request is received, THE Webhook_Handler SHALL verify the x-signature header
2. IF the signature is invalid, THEN THE Webhook_Handler SHALL reject the request with 401 Unauthorized
3. WHEN the signature is valid, THE Webhook_Handler SHALL retrieve full payment details from the Payment_Gateway
4. THE Webhook_Handler SHALL validate that the payment status is "approved" before creating accounts

### Requirement 5: Automated Account Creation

**User Story:** As a customer, I want my account to be created automatically after payment, so that I can access the platform immediately without manual approval.

#### Acceptance Criteria

1. WHEN a payment is approved, THE Webhook_Handler SHALL create a user account in the Auth_Service
2. THE Webhook_Handler SHALL use the email from the payment metadata as the account email
3. WHEN the account is created, THE Auth_Service SHALL return a unique user_id
4. THE Webhook_Handler SHALL store the subscription record in the Subscription_Database with user_id, payment_id, and payment status
5. IF account creation fails, THEN THE Webhook_Handler SHALL log the error and return 500 Internal Server Error

### Requirement 6: Magic Link Authentication

**User Story:** As a customer, I want to receive a login link via email, so that I can access the platform without creating a password.

#### Acceptance Criteria

1. WHEN a user account is created, THE Auth_Service SHALL generate a Magic_Link
2. THE Auth_Service SHALL send the Magic_Link to the user's email address
3. THE Magic_Link SHALL be time-limited and expire after a configured duration
4. WHEN a user clicks the Magic_Link, THE Auth_Service SHALL authenticate the user session
5. WHEN authentication succeeds, THE Auth_Service SHALL redirect the user to the platform dashboard

### Requirement 7: Payment Confirmation Display

**User Story:** As a customer, I want to see confirmation after payment, so that I know my payment was processed and what to do next.

#### Acceptance Criteria

1. WHEN payment is completed, THE Payment_Gateway SHALL redirect the user to the Success_Page
2. WHEN payment is approved, THE Success_Page SHALL display a message instructing the user to check their email
3. WHEN payment is pending, THE Success_Page SHALL display a message indicating the payment is being processed
4. WHEN payment is rejected, THE Success_Page SHALL display an error message with next steps

### Requirement 8: Subscription Data Persistence

**User Story:** As a system administrator, I want payment and subscription data to be stored securely, so that I can track customer subscriptions and payment history.

#### Acceptance Criteria

1. THE Subscription_Database SHALL store subscription records with user_id, payment_id, status, and timestamps
2. THE Subscription_Database SHALL enforce Row Level Security policies
3. WHEN a subscription record is created, THE Subscription_Database SHALL set created_at timestamp automatically
4. THE Subscription_Database SHALL allow querying subscription status by user_id

### Requirement 9: Platform Access Control

**User Story:** As a platform user, I want to access platform features only after successful payment, so that access is properly controlled.

#### Acceptance Criteria

1. WHEN an authenticated user accesses platform pages, THE Auth_Service SHALL verify the user session
2. THE Subscription_Database SHALL enforce that only users with active subscriptions can access protected data
3. WHEN a user without an active subscription attempts to access protected data, THE Subscription_Database SHALL deny access
4. THE platform SHALL redirect unauthenticated users to the Landing_Page

### Requirement 10: Idempotent Webhook Processing

**User Story:** As a system administrator, I want duplicate webhook notifications to be handled safely, so that the same payment doesn't create multiple accounts.

#### Acceptance Criteria

1. WHEN a webhook notification is received for an existing payment_id, THE Webhook_Handler SHALL check if a subscription record already exists
2. IF a subscription record exists for the payment_id, THEN THE Webhook_Handler SHALL return 200 OK without creating a duplicate account
3. THE Webhook_Handler SHALL use payment_id as a unique constraint to prevent duplicate processing

### Requirement 11: Error Handling and Logging

**User Story:** As a system administrator, I want errors to be logged and handled gracefully, so that I can troubleshoot issues and ensure system reliability.

#### Acceptance Criteria

1. WHEN an error occurs in the Webhook_Handler, THE system SHALL log the error with payment_id and error details
2. WHEN the Payment_Gateway API is unavailable, THE Webhook_Handler SHALL return 500 Internal Server Error
3. WHEN email sending fails, THE Webhook_Handler SHALL log the error but still return 200 OK to the Payment_Gateway
4. THE system SHALL provide error messages to users in a user-friendly format without exposing internal details

### Requirement 12: Payment Preference Configuration

**User Story:** As a system administrator, I want to configure payment preferences, so that I can control pricing, payment methods, and checkout behavior.

#### Acceptance Criteria

1. THE Checkout_Page SHALL configure Payment_Preference with product title, description, and price
2. THE Payment_Preference SHALL include success and failure redirect URLs
3. THE Payment_Preference SHALL include the user's email as metadata
4. THE Payment_Preference SHALL specify accepted payment methods
5. THE Payment_Gateway SHALL use the Payment_Preference configuration to render the checkout interface
