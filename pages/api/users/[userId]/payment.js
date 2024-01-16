// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../lib/session/options";
import {AddUserPayment, MarkPaymentDeleted, MarkPaymentReviewed} from "../../../../lib/db/users/userPayment";
import chargeCreditCard from "../../../../lib/payment/chargeCreditCard";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.isLoggedIn) res.status(403).send();
    switch (req.method) {
        case "POST":
            let payResp;
            let data;
            try {
                data = {...req.body};
                payResp = await chargeCreditCard(data);
            } catch (e) {
                res.body = {error: e.statusCode, message: e.errormessage};
                res.status(400).send();
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
                console.error(e);
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
                await AddUserPayment(req.query.site, req.query.userId, data);
                res.status(200).send();
            } catch (e) {
                // if we successfully processed the payment
                // but failed to record it, then log the error
                // but don't send a failure
                res.body = data;
                res.status(200).send();
                console.error(`Failed to record payment: ${JSON.stringify(data)}\n with error: ${e}`);
                return;
            }
            return;
        case "PUT":
            try {
                await MarkPaymentReviewed(req.body.id);
                res.status(204).send();
            } catch (e) {
                res.body = {error: e.code, description: e.message};
                res.status(400).send();
                console.error(e);
            }
            return;
        case "DELETE":
            try {
                await MarkPaymentDeleted(req.body.id, req.body.reason);
                res.status(204).send();
            } catch (e) {
                res.body = {error: e.code, description: e.message};
                res.status(400).send();
                console.error(e);
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
