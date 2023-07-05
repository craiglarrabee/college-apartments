import {ExecuteQuery} from "../pool";

export const GetNavLinks = async (user, site) => {
    let queryString;
    let params;

    if (user && user.admin === site && user.manageApartment) {
        //we duplicate the leases under applications to get the same names
        queryString = "SELECT site, IF((parent_page = 'leases_'), CONCAT(page, '/manage'), page) AS page, parent_page, position, label, sub_menu, target, unrestricted, restricted, maintainable FROM site_nav WHERE site = ? AND restricted = 1 AND page != 'leases' UNION " +
            //we duplicate the leases under applications to get the same names
            "SELECT site, REPLACE(IF((parent_page = 'leases_'), CONCAT(page, '/manage'), page), 'leases', 'applications' ) AS page, REPLACE(parent_page, 'leases', 'applications') AS parent_page, concat('0', position) AS position, REPLACE(label, 'Leases', 'Applications') AS label, sub_menu, target, unrestricted, restricted, maintainable FROM site_nav WHERE site = ? AND restricted = 1 AND page like 'leases_%' UNION " +
            //we get assignments links based on semesters
            "SELECT site, REPLACE(page, 'leases', 'assignments' ) AS page,\n" +
            "       REPLACE(parent_page, 'leases', 'assignments') AS parent_page, concat('00', position) AS position,\n" +
            "       REPLACE(label, 'Leases', 'Assignments') AS label, sub_menu, target, unrestricted, restricted, maintainable\n" +
            "FROM site_nav\n" +
            "WHERE site = ? AND restricted = 1 AND page like 'leases_%' AND sub_menu = 1\n" +
            "UNION\n" +
            "SELECT n.site, CONCAT('assignments/', l.fall_year, '/fall/manage') AS page,\n" +
            "       REPLACE(n.parent_page, 'leases', 'assignments') AS parent_page, concat('00', n.position) AS position,\n" +
            "       CASE WHEN l.fall_year IS NOT NULL THEN CONCAT('Fall ', l.fall_year) WHEN l.spring_year IS NOT NULL THEN CONCAT('Spring ', l.spring_year) WHEN l.summer_year IS NOT NULL THEN CONCAT('Summer ', l.summer_year) END AS label,\n" +
            "       n.sub_menu, n.target, n.unrestricted, n.restricted, n.maintainable\n" +
            "FROM site_nav n JOIN lease l ON l.site = n.site AND l.id = SUBSTR(n.page, LOCATE('/', n.page) + 1) AND l.fall_year >= YEAR(curdate()) - 1\n" +
            "WHERE n.site = ? AND n.page LIKE 'leases%'\n" +
            "UNION\n" +
            "SELECT n.site, CONCAT('assignments/', l.spring_year, '/spring/manage') AS page,\n" +
            "       REPLACE(n.parent_page, 'leases', 'assignments') AS parent_page, concat('00', n.position) AS position,\n" +
            "       CONCAT('Spring ', l.spring_year) AS label,\n" +
            "       n.sub_menu, n.target, n.unrestricted, n.restricted, n.maintainable\n" +
            "FROM site_nav n JOIN lease l ON l.site = n.site AND l.id = SUBSTR(n.page, LOCATE('/', n.page) + 1) AND l.spring_year >= YEAR(curdate())\n" +
            "WHERE n.site = ? AND n.page LIKE 'leases%'\n" +
            "UNION\n" +
            "SELECT n.site, CONCAT('assignments/', l.summer_year, '/summer/manage') AS page,\n" +
            "       REPLACE(n.parent_page, 'leases', 'assignments') AS parent_page, concat('00', n.position) AS position,\n" +
            "       CONCAT('Summer ', l.summer_year) AS label,\n" +
            "       n.sub_menu, n.target, n.unrestricted, n.restricted, n.maintainable\n" +
            "FROM site_nav n JOIN lease l ON l.site = n.site AND l.id = SUBSTR(n.page, LOCATE('/', n.page) + 1) AND l.summer_year >= YEAR(curdate())\n" +
            "WHERE n.site = ? AND n.page LIKE 'leases%'\n" +
            "ORDER BY position, page\n";
        params = [site, site, site, site, site, site];
    } else if (user && user.admin === site && user.editSite) {
        queryString = "SELECT n.* FROM site_nav n LEFT JOIN lease d ON d.site = n.site AND n.page = CONCAT('leases/', d.id) WHERE n.site = ? AND n.maintainable = 1 AND COALESCE(d.end_date, CURDATE() + interval 1 month) >= CURDATE() ORDER BY position";
        params = [site];
    } else if (user && user.isLoggedIn) {
        //get unrestricted links plus any leases that the user has
        queryString = "SELECT n.* FROM site_nav n WHERE n.site = ? AND ( n.unrestricted = 1 OR n.page = 'leases_') UNION " +
            "SELECT n.* FROM site_nav n JOIN user_lease l ON n.page = CONCAT('leases/', l.lease_id) AND l.user_id = ? WHERE n.site = ? UNION " +
            //we get assignments links based on semesters
            "SELECT site, REPLACE(page, 'leases', 'assignments' ) AS page,\n" +
            "       REPLACE(parent_page, 'leases', 'assignments') AS parent_page, position,\n" +
            "       REPLACE(label, 'Leases', 'Roomates') AS label, sub_menu, target, unrestricted, restricted, maintainable\n" +
            "FROM site_nav\n" +
            "WHERE site = ? AND restricted = 1 AND page like 'leases_%' AND sub_menu = 1\n" +
            "UNION\n" +
            "SELECT n.site, CONCAT('assignments/', l.fall_year, '/fall') AS page,\n" +
            "       REPLACE(n.parent_page, 'leases', 'assignments') AS parent_page, position,\n" +
            "       CASE WHEN l.fall_year IS NOT NULL THEN CONCAT('Fall ', l.fall_year) WHEN l.spring_year IS NOT NULL THEN CONCAT('Spring ', l.spring_year) WHEN l.summer_year IS NOT NULL THEN CONCAT('Summer ', l.summer_year) END AS label,\n" +
            "       n.sub_menu, n.target, n.unrestricted, n.restricted, n.maintainable\n" +
            "FROM site_nav n JOIN lease l ON l.site = n.site AND l.id = SUBSTR(n.page, LOCATE('/', n.page) + 1) AND l.fall_year >= YEAR(curdate()) - 1\n" +
            "JOIN user_lease ul ON ul.lease_id = l.id AND ul.user_id = ? " +
            "WHERE n.site = ? AND n.page LIKE 'leases%'\n" +
            "UNION\n" +
            "SELECT n.site, CONCAT('assignments/', l.spring_year, '/spring') AS page,\n" +
            "       REPLACE(n.parent_page, 'leases', 'assignments') AS parent_page, position,\n" +
            "       CONCAT('Spring ', l.spring_year) AS label,\n" +
            "       n.sub_menu, n.target, n.unrestricted, n.restricted, n.maintainable\n" +
            "FROM site_nav n JOIN lease l ON l.site = n.site AND l.id = SUBSTR(n.page, LOCATE('/', n.page) + 1) AND l.spring_year >= YEAR(curdate())\n" +
            "JOIN user_lease ul ON ul.lease_id = l.id AND ul.user_id = ? " +
            "WHERE n.site = ? AND n.page LIKE 'leases%'\n" +
            "UNION\n" +
            "SELECT n.site, CONCAT('assignments/', l.summer_year, '/summer') AS page,\n" +
            "       REPLACE(n.parent_page, 'leases', 'assignments') AS parent_page, position,\n" +
            "       CONCAT('Summer ', l.summer_year) AS label,\n" +
            "       n.sub_menu, n.target, n.unrestricted, n.restricted, n.maintainable\n" +
            "FROM site_nav n JOIN lease l ON l.site = n.site AND l.id = SUBSTR(n.page, LOCATE('/', n.page) + 1) AND l.summer_year >= YEAR(curdate())\n" +
            "JOIN user_lease ul ON ul.lease_id = l.id AND ul.user_id = ? " +
            "WHERE n.site = ? AND n.page LIKE 'leases%'\n" +
            "ORDER BY position, page\n";
        params = [site, user.id, site, site, user.id, site, user.id, site, user.id, site];
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