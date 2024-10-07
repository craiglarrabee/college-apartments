import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../lib/session/options";

const logout = withIronSessionApiRoute(async (req, res) => {
    req.session.destroy();
    const user = {
        id: "",
        isLoggedIn: false,
        firstName: "",
        editSite: false,
        email: "",
        username: "",
        admin: [],
        manage: []
    };

    res.status(200);
    res.json(user);
}, ironOptions);

export default logout;