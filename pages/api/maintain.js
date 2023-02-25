import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../lib/session/options";

const maintain = withIronSessionApiRoute(async (req, res) => {
    // get user from database
    try {
        if (req.session.user.admin && req.body.editSite) {
            req.session.user.editSite = true;
        } else {
            req.session.user.editSite = false;
        }
        await req.session.save();
        res.status(204).send();

    } catch (e) {
        console.log(e);
    }
}, ironOptions);

export default maintain;