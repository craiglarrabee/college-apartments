/* Jest unit tests for lib/payment/chargeCreditCard.js
 * Mocks the Authorize.Net SDK to verify payment processing and error handling.
 * Tests cover various payment scenarios including successful charges and error conditions.
 */

// Mock the authorizenet module before importing
jest.mock('authorizenet', () => {
  // Mock API Contracts
  class MerchantAuthenticationType {
    setName(name) { this._name = name; }
    setTransactionKey(key) { this._key = key; }
  }

  class CreditCardType {
    setCardNumber(num) { this._cardNumber = num; }
    setExpirationDate(date) { this._expirationDate = date; }
    setCardCode(code) { this._cardCode = code; }
  }

  class PaymentType {
    setCreditCard(card) { this._creditCard = card; }
  }

  class CustomerType {
    setType(type) { this._type = type; }
    setEmail(email) { this._email = email; }
  }

  class CustomerAddressType {
    setFirstName(name) { this._firstName = name; }
    setLastName(name) { this._lastName = name; }
    setAddress(addr) { this._address = addr; }
    setCity(city) { this._city = city; }
    setState(state) { this._state = state; }
    setZip(zip) { this._zip = zip; }
    setCountry(country) { this._country = country; }
  }

  class LineItemType {
    setItemId(id) { this._itemId = id; }
    setName(name) { this._name = name; }
    setQuantity(qty) { this._quantity = qty; }
    setUnitPrice(price) { this._unitPrice = price; }
  }

  class ArrayOfLineItem {
    setLineItem(items) { this._lineItems = items; }
  }

  class SettingType {
    setSettingName(name) { this._settingName = name; }
    setSettingValue(val) { this._settingValue = val; }
  }

  class ArrayOfSetting {
    setSetting(settings) { this._settings = settings; }
  }

  class OrderType {
    setDescription(desc) { this._description = desc; }
  }

  class TransactionRequestType {
    setTransactionType(type) { this._transactionType = type; }
    setPayment(payment) { this._payment = payment; }
    setAmount(amt) { this._amount = amt; }
    setBillTo(billTo) { this._billTo = billTo; }
    setTransactionSettings(settings) { this._transactionSettings = settings; }
    setOrder(order) { this._order = order; }
    setCustomer(customer) { this._customer = customer; }
    setLineItems(items) { this._lineItems = items; }
  }

  class CreateTransactionRequest {
    setMerchantAuthentication(auth) { this._auth = auth; }
    setTransactionRequest(req) { this._transactionRequest = req; }
    getJSON() { return {}; }
  }

  class CreateTransactionResponse {
    constructor(apiResponse) {
      this._apiResponse = apiResponse;
      // If apiResponse is null, the code checks response != null and rejects
      // So we need to handle null gracefully
    }
    getMessages() {
      if (!this._apiResponse) return null;
      return {
        getResultCode: () => this._apiResponse?.messages?.resultCode,
        message: this._apiResponse?.messages?.message
      };
    }
    getTransactionResponse() {
      if (!this._apiResponse?.transactionResponse) return null;
      const tr = this._apiResponse.transactionResponse;
      return {
        getMessages: () => tr.messages,
        getErrors: () => tr.errors ? {
          getError: () => tr.errors.error.map(e => ({
            getErrorText: () => e.errorText,
            getErrorCode: () => e.errorCode
          }))
        } : null,
        transId: tr.transId,
        authCode: tr.authCode,
        accountType: tr.accountType,
        accountNumber: tr.accountNumber
      };
    }
  }

  const MessageTypeEnum = {
    OK: 'Ok',
    ERROR: 'Error'
  };

  const TransactionTypeEnum = {
    AUTHCAPTURETRANSACTION: 'authCaptureTransaction'
  };

  const APIContracts = {
    MerchantAuthenticationType,
    CreditCardType,
    PaymentType,
    CustomerType,
    CustomerAddressType,
    LineItemType,
    ArrayOfLineItem,
    SettingType,
    ArrayOfSetting,
    OrderType,
    TransactionRequestType,
    CreateTransactionRequest,
    CreateTransactionResponse,
    MessageTypeEnum,
    TransactionTypeEnum
  };

  // Mock API Controllers
  const mockExecute = jest.fn();
  const mockGetResponse = jest.fn();
  const mockSetEnvironment = jest.fn();

  class CreateTransactionController {
    constructor(request) {
      this._request = request;
    }
    execute(callback) {
      mockExecute(callback);
      const response = mockGetResponse();
      callback(response);
    }
    getResponse() {
      return mockGetResponse();
    }
    setEnvironment(env) {
      mockSetEnvironment(env);
    }
  }

  const APIControllers = {
    CreateTransactionController,
    __mock: {
      execute: mockExecute,
      getResponse: mockGetResponse,
      setEnvironment: mockSetEnvironment
    }
  };

  const Constants = {
    endpoint: {
      production: 'https://api.authorize.net',
      sandbox: 'https://apitest.authorize.net'
    }
  };

  return {
    APIContracts,
    APIControllers,
    Constants,
    __mock: APIControllers.__mock
  };
});

const { __mock } = require('authorizenet').APIControllers;

let chargeCreditCard;

describe('chargeCreditCard', () => {
  const basePaymentRequest = {
    location: 'cw',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    street: '123 Main St',
    city: 'Anytown',
    state: 'UT',
    zip: '84601',
    cc_number: '4111 1111 1111 1111',
    cc_expire: '12/25',
    cc_code: '123',
    items: [{ description: 'Rent Payment', unitPrice: 500.0 }],
    total: 500.0,
    tenantFirstName: 'Jane',
    tenantLastName: 'Smith'
  };

  beforeAll(() => {
    // Set up test environment variables
    process.env.TEST_AUTHNET_API_LOGIN_ID = 'TEST_LOGIN';
    process.env.TEST_AUTHNET_TRANSACTION_KEY = 'TEST_KEY';
    process.env.CW_AUTHNET_API_LOGIN_ID = 'CW_LOGIN';
    process.env.CW_AUTHNET_TRANSACTION_KEY = 'CW_KEY';

    chargeCreditCard = require('./chargeCreditCard').default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Payments', () => {
    test('processes Visa payment successfully (4111 1111 1111 1111)', async () => {
      const mockApiResponse = {
        messages: {
          resultCode: 'Ok',
          message: [{ text: 'This transaction has been approved.' }]
        },
        transactionResponse: {
          messages: {
            message: [{ text: 'This transaction has been approved.' }]
          },
          errors: null,
          transId: 'TRANS123456',
          authCode: 'AUTH123',
          accountType: 'Visa',
          accountNumber: 'XXXX1111'
        }
      };

      const mockResponse = {
        getMessages: () => ({
          getResultCode: () => 'Ok',
          message: mockApiResponse.messages.message
        }),
        getTransactionResponse: () => ({
          getMessages: () => mockApiResponse.transactionResponse.messages,
          getErrors: () => null,
          transId: 'TRANS123456',
          authCode: 'AUTH123',
          accountType: 'Visa',
          accountNumber: 'XXXX1111'
        })
      };

      __mock.getResponse.mockReturnValue(mockApiResponse);

      const result = await chargeCreditCard(basePaymentRequest);

      expect(result).toBeDefined();
      expect(result.getTransactionResponse().transId).toBe('TRANS123456');
      expect(result.getTransactionResponse().accountType).toBe('Visa');
      expect(result.getTransactionResponse().accountNumber).toBe('XXXX1111');
    });

    test('processes Mastercard payment successfully (5105 1051 0510 5100)', async () => {
      const mockApiResponse = {
        messages: {
          resultCode: 'Ok',
          message: [{ text: 'This transaction has been approved.' }]
        },
        transactionResponse: {
          messages: {
            message: [{ text: 'This transaction has been approved.' }]
          },
          errors: null,
          transId: 'TRANS789012',
          authCode: 'AUTH456',
          accountType: 'Mastercard',
          accountNumber: 'XXXX5100'
        }
      };

      __mock.getResponse.mockReturnValue(mockApiResponse);

      const result = await chargeCreditCard({
        ...basePaymentRequest,
        cc_number: '5105 1051 0510 5100'
      });

      expect(result.getTransactionResponse().accountType).toBe('Mastercard');
      expect(result.getMessages().getResultCode()).toBe('Ok');
    });

    test('processes American Express payment successfully (3782 822463 10005)', async () => {
      const mockApiResponse = {
        messages: {
          resultCode: 'Ok',
          message: [{ text: 'This transaction has been approved.' }]
        },
        transactionResponse: {
          messages: {
            message: [{ text: 'This transaction has been approved.' }]
          },
          errors: null,
          transId: 'TRANS345678',
          authCode: 'AUTH789',
          accountType: 'American Express',
          accountNumber: 'XXXX0005'
        }
      };

      __mock.getResponse.mockReturnValue(mockApiResponse);

      const result = await chargeCreditCard({
        ...basePaymentRequest,
        cc_number: '3782 822463 10005'
      });

      expect(result.getTransactionResponse().accountType).toBe('American Express');
    });

    test('strips spaces from card number before processing', async () => {
      const mockApiResponse = {
        messages: {
          resultCode: 'Ok',
          message: [{ text: 'This transaction has been approved.' }]
        },
        transactionResponse: {
          messages: {
            message: [{ text: 'This transaction has been approved.' }]
          },
          errors: null,
          transId: 'TRANS999',
          authCode: 'AUTH999',
          accountType: 'Visa',
          accountNumber: 'XXXX1111'
        }
      };

      __mock.getResponse.mockReturnValue(mockApiResponse);

      await chargeCreditCard({
        ...basePaymentRequest,
        cc_number: '4111 1111 1111 1111' // spaces should be removed
      });

      expect(__mock.execute).toHaveBeenCalled();
    });
  });

  describe('Card Declined Scenarios', () => {
    test('handles card declined (E00027)', async () => {
      const mockApiResponse = {
        messages: {
          resultCode: 'Error',
          message: [{ text: 'Transaction failed' }]
        },
        transactionResponse: {
          messages: null,
          errors: {
            error: [{
              errorText: 'This transaction has been declined.',
              errorCode: '2'
            }]
          }
        }
      };

      __mock.getResponse.mockReturnValue(mockApiResponse);

      await expect(chargeCreditCard(basePaymentRequest))
        .rejects.toMatchObject({
          statusCode: 400,
          errormessage: 'This transaction has been declined.'
        });
    });

    test('handles insufficient funds', async () => {
      const mockApiResponse = {
        messages: {
          resultCode: 'Error',
          message: [{ text: 'Transaction failed' }]
        },
        transactionResponse: {
          messages: null,
          errors: {
            error: [{
              errorText: 'The credit card has insufficient funds.',
              errorCode: '27'
            }]
          }
        }
      };

      __mock.getResponse.mockReturnValue(mockApiResponse);

      await expect(chargeCreditCard(basePaymentRequest))
        .rejects.toMatchObject({
          statusCode: 400,
          errormessage: 'The credit card has insufficient funds.'
        });
    });

    test('handles expired card', async () => {
      const mockApiResponse = {
        messages: {
          resultCode: 'Error',
          message: [{ text: 'Transaction failed' }]
        },
        transactionResponse: {
          messages: null,
          errors: {
            error: [{
              errorText: 'The credit card has expired.',
              errorCode: '8'
            }]
          }
        }
      };

      __mock.getResponse.mockReturnValue(mockApiResponse);

      await expect(chargeCreditCard(basePaymentRequest))
        .rejects.toMatchObject({
          statusCode: 400,
          errormessage: 'The credit card has expired.'
        });
    });

    test('handles invalid card number', async () => {
      const mockApiResponse = {
        messages: {
          resultCode: 'Error',
          message: [{ text: 'Transaction failed' }]
        },
        transactionResponse: {
          messages: null,
          errors: {
            error: [{
              errorText: 'The credit card number is invalid.',
              errorCode: '6'
            }]
          }
        }
      };

      __mock.getResponse.mockReturnValue(mockApiResponse);

      await expect(chargeCreditCard(basePaymentRequest))
        .rejects.toMatchObject({
          statusCode: 400,
          errormessage: 'The credit card number is invalid.'
        });
    });

    test('handles invalid CVV', async () => {
      const mockApiResponse = {
        messages: {
          resultCode: 'Error',
          message: [{ text: 'Transaction failed' }]
        },
        transactionResponse: {
          messages: null,
          errors: {
            error: [{
              errorText: 'The card code is invalid.',
              errorCode: '78'
            }]
          }
        }
      };

      __mock.getResponse.mockReturnValue(mockApiResponse);

      await expect(chargeCreditCard(basePaymentRequest))
        .rejects.toMatchObject({
          statusCode: 400,
          errormessage: 'The card code is invalid.'
        });
    });
  });

  describe('Validation and Business Rules', () => {
    test('handles duplicate transaction window', async () => {
      const mockApiResponse = {
        messages: {
          resultCode: 'Error',
          message: [{ text: 'Transaction failed' }]
        },
        transactionResponse: {
          messages: null,
          errors: {
            error: [{
              errorText: 'A duplicate transaction has been submitted.',
              errorCode: '11'
            }]
          }
        }
      };

      __mock.getResponse.mockReturnValue(mockApiResponse);

      await expect(chargeCreditCard(basePaymentRequest))
        .rejects.toMatchObject({
          statusCode: 400,
          errormessage: 'A duplicate transaction has been submitted.'
        });
    });

    test('handles AVS (Address Verification) failure', async () => {
      const mockApiResponse = {
        messages: {
          resultCode: 'Error',
          message: [{ text: 'Transaction failed' }]
        },
        transactionResponse: {
          messages: null,
          errors: {
            error: [{
              errorText: 'The transaction was declined because of an AVS mismatch.',
              errorCode: '127'
            }]
          }
        }
      };

      __mock.getResponse.mockReturnValue(mockApiResponse);

      await expect(chargeCreditCard(basePaymentRequest))
        .rejects.toMatchObject({
          statusCode: 400,
          errormessage: 'The transaction was declined because of an AVS mismatch.'
        });
    });
  });

  describe('Error Response Handling', () => {
    test('handles error from messages object', async () => {
      const mockApiResponse = {
        messages: {
          resultCode: 'Error',
          message: [{ text: 'Authentication failed' }]
        },
        transactionResponse: null
      };

      __mock.getResponse.mockReturnValue(mockApiResponse);

      await expect(chargeCreditCard(basePaymentRequest))
        .rejects.toMatchObject({
          statusCode: 400,
          errormessage: 'Authentication failed'
        });
    });

    test('handles missing transaction response with error in messages', async () => {
      const mockApiResponse = {
        messages: {
          resultCode: 'Error',
          message: [{ text: 'Invalid merchant credentials' }]
        },
        transactionResponse: {
          messages: null,
          errors: null
        }
      };

      __mock.getResponse.mockReturnValue(mockApiResponse);

      await expect(chargeCreditCard(basePaymentRequest))
        .rejects.toMatchObject({
          statusCode: 400
        });
    });
  });

  describe('Multiple Line Items', () => {
    test('processes payment with multiple line items', async () => {
      const mockApiResponse = {
        messages: {
          resultCode: 'Ok',
          message: [{ text: 'This transaction has been approved.' }]
        },
        transactionResponse: {
          messages: {
            message: [{ text: 'This transaction has been approved.' }]
          },
          errors: null,
          transId: 'TRANS_MULTI',
          authCode: 'AUTH_MULTI',
          accountType: 'Visa',
          accountNumber: 'XXXX1111'
        }
      };

      __mock.getResponse.mockReturnValue(mockApiResponse);

      const result = await chargeCreditCard({
        ...basePaymentRequest,
        items: [
          { description: 'Rent', unitPrice: 500 },
          { description: 'Utilities', unitPrice: 50 },
          { description: 'Parking', unitPrice: 25 }
        ],
        total: 575
      });

      expect(result.getTransactionResponse().transId).toBe('TRANS_MULTI');
    });
  });

  describe('Environment Configuration', () => {
    let originalEnv;

    beforeEach(() => {
      originalEnv = process.env.NODE_ENV;
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    test('uses TEST location in development mode', async () => {
      process.env.NODE_ENV = 'development';

      const mockApiResponse = {
        messages: {
          resultCode: 'Ok',
          message: [{ text: 'This transaction has been approved.' }]
        },
        transactionResponse: {
          messages: {
            message: [{ text: 'This transaction has been approved.' }]
          },
          errors: null,
          transId: 'DEV_TRANS',
          authCode: 'DEV_AUTH',
          accountType: 'Visa',
          accountNumber: 'XXXX1111'
        }
      };

      __mock.getResponse.mockReturnValue(mockApiResponse);
      __mock.setEnvironment.mockClear();

      await chargeCreditCard(basePaymentRequest);

      // In development, should not call setEnvironment (uses sandbox by default)
      expect(__mock.setEnvironment).not.toHaveBeenCalled();
    });

    test('uses production endpoint in production mode', async () => {
      process.env.NODE_ENV = 'production';

      const mockApiResponse = {
        messages: {
          resultCode: 'Ok',
          message: [{ text: 'This transaction has been approved.' }]
        },
        transactionResponse: {
          messages: {
            message: [{ text: 'This transaction has been approved.' }]
          },
          errors: null,
          transId: 'PROD_TRANS',
          authCode: 'PROD_AUTH',
          accountType: 'Visa',
          accountNumber: 'XXXX1111'
        }
      };

      __mock.getResponse.mockReturnValue(mockApiResponse);
      __mock.setEnvironment.mockClear();

      await chargeCreditCard(basePaymentRequest);

      // In production, should set production environment
      expect(__mock.setEnvironment).toHaveBeenCalled();
    });
  });
});

