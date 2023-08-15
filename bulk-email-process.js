import nodemailer from "nodemailer";
import {GetPendingEmailRecipients, MarkEmailRecipientComplete} from "./lib/db/users/bulkEmail";

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
const processBulkEmail = async (site) => {
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
            console.log(e.message);
            return;
        }
    }
    return;
};

if (process.argv.length ===3 && ["suu", "snow"].includes(process.argv[2]))
    await processBulkEmail(process.argv[2]);
