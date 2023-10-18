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

    res.json(user);
    res.status(204).send({});
}, ironOptions);

export default logout;