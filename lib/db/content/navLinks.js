import {ExecuteQuery} from "../pool";
import {GetUserAvailableLeaseRooms} from "../users/roomType";

export const GetNavLinks = async (user, site) => {
    let queryString;
    let params = [];

    if (user && user.admin === site && user.manageApartment) {
        //we duplicate the leases under applications and apartments to get the same names
        queryString = "SELECT site, IF((parent_page = 'leases_'), CONCAT(page, '/manage'), page) AS page, parent_page, position, label, sub_menu, target, restricted, maintainable FROM site_nav WHERE site = ? AND restricted = 1 AND page != 'leases' UNION " +
            //we duplicate the leases under applications to get the same names
            "SELECT site, REPLACE(IF((parent_page = 'leases_'), CONCAT(page, '/manage'), page), 'leases', 'applications' ) AS page, REPLACE(parent_page, 'leases', 'applications') AS parent_page, concat('1', position) AS position, REPLACE(label, 'Leases', 'Applications') AS label, sub_menu, target, restricted, maintainable FROM site_nav WHERE site = ? AND restricted = 1 AND page like 'leases_%' UNION " +
            //we duplicate the leases under apartments to get the same names
            "SELECT site, REPLACE(IF((parent_page = 'leases_'), CONCAT(page, '/manage'), page), 'leases', 'assignments' ) AS page, REPLACE(parent_page, 'leases', 'assignments') AS parent_page, concat('2', position) AS position, REPLACE(label, 'Leases', 'Assignments') AS label, sub_menu, target, restricted, maintainable FROM site_nav WHERE site = ? AND restricted = 1 AND page like 'leases_%' ORDER BY page, position";
        params = [site, site, site];
    } else if (user && user.admin === site && user.editSite) {
        queryString = "SELECT n.* FROM site_nav n LEFT JOIN lease d ON d.site = n.site AND n.page = CONCAT('leases/', d.id) WHERE n.site = ? AND n.maintainable = 1 AND COALESCE(d.end_date, CURDATE() + interval 1 month) >= CURDATE() ORDER BY position";
        params = [site];
    } else if (user) {
        //get unrestricted links plus any leases that the user has
        queryString = "SELECT n.* FROM site_nav n WHERE n.site = ? AND ( n.unrestricted = 1 OR n.page = 'leases_') UNION SELECT n.* FROM site_nav n JOIN user_lease l ON n.page = CONCAT('leases/', l.lease_id) AND l.user_id = ? WHERE n.site = ? ORDER BY position";
        params = [site, user.id, site];
    } else {
        queryString = "SELECT n.* FROM site_nav n WHERE n.site = ? AND n.unrestricted = 1 ORDER BY position";
        params = [site];
    }

    let [rows] = await ExecuteQuery(queryString, params);

    return rows;
}

export const AddNavLink = async ({leaseId, leasename, site}) => {
    let resp;
    try {
        //let's get the "leases" row as a template
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