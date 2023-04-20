import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../lib/session/options";
import {GetUserAndVerifyPassword} from "../../lib/db/users/user";

const login = withIronSessionApiRoute(async (req, res) => {
    // get user from database
    try {
        const userData = await GetUserAndVerifyPassword(req.body.site, req.body.username, req.body.password);
        const user = {
            id: userData.id,
            username: req.body.username,
            firstName: userData.first_name,
            isLoggedIn: true,
            admin: userData.site,
            editSite: false,
            email: userData.email
        };
        req.session.user = user;
        await req.session.save();
        res.json(user);
        res.status(200).send();

    } catch (e) {
        console.log(e);
        res.status(401).send({});
    }
}, ironOptions);

export default login;