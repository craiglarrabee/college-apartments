import { ExecuteQuery } from "../pool";

export const GetLease = async(leaseId) => {
    
    const [rows] = await ExecuteQuery("SELECT id, site, description, COALESCE(start_date, '') as start_date, COALESCE(end_date, '') as end_date FROM lease WHERE id = ?", [leaseId]);
        //we"d better only have one definition
    return rows[0];
}

export const GetLeases = async(site) => {
    
    const [rows] = await ExecuteQuery("SELECT d.id, n.page, n.label FROM lease d JOIN site_nav n ON n.site = d.site AND n.page = concat('leases/', d.id) WHERE d.site = ? AND COALESCE(d.end_date, CURDATE() + interval 1 month) >= CURDATE()", [site]);
        return rows;
}

export const UpdateLease = async(leaseDefinitionId, data) => {
    
    try {
        await ExecuteQuery("UPDATE lease SET description = ?, start_date = ?, end_date = ? WHERE id = ?",
            [
                data.description,
                data.start_date,
                data.end_date,
                leaseDefinitionId
            ]);
    } finally {
            }
}

export const AddLease = async(data) => {
    
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
