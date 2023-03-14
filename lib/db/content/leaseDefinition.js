import Connection from "../connection";

export const GetLeaseDefinition = async(leaseDefinitionId) => {
    const conn = await Connection();
    const [rows] = await conn.execute("SELECT * FROM lease_definition WHERE id = ?", [leaseDefinitionId]);
    conn.release();
    //we'd better only have one definition
    return rows[0];
}

export const GetSiteLeaseDefinitions = async(site) => {
    const conn = await Connection();
    const [rows] = await conn.execute("SELECT d.id, n.page, n.label FROM lease_definition d JOIN site_nav n ON n.site = d.site AND n.page = concat('leases/', d.id) WHERE d.site = ? AND COALESCE(d.end_date, CURDATE() + interval 1 month) >= CURDATE()", [site]);
    conn.release();
    return rows;
}

export const UpdateLeaseDefinition = async(leaseDefinitionId, data) => {
    const conn = await Connection();
    try {
        await conn.execute("UPDATE lease_definition SET description = ?, start_date = ?, end_date = ? WHERE id = ?",
            [
                data.description,
                data.start_date,
                data.end_date,
                leaseDefinitionId
            ]);
    } finally {
        conn.release();
    }
}

export const AddLeaseDefinition = async(data) => {
    const conn = await Connection();
    let resp;
    try {
        resp = await conn.execute("INSERT INTO lease_definition (site, description) VALUES (?,?)",
            [
                data.site,
                data.description
            ]);
        return resp[0].insertId;
    } finally {
        conn.release();
    }
}
