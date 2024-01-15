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
const processBulkEmail = withIronSessionApiRoute(async (req, res) => {
    const site = req.query.site;
    const tenants = await GetPendingEmailRecipients(site);
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
        } catch (e) {
            await MarkEmailRecipientComplete(tenant.message_id, tenant.user_id, "failure", e.response || e.message);
            console.error(e.message);
            res.status(400).send();
            return;
        }
    }
    res.status(204).send();
    return;
}, ironOptions);

export default processBulkEmail;
