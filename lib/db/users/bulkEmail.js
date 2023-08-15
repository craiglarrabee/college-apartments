import {ExecuteQuery} from "../pool";


export const GetSemesterBulkEmails = async (site, semesters) => {
    const idParams = semesters.length === 1 ? "?" : semesters.reduce((prev, curr, idx) => idx === 1 ? "?, ?" : prev + ", ?");
    const query = `SELECT ed.message_id,
                          ed.from_address,
                          ed.subject,
                          ed.body,
                          DATE_FORMAT(ed.created, '%M %d, %Y')   AS created,
                          DATE_FORMAT(ed.completed, '%M %d, %Y') AS completed,
                          ed.site,
                          ed.semester,
                          COUNT(eq.user_id)                      AS failed_count
                   FROM email_definition ed
                            LEFT JOIN email_queue eq on ed.message_id = eq.message_id AND eq.status = 'failure'
                   WHERE ed.semester IN (${idParams})
                     AND ed.site = ?
                   GROUP BY ed.message_id, ed.from_address, ed.subject, ed.body, ed.created, ed.completed, ed.site,
                            ed.semester
    `;
    let [rows] = await ExecuteQuery(query, [...semesters, site]);
    return rows;
};

export const GetTenantSemesterBulkEmails = async (userId, semester) => {
    const query = `SELECT ed.message_id,
                          ed.from_address,
                          ed.subject,
                          ed.body,
                          DATE_FORMAT(ed.created, '%M %d, %Y')   AS created,
                          DATE_FORMAT(ed.completed, '%M %d, %Y') AS completed,
                          ed.site,
                          ed.semester,
                          eq.address,
                          DATE_FORMAT(eq.sent, '%M %d, %Y')      AS sent,
                          eq.status,
                          eq.reason
                   FROM email_definition ed
                            INNER JOIN email_queue eq on ed.message_id = eq.message_id
                   WHERE eq.user_id = ?
                     AND ed.semester = ?
                   ORDER BY eq.sent
    `;
    const [rows] = await ExecuteQuery(query, [userId, semester]);
    return rows;
};

export const GetTenantBulkEmails = async (userId) => {
    const query = `
        SELECT DISTINCT ed.semester
        FROM email_definition ed
                 INNER JOIN email_queue eq on ed.message_id = eq.message_id
        WHERE eq.user_id = ?
    `;
    const [rows] = await ExecuteQuery(query, [userId]);
    const resp = await Promise.all(rows.map(async row => {
        let emails = await GetTenantSemesterBulkEmails(userId, row.semester);
        return {semester: row.semester, emails: emails}
    }));
    return resp;
}

export const AddEmailDefinition = async (message_id, data) => {
    const query = `INSERT INTO email_definition (message_id, from_address, subject, body, site, semester)
                        VALUES (?, ?, ?, ?, ?, ?)`;
    await ExecuteQuery(query,
        [
            message_id,
            data.from,
            data.subject,
            data.body,
            data.site,
            data.fullSemester
        ]);
};

export const AddEmailRecipient = async (message_id, data) => {

    await ExecuteQuery(`INSERT INTO email_queue (message_id, address, user_id)
                        VALUES (?, ?, ?)`,
        [
            message_id,
            data.address,
            data.user_id
        ]);
};

export const GetPendingEmailRecipients = async (site) => {
    const query = `
        SELECT ed.message_id, eq.user_id, ed.from_address, eq.address, ed.subject, ed.body
        FROM (SELECT * FROM email_definition WHERE site = ? AND completed IS NULL ORDER BY created LIMIT 1) AS ed
                 LEFT JOIN email_queue eq ON ed.message_id = eq.message_id AND eq.sent IS NULL
        ORDER BY ed.created
        LIMIT 10
    `;
    const [rows] = await ExecuteQuery(query, [site]);
    if (rows.length === 1 && rows[0].user_id === null) {
        MarkEmailComplete(rows[0].message_id);
        return [];
    }
    return rows;
};

export const MarkEmailRecipientComplete = async (message_id, user_id, status, reason) => {
    const query = `
        UPDATE email_queue
        SET sent   = CURRENT_TIMESTAMP,
            status = ?,
            reason = ?
        WHERE message_id = ?
          AND user_id = ?
    `;
    await ExecuteQuery(query, [
        status,
        reason,
        message_id,
        user_id
    ]);
};

export const MarkEmailComplete = async (message_id) => {
    const query = `
        UPDATE email_definition
        SET completed = CURRENT_TIMESTAMP
        WHERE message_id = ?
    `;
    await ExecuteQuery(query, [
        message_id
    ]);
};

export const GetBulkEmailDetails = async (messageId) => {
    const query = `SELECT DISTINCT ed.message_id,
                                   ed.from_address,
                                   ed.subject,
                                   ed.body,
                                   DATE_FORMAT(ed.created, '%M %d, %Y')   AS created,
                                   DATE_FORMAT(ed.completed, '%M %d, %Y') AS completed,
                                   ed.site,
                                   ed.semester,
                                   eq.user_id,
                                   CONCAT(ult.last_name, ', ', ult.first_name) AS name,
                                   eq.address,
                                   DATE_FORMAT(eq.sent, '%M %d, %Y')      AS sent,
                                   eq.status,
                                   eq.reason
                   FROM email_definition ed
                            LEFT JOIN email_queue eq on ed.message_id = eq.message_id
                            LEFT JOIN user_lease_tenant ult ON ult.user_id = eq.user_id AND ed.semester = ult.semester
                   WHERE ed.message_id = ?`;

    const [rows] = await ExecuteQuery(query, [messageId]);
    return rows;
};