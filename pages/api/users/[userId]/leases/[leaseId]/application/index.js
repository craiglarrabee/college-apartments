// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../../../../lib/session/options";
import {
    AddApplication,
    DeleteApplication,
    ModifyApplication,
    ProcessApplication
} from "../../../../../../../lib/db/users/application";
import {DeleteUserLease} from "../../../../../../../lib/db/users/userLease";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.isLoggedIn) res.status(403).send();
    try {
        switch (req.method) {
            case "POST":
                if (req.body.leases) {
                    for (const lease of req.body.leases) {
                        const data = {...req.body, lease_id: lease.lease_id, room_type_id: lease.room_type_id};
                        try {
                            await ModifyApplication(data.site, req.query.userId, req.query.leaseId, data);
                        } catch (e) {
                            console.error(e);
                        }
                    }
                } else {
                    try {
                        await ModifyApplication(req.body.site, req.query.userId, req.query.leaseId, req.body);
                    } catch (e) {
                        console.error(e);
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
        res.body = {error: e.code, description: e.message};
        res.status(400).send();
        console.error(e);
    }
}, ironOptions);

export default handler;
