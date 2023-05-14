// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../../../lib/session/options";
import {
    AddApplication,
    GetApplication,
    ProcessApplication
} from "../../../../../../lib/db/users/application";
import {AddUserLease, DeleteUserLease} from "../../../../../../lib/db/users/userLease";
import {CopyTenantForUserLease, SetApartmentNumber} from "../../../../../../lib/db/users/tenant";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.isLoggedIn) res.status(403).send();
    try {
        switch (req.method) {
            case "PUT":
                await SetApartmentNumber(req.query.userId, req.query.leaseId, req.body.apartmentNumber);
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