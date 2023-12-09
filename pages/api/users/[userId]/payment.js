// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../lib/session/options";
import {ReceiveDeposit} from "../../../../lib/db/users/application";
import {AddUserPayment, MarkPaymentReviewed} from "../../../../lib/db/users/userPayment";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.isLoggedIn) res.status(403).send();
    try {
        switch (req.method) {
            case "POST":
                // TODO: make payment
                // record payment
                await AddUserPayment(req.query.site, req.query.userId, req.body);
                res.status(204).send();
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
        console.log(e);
    }
}, ironOptions);

export default handler;
