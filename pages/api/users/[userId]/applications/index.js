// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../../lib/session/options";
import {AddApplication, ReceiveDeposit} from "../../../../../lib/db/users/application";
import {AddUserLease} from "../../../../../lib/db/users/userLease";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user?.isLoggedIn) {
        console.warn(`${new Date().toISOString()} - Unauthorized application submission attempt for user: ${req.query.userId}`);
        res.status(403).send();
        return;
    }
    try {
        switch (req.method) {
            case "POST":
                if (!req.body.leases || req.body.leases.length === 0) {
                    console.error(`${new Date().toISOString()} - No leases provided in application for user: ${req.query.userId}`);
                }
                for (const lease of req.body.leases) {
                    const data = {...req.body, lease_id: lease.lease_id, room_type_id: lease.room_type_id}
                    await AddApplication(data.site, req.query.userId, data.lease_id, data);
                    if (req.body.depositPaid) {
                        console.log(`${new Date().toISOString()} - Processing depositPaid for user: ${req.query.userId}, lease: ${data.lease_id}`);
                        await ReceiveDeposit(data.site, req.query.userId, data.lease_id);
                        await AddUserLease(req.query.userId, data.lease_id, {});
                    } else {
                        console.log(`${new Date().toISOString()} - depositPaid is FALSE for user: ${req.query.userId}, lease: ${data.lease_id}. Full body: ${JSON.stringify(req.body)}`);
                    }
                }
                res.status(204).send();
                return;
            default:
                res.status(405).send();
                return;
        }
    } catch (e) {
        res.body = {error: e.code, description: e.message};
        res.status(400).send();
        console.error(new Date().toISOString() + " - Error adding application for user: " + req.query.userId + ". " , e);
    }
}, ironOptions);

export default handler;
