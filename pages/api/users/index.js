// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {AddUser} from "../../../lib/db/users/user";

export default async function handler(req, res) {
    try {
        switch (req.method) {
            case "POST":
                await AddUser(req.body.username, req.body.password);
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
}
