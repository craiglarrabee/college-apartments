import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../lib/session/options";
import {GetUserAdminSites, GetUserAndVerifyPassword} from "../../lib/db/users/user";
import {GetTenantProcessedApplicationSites} from "../../lib/db/users/application";

const login = withIronSessionApiRoute(async (req, res) => {
    // get user from database
    try {
        const userData = await GetUserAndVerifyPassword(req.body.username, req.body.password);
        const data = await GetUserAdminSites(userData.id);
        const processedForSites = await GetTenantProcessedApplicationSites(userData.id, req.query.site);
        const adminSites = data.filter(site => site.site_privs === 1).map(site => site.site);
        const manageSites = data.filter(site => site.apartment_privs === 1).map(site => site.site);
        const user = {
            id: userData.id,
            username: req.body.username,
            firstName: userData.first_name,
            isLoggedIn: true,
            admin: adminSites,
            manage: manageSites,
            editSite: false,
            email: userData.email,
            processedSites: processedForSites
        };
        req.session.user = user;
        await req.session.save();
        res.json(user);
        res.status(200).send();

    } catch (e) {
        console.error(e);
        res.status(401).send({});
    }
}, ironOptions);

export default login;