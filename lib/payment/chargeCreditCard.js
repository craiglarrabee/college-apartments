"use strict";

const ApiContracts = require("authorizenet").APIContracts;
const ApiControllers = require("authorizenet").APIControllers;
const SDKConstants = require("authorizenet").Constants;
import * as Constants from "../constants";


const chargeCreditCard = async ({
                                    location,
                                    first_name,
                                    last_name,
                                    email,
                                    street,
                                    city,
                                    state,
                                    zip,
                                    cc_number,
                                    cc_expire,
                                    cc_code,
                                    items,
                                    total,
                                    tenantFirstName,
                                    tenantLastName
                                }) => {
    const merchLocation = process.env.NODE_ENV === 'production' ? location : "TEST";

    const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(Constants.locationDetails[merchLocation].id);
    merchantAuthenticationType.setTransactionKey(Constants.locationDetails[merchLocation].key);

    const orderDetails = new ApiContracts.OrderType();
    orderDetails.setDescription(`Payment for ${tenantFirstName} ${tenantLastName} at ${Constants.locationDetails[location].name}`);

    const creditCard = new ApiContracts.CreditCardType();
    creditCard.setCardNumber(cc_number.replaceAll(" ", ""));
    creditCard.setExpirationDate(cc_expire);
    creditCard.setCardCode(cc_code);

    const paymentType = new ApiContracts.PaymentType();
    paymentType.setCreditCard(creditCard);

    const customer = new ApiContracts.CustomerType();
    customer.setType("individual");
    customer.setEmail(email);

    const billTo = new ApiContracts.CustomerAddressType();
    billTo.setFirstName(first_name);
    billTo.setLastName(last_name);
    billTo.setAddress(street);
    billTo.setCity(city);
    billTo.setState(state);
    billTo.setZip(zip);
    billTo.setCountry("USA");

    const lineItems = await items.map((item, i) => {
        const lineItem = new ApiContracts.LineItemType();
        lineItem.setItemId(i + 1);
        lineItem.setName(item.description);
        lineItem.setQuantity(1);
        lineItem.setUnitPrice(item.unitPrice);
        return lineItem;
    });

    const lineItemsArray = new ApiContracts.ArrayOfLineItem();
    lineItemsArray.setLineItem(lineItems);

    const transactionSetting1 = new ApiContracts.SettingType();
    transactionSetting1.setSettingName("duplicateWindow");
    transactionSetting1.setSettingValue("120");

    const transactionSetting2 = new ApiContracts.SettingType();
    transactionSetting2.setSettingName("emailCustomer");
    transactionSetting2.setSettingValue("true");

    const transactionSettingList = [];
    transactionSettingList.push(transactionSetting1);
    transactionSettingList.push(transactionSetting2);

    const transactionSettings = new ApiContracts.ArrayOfSetting();
    transactionSettings.setSetting(transactionSettingList);

    const transactionRequestType = new ApiContracts.TransactionRequestType();
    transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
    transactionRequestType.setPayment(paymentType);
    transactionRequestType.setAmount(total);
    transactionRequestType.setBillTo(billTo);
    transactionRequestType.setTransactionSettings(transactionSettings);
    transactionRequestType.setOrder(orderDetails);
    transactionRequestType.setCustomer(customer);
    transactionRequestType.setLineItems(lineItemsArray);


    const createRequest = new ApiContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequestType);

    //pretty print request
    if (process.env.NODE_ENV !== "production")
        console.log(new Date().toISOString() + " - " +JSON.stringify(createRequest.getJSON(), null, 2));

    const ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
    //Defaults to sandbox
    if (process.env.NODE_ENV === "production")
        ctrl.setEnvironment(SDKConstants.endpoint.production);


    const chargePromise = new Promise((resolve, reject) => {
        ctrl.execute(function () {
            let apiResponse = ctrl.getResponse();

            let response = new ApiContracts.CreateTransactionResponse(apiResponse);
            let errorMessage;
            if (response != null) {
                if (
                    response.getMessages().getResultCode() ==
                    ApiContracts.MessageTypeEnum.OK
                ) {
                    if (response.getTransactionResponse().getMessages() != null) {
                        resolve(response);
                    } else {
                        if (response.getTransactionResponse().getErrors() != null) {
                            errorMessage = response
                                .getTransactionResponse()
                                .getErrors()
                                .getError()[0]
                                .getErrorText();
                            reject({errormessage: errorMessage, statusCode: 400});
                        }
                    }
                } else {
                    if (
                        response.getTransactionResponse() != null &&
                        response.getTransactionResponse().getErrors() != null
                    ) {
                        errorMessage = response
                            .getTransactionResponse()
                            .getErrors()
                            .getError()[0]
                            .getErrorText();
                        reject({errormessage: errorMessage, statusCode: 400});
                    } else {
                        errorMessage = response
                            .getMessages()
                            .message[0]
                            .text;
                        reject({errormessage: errorMessage, statusCode: 400});
                    }
                }
            } else {
                reject({
                    errormessage: "unable to process the payment",
                    statusCode: 424,
                });
            }
        });
    });

    try {
        return await chargePromise;
    } catch (error) {
        console.error(new Date().toISOString() + " - " +error);
        throw error;
    }
};

export default chargeCreditCard;