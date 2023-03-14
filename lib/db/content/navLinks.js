import Connection from "../connection";

export const GetNavLinks = async(site, includeRestricted) => {
    const conn = await Connection();
    let queryString = "SELECT n.* FROM site_nav n WHERE n.site = ? AND n.restricted = 0 ";
    let params = [site];
    if (includeRestricted) {
        queryString += "UNION SELECT n.* FROM site_nav n LEFT JOIN lease d ON d.site = n.site AND n.page = CONCAT('leases/', d.id) WHERE n.site = ? AND n.restricted = 1 AND COALESCE(d.end_date, CURDATE() + interval 1 month) >= CURDATE() ";
        params.push(site);
    }
    queryString += "ORDER BY position";
    let [rows] = await conn.execute(queryString, params);

    conn.release();
    return rows;
}

export const AddNavLink = async({leaseId, leasename, site}) => {
    const conn = await Connection();
    let resp;
    try {
        //let's get the "leases" row as a template
        let [rows] = await conn.execute("SELECT * FROM site_nav WHERE site = ? AND page='leases'", [site]);
        let newRow = {...rows[0]};
        newRow.page = `${newRow.page}/${leaseId}`;
        newRow.position = `${newRow.position.split(".")[0]}.${leaseId.toString().padStart(4, "0")}`;
        resp = await conn.execute("INSERT INTO site_nav (site, page, parent_page, position, label, restricted) VALUES (?,?,?,?,?,?)",
            [
                newRow.site,
                newRow.page,
                newRow.parent_page,
                newRow.position,
                leasename,
                newRow.restricted
            ]);
        return resp[0].insertId;
    } finally {
        conn.release();
    }
}