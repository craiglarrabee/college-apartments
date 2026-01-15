import {ExecuteQuery} from "../../db/pool";

// List files for a tenant ordered by created_at ASC
export const ListTenantFiles = async (userId) => {
    const [rows] = await ExecuteQuery(
        `SELECT tf.id, tf.user_id, tf.original_name, tf.stored_filename, tf.mime_type, tf.size_bytes, 
                tf.uploaded_by_user_id, tf.created_at, tf.updated_at,
                CONCAT(t.first_name, ' ', t.last_name) AS uploaded_by_name
         FROM tenant_files tf
         LEFT JOIN tenant t ON t.user_id = tf.uploaded_by_user_id
         WHERE tf.user_id = ? 
         ORDER BY tf.created_at ASC`,
        [userId]
    );
    return rows;
}

// Find a file by id and userId
export const GetTenantFileById = async (userId, fileId) => {
    const [rows] = await ExecuteQuery(
        "SELECT id, user_id, original_name, stored_filename, mime_type, size_bytes, uploaded_by_user_id, created_at, updated_at FROM tenant_files WHERE user_id = ? AND id = ?",
        [userId, fileId]
    );
    return rows && rows.length > 0 ? rows[0] : null;
}

// Find a file by original name and userId
export const GetTenantFileByName = async (userId, originalName) => {
    const [rows] = await ExecuteQuery(
        "SELECT id, user_id, original_name, stored_filename, mime_type, size_bytes, uploaded_by_user_id, created_at, updated_at FROM tenant_files WHERE user_id = ? AND original_name = ?",
        [userId, originalName]
    );
    return rows && rows.length > 0 ? rows[0] : null;
}

// Insert new file metadata
export const InsertTenantFile = async ({userId, originalName, storedFilename, mimeType, sizeBytes, uploadedByUserId}) => {
    const [result] = await ExecuteQuery(
        "INSERT INTO tenant_files (user_id, original_name, stored_filename, mime_type, size_bytes, uploaded_by_user_id) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, originalName, storedFilename, mimeType, sizeBytes, uploadedByUserId]
    );
    const id = result.insertId;
    const [rows] = await ExecuteQuery(
        "SELECT id, user_id, original_name, stored_filename, mime_type, size_bytes, uploaded_by_user_id, created_at, updated_at FROM tenant_files WHERE id = ?",
        [id]
    );
    return rows[0];
}

// Replace file by existing row (keeps created_at)
export const ReplaceTenantFileById = async ({userId, fileId, newStoredFilename, mimeType, sizeBytes, uploadedByUserId}) => {
    await ExecuteQuery(
        "UPDATE tenant_files SET stored_filename = ?, mime_type = ?, size_bytes = ?, uploaded_by_user_id = ? WHERE id = ? AND user_id = ?",
        [newStoredFilename, mimeType, sizeBytes, uploadedByUserId, fileId, userId]
    );
    const [rows] = await ExecuteQuery(
        "SELECT id, user_id, original_name, stored_filename, mime_type, size_bytes, uploaded_by_user_id, created_at, updated_at FROM tenant_files WHERE id = ?",
        [fileId]
    );
    return rows[0];
}

// Replace by original name (keeps created_at)
export const ReplaceTenantFileByName = async ({userId, originalName, newStoredFilename, mimeType, sizeBytes, uploadedByUserId}) => {
    await ExecuteQuery(
        "UPDATE tenant_files SET stored_filename = ?, mime_type = ?, size_bytes = ?, uploaded_by_user_id = ? WHERE user_id = ? AND original_name = ?",
        [newStoredFilename, mimeType, sizeBytes, uploadedByUserId, userId, originalName]
    );
    const [rows] = await ExecuteQuery(
        "SELECT id, user_id, original_name, stored_filename, mime_type, size_bytes, uploaded_by_user_id, created_at, updated_at FROM tenant_files WHERE user_id = ? AND original_name = ?",
        [userId, originalName]
    );
    return rows[0];
}

// Rename file (enforced unique by DB)
export const RenameTenantFile = async ({userId, fileId, newOriginalName}) => {
    await ExecuteQuery(
        "UPDATE tenant_files SET original_name = ? WHERE id = ? AND user_id = ?",
        [newOriginalName, fileId, userId]
    );
    const [rows] = await ExecuteQuery(
        "SELECT id, user_id, original_name, stored_filename, mime_type, size_bytes, uploaded_by_user_id, created_at, updated_at FROM tenant_files WHERE id = ?",
        [fileId]
    );
    return rows[0];
}

// Delete metadata row by id
export const DeleteTenantFile = async ({userId, fileId}) => {
    await ExecuteQuery("DELETE FROM tenant_files WHERE id = ? AND user_id = ?", [fileId, userId]);
}
