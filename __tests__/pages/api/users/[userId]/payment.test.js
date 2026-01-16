import handler from '../../../../../pages/api/users/[userId]/payment';
import {AddUserPayment, MarkPaymentDeleted, MarkPaymentReviewed} from '../../../../../lib/db/users/userPayment';
import {MarkTenantPaymentItemsPaid} from '../../../../../lib/db/users/tenantPaymentItems';
import chargeCreditCard from '../../../../../lib/payment/chargeCreditCard';
import chargeSquare from '../../../../../lib/payment/chargeSquare';

// Mock dependencies
jest.mock('../../../../../lib/db/users/userPayment');
jest.mock('../../../../../lib/db/users/tenantPaymentItems');
jest.mock('../../../../../lib/payment/chargeCreditCard');
jest.mock('../../../../../lib/payment/chargeSquare');

// Mock iron-session
jest.mock('iron-session/next', () => ({
    withIronSessionApiRoute: (handler) => handler
}));

describe('/api/users/[userId]/payment', () => {
    let req, res;

    beforeEach(() => {
        req = {
            session: {
                user: {
                    isLoggedIn: true
                }
            },
            query: {
                userId: '123',
                site: 'snow'
            },
            body: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        jest.clearAllMocks();
    });

    describe('POST - Create Payment', () => {
        beforeEach(() => {
            req.method = 'POST';
            req.body = {
                cc_number: '4111111111111111',
                cc_expire: '12/25',
                cc_code: '123',
                first_name: 'John',
                last_name: 'Doe',
                street: '123 Main St',
                city: 'City',
                state: 'ST',
                zip: '12345',
                total: '100.00',
                items: [
                    {description: 'Deposit', amount: '100.00', surcharge: '0', unitPrice: '100.00'}
                ]
            };
        });

        it('should return 403 if user is not logged in', async () => {
            req.session.user.isLoggedIn = false;

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.send).toHaveBeenCalled();
        });

        it('should return 400 with JSON error when payment processing fails', async () => {
            const error = new Error('Payment declined');
            error.statusCode = 'E00027';
            error.errormessage = 'Payment declined';
            chargeCreditCard.mockRejectedValue(error);

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'E00027',
                message: 'Payment declined'
            });
        });

        it('should process payment successfully and return 200', async () => {
            const mockPaymentResponse = {
                transactionResponse: {
                    transId: 'TX123456',
                    authCode: 'AUTH123',
                    accountType: 'Visa',
                    accountNumber: 'XXXX1111'
                },
                messages: {
                    resultCode: 'Ok',
                    message: [{text: 'Successful'}]
                }
            };

            chargeCreditCard.mockResolvedValue(mockPaymentResponse);
            AddUserPayment.mockResolvedValue();

            await handler(req, res);

            expect(chargeCreditCard).toHaveBeenCalled();
            expect(AddUserPayment).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalled();
        });

        it('should mark admin payment items as paid when adminItemIds are provided', async () => {
            req.body.adminItemIds = [1, 2, 3];
            const mockPaymentResponse = {
                transactionResponse: {
                    transId: 'TX123456',
                    authCode: 'AUTH123',
                    accountType: 'Visa',
                    accountNumber: 'XXXX1111'
                },
                messages: {
                    resultCode: 'Ok',
                    message: [{text: 'Successful'}]
                }
            };

            chargeCreditCard.mockResolvedValue(mockPaymentResponse);
            AddUserPayment.mockResolvedValue();
            MarkTenantPaymentItemsPaid.mockResolvedValue();

            await handler(req, res);

            expect(MarkTenantPaymentItemsPaid).toHaveBeenCalledWith(
                'snow',
                '123',
                [1, 2, 3],
                'TX123456'
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should use Square payment when USE_SQUARE_FOR_SNOW is enabled', async () => {
            process.env.USE_SQUARE_FOR_SNOW = 'true';
            req.body.squareSourceId = 'cnon:card-token-123';

            const mockSquareResponse = {
                transactionResponse: {
                    transId: 'SQ123456',
                    authCode: 'SQAUTH',
                    accountType: 'Visa',
                    accountNumber: 'XXXX1111'
                },
                messages: {
                    resultCode: 'Ok',
                    message: [{text: 'Successful'}]
                }
            };

            chargeSquare.mockResolvedValue(mockSquareResponse);
            AddUserPayment.mockResolvedValue();

            await handler(req, res);

            expect(chargeSquare).toHaveBeenCalled();
            expect(chargeCreditCard).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);

            delete process.env.USE_SQUARE_FOR_SNOW;
        });
    });

    describe('PUT - Mark Payment Reviewed', () => {
        beforeEach(() => {
            req.method = 'PUT';
            req.body = {id: 456};
        });

        it('should mark payment as reviewed and return 204', async () => {
            MarkPaymentReviewed.mockResolvedValue();

            await handler(req, res);

            expect(MarkPaymentReviewed).toHaveBeenCalledWith(456);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        it('should return 400 with JSON error when marking reviewed fails', async () => {
            const error = new Error('Database error');
            error.code = 'DB001';
            MarkPaymentReviewed.mockRejectedValue(error);

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'DB001',
                description: 'Database error'
            });
        });
    });

    describe('DELETE - Mark Payment Deleted', () => {
        beforeEach(() => {
            req.method = 'DELETE';
            req.body = {id: 789, reason: 'Duplicate payment'};
        });

        it('should mark payment as deleted and return 204', async () => {
            MarkPaymentDeleted.mockResolvedValue();

            await handler(req, res);

            expect(MarkPaymentDeleted).toHaveBeenCalledWith(789, 'Duplicate payment');
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        it('should return 400 with JSON error when marking deleted fails', async () => {
            const error = new Error('Database error');
            error.code = 'DB002';
            MarkPaymentDeleted.mockRejectedValue(error);

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'DB002',
                description: 'Database error'
            });
        });
    });

    describe('Unsupported Methods', () => {
        it('should return 405 for unsupported methods', async () => {
            req.method = 'PATCH';

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(405);
            expect(res.send).toHaveBeenCalled();
        });
    });
});

