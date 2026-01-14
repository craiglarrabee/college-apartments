/* Jest unit tests for lib/payment/chargeSquare.js
 * Mocks the Square SDK to verify normalization and error mapping.
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
  beforeAll(() => {
    // Provide required env for TEST location so module doesn't throw config errors
    process.env.TEST_SQUARE_ACCESS_TOKEN = process.env.TEST_SQUARE_ACCESS_TOKEN || 'TEST_ACCESS_TOKEN';
    process.env.TEST_SQUARE_LOCATION_ID = process.env.TEST_SQUARE_LOCATION_ID || 'TEST_LOCATION_ID';
    // Import module after env vars are set
    chargeSquare = require('./chargeSquare').default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: orders.createOrder succeeds
    __mock.ordersApi.createOrder.mockResolvedValue({ result: { order: { id: 'ORDER_ID_123' } } });
  });

  test('successfully maps a COMPLETED payment to normalized response', async () => {
    __mock.paymentsApi.createPayment.mockResolvedValue({
      result: {
        payment: {
          id: 'PAYMENT_ID_456',
          approvalCode: 'APPROVE123',
          status: 'COMPLETED',
          cardDetails: { card: { cardBrand: 'VISA', last4: '1111' } }
        }
      }
    });

    const resp = await chargeSquare({
      location: 'TEST',
      squareSourceId: 'cnon:card-nonce-ok',
      items: [{ description: 'January Rent', unitPrice: 25.0 }],
      total: 25.0,
      tenantFirstName: 'Student',
      tenantLastName: 'Name'
    });

    expect(resp).toEqual({
      transactionResponse: {
        transId: 'PAYMENT_ID_456',
        authCode: 'APPROVE123',
        accountType: 'VISA',
        accountNumber: 'XXXX1111'
      },
      messages: {
        resultCode: 'OK',
        message: [ { text: 'This transaction has been approved.' } ]
      }
    });
  });

  test('throws 400 if squareSourceId is missing', async () => {
    await expect(
      chargeSquare({ location: 'TEST', items: [], total: 1.23 })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('maps ApiError from Square to our error contract', async () => {
    __mock.paymentsApi.createPayment.mockRejectedValue(
      new ApiError([{ code: 'CARD_DECLINED', detail: 'Card was declined.' }])
    );

    await expect(
      chargeSquare({
        location: 'TEST',
        squareSourceId: 'cnon:card-nonce-ok',
        items: [{ description: 'X', unitPrice: 1 }],
        total: 1.0,
      })
    ).rejects.toMatchObject({ statusCode: 400, errormessage: 'Card was declined.' });
  });
});
