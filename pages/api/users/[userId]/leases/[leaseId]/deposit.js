// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../../../lib/session/options";
import {DeleteDeposit, ReceiveDeposit} from "../../../../../../lib/db/users/application";
import {GetLease} from "../../../../../../lib/db/users/lease";
import {ExecuteQuery} from "../../../../../../lib/db/pool";
import {
    AddUserPayment,
    GetUnreviewedSecurityDepositPayment,
    MarkPaymentDeleted
} from "../../../../../../lib/db/users/userPayment";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session?.user?.manageApartment) res.status(403).send();
    try {
        // Lazy migration: ensure lease_id column exists
        try {
            await ExecuteQuery("ALTER TABLE user_payment ADD COLUMN lease_id INT NULL AFTER user_id");
        } catch (e) {
            // ignore if already exists or other error (we'll see error later if it fails)
        }

        switch (req.method) {
            case "POST":
                const postResp = await ReceiveDeposit(req.query.site, req.query.userId, req.query.leaseId);
                if (req.query.site === 'snow') {
                    let amount = req.body.amount !== undefined ? req.body.amount : (await GetLease(req.query.leaseId))?.deposit_amount;
                    if (amount) {
                        amount = Number(amount);
                        const timestamp = Date.now();
                        await AddUserPayment(req.query.site, req.query.userId, {
                            leaseId: req.query.leaseId,
                            amount: amount,
                            total: amount,
                            description: 'Security Deposit',
                            location: 'pp',
                            transId: `MANUAL-${req.query.userId}-${timestamp}`,
                            authCode: 'Manual',
                            resultCode: 'Manual',
                            resultMessage: 'Manual',
                            accountType: 'Cash/Check',
                            accountNumber: 'N/A'
                        });
                    }
                }
                res.status(200);
                res.json({...postResp});
                return;
            case "DELETE":
                const delResp = await DeleteDeposit(req.query.site, req.query.userId, req.query.leaseId);
                if (req.query.site === 'snow') {
                    const payment = await GetUnreviewedSecurityDepositPayment(req.query.site, req.query.userId, req.query.leaseId);
                    if (payment) {
                        await MarkPaymentDeleted(payment.id, 'Deposit Removed by Admin');
                    }
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
