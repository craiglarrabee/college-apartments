# Square Test Cards & Error Conditions

This document provides a comprehensive list of test card numbers you can use with Square's **Sandbox environment** to simulate various payment scenarios and error conditions.

## Important Notes

- These cards **only work in Sandbox mode** (not production)
- Use any future expiration date (e.g., 12/25, 01/26, etc.)
- Use any 3-digit CVV (e.g., 111, 123, etc.)
- Use any billing postal code (e.g., 12345, 90210, etc.)

## Successful Payment Test Cards

### General Success Cards
| Card Number          | Brand              | Description                           |
|---------------------|-------------------|---------------------------------------|
| `4111 1111 1111 1111` | Visa              | Standard successful charge            |
| `5105 1051 0510 5100` | Mastercard        | Standard successful charge            |
| `3782 822463 10005`   | American Express  | Standard successful charge            |
| `6011 1111 1111 1117` | Discover          | Standard successful charge            |
| `3566 0020 2036 0505` | JCB               | Standard successful charge            |
| `3056 9309 0259 04`   | Diners Club       | Standard successful charge            |

### 3D Secure / SCA Test Cards
| Card Number          | Brand      | Description                                    |
|---------------------|-----------|------------------------------------------------|
| `4111 1111 1111 1111` | Visa      | Triggers SCA challenge flow                    |

## Error Condition Test Cards

### Card Declined Scenarios
| Card Number          | Error Type                    | Description                                  |
|---------------------|-------------------------------|----------------------------------------------|
| `4000 0000 0000 0002` | CARD_DECLINED                 | Generic card decline                         |
| `4000 0000 0000 9995` | INSUFFICIENT_FUNDS            | Insufficient funds in account                |
| `4000 0000 0000 0069` | CARD_EXPIRED                  | Expired card (use past expiration date too)  |
| `4000 0000 0000 0127` | INCORRECT_CVC                 | Incorrect CVV/CVC code                       |
| `4000 0000 0000 0119` | PROCESSING_ERROR              | Generic processing error from card issuer    |
| `4000 0000 0000 3220` | CALL_ISSUER                   | Card requires authorization from issuer      |
| `4000 0000 0000 3063` | FRAUDULENT                    | Card flagged as fraudulent                   |

### Specific Business Rule Failures
| Card Number          | Error Type                    | Description                                  |
|---------------------|-------------------------------|----------------------------------------------|
| `5555 5555 5555 4444` | CVV_FAILURE                   | CVV check fails                              |
| `4000 0000 0000 0010` | ADDRESS_VERIFICATION_FAILURE  | AVS check fails                              |
| `4242 4242 4242 4242` | INVALID_CARD                  | Invalid card number                          |
| `4000 0000 0000 0077` | PICKUP_CARD                   | Card should be picked up                     |
| `4000 0000 0000 0093` | CARD_NOT_SUPPORTED            | Card type not supported by merchant          |

### Network/Gateway Errors
| Card Number          | Error Type                    | Description                                  |
|---------------------|-------------------------------|----------------------------------------------|
| `4000 0000 0000 0101` | GATEWAY_TIMEOUT               | Gateway timeout error                        |
| `4000 0000 0000 0341` | TEMPORARY_ERROR               | Temporary processing error (retry possible)  |

## Testing with Square Web Payments SDK

When using the Square Web Payments SDK (which your implementation requires), you can:

1. **Use the Card component** in sandbox mode with these test card numbers
2. **Use Pre-filled Test Cards** from Square's Card component test mode
3. **Generate nonces** programmatically for automated testing

### Example: Testing in Browser (Manual)
```javascript
// Initialize Square Payments in Sandbox
const payments = Square.payments(APPLICATION_ID, LOCATION_ID);
const card = await payments.card();
await card.attach('#card-container');

// User enters test card: 4111 1111 1111 1111
// Exp: 12/25, CVV: 111, ZIP: 12345

const result = await card.tokenize();
// result.token = 'cnon:card-nonce-ok'  (successful tokenization)
```

### Example: Automated Testing (Mocking)
For your Jest tests (like `chargeSquare.test.js`), you can mock the Square token:

```javascript
test('handles CARD_DECLINED error', async () => {
  // Mock Square API to return CARD_DECLINED
  __mock.paymentsApi.createPayment.mockRejectedValue(
    new ApiError([{ 
      code: 'CARD_DECLINED', 
      detail: 'Card was declined by the issuer.' 
    }])
  );

  await expect(
    chargeSquare({
      location: 'TEST',
      squareSourceId: 'cnon:card-nonce-declined',  // mock nonce
      items: [{ description: 'Test', unitPrice: 10 }],
      total: 10,
      tenantFirstName: 'Test',
      tenantLastName: 'User'
    })
  ).rejects.toMatchObject({ 
    errormessage: expect.stringContaining('declined'),
    statusCode: 402 
  });
});
```

## Common Square Error Codes

When testing your error handling, these are the most common error codes you'll encounter:

| Error Code                      | HTTP Status | Meaning                                           |
|---------------------------------|-------------|---------------------------------------------------|
| `CARD_DECLINED`                 | 402         | Card was declined by issuer                       |
| `INSUFFICIENT_FUNDS`            | 402         | Not enough funds                                  |
| `CVV_FAILURE`                   | 402         | CVV verification failed                           |
| `ADDRESS_VERIFICATION_FAILURE`  | 402         | AVS check failed                                  |
| `CARD_EXPIRED`                  | 402         | Card has expired                                  |
| `INVALID_CARD`                  | 400         | Invalid card number format                        |
| `INVALID_EXPIRATION`            | 400         | Invalid expiration date                           |
| `UNAUTHORIZED`                  | 401         | Invalid access token                              |
| `NOT_FOUND`                     | 404         | Location or resource not found                    |
| `RATE_LIMITED`                  | 429         | Too many requests                                 |
| `INTERNAL_SERVER_ERROR`         | 500         | Square server error                               |
| `SERVICE_UNAVAILABLE`           | 503         | Square service temporarily unavailable            |

## Testing Workflow Recommendations

### 1. Unit Tests (Jest)
Test your `chargeSquare.js` logic by mocking Square SDK responses:
- ✅ Successful payment
- ✅ Missing token (400 error)
- ✅ Card declined scenarios
- ✅ Network errors
- ✅ Invalid configuration

### 2. Integration Tests (Sandbox)
Use actual Square Sandbox environment:
- ✅ Test with real test card numbers
- ✅ Verify proper nonce generation
- ✅ Test 3D Secure flows
- ✅ Verify webhook handling (if implemented)

### 3. Manual QA (Sandbox)
- ✅ Test full checkout flow with Square Card component
- ✅ Verify error messages display correctly to users
- ✅ Test on different browsers/devices
- ✅ Verify receipts and order confirmations

## Useful Square Testing Resources

- **Sandbox Dashboard**: https://squareup.com/dashboard/test-accounts
- **Web Payments SDK Docs**: https://developer.squareup.com/docs/web-payments/overview
- **Testing Guide**: https://developer.squareup.com/docs/testing/test-values
- **API Reference**: https://developer.squareup.com/reference/square/payments-api
- **Error Code Reference**: https://developer.squareup.com/docs/build-basics/handling-errors

## Environment Variables Required

Based on your implementation, ensure these are set for testing:

```bash
# For TEST location (sandbox)
TEST_SQUARE_ACCESS_TOKEN=your_sandbox_access_token
TEST_SQUARE_LOCATION_ID=your_sandbox_location_id

# For production locations (when ready)
CW_SQUARE_ACCESS_TOKEN=your_prod_access_token_cw
CW_SQUARE_LOCATION_ID=your_prod_location_id_cw

SW_SQUARE_ACCESS_TOKEN=your_prod_access_token_sw
SW_SQUARE_LOCATION_ID=your_prod_location_id_sw

PP_SQUARE_ACCESS_TOKEN=your_prod_access_token_pp
PP_SQUARE_LOCATION_ID=your_prod_location_id_pp
```

## Quick Reference: Error Simulation

To quickly test different error scenarios in your application:

```javascript
// In your test file or dev environment

const errorScenarios = [
  {
    card: '4000000000000002',
    expectedError: 'CARD_DECLINED',
    description: 'Generic decline'
  },
  {
    card: '4000000000009995',
    expectedError: 'INSUFFICIENT_FUNDS',
    description: 'Insufficient funds'
  },
  {
    card: '4000000000000069',
    expectedError: 'CARD_EXPIRED',
    description: 'Expired card'
  },
  {
    card: '4000000000000127',
    expectedError: 'INCORRECT_CVC',
    description: 'Wrong CVV'
  }
];

// Use these in automated tests or manual testing checklists
```

---

**Last Updated**: January 15, 2026
**Square API Version**: 2024-12-18 (or latest)

