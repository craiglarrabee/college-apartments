// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {ChangeUsername, ChangeUserPassword} from "../../../../lib/db/users/user";
import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../lib/session/options";

const Username = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.isLoggedIn) res.status(403).send();
    try {
        switch (req.method) {
            case "POST":
                await ChangeUsername(req.query.userId, req.body.username);
                res.status(204).send();
                return;
            default:
                res.status(405).send();
                return;
        }
    } catch (e) {
        res.status(401).send();
    }
}, ironOptions);

export default Username;
