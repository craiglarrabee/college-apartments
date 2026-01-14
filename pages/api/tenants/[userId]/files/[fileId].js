import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../../lib/session/options";
import {GetTenantFileById, RenameTenantFile, ReplaceTenantFileById, DeleteTenantFile} from "../../../../../lib/db/tenants/files";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import {IncomingForm} from "formidable";
import crypto from "crypto";
import {validateFileType, optimizeImage, validateFilename, validateFileSize} from "../../../../../lib/fileUtils";

export const config = { api: { bodyParser: false } };

const maxBytes = () => {
    const mb = parseInt(process.env.FILE_UPLOAD_MAX_MB || '25', 10);
    return mb * 1024 * 1024;
}

const uploadRoot = () => process.env.UPLOAD_ROOT || path.join(process.cwd(), 'upload');

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

        const existing = await GetTenantFileById(userId, fileId);
        if (!existing) {
            res.status(404).json({error: 'File not found'});
            return;
        }

        switch (req.method) {
            case 'PATCH': { // rename
                // Manually parse JSON body since bodyParser is false
                let body = {};
                if (req.headers['content-type']?.includes('application/json')) {
                    const chunks = [];
                    for await (const chunk of req) {
                        chunks.push(chunk);
                    }
                    const rawBody = Buffer.concat(chunks).toString('utf-8');
                    try {
                        body = JSON.parse(rawBody);
                    } catch (e) {
                        res.status(400).json({error: 'Invalid JSON'});
                        return;
                    }
                }

                const { newName } = body;

                // Validate filename
                const filenameValidation = validateFilename(newName);
                if (!filenameValidation.valid) {
                    res.status(400).json({error: filenameValidation.error});
                    return;
                }

                try {
                    const updated = await RenameTenantFile({userId, fileId, newOriginalName: newName});
                    res.status(200).json({ok: true, file: updated});
                } catch (e) {
                    // Likely UNIQUE constraint violation
                    res.status(409).json({error: 'A file with that name already exists for this tenant.'});
                }
                return;
            }
            case 'PUT': { // replace file binary
                const form = new IncomingForm({ multiples: false, maxFileSize: maxBytes(), keepExtensions: true });
                form.parse(req, async (err, fields, files) => {
                    if (err) { res.status(400).json({error: err.message}); return; }

                    // Handle formidable v3 which may return files as arrays
                    let f = files.file;
                    if (Array.isArray(f)) f = f[0];
                    if (!f && Object.keys(files).length > 0) {
                        const firstKey = Object.keys(files)[0];
                        f = Array.isArray(files[firstKey]) ? files[firstKey][0] : files[firstKey];
                    }

                    if (!f) {
                        res.status(400).json({error: 'No file uploaded'});
                        return;
                    }

                    // Get temp path - formidable v3+ uses filepath property
                    const tempPath = f.filepath || f.path;

                    if (!tempPath) {
                        console.error('File object keys:', Object.keys(f));
                        console.error('File object:', f);
                        res.status(400).json({error: 'Could not determine uploaded file path. File object structure unexpected.'});
                        return;
                    }

                    // Validate file size
                    const sizeValidation = validateFileSize(f.size, maxBytes());
                    if (!sizeValidation.valid) {
                        try { if (tempPath && fs.existsSync(tempPath)) await fsp.unlink(tempPath); } catch (_) {}
                        res.status(400).json({error: sizeValidation.error});
                        return;
                    }

                    // Validate file type using magic bytes
                    const typeValidation = await validateFileType(tempPath);
                    if (!typeValidation.valid) {
                        try { if (tempPath && fs.existsSync(tempPath)) await fsp.unlink(tempPath); } catch (_) {}
                        res.status(400).json({error: typeValidation.error});
                        return;
                    }

                    const validatedMime = typeValidation.mime;
                    const ext = path.extname(existing.original_name) || path.extname(f.originalFilename || '') || '';
                    const newName = crypto.randomUUID() + ext.toLowerCase();
                    const root = uploadRoot();
                    const tenantDir = path.join(root, 'tenants', String(userId));
                    await fsp.mkdir(tenantDir, {recursive: true});
                    const destPath = path.join(tenantDir, newName);

                    try {
                        // Optimize image or copy PDF
                        const optimization = await optimizeImage(tempPath, destPath, validatedMime);
                        if (!optimization.success) {
                            throw new Error(optimization.error);
                        }

                        const finalSize = optimization.optimizedSize;

                        // delete old file
                        try { const oldPath = path.join(tenantDir, existing.stored_filename); if (fs.existsSync(oldPath)) await fsp.unlink(oldPath); } catch (_) {}

                        const meta = await ReplaceTenantFileById({
                            userId,
                            fileId,
                            newStoredFilename: newName,
                            mimeType: validatedMime,
                            sizeBytes: finalSize,
                            uploadedByUserId: req.session.user.id
                        });
                        res.status(200).json({ok: true, file: meta});
                    } catch (e2) {
                        try { if (fs.existsSync(destPath)) await fsp.unlink(destPath); } catch (_) {}
                        res.status(400).json({error: e2.message});
                    } finally {
                        try { if (tempPath && fs.existsSync(tempPath)) await fsp.unlink(tempPath); } catch (_) {}
                    }
                });
                return;
            }
            case 'DELETE': {
                const root = uploadRoot();
                const tenantDir = path.join(root, 'tenants', String(userId));
                try {
                    const filePath = path.join(tenantDir, existing.stored_filename);
                    if (fs.existsSync(filePath)) await fsp.unlink(filePath);
                } catch (_) {}
                await DeleteTenantFile({userId, fileId});
                res.status(200).json({ok: true});
                return;
            }
            default:
                res.status(405).send();
                return;
        }
    } catch (e) {
        res.status(400).json({error: e.message});
        console.error(`${new Date().toISOString()} -`, e);
    }
}, ironOptions);

export default handler;
