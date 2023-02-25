// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import Connection from "../../../lib/db/connection";
import * as argon2 from "argon2";

export default async function handler(req, res) {
    const conn = await Connection();
    try {
        switch (req.method) {
            case "POST":
                const hash = await argon2.hash(req.body.password);
                await conn.execute("INSERT INTO user (username, password) VALUES (?,?)", [req.body.username, hash]);
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
