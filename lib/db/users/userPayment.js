import {ExecuteQuery} from "../pool";

export const GetUserPayments = async (site, userId) => {
    const query = `
        SELECT p.id, p.user_id, DATE_FORMAT(p.date, '%m/%d/%Y') AS date, p.amount, p.surcharge, p.total, p.description, 
               p.location,
               p.account_type, p.account_number, p.trans_id, p.auth_code, p.result_code, p.result_message
        FROM user_payment p
        WHERE p.site = ? AND p.user_id = ?
        ORDER BY trans_id desc
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
        SELECT CONCAT(t.first_name, ' ', t.last_name) AS tenant_name, p.id, p.user_id, DATE_FORMAT(p.date, '%m/%d/%Y') AS date, 
               DATE_FORMAT(p.date_reviewed, '%m/%d/%Y') AS date_reviewed, p.amount, p.surcharge, p.total, p.description, p.account_type, p.account_number, 
               p.location, p.trans_id
        FROM user_payment p
        JOIN tenant t ON t.user_id = p.user_id
        WHERE p.site = ? AND date_reviewed IS NULL
        ORDER BY trans_id DESC
    `;
    let [rows] = await ExecuteQuery(query,
        [
            site
        ]);

    return rows;
};

export const AddUserPayment = async (site, userId, data) => {
    let [rows] = await ExecuteQuery(`INSERT INTO user_payment (site, user_id, amount, surcharge, total, description, date, location, trans_id, auth_code, result_code, result_message, account_type, account_number)
                               VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)`,
        [
            site,
            userId,
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
