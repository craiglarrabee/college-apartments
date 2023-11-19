import {ExecuteQuery} from "../pool";

export const GetNavLinks = async (user, site) => {
    let queryString;
    let params;

    if (user?.manage?.includes(site) && user?.manageApartment) {
        //we duplicate the leases under applications to get the same names
        queryString = `
            SELECT site,
                   IF((parent_page = 'leases_'), CONCAT(page, '/manage'), page) AS page,
                   parent_page,
                   position,
                   label,
                   sub_menu,
                   target,
                   unrestricted,
                   restricted,
                   maintainable,
                   public
            FROM site_nav
            WHERE site = ?
              AND restricted = 1
              AND page != 'leases'
            UNION
            -- we duplicate the leases under applications to get the same names
            SELECT site,
                   REPLACE(IF((parent_page = 'leases_'), CONCAT(page, '/manage'), page), 'leases',
                           'applications')                        AS page,
                   REPLACE(parent_page, 'leases', 'applications') AS parent_page,
                   concat('0', position)                          AS position,
                   REPLACE(label, 'Leases', 'Applications')       AS label,
                   sub_menu,
                   target,
                   unrestricted,
                   restricted,
                   maintainable,
                   public
            FROM site_nav
            WHERE site = ?
              AND restricted = 1
              AND page like 'leases_%'
            UNION
            -- we get assignments links based on semesters
            SELECT site,
                   REPLACE(page, 'leases', 'assignments')        AS page,
                   REPLACE(parent_page, 'leases', 'assignments') AS parent_page,
                   concat('00', position)                        AS position,
                   REPLACE(label, 'Leases', 'Assignments')       AS label,
                   sub_menu,
                   target,
                   unrestricted,
                   restricted,
                   maintainable,
                   public
            FROM site_nav
            WHERE site = ?
              AND restricted = 1
              AND page like 'leases_%'
              AND sub_menu = 1
            UNION
            SELECT DISTINCT n.site,
                            CONCAT('assignments/', REPLACE(ult.semester, ' ', '_'), '/manage${site === "suu" ? "/location" : ""}') AS page,
                            REPLACE(n.parent_page, 'leases', 'assignments')                    AS parent_page,
                            concat('0000', SUBSTR(ult.semester, LOCATE(' ', ult.semester) + 1),
                                   CASE
                                       WHEN ult.semester LIKE 'Spring%' THEN 1
                                       WHEN ult.semester LIKE 'Summer%' THEN 2
                                       WHEN ult.semester LIKE 'Fall%' THEN 3 END)              AS position,
                            ult.semester                                                       AS label,
                            n.sub_menu,
                            n.target,
                            n.unrestricted,
                            n.restricted,
                            n.maintainable,
                            n.public
            FROM site_nav n
                     JOIN lease l ON l.site = n.site AND l.id = SUBSTR(n.page, LOCATE('/', n.page) + 1)
                     JOIN user_lease_tenant ult ON ult.lease_id = l.id AND
                                                   SUBSTR(ult.semester, LOCATE(' ', ult.semester) + 1) >=
                                                   YEAR(curdate()) - 1
                     JOIN application a on a.lease_id = ult.lease_id AND a.user_id = ult.user_id AND a.processed = 1 AND
                                           a.deposit_date IS NOT NULL
            WHERE n.site = ?
              AND n.page LIKE 'leases%'
            ORDER BY position, page`;
        params = [site, site, site, site];
    } else if (user?.admin?.includes(site) && user?.editSite) {
        queryString = "SELECT n.* FROM site_nav n LEFT JOIN lease d ON d.site = n.site AND n.page = CONCAT('leases/', d.id) WHERE n.site = ? AND n.maintainable = 1 AND COALESCE(d.end_date, CURDATE() + interval 1 month) >= CURDATE() ORDER BY position";
        params = [site];
    } else if (user?.isLoggedIn) {
        //get unrestricted links plus any leases that the user has
        queryString = `
            SELECT n.*
            FROM site_nav n
            WHERE n.site = ?
              AND (n.unrestricted = 1 )
            UNION
            SELECT n.*
            FROM site_nav n
            WHERE n.site = ?
            UNION
            -- we get assignments links based on semesters
            SELECT site,
                   REPLACE(page, 'leases', 'assignments')        AS page,
                   REPLACE(parent_page, 'leases', 'assignments') AS parent_page,
                   concat('00', position)                        AS position,
                   REPLACE(label, 'Leases', 'Roomates')          AS label,
                   sub_menu,
                   target,
                   unrestricted,
                   restricted,
                   maintainable,
                   public
            FROM site_nav
            WHERE site = ?
              AND restricted = 1
              AND page like 'leases_%'
              AND sub_menu = 1
            UNION
            SELECT n.site,
                   CONCAT('assignments/', REPLACE(l.semester1, ' ', '_'))                                 AS page,
                   REPLACE(n.parent_page, 'leases', 'assignments')                              AS parent_page,
                   concat('00', position, '3')                                                  AS position,
                   semester1 AS label,
                   n.sub_menu,
                   n.target,
                   n.unrestricted,
                   n.restricted,
                   n.maintainable,
                   n.public
            FROM site_nav n
                     JOIN lease l ON l.site = n.site AND l.id = SUBSTR(n.page, LOCATE('/', n.page) + 1) AND
                                     SUBSTR(l.semester1, LOCATE(' ', l.semester1) + 1) >= YEAR(curdate()) - 1
                     JOIN user_lease ul ON ul.lease_id = l.id AND ul.user_id = ? 
            ORDER BY position, page
        `;
        params = [site, user.id, site, site, user.id, site];
    } else {
        queryString = "SELECT n.* FROM site_nav n WHERE n.site = ? AND n.unrestricted = 1 AND n.public = 1 ORDER BY position";
        params = [site];
    }

    let [rows] = await ExecuteQuery(queryString, params);

    return rows;
}

export const AddNavLink = async ({leaseId, leasename, site, ...restOfProps }) => {
    let resp;
    try {
        //let's get the "leases" row as a template
        let [rows] = await ExecuteQuery("SELECT * FROM site_nav WHERE site = ? AND page='leases'", [site]);
        let newRow = {...rows[0]};
        newRow.page = `${newRow.page}/${leaseId}`;
        newRow.position = `${newRow.position.split(".")[0]}.${leaseId.toString().padStart(4, "0")}`;
        resp = await ExecuteQuery("INSERT INTO site_nav (site, page, parent_page, position, label, restricted, public) VALUES (?,?,?,?,?,?,0)",
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