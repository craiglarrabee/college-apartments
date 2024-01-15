// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../lib/session/options";
import {AddUserPayment, MarkPaymentReviewed} from "../../../../lib/db/users/userPayment";
import chargeCreditCard from "../../../../lib/payment/chargeCreditCard";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.isLoggedIn) res.status(403).send();
    try {
        switch (req.method) {
            case "POST":
                const data = {...req.body};
                // TODO: make payment
                const payResp = await chargeCreditCard(data);

                // record payment
                data.transId = payResp.transactionResponse.transId;
                data.authCode = payResp.transactionResponse.authCode;
                data.resultCode = payResp.messages?.resultCode;
                data.resultMessage = payResp.messages?.message[0]?.text;
                data.accountType = payResp.transactionResponse.accountType;
                data.accountNumber = payResp.transactionResponse.accountNumber;
                await AddUserPayment(req.query.site, req.query.userId, data);
                res.body = data;
                res.status(200).send();
                return;
            case "PUT":
                await MarkPaymentReviewed(req.body.id);
                res.status(204).send();
                return;
            default:
                res.status(405).send();
                return;
        }
    } catch (e) {
        res.body = {error: e.code, description: e.message};
        res.status(400).send();
        console.error(e);
    }
}, ironOptions);

export default handler;
