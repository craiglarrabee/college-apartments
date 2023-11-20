import {ExecuteQuery} from "../pool";

export const GetUserPayments = async (userId) => {
    const query = `
        SELECT p.id, p.user_id, p.lease_id, DATE_FORMAT(p.date, '%m/%d/%Y') AS date, p.amount, p.type, p.description, n.label, p.payment_number
        FROM user_payment p
                 INNER JOIN site_nav n on n.page = CONCAT('leases/', p.lease_id)
        WHERE p.user_id = ?
    `;
    let [rows] = await ExecuteQuery(query,
        [
            userId
        ]);

    return rows;
};
export const GetUnreviewedUserPayments = async (site) => {
    const query = `
        SELECT CONCAT(t.first_name, ' ', t.last_name) AS tenant_name, p.id, p.user_id, p.lease_id, DATE_FORMAT(p.date, '%m/%d/%Y') AS date, DATE_FORMAT(p.date_reviewed, '%m/%d/%Y') AS date_reviewed, p.amount, p.type, p.description, p.payment_number
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

export const AddUserPayment = async (site, userId, leaseId, type, amount, description, paymentNumber) => {
    let [rows] = await ExecuteQuery(`INSERT INTO user_payment (site, lease_id, user_id, amount, type, description, date, payment_number)
                               VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
        [
            site,
            leaseId,
            userId,
            amount,
            type,
            description,
            paymentNumber
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
