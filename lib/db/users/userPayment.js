import {ExecuteQuery} from "../pool";

export const GetUserPayments = async (site, userId) => {
    const query = `
        SELECT p.id,
               p.user_id,
               DATE_FORMAT(p.date, '%m/%d/%Y') AS date,
               p.amount,
               p.surcharge,
               p.total,
               p.description,
               p.location,
               p.account_type,
               p.account_number,
               p.trans_id,
               p.auth_code,
               p.result_code,
               p.result_message
        FROM user_payment p
        WHERE p.site = ?
          AND p.user_id = ?
          AND p.date_deleted IS NULL
        ORDER BY p.date DESC, p.id DESC
    `;
    let [rows] = await ExecuteQuery(query,
        [
            site,
            userId
        ]);

    return rows;
};
export const GetUserDeletedPayments = async (site, userId) => {
    const query = `
        SELECT p.id,
               p.user_id,
               DATE_FORMAT(p.date, '%m/%d/%Y')         AS date,
               p.amount,
               p.surcharge,
               p.total,
               p.description,
               p.location,
               DATE_FORMAT(p.date_deleted, '%m/%d/%Y') AS date_deleted,
               p.reason_deleted,
               p.account_type,
               p.account_number,
               p.trans_id,
               p.auth_code,
               p.result_code,
               p.result_message
        FROM user_payment p
        WHERE p.site = ?
          AND p.user_id = ?
          AND p.date_deleted IS NOT NULL
        ORDER BY p.date DESC, p.id DESC
    `;
    let [rows] = await ExecuteQuery(query,
        [
            site,
            userId
        ]);

    return rows;
};
export const GetUnreviewedUserPayments = async (site) => {
    const query = `
        SELECT CONCAT(t.first_name, ' ', t.last_name)   AS tenant_name,
               p.id,
               p.user_id,
               DATE_FORMAT(p.date, '%m/%d/%Y')          AS date,
               DATE_FORMAT(p.date_reviewed, '%m/%d/%Y') AS date_reviewed,
               p.amount,
               p.surcharge,
               p.total,
               p.description,
               p.account_type,
               p.account_number,
               p.location,
               p.trans_id,
               DATE_FORMAT(p.date, '%Y-%m-%d %H:%i:%s') AS raw_date
        FROM user_payment p
                 JOIN tenant t ON t.user_id = p.user_id
        WHERE p.site = ?
          AND date_reviewed IS NULL
        UNION
        SELECT NULL AS tenant_name,
               NULL AS id,
               NULL AS user_id,
               DATE_FORMAT(MAX(p.date), '%m/%d/%Y')          AS date,
               NULL AS date_reviewed,
               SUM(p.amount) AS amount,
               SUM(p.surcharge) AS surcharge,
               SUM(p.total) AS total,
               'TOTAL' AS description,
               NULL AS account_type,
               NULL AS account_number,
               NULL AS location,
               p.trans_id,
               DATE_FORMAT(MAX(p.date), '%Y-%m-%d %H:%i:%s') AS raw_date
        FROM user_payment p
                 JOIN tenant t ON t.user_id = p.user_id
        WHERE p.site = ?
          AND date_reviewed IS NULL
        GROUP BY p.trans_id
        ORDER BY raw_date DESC, trans_id DESC, id desc
    `;
    let [rows] = await ExecuteQuery(query,
        [
            site,
            site
        ]);

    return rows;
};

export const AddUserPayment = async (site, userId, data) => {
    let [rows] = await ExecuteQuery(`INSERT INTO user_payment (site, user_id, lease_id, amount, surcharge, total, description,
                                                               date, location, trans_id, auth_code, result_code,
                                                               result_message, account_type, account_number)
                                     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)`,
        [
            site,
            userId,
            data.leaseId || null,
            data.amount,
            data.surcharge ? data.surcharge : 0,
            data.total,
            data.description,
            data.location,
            data.transId,
            data.authCode,
            data.resultCode,
            data.resultMessage,
            data.accountType,
            data.accountNumber
        ]);
    return rows;
};


export const MarkPaymentReviewed = async (id) => {
    let [rows] = await ExecuteQuery(
        `UPDATE user_payment
         SET date_reviewed = NOW()
         WHERE id = ?`,
        [
            id
        ]);
    return rows;
};


export const GetPayment = async (id) => {
    const query = `
        SELECT id, site, user_id, lease_id, description, amount, total, trans_id
        FROM user_payment
        WHERE id = ?
    `;
    let [rows] = await ExecuteQuery(query, [id]);
    return rows[0];
};


export const GetUnreviewedSecurityDepositPayment = async (site, userId, leaseId) => {
    const query = `
        SELECT id
        FROM user_payment
        WHERE site = ?
          AND user_id = ?
          ${leaseId ? 'AND lease_id = ?' : ''}
          AND description = 'Security Deposit'
          AND date_deleted IS NULL
        ORDER BY date DESC
        LIMIT 1
    `;
    let params = [site, userId];
    if (leaseId) params.push(leaseId);
    let [rows] = await ExecuteQuery(query, params);
    return rows[0];
};

export const MarkPaymentDeleted = async (id, reason) => {
    let [rows] = await ExecuteQuery(
        `UPDATE user_payment
         SET date_reviewed = NOW(),
             date_deleted = NOW(),
             reason_deleted = ?
         WHERE id = ?`,
        [
            reason,
            id
        ]);
    return rows;
};
