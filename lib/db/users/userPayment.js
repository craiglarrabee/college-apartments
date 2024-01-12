import {ExecuteQuery} from "../pool";

export const GetUserPayments = async (site, userId) => {
    const query = `
        SELECT p.id, p.user_id, DATE_FORMAT(p.date, '%m/%d/%Y') AS date, p.amount, p.description, 
               CASE p.location WHEN 'cw' THEN 'College Way' WHEN 'sw' THEN 'Stadium Way' WHEN 'pp' THEN 'Park Place' ELSE p.location END AS location,
               p.account_type, p.account_number, p.trans_id, p.auth_code, p.result_code, p.result_message
        FROM user_payment p
        WHERE p.site = ? AND p.user_id = ?
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
        SELECT CONCAT(t.first_name, ' ', t.last_name) AS tenant_name, p.id, p.user_id, DATE_FORMAT(p.date, '%m/%d/%Y') AS date, DATE_FORMAT(p.date_reviewed, '%m/%d/%Y') AS date_reviewed, p.amount, p.description
        FROM user_payment p
        JOIN tenant t ON t.user_id = p.user_id
        WHERE p.site = ? AND date_reviewed IS NULL
        ORDER BY date DESC
    `;
    let [rows] = await ExecuteQuery(query,
        [
            site
        ]);

    return rows;
};

export const AddUserPayment = async (site, userId, data) => {
    let [rows] = await ExecuteQuery(`INSERT INTO user_payment (site, user_id, amount, description, date, location, trans_id, auth_code, result_code, result_message, account_type, account_number)
                               VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)`,
        [
            site,
            userId,
            data.amount,
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
