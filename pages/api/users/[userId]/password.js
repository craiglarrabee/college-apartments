// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {ChangeUserPassword} from "../../../../lib/db/users/user";

export default async function handler(req, res) {
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
        console.log(e);
    }
}
