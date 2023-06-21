// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../../../lib/session/options";
import {
    AddApplication,
    GetApplication,
    UpdateApplication
} from "../../../../../../lib/db/users/application";
import {AddUserLease, DeleteUserLease} from "../../../../../../lib/db/users/userLease";
import {CopyTenantForUserLease, SetApartmentNumber, SetTenantSemesters} from "../../../../../../lib/db/users/tenant";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.isLoggedIn) res.status(403).send();
    try {
        switch (req.method) {
            case "PUT":
                if (req.body.apartmentNumber) {
                    await SetApartmentNumber(req.query.userId, req.query.leaseId, req.body.apartmentNumber);
                } else {
                    await SetTenantSemesters(req.query.userId, req.query.leaseId, req.body.fall_year, req.body.spring_year, req.body.summer_year);
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
        console.log(e);
    }
}, ironOptions);

export default handler;
