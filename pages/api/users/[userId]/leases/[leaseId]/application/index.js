// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../../../../lib/session/options";
import {
    AddApplication,
    DeleteApplication,
    ModifyApplication,
    ProcessApplication,
    ReceiveDeposit
} from "../../../../../../../lib/db/users/application";
import {AddUserLease, DeleteUserLease} from "../../../../../../../lib/db/users/userLease";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session?.user?.isLoggedIn) {
        console.warn(`${new Date().toISOString()} - Unauthorized application modify/add attempt for user: ${req.query.userId}, lease: ${req.query.leaseId}`);
        res.status(403).send();
        return;
    }
    try {
        switch (req.method) {
            case "POST":
                if (req.body.leases) {
                    for (const lease of req.body.leases) {
                        const data = {...req.body, lease_id: lease.lease_id, room_type_id: lease.room_type_id};
                        try {
                            await ModifyApplication(data.site, req.query.userId, req.query.leaseId, data);
                        } catch (e) {
                            console.error(`${new Date().toISOString()} -` , e);
                        }
                    }
                } else {
                    try {
                        if (req.body.newApp && req.body.newApp === true) {
                            await AddApplication(req.body.site, req.query.userId, req.query.leaseId, req.body);
                            await ReceiveDeposit(req.body.site, req.query.userId, req.query.leaseId);
                            await AddUserLease(req.query.userId, req.query.leaseId, {});
                        } else {
                            await ModifyApplication(req.body.site, req.query.userId, req.query.leaseId, req.body);
                        }
                    } catch (e) {
                        console.error(`${new Date().toISOString()} -` , e);
                    }
                }
                res.status(204).send();
                return;
            case "PUT":
                await ProcessApplication(req.query.site, req.query.userId, req.query.leaseId, req.body);
                res.status(204).send();
                return;
            case "DELETE":
                await Promise.all([DeleteApplication(req.query.userId, req.query.leaseId, req.query.roomTypeId),
                    DeleteUserLease(req.query.userId, req.query.leaseId, req.query.roomTypeId)]);
                res.status(204).send();
                return;
            default:
                res.status(405).send();
                return;
        }
    } catch (e) {
        console.error(`${new Date().toISOString()} - Error in /api/users/${req.query.userId}/leases/${req.query.leaseId}/application:`, e);
        res.status(400).json({error: e.code, description: e.message});
    }
}, ironOptions);

export default handler;
