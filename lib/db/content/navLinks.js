import { ExecuteQuery } from "../pool";

export const GetNavLinks = async(user, site) => {
    let queryString;
    if(user && user.admin === site && user.manageApartment) {
        queryString = "SELECT n.* FROM site_nav n WHERE n.site = ? AND n.restricted = 1 ORDER BY position";
    } else if (user && user.admin === site && user.editSite) {
        queryString = "SELECT n.* FROM site_nav n LEFT JOIN lease d ON d.site = n.site AND n.page = CONCAT('leases/', d.id) WHERE n.site = ? AND n.maintainable = 1 AND COALESCE(d.end_date, CURDATE() + interval 1 month) >= CURDATE() ORDER BY position";
    } else {
        queryString = "SELECT n.* FROM site_nav n WHERE n.site = ? AND n.restricted = 0 ORDER BY position";
    }

    let [rows] = await ExecuteQuery(queryString, [site]);

        return rows;
}

export const AddNavLink = async({leaseId, leasename, site}) => {
    let resp;
    try {
        //let"s get the "leases" row as a template
        let [rows] = await ExecuteQuery("SELECT * FROM site_nav WHERE site = ? AND page='leases'", [site]);
        let newRow = {...rows[0]};
        newRow.page = `${newRow.page}/${leaseId}`;
        newRow.position = `${newRow.position.split(".")[0]}.${leaseId.toString().padStart(4, "0")}`;
        resp = await ExecuteQuery("INSERT INTO site_nav (site, page, parent_page, position, label, restricted) VALUES (?,?,?,?,?,?)",
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
            }
}