// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../../../lib/session/options";
import {AddApplicationInfo, GetApplicationInfo} from "../../../../../../lib/db/users/applicationInfo";
import {GetPendingApplicationInfo} from "../../../../lib/db/users/applicationInfo";

const handler = withIronSessionApiRoute(async (req, res) => {
    try {
        switch (req.method) {
            case "GET":
                res.body = await GetPendingApplicationInfo(req.query.userId);
                if (!res.body) {
                    res.status(404).send();
                }
                res.status(200).send();
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
