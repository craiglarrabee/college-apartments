/**
 * Unit tests for Square Customers API integration
 */

// Mock Square SDK
const mockSearchCustomers = jest.fn();
const mockCreateCustomer = jest.fn();
const mockRetrieveCustomer = jest.fn();
const mockUpdateCustomer = jest.fn();
const mockDeleteCustomer = jest.fn();

class MockApiError extends Error {
    constructor(errors) {
        super('Square API Error');
        this.errors = errors;
        this.name = 'ApiError';
    }
}

// Make ApiError available globally for the mock
global.SquareApiError = MockApiError;

jest.mock('square', () => {
    const mockClient = {
        customersApi: {
            searchCustomers: (...args) => mockSearchCustomers(...args),
            createCustomer: (...args) => mockCreateCustomer(...args),
            retrieveCustomer: (...args) => mockRetrieveCustomer(...args),
            updateCustomer: (...args) => mockUpdateCustomer(...args),
            deleteCustomer: (...args) => mockDeleteCustomer(...args)
        }
    };

    return {
        Client: jest.fn(() => mockClient),
        Environment: {
            Production: 'production',
            Sandbox: 'sandbox'
        },
        ApiError: global.SquareApiError
    };
});

jest.mock('../constants.js', () => ({
    squareLocationDetails: {
        TEST: {
            accessToken: 'test_access_token',
            locationId: 'test_location_id'
        },
        pp: {
            accessToken: 'pp_access_token',
            locationId: 'pp_location_id'
        }
    }
}));

describe('Square Customers API', () => {
    let squareCustomers;

    beforeAll(async () => {
        // Dynamically import the module
        squareCustomers = await import('./squareCustomers.js');
    });

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NODE_ENV = 'development';
    });

    describe('getOrCreateCustomer', () => {
        const baseParams = {
            location: 'pp',
            email: 'test@example.com',
            givenName: 'Test',
            familyName: 'User',
            phoneNumber: '8015551234',
            referenceId: '123',
            address: {
                addressLine1: '123 Test St',
                locality: 'Test City',
                administrativeDistrictLevel1: 'UT',
                postalCode: '84601'
            }
        };

        test('returns existing customer when found by email', async () => {
            const existingCustomer = {
                id: 'CUSTOMER_123',
                emailAddress: 'test@example.com',
                givenName: 'Test',
                familyName: 'User'
            };

            mockSearchCustomers.mockResolvedValue({
                result: {
                    customers: [existingCustomer]
                }
            });

            const result = await squareCustomers.getOrCreateCustomer(baseParams);

            expect(result.customerId).toBe('CUSTOMER_123');
            expect(result.isNew).toBe(false);
            expect(result.customer).toEqual(existingCustomer);
            expect(mockSearchCustomers).toHaveBeenCalledTimes(1);
            expect(mockCreateCustomer).not.toHaveBeenCalled();
        });

        test('creates new customer when not found', async () => {
            mockSearchCustomers.mockResolvedValue({
                result: {
                    customers: []
                }
            });

            const newCustomer = {
                id: 'CUSTOMER_456',
                emailAddress: 'test@example.com',
                givenName: 'Test',
                familyName: 'User'
            };

            mockCreateCustomer.mockResolvedValue({
                result: {
                    customer: newCustomer
                }
            });

            const result = await squareCustomers.getOrCreateCustomer(baseParams);

            expect(result.customerId).toBe('CUSTOMER_456');
            expect(result.isNew).toBe(true);
            expect(result.customer).toEqual(newCustomer);
            expect(mockSearchCustomers).toHaveBeenCalledTimes(1);
            expect(mockCreateCustomer).toHaveBeenCalledTimes(1);
        });

        test('includes address in create request when provided', async () => {
            mockSearchCustomers.mockResolvedValue({
                result: { customers: [] }
            });

            mockCreateCustomer.mockResolvedValue({
                result: {
                    customer: { id: 'CUSTOMER_789', emailAddress: 'test@example.com' }
                }
            });

            await squareCustomers.getOrCreateCustomer(baseParams);

            expect(mockCreateCustomer).toHaveBeenCalledWith(
                expect.objectContaining({
                    address: {
                        addressLine1: '123 Test St',
                        locality: 'Test City',
                        administrativeDistrictLevel1: 'UT',
                        postalCode: '84601',
                        country: 'US'
                    }
                })
            );
        });

        test('omits address from create request when not provided', async () => {
            mockSearchCustomers.mockResolvedValue({
                result: { customers: [] }
            });

            mockCreateCustomer.mockResolvedValue({
                result: {
                    customer: { id: 'CUSTOMER_789', emailAddress: 'test@example.com' }
                }
            });

            const paramsWithoutAddress = { ...baseParams };
            delete paramsWithoutAddress.address;

            await squareCustomers.getOrCreateCustomer(paramsWithoutAddress);

            expect(mockCreateCustomer).toHaveBeenCalledWith(
                expect.not.objectContaining({
                    address: expect.anything()
                })
            );
        });

        test('throws error when email is missing', async () => {
            const paramsWithoutEmail = { ...baseParams };
            delete paramsWithoutEmail.email;

            await expect(squareCustomers.getOrCreateCustomer(paramsWithoutEmail))
                .rejects.toMatchObject({
                    errormessage: 'Email is required to get or create customer',
                    statusCode: 400
                });

            expect(mockSearchCustomers).not.toHaveBeenCalled();
        });

        test('throws error when Square credentials are missing', async () => {
            // Set to production mode so it uses the actual location parameter
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            await expect(squareCustomers.getOrCreateCustomer({
                ...baseParams,
                location: 'invalid_location'
            })).rejects.toMatchObject({
                errormessage: expect.stringContaining('Square configuration missing'),
                statusCode: 500
            });

            // Restore environment
            process.env.NODE_ENV = originalEnv;
        });

        test('handles Square API error during search', async () => {
            mockSearchCustomers.mockRejectedValue(
                new MockApiError([{
                    code: 'UNAUTHORIZED',
                    detail: 'Invalid credentials'
                }])
            );

            await expect(squareCustomers.getOrCreateCustomer(baseParams))
                .rejects.toMatchObject({
                    errormessage: 'Invalid credentials',
                    statusCode: 400
                });
        });

        test('handles Square API error during create', async () => {
            mockSearchCustomers.mockResolvedValue({
                result: { customers: [] }
            });

            mockCreateCustomer.mockRejectedValue(
                new MockApiError([{
                    code: 'INVALID_REQUEST_ERROR',
                    detail: 'Email address is invalid'
                }])
            );

            await expect(squareCustomers.getOrCreateCustomer(baseParams))
                .rejects.toMatchObject({
                    errormessage: 'Email address is invalid',
                    statusCode: 400
                });
        });

        test('handles error when customer creation returns no ID', async () => {
            mockSearchCustomers.mockResolvedValue({
                result: { customers: [] }
            });

            mockCreateCustomer.mockResolvedValue({
                result: {
                    customer: { emailAddress: 'test@example.com' } // No ID
                }
            });

            await expect(squareCustomers.getOrCreateCustomer(baseParams))
                .rejects.toMatchObject({
                    errormessage: 'Failed to create Square customer - no ID returned',
                    statusCode: 500
                });
        });

        test('uses TEST location in development mode', async () => {
            process.env.NODE_ENV = 'development';

            mockSearchCustomers.mockResolvedValue({
                result: { customers: [] }
            });

            mockCreateCustomer.mockResolvedValue({
                result: {
                    customer: { id: 'CUSTOMER_TEST', emailAddress: 'test@example.com' }
                }
            });

            await squareCustomers.getOrCreateCustomer(baseParams);

            // Should use TEST credentials even though location is 'pp'
            expect(mockSearchCustomers).toHaveBeenCalled();
        });
    });

    describe('searchCustomersByEmail', () => {
        test('returns array of matching customers', async () => {
            const customers = [
                { id: 'CUSTOMER_1', emailAddress: 'test@example.com' },
                { id: 'CUSTOMER_2', emailAddress: 'test@example.com' }
            ];

            mockSearchCustomers.mockResolvedValue({
                result: { customers }
            });

            const result = await squareCustomers.searchCustomersByEmail({
                location: 'pp',
                email: 'test@example.com'
            });

            expect(result).toEqual(customers);
            expect(result.length).toBe(2);
        });

        test('returns empty array when no customers found', async () => {
            mockSearchCustomers.mockResolvedValue({
                result: { customers: [] }
            });

            const result = await squareCustomers.searchCustomersByEmail({
                location: 'pp',
                email: 'nonexistent@example.com'
            });

            expect(result).toEqual([]);
            expect(result.length).toBe(0);
        });

        test('returns empty array when result is null', async () => {
            mockSearchCustomers.mockResolvedValue({
                result: null
            });

            const result = await squareCustomers.searchCustomersByEmail({
                location: 'pp',
                email: 'test@example.com'
            });

            expect(result).toEqual([]);
        });

        test('throws error when email is missing', async () => {
            await expect(squareCustomers.searchCustomersByEmail({
                location: 'pp',
                email: ''
            })).rejects.toMatchObject({
                errormessage: 'Email is required to search customers',
                statusCode: 400
            });
        });

        test('handles Square API error', async () => {
            mockSearchCustomers.mockRejectedValue(
                new MockApiError([{
                    code: 'SERVICE_UNAVAILABLE',
                    detail: 'Service temporarily unavailable'
                }])
            );

            await expect(squareCustomers.searchCustomersByEmail({
                location: 'pp',
                email: 'test@example.com'
            })).rejects.toMatchObject({
                errormessage: 'Service temporarily unavailable',
                statusCode: 400
            });
        });
    });

    describe('getCustomer', () => {
        test('retrieves customer by ID', async () => {
            const customer = {
                id: 'CUSTOMER_123',
                emailAddress: 'test@example.com',
                givenName: 'Test',
                familyName: 'User'
            };

            mockRetrieveCustomer.mockResolvedValue({
                result: { customer }
            });

            const result = await squareCustomers.getCustomer({
                location: 'pp',
                customerId: 'CUSTOMER_123'
            });

            expect(result).toEqual(customer);
            expect(mockRetrieveCustomer).toHaveBeenCalledWith('CUSTOMER_123');
        });

        test('throws error when customer ID is missing', async () => {
            await expect(squareCustomers.getCustomer({
                location: 'pp',
                customerId: ''
            })).rejects.toMatchObject({
                errormessage: 'Customer ID is required',
                statusCode: 400
            });
        });

        test('handles Square API error', async () => {
            mockRetrieveCustomer.mockRejectedValue(
                new MockApiError([{
                    code: 'NOT_FOUND',
                    detail: 'Customer not found'
                }])
            );

            await expect(squareCustomers.getCustomer({
                location: 'pp',
                customerId: 'INVALID_ID'
            })).rejects.toMatchObject({
                errormessage: 'Customer not found',
                statusCode: 400
            });
        });
    });

    describe('updateCustomer', () => {
        test('updates customer successfully', async () => {
            const updatedCustomer = {
                id: 'CUSTOMER_123',
                emailAddress: 'updated@example.com',
                givenName: 'Updated',
                familyName: 'User'
            };

            mockUpdateCustomer.mockResolvedValue({
                result: { customer: updatedCustomer }
            });

            const result = await squareCustomers.updateCustomer({
                location: 'pp',
                customerId: 'CUSTOMER_123',
                updates: {
                    emailAddress: 'updated@example.com',
                    givenName: 'Updated'
                }
            });

            expect(result).toEqual(updatedCustomer);
            expect(mockUpdateCustomer).toHaveBeenCalledWith(
                'CUSTOMER_123',
                expect.objectContaining({
                    emailAddress: 'updated@example.com',
                    givenName: 'Updated'
                })
            );
        });

        test('throws error when customer ID is missing', async () => {
            await expect(squareCustomers.updateCustomer({
                location: 'pp',
                customerId: '',
                updates: { givenName: 'Test' }
            })).rejects.toMatchObject({
                errormessage: 'Customer ID is required',
                statusCode: 400
            });
        });

        test('handles Square API error', async () => {
            mockUpdateCustomer.mockRejectedValue(
                new MockApiError([{
                    code: 'INVALID_REQUEST_ERROR',
                    detail: 'Invalid email format'
                }])
            );

            await expect(squareCustomers.updateCustomer({
                location: 'pp',
                customerId: 'CUSTOMER_123',
                updates: { emailAddress: 'invalid-email' }
            })).rejects.toMatchObject({
                errormessage: 'Invalid email format',
                statusCode: 400
            });
        });
    });

    describe('deleteCustomer', () => {
        test('deletes customer successfully', async () => {
            mockDeleteCustomer.mockResolvedValue({
                result: {}
            });

            await expect(squareCustomers.deleteCustomer({
                location: 'pp',
                customerId: 'CUSTOMER_123'
            })).resolves.toBeUndefined();

            expect(mockDeleteCustomer).toHaveBeenCalledWith('CUSTOMER_123');
        });

        test('throws error when customer ID is missing', async () => {
            await expect(squareCustomers.deleteCustomer({
                location: 'pp',
                customerId: ''
            })).rejects.toMatchObject({
                errormessage: 'Customer ID is required',
                statusCode: 400
            });
        });

        test('handles Square API error', async () => {
            mockDeleteCustomer.mockRejectedValue(
                new MockApiError([{
                    code: 'NOT_FOUND',
                    detail: 'Customer not found'
                }])
            );

            await expect(squareCustomers.deleteCustomer({
                location: 'pp',
                customerId: 'INVALID_ID'
            })).rejects.toMatchObject({
                errormessage: 'Customer not found',
                statusCode: 400
            });
        });
    });

    describe('Error handling', () => {
        test('handles API error with code but no detail', async () => {
            mockSearchCustomers.mockRejectedValue(
                new MockApiError([{
                    code: 'UNKNOWN_ERROR'
                }])
            );

            await expect(squareCustomers.searchCustomersByEmail({
                location: 'pp',
                email: 'test@example.com'
            })).rejects.toMatchObject({
                errormessage: 'UNKNOWN_ERROR',
                statusCode: 400
            });
        });

        test('handles API error with no code or detail', async () => {
            mockSearchCustomers.mockRejectedValue(
                new MockApiError([{}])
            );

            await expect(squareCustomers.searchCustomersByEmail({
                location: 'pp',
                email: 'test@example.com'
            })).rejects.toMatchObject({
                errormessage: 'Failed to search customers',
                statusCode: 400
            });
        });

        test('handles non-API errors', async () => {
            mockSearchCustomers.mockRejectedValue(
                new Error('Network error')
            );

            await expect(squareCustomers.searchCustomersByEmail({
                location: 'pp',
                email: 'test@example.com'
            })).rejects.toMatchObject({
                errormessage: 'Network error',
                statusCode: 400
            });
        });
    });
});

