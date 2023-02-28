import {withIronSessionApiRoute} from "iron-session/next";
import Connection from "../../lib/db/connection";
import argon2 from "argon2";
import {ironOptions} from "../../lib/session/options";

const login = withIronSessionApiRoute(async (req, res) => {
    // get user from database
    try {
        const conn = await Connection();
        const [rows] = await conn.execute("SELECT user.password, user.id, tenant.first_name, site_admins.site FROM user LEFT JOIN tenant ON tenant.student_id = user.id LEFT JOIN site_admins ON site_admins.userid = user.id and site_admins.site = ? WHERE username = ?",
            [
                req.body.site,
                req.body.username
            ]);

        if (rows.length !== 1 || !(await argon2.verify(rows[0].password, req.body.password))) {
            res.status(401).send({});
        } else {
            const user = {
                id: rows[0].id,
                username: req.body.username,
                firstName: rows[0].first_name,
                isLoggedIn: true,
                admin: rows[0].site,
                editSite: false,
            };
            req.session.user = user;
            await req.session.save();
            res.json(user);
            res.status(200).send();
        }
    } catch (e) {
        console.log (e);
    }
}, ironOptions);

export default login;