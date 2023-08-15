// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../../../lib/session/options";
import {
    AddApplication,
    GetApplication,
    UpdateApplication
} from "../../../../../../lib/db/users/application";
import {
    AddUserLease,
    ChangeUserLeaseRoomType,
    DeleteUserLease,
    UpdateUserLease
} from "../../../../../../lib/db/users/userLease";
import {CopyTenantForUserLease, SetApartmentNumber, SetTenantSemester} from "../../../../../../lib/db/users/tenant";
import {UpdateLease} from "../../../../../../lib/db/users/lease";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.manageApartment) res.status(403).send();
    try {
        switch (req.method) {
            case "PUT":
                if (req.body.apartmentNumber) {
                    await Promise.all(
                        [
                            SetApartmentNumber(req.query.userId, req.query.leaseId, req.body.apartmentNumber),
                            ChangeUserLeaseRoomType(req.query.userId, req.query.leaseId, req.body.roomTypeId)
                        ]);
                } else {
                    await Promise.all(req.body.semesters.map(semester => SetTenantSemester(req.query.userId, req.query.leaseId, semester)));
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
