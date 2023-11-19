import {ExecuteQuery} from "../pool";

export const GetUserPayments = async (userId) => {
    const query = `
        SELECT p.id, p.user_id, p.lease_id, DATE_FORMAT(p.date, '%m/%d/%Y') AS date, p.amount, p.type, p.description
        FROM user_payment p
    `;
    let [rows] = await ExecuteQuery(query,
        [
            userId
        ]);

    return rows;
};

export const AddUserPayment = async (site, userId, leaseId, amount, description) => {
    let [rows] = await ExecuteQuery(`INSERT INTO user_payment (site, lease_id, user_id, amount, type, description, date)
                               VALUES (?, ?, ?, ?, 'deposit', ?, NOW())`,
        [
            site,
            leaseId,
            userId,
            amount,
            description
        ]);
    return rows;
};
