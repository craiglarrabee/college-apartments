// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../lib/session/options";
import {AddUserPayment, GetPayment, MarkPaymentDeleted, MarkPaymentReviewed} from "../../../../lib/db/users/userPayment";
import {MarkTenantPaymentItemsPaid} from "../../../../lib/db/users/tenantPaymentItems";
import {GetTenant, GetTenantSquareCustomerId, UpdateTenantSquareCustomerId} from "../../../../lib/db/users/tenant";
import {ClearDeposit, ClearRecentDeposit} from "../../../../lib/db/users/application";
import chargeCreditCard from "../../../../lib/payment/chargeCreditCard";
import chargeSquare from "../../../../lib/payment/chargeSquare";
import {getOrCreateCustomer} from "../../../../lib/payment/squareCustomers";

const handler = withIronSessionApiRoute(async (req, res) => {
            if (!req.session?.user?.isLoggedIn) res.status(403).send();
            switch (req.method) {
                case "POST":
                    let payResp;
                    let data;
                    try {
                        data = {...req.body};
                        const useSquareForSnow = process.env.USE_SQUARE_FOR_SNOW === 'true';
                        const isSnowSite = req.query.site === 'snow';
                        if (useSquareForSnow && isSnowSite && data.squareSourceId) {
                            // Get tenant information
                            const tenant = await GetTenant(req.query.site, req.query.userId);

                            if (!tenant) {
                                throw { errormessage: "Tenant not found", statusCode: 404 };
                            }

                            // Get or create Square customer
                            let customerId = await GetTenantSquareCustomerId(req.query.userId);

                            if (!customerId) {
                                // No customer ID stored yet - get or create one
                                try {
                                    const customerResult = await getOrCreateCustomer({
                                        location: data.location,
                                        email: tenant.email,
                                        givenName: tenant.first_name,
                                        familyName: tenant.last_name,
                                        phoneNumber: tenant.cell_phone,
                                        referenceId: req.query.userId.toString(),
                                        address: {
                                            addressLine1: tenant.street,
                                            locality: tenant.city,
                                            administrativeDistrictLevel1: tenant.state,
                                            postalCode: tenant.zip
                                        }
                                    });

                                    customerId = customerResult.customerId;

                                    // Save customer ID to tenant record for future use
                                    await UpdateTenantSquareCustomerId(req.query.userId, customerId);

                                    if (process.env.NODE_ENV !== 'production') {
                                        console.log(`${new Date().toISOString()} - ${customerResult.isNew ? 'Created' : 'Found'} Square customer ${customerId} for tenant ${req.query.userId}`);
                                    }
                                } catch (customerError) {
                                    // Log customer creation error but continue with payment (customer ID not critical)
                                    console.error(`${new Date().toISOString()} - Failed to get/create Square customer:`, customerError);
                                    // Customer ID will be undefined - payment will proceed without it
                                }
                            }

                            // Add customer ID to payment data (if we have one)
                            if (customerId) {
                                data.customerId = customerId;
                            }

                            // Never log or persist the raw token
                            payResp = await chargeSquare(data);
                        } else {
                            payResp = await chargeCreditCard(data);
                        }
                    } catch (e) {
                        const errorResponse = {error: e.statusCode, message: e.errormessage};
                        // make sure we remove sensitive data before logging
                        delete data.cc_number;
                        delete data.cc_code;
                        delete data.cc_expire;
                        delete data.first_name;
                        delete data.last_name;
                        delete data.street;
                        delete data.city;
                        delete data.state;
                        delete data.zip;
                        console.error(`${new Date().toISOString()} -` , e);
                        res.status(400).json(errorResponse);
                        return;
                    }

                    try {
                        // record payment
                        // make sure we remove sensitive data before storing/logging
                        delete data.cc_number;
                        delete data.cc_code;
                        delete data.cc_expire;
                        delete data.first_name;
                        delete data.last_name;
                        delete data.street;
                        delete data.city;
                        delete data.state;
                        delete data.zip;
                        data.transId = payResp.transactionResponse.transId;
                        data.authCode = payResp.transactionResponse.authCode;
                        data.resultCode = payResp.messages?.resultCode;
                        data.resultMessage = payResp.messages?.message[0]?.text;
                        data.accountType = payResp.transactionResponse.accountType;
                        data.accountNumber = payResp.transactionResponse.accountNumber;

                        // Mark admin-created payment items as paid
                        if (data.adminItemIds && data.adminItemIds.length > 0) {
                            await MarkTenantPaymentItemsPaid(req.query.site, req.query.userId, data.adminItemIds, data.transId);
                        }

                        // create a payment record for each line item
                        // they will all have the same transactionId for grouping
                        await Promise.allSettled(data.items.map(item =>
                            AddUserPayment(req.query.site, req.query.userId,
                                {
                                    ...data,
                                    amount: item.amount,
                                    surcharge: item.surcharge,
                                    total: item.unitPrice,
                                    description: item.description
                                })));
                        res.status(200).send();
                    } catch (e) {
                        // if we successfully processed the payment
                        // but failed to record it, then log the error
                        // but don't send a failure (payment was successful)
                        console.error(`${new Date().toISOString()} - Failed to record payment: ${JSON.stringify(data)}\n with error: ${e}`);
                        res.status(200).send();
                        return;
                    }
                    return;
                case "PUT":
                    try {
                        await MarkPaymentReviewed(req.body.id);
                        res.status(204).send();
                    } catch (e) {
                        const errorResponse = {error: e.code, description: e.message};
                        console.error(`${new Date().toISOString()} -` , e);
                        res.status(400).json(errorResponse);
                    }
                    return;
                case "DELETE":
                    try {
                        const payment = await GetPayment(req.body.id);
                        await MarkPaymentDeleted(req.body.id, req.body.reason);
                        if (payment && payment.description === 'Security Deposit') {
                            if (payment.lease_id) {
                                await ClearDeposit(payment.site, payment.user_id, payment.lease_id);
                            } else {
                                await ClearRecentDeposit(payment.site, payment.user_id);
                            }
                        }
                        res.status(204).send();
                    } catch (e) {
                        const errorResponse = {error: e.code, description: e.message};
                        console.error(`${new Date().toISOString()} -` , e);
                        res.status(400).json(errorResponse);
                    }
                    return;
                default:
                    res.status(405).send();
            }
        },
        ironOptions
    )
;

export default handler;
