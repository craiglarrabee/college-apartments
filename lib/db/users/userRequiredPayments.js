import {ExecuteQuery} from "../pool";

export const GetUserRequiredPayments = async (userId) => {
    const query = `
        SELECT p.lease_id, p.semester, p.amount, MIN(p.payment_number) AS payment_number, p.payment_type, DATE_FORMAT(up.date, '%m/%d/%Y') AS date
        FROM user_required_payments p
                LEFT JOIN user_payment up on p.lease_id = up.lease_id AND p.user_id = up.user_id AND p.payment_number = up.payment_number AND p.semester = up.semester
        WHERE p.user_id = ?
        GROUP BY p.lease_id, p.payment_type, up.date
        HAVING up.date IS NULL
        ORDER BY p.lease_id, p.payment_type, payment_number
    `;
    let [rows] = await ExecuteQuery(query,
        [
            userId
        ]);

    return rows;
};