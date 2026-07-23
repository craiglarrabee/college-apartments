// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../../../lib/session/options";
import {AddUserLease, DeleteUserLease, GetUserLease, UpdateUserLease} from "../../../../../../lib/db/users/userLease";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session?.user?.isLoggedIn) {
        console.warn(`${new Date().toISOString()} - Unauthorized access attempt for user: ${req.query.userId}, lease: ${req.query.leaseId}`);
        res.status(403).send();
        return;
    }
    try {
        switch (req.method) {
            case "GET":
                const lease = await GetUserLease(req.query.userId, req.query.leaseId);
                res.status(200).json(lease);
                return;
            case "DELETE":
                await DeleteUserLease(req.query.userId, req.query.leaseId, req.query.roomTypeId);
                res.status(204).send();
                return;
            case "POST":
                await AddUserLease(req.query.userId, req.query.leaseId, req.body);
                res.status(204).send();
                return;
            case "PUT":
                await UpdateUserLease(req.query.userId, req.query.leaseId, req.body);
                res.status(204).send();
                return;
            default:
                res.status(405).send();
                return;
        }
    } catch (e) {
        console.error(`${new Date().toISOString()} - Error in /api/users/${req.query.userId}/leases/${req.query.leaseId}:`, e);
        res.status(400).json({error: e.code, description: e.message});
    }
}, ironOptions);

export default handler;
