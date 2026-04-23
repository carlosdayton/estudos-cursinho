# Implementation Plan: Payment System

## Overview

This implementation plan covers the complete payment system integration with Mercado Pago, including frontend pages (Landing, Checkout, Success), Supabase Edge Function for webhook handling, database schema, and comprehensive property-based testing for all 15 correctness properties. The implementation follows an incremental approach, building from database schema through backend webhook processing to frontend integration.

## Tasks

- [x] 1. Set up database schema and RLS policies
  - [x] 1.1 Create subscriptions table with required fields
    - Create migration file for subscriptions table
    - Define columns: id (uuid), user_id (uuid), payment_id (text), status (text), created_at (timestamptz), updated_at (timestamptz)
    - Add foreign key constraint to auth.users
    - Add unique constraint on payment_id for idempotency
    - _Requirements: 8.1, 8.3, 10.3_
  
  - [x] 1.2 Implement Row Level Security policies
    - Create RLS policy to allow users to read only their own subscription records
    - Create RLS policy to allow service role to insert/update subscription records
    - Enable RLS on subscriptions table
    - _Requirements: 8.2, 9.2, 9.3_
  
  - [ ]* 1.3 Write property test for subscription data persistence
    - **Property 8: Subscription Data Persistence**
    - **Validates: Requirements 8.1**
  
  - [ ]* 1.4 Write property test for automatic timestamp generation
    - **Property 9: Automatic Timestamp Generation**
    - **Validates: Requirements 8.3**
  
  - [ ]* 1.5 Write property test for subscription query by user ID
    - **Property 10: Subscription Query by User ID**
    - **Validates: Requirements 8.4**

- [x] 2. Implement Supabase Edge Function for webhook handling
  - [x] 2.1 Create webhook-handler Edge Function structure
    - Create Edge Function directory and index.ts file
    - Set up TypeScript types for Mercado Pago webhook payload
    - Configure CORS headers for webhook endpoint
    - _Requirements: 4.1, 11.1_
  
  - [x] 2.2 Implement webhook signature verification
    - Create function to verify x-signature header using Mercado Pago secret
    - Return 401 Unauthorized for invalid signatures
    - Log signature verification failures with payment context
    - _Requirements: 4.1, 4.2, 11.1_
  
  - [ ]* 2.3 Write property test for valid signature acceptance
    - **Property 3: Valid Signature Acceptance**
    - **Validates: Requirements 4.1**
  
  - [ ]* 2.4 Write property test for invalid signature rejection
    - **Property 4: Invalid Signature Rejection**
    - **Validates: Requirements 4.2**
  
  - [x] 2.5 Implement payment status validation
    - Fetch full payment details from Mercado Pago API
    - Validate payment status is "approved" before processing
    - Handle pending and rejected payment statuses appropriately
    - _Requirements: 3.4, 3.5, 4.3, 4.4_
  
  - [ ]* 2.6 Write property test for approved payment status validation
    - **Property 5: Approved Payment Status Validation**
    - **Validates: Requirements 4.4**
  
  - [x] 2.7 Implement idempotent webhook processing
    - Check if subscription record already exists for payment_id
    - Return 200 OK without side effects if record exists
    - Use payment_id unique constraint to prevent race conditions
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ]* 2.8 Write property test for idempotent webhook processing
    - **Property 12: Idempotent Webhook Processing**
    - **Validates: Requirements 10.1, 10.2**

- [ ] 3. Checkpoint - Verify webhook signature and idempotency logic
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement account creation and subscription storage
  - [x] 4.1 Implement user account creation in webhook handler
    - Extract email from payment metadata
    - Create user account using Supabase Admin API
    - Handle duplicate email scenarios gracefully
    - Return user_id for subscription record creation
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ]* 4.2 Write property test for account creation email mapping
    - **Property 6: Account Creation Email Mapping**
    - **Validates: Requirements 5.1, 5.2**
  
  - [x] 4.3 Implement subscription record creation
    - Insert subscription record with user_id, payment_id, status, and timestamps
    - Use Supabase service role client for database operations
    - Handle database insertion errors with proper logging
    - _Requirements: 5.4, 8.1_
  
  - [ ]* 4.4 Write property test for subscription record completeness
    - **Property 7: Subscription Record Completeness**
    - **Validates: Requirements 5.4**
  
  - [x] 4.5 Implement magic link email sending
    - Generate magic link using Supabase Auth API
    - Send magic link email to user's email address
    - Log email sending failures without failing webhook response
    - _Requirements: 6.1, 6.2, 11.3_
  
  - [x] 4.6 Implement error handling and logging
    - Add try-catch blocks for all external API calls
    - Log errors with payment_id and detailed context
    - Return appropriate HTTP status codes (200, 401, 500)
    - Sanitize error messages for user-facing responses
    - _Requirements: 5.5, 11.1, 11.2, 11.3, 11.4_
  
  - [ ]* 4.7 Write property test for error logging with context
    - **Property 13: Error Logging with Context**
    - **Validates: Requirements 11.1**
  
  - [ ]* 4.8 Write property test for user-facing error message sanitization
    - **Property 14: User-Facing Error Message Sanitization**
    - **Validates: Requirements 11.4**

- [x] 5. Checkpoint - Verify account creation and subscription flow
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Landing Page
  - [x] 6.1 Create Landing Page component
    - Create LandingPage.tsx component with hero section
    - Display platform features and benefits
    - Add call-to-action button for subscription
    - Style with existing CSS patterns from the project
    - _Requirements: 1.1, 1.2_
  
  - [x] 6.2 Implement navigation to Checkout Page
    - Add onClick handler to CTA button
    - Navigate to /checkout route using React Router
    - _Requirements: 1.3_
  
  - [ ]* 6.3 Write unit tests for Landing Page
    - Test CTA button renders correctly
    - Test navigation to checkout on button click
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 7. Implement Checkout Page
  - [x] 7.1 Create Checkout Page component with email input
    - Create CheckoutPage.tsx component
    - Add email input field with validation
    - Add submit button to initiate payment
    - Style with existing CSS patterns
    - _Requirements: 2.1, 2.2_
  
  - [x] 7.2 Implement email validation
    - Create email validation function using regex
    - Display error message for invalid email format
    - Prevent payment initiation when email is invalid
    - _Requirements: 2.2, 2.3_
  
  - [ ]* 7.3 Write property test for email validation
    - **Property 1: Email Validation**
    - **Validates: Requirements 2.2, 2.3**
  
  - [x] 7.4 Implement payment preference creation
    - Create API client function to call Mercado Pago API
    - Configure payment preference with product details, price, and metadata
    - Include user email in payment metadata
    - Include success and failure redirect URLs
    - Specify accepted payment methods
    - _Requirements: 2.4, 2.5, 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [ ]* 7.5 Write property test for payment preference email metadata
    - **Property 2: Payment Preference Email Metadata**
    - **Validates: Requirements 2.4, 12.3**
  
  - [ ]* 7.6 Write property test for payment preference configuration completeness
    - **Property 15: Payment Preference Configuration Completeness**
    - **Validates: Requirements 12.1, 12.2, 12.4**
  
  - [x] 7.7 Implement redirect to Mercado Pago checkout
    - Extract init_point URL from payment preference response
    - Redirect user to Mercado Pago checkout URL
    - Handle API errors with user-friendly messages
    - _Requirements: 2.6_
  
  - [ ]* 7.8 Write unit tests for Checkout Page
    - Test email input validation
    - Test payment preference creation flow
    - Test error handling for API failures
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 8. Checkpoint - Verify frontend checkout flow
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement Success Page
  - [x] 9.1 Create Success Page component
    - Create SuccessPage.tsx component
    - Parse payment status from URL query parameters
    - Display appropriate message based on payment status
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [x] 9.2 Implement status-specific messaging
    - Display "Check your email" message for approved payments
    - Display "Payment pending" message for pending payments
    - Display error message with next steps for rejected payments
    - Style messages with appropriate visual indicators
    - _Requirements: 7.2, 7.3, 7.4_
  
  - [ ]* 9.3 Write unit tests for Success Page
    - Test approved payment message display
    - Test pending payment message display
    - Test rejected payment message display
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 10. Implement platform access control
  - [x] 10.1 Create subscription check hook
    - Create useSubscription.ts hook to query subscription status
    - Query subscriptions table by authenticated user_id
    - Return subscription status and loading state
    - _Requirements: 8.4, 9.1, 9.2_
  
  - [x] 10.2 Implement protected route wrapper
    - Create ProtectedRoute component to check subscription status
    - Redirect to landing page if user is not authenticated
    - Display loading state while checking subscription
    - Allow access only if user has active subscription
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ]* 10.3 Write property test for subscription-based access control
    - **Property 11: Subscription-Based Access Control**
    - **Validates: Requirements 9.2, 9.3**
  
  - [ ]* 10.4 Write integration tests for protected routes
    - Test authenticated user with subscription can access platform
    - Test authenticated user without subscription is denied access
    - Test unauthenticated user is redirected to landing page
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 11. Implement magic link authentication flow
  - [x] 11.1 Configure Supabase Auth magic link settings
    - Set magic link expiration duration in Supabase dashboard
    - Configure email templates for magic link emails
    - Set redirect URL to platform dashboard
    - _Requirements: 6.3, 6.4, 6.5_
  
  - [x] 11.2 Implement magic link click handler
    - Handle magic link authentication callback in App.tsx
    - Extract session token from URL parameters
    - Authenticate user session using Supabase Auth
    - Redirect to dashboard on successful authentication
    - _Requirements: 6.4, 6.5_
  
  - [ ]* 11.3 Write integration tests for magic link flow
    - Test magic link authentication succeeds
    - Test expired magic link shows error message
    - Test successful authentication redirects to dashboard
    - _Requirements: 6.3, 6.4, 6.5_

- [x] 12. Integration and routing setup
  - [x] 12.1 Configure React Router routes
    - Add route for Landing Page at /
    - Add route for Checkout Page at /checkout
    - Add route for Success Page at /success
    - Wrap existing dashboard routes with ProtectedRoute
    - _Requirements: 1.3, 2.1, 7.1, 9.4_
  
  - [x] 12.2 Configure environment variables
    - Add MERCADO_PAGO_ACCESS_TOKEN to .env
    - Add MERCADO_PAGO_WEBHOOK_SECRET to .env
    - Add SUPABASE_SERVICE_ROLE_KEY to Edge Function secrets
    - Document required environment variables in README
    - _Requirements: 2.4, 4.1, 5.1_
  
  - [x] 12.3 Deploy Supabase Edge Function
    - Deploy webhook-handler Edge Function to Supabase
    - Configure webhook URL in Mercado Pago dashboard
    - Test webhook endpoint with Mercado Pago test notifications
    - _Requirements: 4.1, 4.2_
  
  - [ ]* 12.4 Write end-to-end integration tests
    - Test complete payment flow from landing to dashboard access
    - Test webhook processing with mock Mercado Pago notifications
    - Test idempotency with duplicate webhook notifications
    - _Requirements: All requirements_

- [x] 13. Final checkpoint - Verify complete payment system
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows
- Checkpoints ensure incremental validation at key milestones
- TypeScript is used throughout for type safety
- Supabase Edge Functions handle webhook processing securely
- Row Level Security policies enforce subscription-based access control
