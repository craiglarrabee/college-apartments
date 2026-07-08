// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../../../lib/session/options";
import {DeleteDeposit, ReceiveDeposit} from "../../../../../../lib/db/users/application";
import {
    AddUserPayment,
    GetUnreviewedSecurityDepositPayment,
    MarkPaymentDeleted
} from "../../../../../../lib/db/users/userPayment";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session?.user?.manageApartment) res.status(403).send();
    try {

        switch (req.method) {
            case "POST":
                const postResp = await ReceiveDeposit(req.query.site, req.query.userId, req.query.leaseId);
                // Record manual payment for BOTH sites to ensure payment history is complete
                let amount = req.body.amount !== undefined ? req.body.amount : postResp?.deposit_amount;
                if (amount && postResp?.location) {
                    amount = Number(amount);
                    const timestamp = Date.now();

                    // Map location name to code if it's a full name
                    let locCode = postResp.location;
                    if (locCode === "Stadium Way") locCode = "sw";
                    else if (locCode === "College Way") locCode = "cw";
                    else if (locCode === "Park Place") locCode = "pp";

                    await AddUserPayment(req.query.site, req.query.userId, {
                        leaseId: req.query.leaseId,
                        amount: amount,
                        total: amount,
                        description: 'Security Deposit',
                        location: locCode,
                        transId: `MANUAL-${req.query.userId}-${timestamp}`,
                        authCode: 'Manual',
                        resultCode: 'Manual',
                        resultMessage: 'Manual',
                        accountType: 'Cash/Check',
                        accountNumber: 'N/A'
                    });
                }
                res.status(200);
                res.json({...postResp});
                return;
            case "DELETE":
                const delResp = await DeleteDeposit(req.query.site, req.query.userId, req.query.leaseId);
                // Mark matching unreviewed manual security deposit payments as deleted for both sites
                const payment = await GetUnreviewedSecurityDepositPayment(req.query.site, req.query.userId, req.query.leaseId);
                if (payment) {
                    await MarkPaymentDeleted(payment.id, 'Deposit Removed by Admin');
                }
                res.status(200);
                res.json({...delResp});
                return;
            default:
                res.status(405).send();
                return;
        }
    } catch (e) {
        res.body = {error: e.code, description: e.message};
        res.status(400).send();
        console.error(`${new Date().toISOString()} -` , e);
    }
}, ironOptions);

export default handler;
