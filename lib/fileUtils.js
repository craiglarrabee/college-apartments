import sharp from 'sharp';
import fileType from 'file-type';
import fsp from 'fs/promises';

const MAX_FILENAME_LENGTH = 150;

/**
 * Validate file type using magic bytes
 * @param {string} filePath - Path to the file to validate
 * @returns {Promise<{valid: boolean, mime?: string, error?: string}>}
 */
export async function validateFileType(filePath) {
    try {
        const buffer = await fsp.readFile(filePath);
        const detectedType = await fileType.fromBuffer(buffer);

        if (!detectedType) {
            return {valid: false, error: 'Could not determine file type'};
        }

        // Allow PNG images and PDFs only
        const allowedTypes = ['image/png', 'application/pdf'];
        if (!allowedTypes.includes(detectedType.mime)) {
            return {valid: false, error: `File type ${detectedType.mime} not allowed. Only PNG images and PDFs are accepted.`};
        }

        return {valid: true, mime: detectedType.mime};
    } catch (e) {
        return {valid: false, error: `File validation failed: ${e.message}`};
    }
}

/**
 * Optimize an image file using sharp
 * @param {string} inputPath - Path to the input file
 * @param {string} outputPath - Path to save the optimized file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<{success: boolean, optimizedSize?: number, error?: string}>}
 */
export async function optimizeImage(inputPath, outputPath, mimeType) {
    // Only optimize images, skip PDFs
    if (mimeType === 'application/pdf') {
        // For PDFs, just copy the file
        await fsp.copyFile(inputPath, outputPath);
        const stats = await fsp.stat(outputPath);
        return {success: true, optimizedSize: stats.size};
    }

    try {
        const image = sharp(inputPath);
        const metadata = await image.metadata();

        // Resize large images (max width 1600px, maintaining aspect ratio)
        const maxWidth = 1600;
        let pipeline = image;

        if (metadata.width && metadata.width > maxWidth) {
            pipeline = pipeline.resize(maxWidth, null, {
                fit: 'inside',
                withoutEnlargement: true
            });
        }

        // Auto-rotate based on EXIF orientation and strip metadata
        pipeline = pipeline.rotate();

        // Optimize based on format
        if (mimeType === 'image/png') {
            pipeline = pipeline.png({
                compressionLevel: 9,
                adaptiveFiltering: true,
                palette: true // Use palette if possible for smaller size
            });
        } else {
            // For other image types (fallback), convert to optimized JPEG
            pipeline = pipeline.jpeg({
                quality: 85,
                progressive: true
            });
        }


        await pipeline.toFile(outputPath);
        const stats = await fsp.stat(outputPath);

        return {success: true, optimizedSize: stats.size};
    } catch (e) {
        return {success: false, error: `Image optimization failed: ${e.message}`};
    }
}

/**
 * Validate filename
 * @param {string} filename - Filename to validate
 * @returns {{valid: boolean, error?: string}}
 */
export function validateFilename(filename) {
    if (!filename || typeof filename !== 'string' || filename.trim().length === 0) {
        return {valid: false, error: 'Filename is required'};
    }

    if (filename.length > MAX_FILENAME_LENGTH) {
        return {valid: false, error: `Filename must be <= ${MAX_FILENAME_LENGTH} characters`};
    }

    return {valid: true};
}

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @param {number} maxBytes - Maximum allowed size in bytes
 * @returns {{valid: boolean, error?: string}}
 */
export function validateFileSize(size, maxBytes) {
    if (size > maxBytes) {
        const maxMb = Math.round(maxBytes / 1024 / 1024);
        return {valid: false, error: `File too large. Max ${maxMb} MB`};
    }
    return {valid: true};
}

