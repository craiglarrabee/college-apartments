import {ExecuteQuery} from "../pool";

/**
 * Get all unpaid payment line items for a tenant
 */
export const GetTenantPaymentItems = async (site, userId) => {
    const query = `
        SELECT id,
               user_id,
               description,
               amount,
               DATE_FORMAT(due_date, '%m/%d/%Y') AS due_date,
               is_paid,
               DATE_FORMAT(date_created, '%m/%d/%Y') AS date_created
        FROM tenant_payment_items
        WHERE site = ?
          AND user_id = ?
          AND is_paid = 0
          AND date_deleted IS NULL
        ORDER BY due_date ASC, date_created ASC
    `;
    let [rows] = await ExecuteQuery(query, [site, userId]);
    return rows;
};

/**
 * Get all payment items (paid and unpaid) for a tenant
 */
export const GetAllTenantPaymentItems = async (site, userId) => {
    const query = `
        SELECT id,
               user_id,
               description,
               amount,
               DATE_FORMAT(due_date, '%m/%d/%Y') AS due_date,
               is_paid,
               paid_trans_id,
               DATE_FORMAT(date_created, '%m/%d/%Y') AS date_created,
               DATE_FORMAT(date_deleted, '%m/%d/%Y') AS date_deleted
        FROM tenant_payment_items
        WHERE site = ?
          AND user_id = ?
        ORDER BY is_paid ASC, due_date DESC, date_created DESC
    `;
    let [rows] = await ExecuteQuery(query, [site, userId]);
    return rows;
};

/**
 * Add a new payment line item for a tenant
 */
export const AddTenantPaymentItem = async (site, userId, description, amount, dueDate, createdByUserId) => {
    const query = `
        INSERT INTO tenant_payment_items (site, user_id, description, amount, due_date, created_by_user_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    let [rows] = await ExecuteQuery(query, [site, userId, description, amount, dueDate, createdByUserId]);
    return rows;
};

/**
 * Mark payment items as paid when a payment is processed
 */
export const MarkTenantPaymentItemsPaid = async (site, userId, itemIds, transId) => {
    if (!itemIds || itemIds.length === 0) return;

    const placeholders = itemIds.map(() => '?').join(',');
    const query = `
        UPDATE tenant_payment_items
        SET is_paid = 1,
            paid_trans_id = ?
        WHERE site = ?
          AND user_id = ?
          AND id IN (${placeholders})
    `;
    let [rows] = await ExecuteQuery(query, [transId, site, userId, ...itemIds]);
    return rows;
};

/**
 * Delete a payment line item (soft delete)
 */
export const DeleteTenantPaymentItem = async (itemId, deletedByUserId) => {
    const query = `
        UPDATE tenant_payment_items
        SET date_deleted = NOW(),
            deleted_by_user_id = ?
        WHERE id = ?
    `;
    let [rows] = await ExecuteQuery(query, [deletedByUserId, itemId]);
    return rows;
};

/**
 * Update a payment line item
 */
export const UpdateTenantPaymentItem = async (itemId, description, amount, dueDate) => {
    const query = `
        UPDATE tenant_payment_items
        SET description = ?,
            amount = ?,
            due_date = ?
        WHERE id = ?
          AND is_paid = 0
    `;
    let [rows] = await ExecuteQuery(query, [description, amount, dueDate, itemId]);
    return rows;
};

