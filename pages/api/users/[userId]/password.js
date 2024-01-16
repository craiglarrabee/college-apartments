// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {ChangeUserPassword} from "../../../../lib/db/users/user";
import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../lib/session/options";

const Password = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.isLoggedIn) res.status(403).send();
    try {
        switch (req.method) {
            case "POST":
                await ChangeUserPassword(req.body.site, req.body.username, req.body.current_password, req.body.password);
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

export default Password;
