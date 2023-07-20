import nodemailer from "nodemailer";
import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../lib/session/options";
import {
    GetUserLeaseTenants,
    GetUserLeaseTenantsByGender,
    GetUserLeaseTenantsByIdsAndSemester, GetUserLeaseTenantsByApartments
} from "../../../lib/db/users/tenant";

const suuTransporter = nodemailer.createTransport({
    host: "uca.snowcollegeapartments.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SUU_EMAIL_USER,
        pass: process.env.SUU_EMAIL_PASS
    }
});

const snowTransporter = nodemailer.createTransport({
    host: "uca.snowcollegeapartments.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SNOW_EMAIL_USER,
        pass: process.env.SNOW_EMAIL_PASS
    }
});

export const bulkEmail = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.admin.includes(req.body.site) || !req.session.user.manageApartment) {
        res.status(403).send();
        return;
    }

    try {
        switch (req.method) {
            case "POST":
                let transporter = req.body.site === "suu" ? suuTransporter : snowTransporter;
                let tenants;
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
                    transporter.sendMail({
                        from: req.body.from,
                        to: tenant.email,
                        subject: req.body.subject,
                        html: req.body.body
                    })
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
