# Quick Reference: Square Test Card Numbers

Use these card numbers when testing Square payments in **Sandbox mode only**.

## ✅ Success Cards

| Card Number          | Brand     | Use For                    |
|---------------------|-----------|----------------------------|
| `4111 1111 1111 1111` | Visa      | Standard successful payment |
| `5105 1051 0510 5100` | Mastercard| Standard successful payment |
| `3782 822463 10005`   | Amex      | Standard successful payment |

**For all cards**: Use any future date (e.g., 12/26), any CVV (e.g., 111), any ZIP (e.g., 12345)

## ❌ Error Cards

### Common Declines
| Card Number          | Error Type           | Message                          |
|---------------------|---------------------|----------------------------------|
| `4000 0000 0000 0002` | CARD_DECLINED       | Generic decline                  |
| `4000 0000 0000 9995` | INSUFFICIENT_FUNDS  | Not enough funds                 |
| `4000 0000 0000 0069` | CARD_EXPIRED        | Card is expired                  |
| `4000 0000 0000 0127` | INCORRECT_CVC       | Wrong CVV/CVC                    |

### Verification Failures
| Card Number          | Error Type                    | Message                  |
|---------------------|------------------------------|--------------------------|
| `5555 5555 5555 4444` | CVV_FAILURE                  | CVV check fails          |
| `4000 0000 0000 0010` | ADDRESS_VERIFICATION_FAILURE | AVS check fails          |

### Other Issues
| Card Number          | Error Type           | Message                          |
|---------------------|---------------------|----------------------------------|
| `4000 0000 0000 3063` | FRAUDULENT          | Flagged as fraudulent            |
| `4000 0000 0000 0119` | PROCESSING_ERROR    | Issuer processing error          |
| `4000 0000 0000 0101` | GATEWAY_TIMEOUT     | Gateway timeout                  |

## 🧪 Testing in Code

### Jest/Unit Tests (Mock)
```javascript
test('handles card decline', async () => {
  __mock.paymentsApi.createPayment.mockRejectedValue(
    new ApiError([{ 
      code: 'CARD_DECLINED', 
      detail: 'Card was declined by the issuer.' 
    }])
  );

  await expect(
    chargeSquare({
      location: 'TEST',
      squareSourceId: 'cnon:card-nonce-declined',
      items: [{ description: 'Rent', unitPrice: 500 }],
      total: 500,
      tenantFirstName: 'Test',
      tenantLastName: 'User'
    })
  ).rejects.toMatchObject({ 
    errormessage: 'Card was declined by the issuer.',
    statusCode: 400 
  });
});
```

### Integration Tests (Real Sandbox API)
```javascript
// Use real Square Web Payments SDK to generate nonce
const card = await payments.card();
await card.attach('#card-container');

// User enters: 4000 0000 0000 0002
// Exp: 12/26, CVV: 111, ZIP: 12345

const result = await card.tokenize();
// result.token will be a real nonce that simulates decline
```

### Manual Testing (Browser)
1. Go to your payment form in development mode
2. Enter test card number: `4111 1111 1111 1111`
3. Enter any future expiration: `12/26`
4. Enter any CVV: `111`
5. Enter any ZIP: `12345`
6. Submit - should succeed

To test error: Use `4000 0000 0000 0002` instead

## 📝 Notes

- These cards **only work in Sandbox**, not production
- The Square Web Payments SDK automatically tokenizes the card (you never handle raw card numbers)
- All test transactions appear in your Square Sandbox dashboard
- No real money is charged with these test cards

## 🔗 More Details

See `SQUARE_TEST_CARDS.md` for complete documentation.

---
**Last Updated**: January 15, 2026

