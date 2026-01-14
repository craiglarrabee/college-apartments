import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../../../lib/session/options";
import {GetTenantFileById} from "../../../../../../lib/db/tenants/files";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";

const uploadRoot = () => process.env.UPLOAD_ROOT || path.join(process.cwd(), 'upload');

export const config = { api: { bodyParser: false } };

const handler = withIronSessionApiRoute(async (req, res) => {
    try {
        if (!req.session?.user?.isLoggedIn || !req.session.user.admin?.includes(req.query.site)) {
            res.status(403).send();
            return;
        }
        const userId = parseInt(req.query.userId, 10);
        const fileId = parseInt(req.query.fileId, 10);
        if (!userId || Number.isNaN(userId) || !fileId || Number.isNaN(fileId)) {
            res.status(400).json({error: 'Invalid userId or fileId'});
            return;
        }
        const meta = await GetTenantFileById(userId, fileId);
        if (!meta) { res.status(404).json({error: 'File not found'}); return; }
        const root = uploadRoot();
        const filePath = path.join(root, 'tenants', String(userId), meta.stored_filename);
        try {
            await fsp.access(filePath, fs.constants.R_OK);
        } catch (_) {
            res.status(404).json({error: 'File data missing'});
            return;
        }
        const stat = await fsp.stat(filePath);
        res.setHeader('Content-Type', meta.mime_type || 'application/octet-stream');
        res.setHeader('Content-Length', stat.size);
        // Force download with the original filename
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(meta.original_name)}"`);

        const stream = fs.createReadStream(filePath);
        stream.on('error', (e) => { res.status(500).end(); });
        stream.pipe(res);
    } catch (e) {
        res.status(400).json({error: e.message});
        console.error(`${new Date().toISOString()} -`, e);
    }
}, ironOptions);

export default handler;
