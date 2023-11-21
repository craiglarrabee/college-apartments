import {ExecuteQuery} from "../pool";

export const GetUserRequiredPayments = async (userId) => {
    const query = `
        SELECT p.lease_id, p.amount, MIN(p.payment_number) AS payment_number, p.payment_type, n.label, DATE_FORMAT(up.date, '%m/%d/%Y') AS date
        FROM user_required_payments p
                 INNER JOIN site_nav n on n.page = CONCAT('leases/', p.lease_id)
                LEFT JOIN user_payment up on p.lease_id = up.lease_id AND p.user_id = up.user_id AND p.payment_number = up.payment_number
        WHERE p.user_id = ?
        GROUP BY p.lease_id, p.payment_type, n.label, up.date
        HAVING up.date IS NULL
        ORDER BY p.lease_id, p.payment_type, payment_number
    `;
    let [rows] = await ExecuteQuery(query,
        [
            userId
        ]);

    return rows;
};