/* Jest unit tests for lib/payment/chargeSquare.js
 * Mocks the Square SDK to verify normalization and error mapping.
 * Tests cover various Square error scenarios based on test card behaviors.
 */

jest.mock('square', () => {
  class ApiError extends Error {
    constructor(errors) {
      super('ApiError');
      this.name = 'ApiError';
      this.errors = errors;
    }
  }

  const ordersApi = {
    createOrder: jest.fn()
  };
  const paymentsApi = {
    createPayment: jest.fn()
  };

  class Client {
    constructor() {
      this.ordersApi = ordersApi;
      this.paymentsApi = paymentsApi;
    }
  }

  const Environment = { Sandbox: 'sandbox', Production: 'production' };

  return { Client, Environment, ApiError, __mock: { ordersApi, paymentsApi } };
});

const { __mock, ApiError } = require('square');

let chargeSquare;

describe('chargeSquare', () => {
  const basePaymentRequest = {
    location: 'TEST',
    squareSourceId: 'cnon:card-nonce-ok',
    items: [{ description: 'Rent Payment', unitPrice: 100.0 }],
    total: 100.0,
    tenantFirstName: 'Test',
    tenantLastName: 'Tenant',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    street: '123 Main St',
    city: 'Anytown',
    state: 'UT',
    zip: '12345'
  };

  beforeAll(() => {
    process.env.TEST_SQUARE_ACCESS_TOKEN = process.env.TEST_SQUARE_ACCESS_TOKEN || 'TEST_ACCESS_TOKEN';
    process.env.TEST_SQUARE_LOCATION_ID = process.env.TEST_SQUARE_LOCATION_ID || 'TEST_LOCATION_ID';
    chargeSquare = require('./chargeSquare').default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    __mock.ordersApi.createOrder.mockResolvedValue({ result: { order: { id: 'ORDER_ID_123' } } });
  });

  describe('Successful Payments', () => {
    test('processes VISA payment successfully (4111 1111 1111 1111)', async () => {
      __mock.paymentsApi.createPayment.mockResolvedValue({
        result: {
          payment: {
            id: 'PAYMENT_VISA_456',
            approvalCode: 'APPROVE123',
            status: 'COMPLETED',
            cardDetails: { card: { cardBrand: 'VISA', last4: '1111' } }
          }
        }
      });

      const resp = await chargeSquare(basePaymentRequest);

      expect(resp.transactionResponse.accountType).toBe('VISA');
      expect(resp.transactionResponse.accountNumber).toBe('XXXX1111');
      expect(resp.messages.resultCode).toBe('OK');
    });

    test('processes Mastercard payment successfully (5105 1051 0510 5100)', async () => {
      __mock.paymentsApi.createPayment.mockResolvedValue({
        result: {
          payment: {
            id: 'PAYMENT_MC_789',
            approvalCode: 'MC_APPROVE',
            status: 'COMPLETED',
            cardDetails: { card: { cardBrand: 'MASTERCARD', last4: '5100' } }
          }
        }
      });

      const resp = await chargeSquare({ ...basePaymentRequest, squareSourceId: 'cnon:mc-nonce' });

      expect(resp.transactionResponse.accountType).toBe('MASTERCARD');
      expect(resp.messages.resultCode).toBe('OK');
    });

    test('processes American Express payment successfully (3782 822463 10005)', async () => {
      __mock.paymentsApi.createPayment.mockResolvedValue({
        result: {
          payment: {
            id: 'PAYMENT_AMEX_101',
            approvalCode: 'AMEX_AUTH',
            status: 'COMPLETED',
            cardDetails: { card: { cardBrand: 'AMERICAN_EXPRESS', last4: '0005' } }
          }
        }
      });

      const resp = await chargeSquare({ ...basePaymentRequest, squareSourceId: 'cnon:amex-nonce' });

      expect(resp.transactionResponse.accountType).toBe('AMERICAN_EXPRESS');
      expect(resp.messages.resultCode).toBe('OK');
    });
  });

  describe('Input Validation', () => {
    test('throws 400 if squareSourceId is missing', async () => {
      await expect(
        chargeSquare({ location: 'TEST', items: [], total: 1.23 })
      ).rejects.toMatchObject({
        statusCode: 400,
        errormessage: 'missing Square payment token'
      });
    });
  });

  describe('Card Declined Scenarios', () => {
    test('handles CARD_DECLINED error (4000 0000 0000 0002)', async () => {
      __mock.paymentsApi.createPayment.mockRejectedValue(
        new ApiError([{ code: 'CARD_DECLINED', detail: 'Card was declined by the issuer.' }])
      );

      await expect(
        chargeSquare({ ...basePaymentRequest, squareSourceId: 'cnon:card-declined' })
      ).rejects.toMatchObject({
        statusCode: 400,
        errormessage: 'Card was declined by the issuer.'
      });
    });

    test('handles INSUFFICIENT_FUNDS error (4000 0000 0000 9995)', async () => {
      __mock.paymentsApi.createPayment.mockRejectedValue(
        new ApiError([{ code: 'INSUFFICIENT_FUNDS', detail: 'The card has insufficient funds to complete the purchase.' }])
      );

      await expect(
        chargeSquare({ ...basePaymentRequest, squareSourceId: 'cnon:insufficient-funds' })
      ).rejects.toMatchObject({
        statusCode: 400,
        errormessage: 'The card has insufficient funds to complete the purchase.'
      });
    });

    test('handles CARD_EXPIRED error (4000 0000 0000 0069)', async () => {
      __mock.paymentsApi.createPayment.mockRejectedValue(
        new ApiError([{ code: 'CARD_EXPIRED', detail: 'The card is expired.' }])
      );

      await expect(
        chargeSquare({ ...basePaymentRequest, squareSourceId: 'cnon:expired-card' })
      ).rejects.toMatchObject({
        statusCode: 400,
        errormessage: 'The card is expired.'
      });
    });

    test('handles INCORRECT_CVC error (4000 0000 0000 0127)', async () => {
      __mock.paymentsApi.createPayment.mockRejectedValue(
        new ApiError([{ code: 'INCORRECT_CVC', detail: 'The card verification code (CVV) is incorrect.' }])
      );

      await expect(
        chargeSquare({ ...basePaymentRequest, squareSourceId: 'cnon:incorrect-cvc' })
      ).rejects.toMatchObject({
        statusCode: 400,
        errormessage: 'The card verification code (CVV) is incorrect.'
      });
    });

    test('handles PROCESSING_ERROR (4000 0000 0000 0119)', async () => {
      __mock.paymentsApi.createPayment.mockRejectedValue(
        new ApiError([{ code: 'PROCESSING_ERROR', detail: 'An error occurred while processing the card.' }])
      );

      await expect(
        chargeSquare({ ...basePaymentRequest, squareSourceId: 'cnon:processing-error' })
      ).rejects.toMatchObject({
        statusCode: 400,
        errormessage: 'An error occurred while processing the card.'
      });
    });

    test('handles CALL_ISSUER error (4000 0000 0000 3220)', async () => {
      __mock.paymentsApi.createPayment.mockRejectedValue(
        new ApiError([{ code: 'CALL_ISSUER', detail: 'The card issuer must be contacted for authorization.' }])
      );

      await expect(
        chargeSquare({ ...basePaymentRequest, squareSourceId: 'cnon:call-issuer' })
      ).rejects.toMatchObject({
        statusCode: 400,
        errormessage: 'The card issuer must be contacted for authorization.'
      });
    });

    test('handles FRAUDULENT error (4000 0000 0000 3063)', async () => {
      __mock.paymentsApi.createPayment.mockRejectedValue(
        new ApiError([{ code: 'FRAUDULENT', detail: 'The payment is suspected to be fraudulent.' }])
      );

      await expect(
        chargeSquare({ ...basePaymentRequest, squareSourceId: 'cnon:fraudulent' })
      ).rejects.toMatchObject({
        statusCode: 400,
        errormessage: 'The payment is suspected to be fraudulent.'
      });
    });
  });

  describe('Business Rule Failures', () => {
    test('handles CVV_FAILURE (5555 5555 5555 4444)', async () => {
      __mock.paymentsApi.createPayment.mockRejectedValue(
        new ApiError([{ code: 'CVV_FAILURE', detail: 'CVV verification failed.' }])
      );

      await expect(
        chargeSquare({ ...basePaymentRequest, squareSourceId: 'cnon:cvv-failure' })
      ).rejects.toMatchObject({
        statusCode: 400,
        errormessage: 'CVV verification failed.'
      });
    });

    test('handles ADDRESS_VERIFICATION_FAILURE (4000 0000 0000 0010)', async () => {
      __mock.paymentsApi.createPayment.mockRejectedValue(
        new ApiError([{ code: 'ADDRESS_VERIFICATION_FAILURE', detail: 'Address verification failed.' }])
      );

      await expect(
        chargeSquare({ ...basePaymentRequest, squareSourceId: 'cnon:avs-failure' })
      ).rejects.toMatchObject({
        statusCode: 400,
        errormessage: 'Address verification failed.'
      });
    });

    test('handles INVALID_CARD (4242 4242 4242 4242)', async () => {
      __mock.paymentsApi.createPayment.mockRejectedValue(
        new ApiError([{ code: 'INVALID_CARD', detail: 'The card number is invalid.' }])
      );

      await expect(
        chargeSquare({ ...basePaymentRequest, squareSourceId: 'cnon:invalid-card' })
      ).rejects.toMatchObject({
        statusCode: 400,
        errormessage: 'The card number is invalid.'
      });
    });

    test('handles PICKUP_CARD (4000 0000 0000 0077)', async () => {
      __mock.paymentsApi.createPayment.mockRejectedValue(
        new ApiError([{ code: 'PICKUP_CARD', detail: 'The card should be picked up from the cardholder.' }])
      );

      await expect(
        chargeSquare({ ...basePaymentRequest, squareSourceId: 'cnon:pickup-card' })
      ).rejects.toMatchObject({
        statusCode: 400,
        errormessage: 'The card should be picked up from the cardholder.'
      });
    });

    test('handles CARD_NOT_SUPPORTED (4000 0000 0000 0093)', async () => {
      __mock.paymentsApi.createPayment.mockRejectedValue(
        new ApiError([{ code: 'CARD_NOT_SUPPORTED', detail: 'This card type is not supported.' }])
      );

      await expect(
        chargeSquare({ ...basePaymentRequest, squareSourceId: 'cnon:card-not-supported' })
      ).rejects.toMatchObject({
        statusCode: 400,
        errormessage: 'This card type is not supported.'
      });
    });
  });

  describe('Network and Gateway Errors', () => {
    test('handles GATEWAY_TIMEOUT (4000 0000 0000 0101)', async () => {
      __mock.paymentsApi.createPayment.mockRejectedValue(
        new ApiError([{ code: 'GATEWAY_TIMEOUT', detail: 'The payment gateway timed out.' }])
      );

      await expect(
        chargeSquare({ ...basePaymentRequest, squareSourceId: 'cnon:gateway-timeout' })
      ).rejects.toMatchObject({
        statusCode: 400,
        errormessage: 'The payment gateway timed out.'
      });
    });

    test('handles TEMPORARY_ERROR (4000 0000 0000 0341)', async () => {
      __mock.paymentsApi.createPayment.mockRejectedValue(
        new ApiError([{ code: 'TEMPORARY_ERROR', detail: 'A temporary error occurred. Please try again.' }])
      );

      await expect(
        chargeSquare({ ...basePaymentRequest, squareSourceId: 'cnon:temporary-error' })
      ).rejects.toMatchObject({
        statusCode: 400,
        errormessage: 'A temporary error occurred. Please try again.'
      });
    });
  });

  describe('Order and Payment Response Handling', () => {
    test('handles order creation failure', async () => {
      __mock.ordersApi.createOrder.mockRejectedValue(
        new ApiError([{ code: 'INVALID_REQUEST_ERROR', detail: 'Invalid order data.' }])
      );

      await expect(
        chargeSquare(basePaymentRequest)
      ).rejects.toMatchObject({
        statusCode: 400,
        errormessage: 'Invalid order data.'
      });
    });

    test('handles missing order ID in response', async () => {
      __mock.ordersApi.createOrder.mockResolvedValue({ result: { order: {} } });

      await expect(
        chargeSquare(basePaymentRequest)
      ).rejects.toMatchObject({
        statusCode: 400,
        errormessage: 'Square order error'
      });
    });

    test('handles missing payment in response', async () => {
      __mock.paymentsApi.createPayment.mockResolvedValue({ result: {} });

      await expect(
        chargeSquare(basePaymentRequest)
      ).rejects.toMatchObject({
        statusCode: 424,
        errormessage: 'No payment response from Square'
      });
    });

    test('handles non-COMPLETED payment status', async () => {
      __mock.paymentsApi.createPayment.mockResolvedValue({
        result: {
          payment: {
            id: 'PAYMENT_PENDING',
            status: 'PENDING',
            cardDetails: { card: { cardBrand: 'VISA', last4: '1111' } }
          }
        }
      });

      const resp = await chargeSquare(basePaymentRequest);

      expect(resp.messages.resultCode).toBe('PENDING');
      expect(resp.messages.message[0].text).toContain('Status: PENDING');
    });

    test('maps error without detail to use code (falls back to detail)', async () => {
      __mock.paymentsApi.createPayment.mockRejectedValue(
        new ApiError([{ code: 'GENERIC_DECLINE' }])
      );

      await expect(
        chargeSquare(basePaymentRequest)
      ).rejects.toMatchObject({
        statusCode: 400,
        errormessage: 'GENERIC_DECLINE'
      });
    });

    test('handles unmapped error code (falls back to detail)', async () => {
      __mock.paymentsApi.createPayment.mockRejectedValue(
        new ApiError([{ code: 'UNKNOWN_ERROR_CODE', detail: 'Some unknown error occurred' }])
      );

      await expect(
        chargeSquare(basePaymentRequest)
      ).rejects.toMatchObject({
        statusCode: 400,
        errormessage: 'Some unknown error occurred'
      });
    });

    test('handles non-ApiError exceptions', async () => {
      __mock.paymentsApi.createPayment.mockRejectedValue(
        new Error('Network connection failed')
      );

      await expect(
        chargeSquare(basePaymentRequest)
      ).rejects.toMatchObject({
        statusCode: 400,
        errormessage: 'Network connection failed'
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles payment with minimal data', async () => {
      __mock.paymentsApi.createPayment.mockResolvedValue({
        result: {
          payment: {
            id: 'MIN_PAYMENT',
            status: 'COMPLETED'
          }
        }
      });

      const resp = await chargeSquare({
        location: 'TEST',
        squareSourceId: 'cnon:minimal',
        items: [{ description: 'Test', unitPrice: 10 }],
        total: 10
      });

      expect(resp.transactionResponse.transId).toBe('MIN_PAYMENT');
      expect(resp.transactionResponse.authCode).toBeUndefined();
      expect(resp.transactionResponse.accountNumber).toBeUndefined();
    });

    test('handles multiple line items', async () => {
      __mock.paymentsApi.createPayment.mockResolvedValue({
        result: {
          payment: {
            id: 'MULTI_ITEMS',
            status: 'COMPLETED',
            cardDetails: { card: { cardBrand: 'VISA', last4: '1111' } }
          }
        }
      });

      const resp = await chargeSquare({
        ...basePaymentRequest,
        items: [
          { description: 'Rent', unitPrice: 500 },
          { description: 'Utilities', unitPrice: 50 },
          { description: 'Parking', unitPrice: 25 }
        ],
        total: 575
      });

      expect(resp.messages.resultCode).toBe('OK');
    });

    test('handles verification token for SCA', async () => {
      __mock.paymentsApi.createPayment.mockResolvedValue({
        result: {
          payment: {
            id: 'SCA_PAYMENT',
            approvalCode: 'SCA_AUTH',
            status: 'COMPLETED',
            cardDetails: { card: { cardBrand: 'VISA', last4: '1111' } }
          }
        }
      });

      const resp = await chargeSquare({
        ...basePaymentRequest,
        squareVerificationToken: 'verification-token-123'
      });

      expect(resp.messages.resultCode).toBe('OK');
    });
  });
});

