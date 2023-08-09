import nodemailer from "nodemailer";
import {GetPendingEmailRecipients, MarkEmailRecipientComplete} from "../../../lib/db/users/bulkEmail";
import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../lib/session/options";

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
export const processBulkEmail = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.admin && req.body.address !== req.session.user.email) {
        res.status(403).send();
        return;
    }

    switch (req.method) {
        case "POST":
            const site = req.query.site;
            const tenants = await GetPendingEmailRecipients(req.query.site);
            const transporter = site === "suu" ? suuTransporter : snowTransporter;
            let resp;
            for (const tenant of tenants) {
                try {
                    resp = await transporter.sendMail({
                        from: tenant.from_address,
                        to: tenant.address,
                        subject: tenant.subject,
                        html: tenant.body
                    });
                    if (resp.accepted.length === 1) {
                        await MarkEmailRecipientComplete(tenant.message_id, tenant.user_id, "success", null);
                    } else {
                        await MarkEmailRecipientComplete(tenant.message_id, tenant.user_id, "failure", (resp && resp.rejectedErrors) ? resp.rejectedErrors[0] : null);
                    }
                    console.log(resp);
                } catch (e) {
                    await MarkEmailRecipientComplete(tenant.message_id, tenant.user_id, "failure", e.response || e.message);
                    res.body = {error: e.code, description: e.message};
                    res.status(400).send();
                }
            }
    }
}, ironOptions);

export default processBulkEmail;
