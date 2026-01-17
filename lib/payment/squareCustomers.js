"use strict";

/**
 * Square Customers API integration
 *
 * Strategy: Search first, create if not found
 * - Prevents duplicate customer profiles
 * - Links tenants to Square customers via customer ID
 * - Customer ID stored in tenant table for future use
 *
 * Documentation: https://developer.squareup.com/docs/customers-api/what-it-does
 */

import { Client, Environment, ApiError } from "square";
import * as Constants from "../constants.js";

/**
 * Get or create a Square customer for a tenant
 *
 * This is the main function you'll use - it handles everything:
 * 1. Searches for existing customer by email
 * 2. If found, returns existing customer ID
 * 3. If not found, creates new customer and returns ID
 *
 * @param {Object} params
 * @param {("cw"|"sw"|"pp"|"TEST")} params.location - Property location
 * @param {string} params.email - Customer email (required, used for search/create)
 * @param {string} [params.givenName] - Customer first name
 * @param {string} [params.familyName] - Customer last name
 * @param {string} [params.phoneNumber] - Customer phone number
 * @param {string} [params.referenceId] - Your internal reference ID (tenant user_id recommended)
 * @param {Object} [params.address] - Customer address
 * @param {string} [params.address.addressLine1] - Street address
 * @param {string} [params.address.locality] - City
 * @param {string} [params.address.administrativeDistrictLevel1] - State
 * @param {string} [params.address.postalCode] - ZIP code
 * @returns {Promise<{customerId: string, isNew: boolean, customer: Object}>}
 */
export const getOrCreateCustomer = async ({
    location,
    email,
    givenName,
    familyName,
    phoneNumber,
    referenceId,
    address
}) => {
    if (!email) {
        throw { errormessage: "Email is required to get or create customer", statusCode: 400 };
    }

    const merchLocation = process.env.NODE_ENV === 'production' ? location : "TEST";
    const sqConfig = Constants.squareLocationDetails?.[merchLocation];

    if (!sqConfig?.accessToken) {
        throw { errormessage: `Square configuration missing for location ${merchLocation}`, statusCode: 500 };
    }

    const client = new Client({
        environment: process.env.NODE_ENV === 'production' ? Environment.Production : Environment.Sandbox,
        accessToken: sqConfig.accessToken
    });

    try {
        // Step 1: Search for existing customer by email
        const searchResponse = await client.customersApi.searchCustomers({
            query: {
                filter: {
                    emailAddress: {
                        exact: email
                    }
                }
            }
        });

        const existingCustomer = searchResponse.result?.customers?.[0];

        if (existingCustomer) {
            // Customer already exists - return it
            if (process.env.NODE_ENV !== 'production') {
                console.log(`${new Date().toISOString()} - Found existing Square customer: ${existingCustomer.id} for ${email}`);
            }

            return {
                customerId: existingCustomer.id,
                isNew: false,
                customer: existingCustomer
            };
        }

        // Step 2: No existing customer found - create new one
        const createBody = {
            emailAddress: email,
            givenName,
            familyName,
            phoneNumber,
            referenceId
        };

        if (address) {
            createBody.address = {
                addressLine1: address.addressLine1,
                locality: address.locality,
                administrativeDistrictLevel1: address.administrativeDistrictLevel1,
                postalCode: address.postalCode,
                country: address.country || 'US'
            };
        }

        const createResponse = await client.customersApi.createCustomer(createBody);
        const newCustomer = createResponse.result?.customer;

        if (!newCustomer?.id) {
            throw { errormessage: "Failed to create Square customer - no ID returned", statusCode: 500 };
        }

        if (process.env.NODE_ENV !== 'production') {
            console.log(`${new Date().toISOString()} - Created new Square customer: ${newCustomer.id} for ${email}`);
        }

        return {
            customerId: newCustomer.id,
            isNew: true,
            customer: newCustomer
        };

    } catch (e) {
        // Re-throw if already formatted
        if (e?.statusCode && e?.errormessage) throw e;

        if (e instanceof ApiError) {
            const err = e.errors?.[0];
            const detail = err?.detail || err?.code || "Failed to get or create customer";
            console.error(`${new Date().toISOString()} - Square customer error:`, err);
            throw { errormessage: detail, statusCode: 400 };
        }

        console.error(`${new Date().toISOString()} - Unexpected error in getOrCreateCustomer:`, e);
        throw { errormessage: e?.message || "Failed to get or create customer", statusCode: 400 };
    }
};

/**
 * Search for customers by email (exact match)
 *
 * @param {Object} params
 * @param {("cw"|"sw"|"pp"|"TEST")} params.location
 * @param {string} params.email - Customer email to search for
 * @returns {Promise<Array>} Array of matching customers (usually 0 or 1)
 */
export const searchCustomersByEmail = async ({ location, email }) => {
    if (!email) {
        throw { errormessage: "Email is required to search customers", statusCode: 400 };
    }

    const merchLocation = process.env.NODE_ENV === 'production' ? location : "TEST";
    const sqConfig = Constants.squareLocationDetails?.[merchLocation];

    if (!sqConfig?.accessToken) {
        throw { errormessage: `Square configuration missing for location ${merchLocation}`, statusCode: 500 };
    }

    const client = new Client({
        environment: process.env.NODE_ENV === 'production' ? Environment.Production : Environment.Sandbox,
        accessToken: sqConfig.accessToken
    });

    try {
        const response = await client.customersApi.searchCustomers({
            query: {
                filter: {
                    emailAddress: {
                        exact: email
                    }
                }
            }
        });
        return response.result?.customers || [];
    } catch (e) {
        if (e instanceof ApiError) {
            const err = e.errors?.[0];
            const detail = err?.detail || err?.code || "Failed to search customers";
            throw { errormessage: detail, statusCode: 400 };
        }
        throw { errormessage: e?.message || "Failed to search customers", statusCode: 400 };
    }
};

/**
 * Get a customer by Square customer ID
 *
 * @param {Object} params
 * @param {("cw"|"sw"|"pp"|"TEST")} params.location
 * @param {string} params.customerId - Square customer ID
 * @returns {Promise<Object>} Customer object
 */
export const getCustomer = async ({ location, customerId }) => {
    if (!customerId) {
        throw { errormessage: "Customer ID is required", statusCode: 400 };
    }

    const merchLocation = process.env.NODE_ENV === 'production' ? location : "TEST";
    const sqConfig = Constants.squareLocationDetails?.[merchLocation];

    if (!sqConfig?.accessToken) {
        throw { errormessage: `Square configuration missing for location ${merchLocation}`, statusCode: 500 };
    }

    const client = new Client({
        environment: process.env.NODE_ENV === 'production' ? Environment.Production : Environment.Sandbox,
        accessToken: sqConfig.accessToken
    });

    try {
        const response = await client.customersApi.retrieveCustomer(customerId);
        return response.result?.customer;
    } catch (e) {
        if (e instanceof ApiError) {
            const err = e.errors?.[0];
            const detail = err?.detail || err?.code || "Failed to retrieve customer";
            throw { errormessage: detail, statusCode: 400 };
        }
        throw { errormessage: e?.message || "Failed to retrieve customer", statusCode: 400 };
    }
};

/**
 * Update an existing customer
 *
 * @param {Object} params
 * @param {("cw"|"sw"|"pp"|"TEST")} params.location
 * @param {string} params.customerId - Square customer ID
 * @param {Object} params.updates - Fields to update
 * @param {string} [params.updates.givenName]
 * @param {string} [params.updates.familyName]
 * @param {string} [params.updates.emailAddress]
 * @param {string} [params.updates.phoneNumber]
 * @param {Object} [params.updates.address]
 * @returns {Promise<Object>} Updated customer object
 */
export const updateCustomer = async ({ location, customerId, updates }) => {
    if (!customerId) {
        throw { errormessage: "Customer ID is required", statusCode: 400 };
    }

    const merchLocation = process.env.NODE_ENV === 'production' ? location : "TEST";
    const sqConfig = Constants.squareLocationDetails?.[merchLocation];

    if (!sqConfig?.accessToken) {
        throw { errormessage: `Square configuration missing for location ${merchLocation}`, statusCode: 500 };
    }

    const client = new Client({
        environment: process.env.NODE_ENV === 'production' ? Environment.Production : Environment.Sandbox,
        accessToken: sqConfig.accessToken
    });

    try {
        const response = await client.customersApi.updateCustomer(customerId, updates);
        return response.result?.customer;
    } catch (e) {
        if (e instanceof ApiError) {
            const err = e.errors?.[0];
            const detail = err?.detail || err?.code || "Failed to update customer";
            throw { errormessage: detail, statusCode: 400 };
        }
        throw { errormessage: e?.message || "Failed to update customer", statusCode: 400 };
    }
};

/**
 * Delete a customer from Square
 * Note: Payment history is preserved even after customer deletion
 *
 * @param {Object} params
 * @param {("cw"|"sw"|"pp"|"TEST")} params.location
 * @param {string} params.customerId - Square customer ID
 * @returns {Promise<void>}
 */
export const deleteCustomer = async ({ location, customerId }) => {
    if (!customerId) {
        throw { errormessage: "Customer ID is required", statusCode: 400 };
    }

    const merchLocation = process.env.NODE_ENV === 'production' ? location : "TEST";
    const sqConfig = Constants.squareLocationDetails?.[merchLocation];

    if (!sqConfig?.accessToken) {
        throw { errormessage: `Square configuration missing for location ${merchLocation}`, statusCode: 500 };
    }

    const client = new Client({
        environment: process.env.NODE_ENV === 'production' ? Environment.Production : Environment.Sandbox,
        accessToken: sqConfig.accessToken
    });

    try {
        await client.customersApi.deleteCustomer(customerId);
        if (process.env.NODE_ENV !== 'production') {
            console.log(`${new Date().toISOString()} - Deleted Square customer: ${customerId}`);
        }
    } catch (e) {
        if (e instanceof ApiError) {
            const err = e.errors?.[0];
            const detail = err?.detail || err?.code || "Failed to delete customer";
            throw { errormessage: detail, statusCode: 400 };
        }
        throw { errormessage: e?.message || "Failed to delete customer", statusCode: 400 };
    }
};

