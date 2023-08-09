import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../lib/session/options";
import {
    GetUserLeaseTenants,
    GetUserLeaseTenantsByApartments,
    GetUserLeaseTenantsByGender,
    GetUserLeaseTenantsByIdsAndSemester
} from "../../../lib/db/users/tenant";
import {AddEmailDefinition, AddEmailRecipient} from "../../../lib/db/users/bulkEmail";
import {crypto} from "next/dist/compiled/@edge-runtime/primitives/crypto";

export const bulkEmail = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.admin.includes(req.body.site) || !req.session.user.manageApartment) {
        res.status(403).send();
        return;
    }

    try {
        switch (req.method) {
            case "POST":
                let tenants;
                //first insert the email definition into the db
                let message_id = crypto.randomUUID();
                await AddEmailDefinition(message_id, req.body);
                switch (req.body.recipients) {
                    case "All":
                        tenants = await GetUserLeaseTenants(req.body.site, req.body.year, req.body.semester.toLowerCase());
                        break;
                    case "Male":
                        tenants = await GetUserLeaseTenantsByGender(req.body.site, req.body.year, req.body.semester.toLowerCase(), "M");
                        break;
                    case "Female":
                        tenants = await GetUserLeaseTenantsByGender(req.body.site, req.body.year, req.body.semester.toLowerCase(), "F");
                        break;
                    case "Tenants":
                        tenants = await GetUserLeaseTenantsByIdsAndSemester(req.body.site, req.body.year, req.body.semester.toLowerCase(), req.body.ids);
                        break;
                    case "Apartments":
                        tenants = await GetUserLeaseTenantsByApartments(req.body.site, req.body.year, req.body.semester.toLowerCase(), req.body.ids);
                        break;
                }
                tenants.forEach(tenant => {
                    let data = {
                        address: tenant.email,
                        user_id: tenant.user_id
                    }
                    AddEmailRecipient(message_id, data);
                });
                res.json({count: tenants.length});
                res.status(200).send();
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
}, ironOptions);

export default bulkEmail;
