import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../../lib/session/options";
import {ListTenantFiles, GetTenantFileByName, InsertTenantFile, ReplaceTenantFileByName} from "../../../../../lib/db/tenants/files";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import {IncomingForm} from "formidable";
import crypto from "crypto";
import {validateFileType, optimizeImage, validateFilename, validateFileSize} from "../../../../../lib/fileUtils";

export const config = { api: { bodyParser: false } };

const ensureDir = async (dirPath) => {
    await fsp.mkdir(dirPath, {recursive: true});
}

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
        if (!userId || Number.isNaN(userId)) {
            res.status(400).json({error: 'Invalid userId'});
            return;
        }

        switch (req.method) {
            case 'GET': {
                const files = await ListTenantFiles(userId);
                res.status(200).json({files});
                return;
            }
            case 'POST': {
                const form = new IncomingForm({
                    multiples: true,
                    maxFileSize: maxBytes(),
                    keepExtensions: true
                });

                form.parse(req, async (err, fields, files) => {
                    if (err) {
                        res.status(400).json({error: err.message});
                        return;
                    }

                    // Normalize to array
                    const upFiles = [];
                    if (Array.isArray(files.file)) upFiles.push(...files.file);
                    else if (files.file) upFiles.push(files.file);
                    else {
                        // Try any field values as files
                        Object.values(files).forEach(v => {
                            if (Array.isArray(v)) upFiles.push(...v); else if (v) upFiles.push(v);
                        });
                    }

                    if (upFiles.length === 0) {
                        res.status(400).json({error: 'No files uploaded. Field name should be "file".'});
                        return;
                    }

                    const results = [];
                    const root = uploadRoot();
                    const tenantDir = path.join(root, 'tenants', String(userId));
                    await ensureDir(tenantDir);

                    for (const f of upFiles) {
                        const originalName = (f.originalFilename || f.newFilename || 'file').trim();
                        const tempPath = f.filepath || f.path;

                        // Validate filename
                        const filenameValidation = validateFilename(originalName);
                        if (!filenameValidation.valid) {
                            results.push({original_name: originalName, status: 'rejected', reason: filenameValidation.error});
                            try { if (tempPath && fs.existsSync(tempPath)) await fsp.unlink(tempPath); } catch (_) {}
                            continue;
                        }

                        // Validate file size
                        const sizeValidation = validateFileSize(f.size, maxBytes());
                        if (!sizeValidation.valid) {
                            results.push({original_name: originalName, status: 'rejected', reason: sizeValidation.error});
                            try { if (tempPath && fs.existsSync(tempPath)) await fsp.unlink(tempPath); } catch (_) {}
                            continue;
                        }

                        // Validate file type using magic bytes
                        const typeValidation = await validateFileType(tempPath);
                        if (!typeValidation.valid) {
                            results.push({original_name: originalName, status: 'rejected', reason: typeValidation.error});
                            try { if (tempPath && fs.existsSync(tempPath)) await fsp.unlink(tempPath); } catch (_) {}
                            continue;
                        }

                        const validatedMime = typeValidation.mime;
                        const ext = path.extname(originalName) || '';
                        const newName = crypto.randomUUID() + ext.toLowerCase();
                        const destPath = path.join(tenantDir, newName);

                        try {
                            // Optimize image or copy PDF
                            const optimization = await optimizeImage(tempPath, destPath, validatedMime);
                            if (!optimization.success) {
                                throw new Error(optimization.error);
                            }

                            const finalSize = optimization.optimizedSize;

                            // Check if name exists
                            const existing = await GetTenantFileByName(userId, originalName);
                            if (existing) {
                                // Replace: delete old binary first if different
                                try {
                                    if (existing.stored_filename && existing.stored_filename !== newName) {
                                        const oldPath = path.join(tenantDir, existing.stored_filename);
                                        if (fs.existsSync(oldPath)) await fsp.unlink(oldPath);
                                    }
                                } catch (_) {}

                                const meta = await ReplaceTenantFileByName({
                                    userId,
                                    originalName,
                                    newStoredFilename: newName,
                                    mimeType: validatedMime,
                                    sizeBytes: finalSize,
                                    uploadedByUserId: req.session.user.id
                                });
                                results.push({original_name: originalName, status: 'replaced', file: meta});
                            } else {
                                const meta = await InsertTenantFile({
                                    userId,
                                    originalName,
                                    storedFilename: newName,
                                    mimeType: validatedMime,
                                    sizeBytes: finalSize,
                                    uploadedByUserId: req.session.user.id
                                });
                                results.push({original_name: originalName, status: 'created', file: meta});
                            }
                        } catch (e2) {
                            // cleanup partial copy
                            try { if (fs.existsSync(destPath)) await fsp.unlink(destPath); } catch (_) {}
                            results.push({original_name: originalName, status: 'error', reason: e2.message});
                        } finally {
                            // Remove temp file
                            try { if (tempPath && fs.existsSync(tempPath)) await fsp.unlink(tempPath); } catch (_) {}
                        }
                    }

                    res.status(200).json({results});
                });
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
