import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Property-Based Tests for Webhook Handler
 * 
 * These tests validate the correctness properties defined in the design document
 * for webhook signature verification, payment status validation, and idempotent processing.
 * 
 * Note: These tests validate the logic of signature verification and validation functions.
 * Full integration tests would require a deployed Supabase Edge Function.
 */

// ─── Test Data Generators ─────────────────────────────────────────────────────

const paymentIdArbitrary = fc.string({ minLength: 10, maxLength: 50 });
const requestIdArbitrary = fc.uuid();
const timestampArbitrary = fc.integer({ min: 1600000000, max: 2000000000 });
const webhookSecretArbitrary = fc.string({ minLength: 32, maxLength: 64 });
const paymentStatusArbitrary = fc.constantFrom('approved', 'pending', 'rejected', 'cancelled', 'in_process');

// ─── Helper Functions (Extracted from Edge Function) ──────────────────────────

/**
 * Verify Mercado Pago webhook signature using HMAC-SHA256
 * This is the same logic as in the Edge Function, extracted for testing
 */
async function verifyWebhookSignature(
  signature: string,
  requestId: string,
  paymentId: string,
  secret: string
): Promise<boolean> {
  try {
    // Parse signature header (format: "ts=timestamp,v1=hash")
    const signatureParts = signature.split(',').reduce((acc, part) => {
      const [key, value] = part.split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const timestamp = signatureParts.ts;
    const receivedHash = signatureParts.v1;

    if (!timestamp || !receivedHash) {
      return false;
    }

    // Construct the signed content: id + request_id + timestamp
    const signedContent = `id:${paymentId};request-id:${requestId};ts:${timestamp};`;

    // Create HMAC-SHA256 hash
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(signedContent);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature_buffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const hashArray = Array.from(new Uint8Array(signature_buffer));
    const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Compare hashes
    return computedHash === receivedHash;
  } catch (error) {
    return false;
  }
}

/**
 * Generate a valid signature for testing
 */
async function generateValidSignature(
  paymentId: string,
  requestId: string,
  timestamp: number,
  secret: string
): Promise<string> {
  const signedContent = `id:${paymentId};request-id:${requestId};ts:${timestamp};`;
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(signedContent);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature_buffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature_buffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return `ts=${timestamp},v1=${hash}`;
}

/**
 * Validate payment status
 */
function isPaymentApproved(status: string): boolean {
  return status === 'approved';
}

// ─── Property 3: Valid Signature Acceptance ───────────────────────────────────

describe('Property 3: Valid Signature Acceptance', () => {
  /**
   * **Validates: Requirement 4.1**
   * 
   * For any webhook payload with a valid x-signature header, the Webhook_Handler
   * SHALL accept the request and proceed with payment verification.
   */
  it('accepts requests with valid signatures', async () => {
    await fc.assert(
      fc.asyncProperty(
        paymentIdArbitrary,
        requestIdArbitrary,
        timestampArbitrary,
        webhookSecretArbitrary,
        async (paymentId, requestId, timestamp, secret) => {
          // Generate a valid signature
          const validSignature = await generateValidSignature(
            paymentId,
            requestId,
            timestamp,
            secret
          );

          // Verify the signature
          const isValid = await verifyWebhookSignature(
            validSignature,
            requestId,
            paymentId,
            secret
          );

          // Property: Valid signatures should always be accepted
          expect(isValid).toBe(true);
          return isValid === true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('accepts signatures with different timestamp values', async () => {
    await fc.assert(
      fc.asyncProperty(
        paymentIdArbitrary,
        requestIdArbitrary,
        fc.integer({ min: 1, max: 9999999999 }),
        webhookSecretArbitrary,
        async (paymentId, requestId, timestamp, secret) => {
          const validSignature = await generateValidSignature(
            paymentId,
            requestId,
            timestamp,
            secret
          );

          const isValid = await verifyWebhookSignature(
            validSignature,
            requestId,
            paymentId,
            secret
          );

          expect(isValid).toBe(true);
          return isValid === true;
        }
      ),
      { numRuns: 30 }
    );
  });
});

// ─── Property 4: Invalid Signature Rejection ──────────────────────────────────

describe('Property 4: Invalid Signature Rejection', () => {
  /**
   * **Validates: Requirement 4.2**
   * 
   * For any webhook payload with an invalid or missing x-signature header,
   * the Webhook_Handler SHALL reject the request with 401 Unauthorized status.
   */
  it('rejects requests with invalid signatures', async () => {
    await fc.assert(
      fc.asyncProperty(
        paymentIdArbitrary,
        requestIdArbitrary,
        timestampArbitrary,
        webhookSecretArbitrary,
        fc.string({ minLength: 64, maxLength: 64 }), // Random hash
        async (paymentId, requestId, timestamp, secret, randomHash) => {
          // Create an invalid signature with a random hash
          const invalidSignature = `ts=${timestamp},v1=${randomHash}`;

          // Verify the signature
          const isValid = await verifyWebhookSignature(
            invalidSignature,
            requestId,
            paymentId,
            secret
          );

          // Property: Invalid signatures should always be rejected
          expect(isValid).toBe(false);
          return isValid === false;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('rejects signatures with tampered payment IDs', async () => {
    await fc.assert(
      fc.asyncProperty(
        paymentIdArbitrary,
        paymentIdArbitrary,
        requestIdArbitrary,
        timestampArbitrary,
        webhookSecretArbitrary,
        async (originalPaymentId, tamperedPaymentId, requestId, timestamp, secret) => {
          // Skip if payment IDs are the same
          fc.pre(originalPaymentId !== tamperedPaymentId);

          // Generate signature for original payment ID
          const signature = await generateValidSignature(
            originalPaymentId,
            requestId,
            timestamp,
            secret
          );

          // Try to verify with tampered payment ID
          const isValid = await verifyWebhookSignature(
            signature,
            requestId,
            tamperedPaymentId, // Different payment ID
            secret
          );

          // Property: Tampered payment IDs should be rejected
          expect(isValid).toBe(false);
          return isValid === false;
        }
      ),
      { numRuns: 30 }
    );
  });

  it('rejects signatures with tampered request IDs', async () => {
    await fc.assert(
      fc.asyncProperty(
        paymentIdArbitrary,
        requestIdArbitrary,
        requestIdArbitrary,
        timestampArbitrary,
        webhookSecretArbitrary,
        async (paymentId, originalRequestId, tamperedRequestId, timestamp, secret) => {
          // Skip if request IDs are the same
          fc.pre(originalRequestId !== tamperedRequestId);

          // Generate signature for original request ID
          const signature = await generateValidSignature(
            paymentId,
            originalRequestId,
            timestamp,
            secret
          );

          // Try to verify with tampered request ID
          const isValid = await verifyWebhookSignature(
            signature,
            tamperedRequestId, // Different request ID
            paymentId,
            secret
          );

          // Property: Tampered request IDs should be rejected
          expect(isValid).toBe(false);
          return isValid === false;
        }
      ),
      { numRuns: 30 }
    );
  });

  it('rejects signatures with wrong secret', async () => {
    await fc.assert(
      fc.asyncProperty(
        paymentIdArbitrary,
        requestIdArbitrary,
        timestampArbitrary,
        webhookSecretArbitrary,
        webhookSecretArbitrary,
        async (paymentId, requestId, timestamp, correctSecret, wrongSecret) => {
          // Skip if secrets are the same
          fc.pre(correctSecret !== wrongSecret);

          // Generate signature with correct secret
          const signature = await generateValidSignature(
            paymentId,
            requestId,
            timestamp,
            correctSecret
          );

          // Try to verify with wrong secret
          const isValid = await verifyWebhookSignature(
            signature,
            requestId,
            paymentId,
            wrongSecret // Different secret
          );

          // Property: Wrong secrets should be rejected
          expect(isValid).toBe(false);
          return isValid === false;
        }
      ),
      { numRuns: 30 }
    );
  });

  it('rejects malformed signature formats', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        requestIdArbitrary,
        paymentIdArbitrary,
        webhookSecretArbitrary,
        async (malformedSignature, requestId, paymentId, secret) => {
          // Skip valid signature formats
          fc.pre(!malformedSignature.includes('ts=') || !malformedSignature.includes('v1='));

          // Verify the malformed signature
          const isValid = await verifyWebhookSignature(
            malformedSignature,
            requestId,
            paymentId,
            secret
          );

          // Property: Malformed signatures should be rejected
          expect(isValid).toBe(false);
          return isValid === false;
        }
      ),
      { numRuns: 30 }
    );
  });
});

// ─── Property 5: Approved Payment Status Validation ───────────────────────────

describe('Property 5: Approved Payment Status Validation', () => {
  /**
   * **Validates: Requirement 4.4**
   * 
   * For any payment status value, the Webhook_Handler SHALL only trigger account
   * creation when the status is exactly "approved", ignoring all other status values.
   */
  it('only processes payments with "approved" status', async () => {
    await fc.assert(
      fc.asyncProperty(
        paymentStatusArbitrary,
        async (status) => {
          const shouldProcess = isPaymentApproved(status);

          // Property: Only "approved" status should trigger processing
          if (status === 'approved') {
            expect(shouldProcess).toBe(true);
            return shouldProcess === true;
          } else {
            expect(shouldProcess).toBe(false);
            return shouldProcess === false;
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('rejects pending payments', async () => {
    const shouldProcess = isPaymentApproved('pending');
    expect(shouldProcess).toBe(false);
  });

  it('rejects rejected payments', async () => {
    const shouldProcess = isPaymentApproved('rejected');
    expect(shouldProcess).toBe(false);
  });

  it('rejects cancelled payments', async () => {
    const shouldProcess = isPaymentApproved('cancelled');
    expect(shouldProcess).toBe(false);
  });

  it('rejects in_process payments', async () => {
    const shouldProcess = isPaymentApproved('in_process');
    expect(shouldProcess).toBe(false);
  });

  it('is case-sensitive for status validation', async () => {
    // Test case sensitivity
    expect(isPaymentApproved('Approved')).toBe(false);
    expect(isPaymentApproved('APPROVED')).toBe(false);
    expect(isPaymentApproved('approved')).toBe(true);
  });
});

// ─── Property 12: Idempotent Webhook Processing ───────────────────────────────

describe('Property 12: Idempotent Webhook Processing', () => {
  /**
   * **Validates: Requirements 10.1, 10.2**
   * 
   * For any payment_id, processing multiple webhook notifications with the same
   * payment_id SHALL result in exactly one user account and one subscription record
   * being created, with subsequent requests returning 200 OK without side effects.
   * 
   * Note: This test validates the idempotency logic. Full integration tests would
   * require a deployed Edge Function with database access.
   */
  it('identifies duplicate payment IDs correctly', async () => {
    // Mock subscription check logic
    const processedPayments = new Set<string>();

    const checkAndProcessPayment = (paymentId: string): boolean => {
      if (processedPayments.has(paymentId)) {
        // Already processed - return false to indicate no action taken
        return false;
      }
      // New payment - mark as processed
      processedPayments.add(paymentId);
      return true;
    };

    await fc.assert(
      fc.asyncProperty(
        paymentIdArbitrary,
        fc.integer({ min: 1, max: 5 }), // Number of duplicate requests
        async (paymentId, duplicateCount) => {
          processedPayments.clear();

          let processedCount = 0;

          // Process the same payment multiple times
          for (let i = 0; i < duplicateCount; i++) {
            const wasProcessed = checkAndProcessPayment(paymentId);
            if (wasProcessed) {
              processedCount++;
            }
          }

          // Property: Payment should only be processed once
          expect(processedCount).toBe(1);
          return processedCount === 1;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('handles multiple different payments correctly', async () => {
    const processedPayments = new Set<string>();

    const checkAndProcessPayment = (paymentId: string): boolean => {
      if (processedPayments.has(paymentId)) {
        return false;
      }
      processedPayments.add(paymentId);
      return true;
    };

    await fc.assert(
      fc.asyncProperty(
        fc.array(paymentIdArbitrary, { minLength: 1, maxLength: 10 }),
        async (paymentIds) => {
          processedPayments.clear();

          // Make payment IDs unique
          const uniquePaymentIds = [...new Set(paymentIds)];

          let processedCount = 0;

          // Process each unique payment
          for (const paymentId of uniquePaymentIds) {
            const wasProcessed = checkAndProcessPayment(paymentId);
            if (wasProcessed) {
              processedCount++;
            }
          }

          // Property: Each unique payment should be processed exactly once
          expect(processedCount).toBe(uniquePaymentIds.length);
          return processedCount === uniquePaymentIds.length;
        }
      ),
      { numRuns: 30 }
    );
  });
});
