import {ExecuteQuery, ExecuteTransaction} from "../pool";

export const GetLease = async (leaseId) => {

    const [rows] = await ExecuteQuery(`
        SELECT id,
               site,
               description,
               COALESCE(start_date, '') as start_date,
               COALESCE(end_date, '')   as end_date,
               semester1,
               semester2,
               deposit_amount
        FROM lease
        WHERE id = ?`, [leaseId]);
    //we'd better only have one definition
    return rows[0];
}

export const GetLeases = async (site) => {
    const [rows] = await ExecuteQuery(`SELECT d.id, n.page, n.label
                                       FROM lease d
                                                JOIN site_nav n ON n.site = d.site AND n.page = concat('leases/', d.id)
                                       WHERE d.site = ?
                                         AND COALESCE(d.end_date, CURDATE() + interval 1 month) >= CURDATE()`,
        [site]);
    return rows;
}

export const UpdateLease = async (leaseDefinitionId, data) => {
    const semesters = data.semesters.sort();
    try {
        await ExecuteTransaction([
            {
                string: `
                    UPDATE lease
                    SET description    = ?,
                        start_date     = ?,
                        end_date       = ?,
                        semester1      = ?,
                        semester2      = ?,
                        deposit_amount = ?
                    WHERE id = ?`,
                params:
                    [
                        data.description,
                        data.start_date,
                        data.end_date,
                        semesters.length > 0 ? semesters[0] : null,
                        semesters.length > 1 ? semesters[1] : null,
                        data.deposit_amount,
                        leaseDefinitionId
                    ]
            },
            {
                string: `
                    UPDATE site_nav
                    SET label    = ?
                    WHERE site = ? 
                      AND page = ?`,
                params:
                    [
                        data.label,
                        data.site,
                        data.page
                    ]
            }
        ]);
    } catch (e) {
        console.log(e);
    }finally {
    }
}

export const AddLease = async (data) => {

    let resp;
    try {
        resp = await ExecuteQuery("INSERT INTO lease (site, description) VALUES (?,?)",
            [
                data.site,
                data.description
            ]);
        return resp[0].insertId;
    } finally {
    }
}
