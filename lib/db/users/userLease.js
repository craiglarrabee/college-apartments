import {BeginTransaction, CommitTransaction, ExecuteQuery, ExecuteTransaction} from "../pool";

export const GetUserLease = async (userId, leaseId) => {
    let [rows] = await ExecuteQuery(`
                SELECT l.id,
                       l.lease_id,
                       l.user_id,
                       l.room_type_id,
                       DATE_FORMAT(l.lease_date, '%M %d, %Y')  AS lease_date,
                       l.signature,
                       DATE_FORMAT(l.signed_date, '%M %d, %Y') AS signed_date,
                       l.lease_discount,
                       l.vehicle_color,
                       l.vehicle_make_model,
                       l.vehicle_license,
                       l.vehicle_state,
                       l.vehicle_owner,
                       l.lease_address,
                       l.lease_home_phone,
                       l.lease_cell_phone,
                       l.lease_email,
                       l.lease_parent_name,
                       l.lease_parent_phone,
                       CONCAT(t.first_name, ' ', t.last_name)  AS name,
                       a.room_type_id,
                       t.apartment_number
                FROM user_lease l
                         JOIN user_lease_tenant t on l.user_id = t.user_id AND l.lease_id = t.lease_id
                         JOIN application a on l.user_id = a.user_id AND l.lease_id = a.lease_id
                WHERE l.user_id = ?
                  AND l.lease_id = ?`,
        [
            userId,
            leaseId
        ]);
    //we should only have one
    return rows[0];
}

export const GetUserLeases = async (leaseId) => {
    let [rows] = await ExecuteQuery(`
                SELECT ul.id,
                       ul.lease_id,
                       ul.user_id,
                       ul.room_type_id,
                       DATE_FORMAT(ul.lease_date, '%M %d, %Y')                 AS lease_date,
                       ul.signature,
                       DATE_FORMAT(ul.signed_date, '%M %d, %Y')                AS signed_date,
                       ul.lease_discount,
                       ul.vehicle_color,
                       ul.vehicle_make_model,
                       ul.vehicle_license,
                       ul.vehicle_state,
                       ul.vehicle_owner,
                       ul.lease_address,
                       ul.lease_home_phone,
                       ul.lease_cell_phone,
                       ul.lease_email,
                       ul.lease_parent_name,
                       ul.lease_parent_phone,
                       CONCAT(ult.first_name, ' ', ult.last_name)              AS name,
                       a.room_type_id,
                       l.semester1,
                       l.semester2,
                       SUM(IF(ult.semester = l.semester1, ult.selected, null)) AS semester1_selected,
                       SUM(IF(ult.semester = l.semester2, ult.selected, null)) AS semester2_selected
                FROM user_lease ul
                         JOIN user_lease_tenant ult on ul.user_id = ult.user_id AND ul.lease_id = ult.lease_id
                         JOIN application a on ul.lease_id = a.lease_id and ul.user_id = a.user_id
                         JOIN lease l ON l.id = ul.lease_id
                WHERE ul.lease_id = ?
                GROUP BY ul.id, ul.lease_id, ul.user_id, ul.room_type_id, ul.lease_date,
                         ul.signature, ul.signed_date, ul.lease_discount, ul.vehicle_color,
                         ul.vehicle_make_model, ul.vehicle_license, ul.vehicle_state, ul.vehicle_owner, ul.lease_address,
                         ul.lease_home_phone,
                         ul.lease_cell_phone, ul.lease_email, ul.lease_parent_name, ul.lease_parent_phone,
                         ult.first_name, ult.last_name, a.room_type_id, l.semester1, l.semester2
        `,
        [
            leaseId
        ]);
    return rows;
};

export const GetPotentialTenantUserLeases = async (site, userId) => {
    const query = `
        SELECT l.id, n.page, n.label
        FROM lease l
                 JOIN site_nav n ON n.site = l.site AND n.page = concat('leases/', l.id)
        WHERE l.site = ?
          AND COALESCE(l.end_date, CURDATE() + interval 1 month) >= CURDATE()
          AND l.id NOT IN (SELECT lease_id FROM user_lease WHERE user_id = ?)
    `;
    const [rows] = await ExecuteQuery(query, [
        site,
        userId
    ]);
    return rows;
};

export const GetTenantUserLeases = async (site, userId) => {
    let [rows] = await ExecuteQuery(`SELECT DISTINCT l.id,
                                                     l.lease_id,
                                                     l.user_id,
                                                     l.room_type_id,
                                                     DATE_FORMAT(l.lease_date, '%M %d, %Y')  AS lease_date,
                                                     l.signature,
                                                     DATE_FORMAT(l.signed_date, '%M %d, %Y') AS signed_date,
                                                     l.lease_discount,
                                                     l.vehicle_color,
                                                     l.vehicle_make_model,
                                                     l.vehicle_license,
                                                     l.vehicle_state,
                                                     l.vehicle_owner,
                                                     l.lease_address,
                                                     l.lease_home_phone,
                                                     l.lease_cell_phone,
                                                     l.lease_email,
                                                     l.lease_parent_name,
                                                     l.lease_parent_phone,
                                                     CONCAT(t.first_name, ' ', t.last_name)  AS name,
                                                     a.room_type_id,
                                                     n.label,
                                                     lr.room_rent,
                                                     t.apartment_number
                                     FROM user_lease l
                                              INNER JOIN user_lease_tenant t on l.user_id = t.user_id AND l.lease_id = t.lease_id
                                              INNER JOIN application a on l.user_id = a.user_id AND l.lease_id = a.lease_id
                                              INNER JOIN site_nav n on n.page = CONCAT('leases/', l.lease_id)
                                              INNER JOIN lease_rooms lr
                                                         on l.lease_id = lr.lease_id AND l.room_type_id = lr.room_type_id

                                     WHERE a.site = ? AND l.user_id = ? `,
        [
            site,
            userId
        ]);
    return rows;
};

export const AddUserLease = async (userId, leaseId, data) => {

    try {
        await ExecuteQuery(`
                    INSERT INTO user_lease (lease_id, user_id, room_type_id, lease_address, lease_home_phone,
                                            lease_cell_phone, lease_email, lease_parent_name,
                                            lease_parent_phone, lease_discount)
                    SELECT DISTINCT a.lease_id,
                                    a.user_id,
                                    a.room_type_id,
                                    CONCAT(t.street, ', ', t.city, ', ', t.state, ' ', t.zip),
                                    t.home_phone,
                                    t.cell_phone,
                                    t.email,
                                    t.parent_name,
                                    t.parent_phone,
                                    ?
                    FROM application a
                             JOIN user_lease_tenant t on a.user_id = t.user_id AND a.lease_id = t.lease_id
                    WHERE a.lease_id = ?
                      AND a.user_id = ?`,
            [
                data.discount !== null ? data.discount : 0,
                leaseId,
                userId
            ]);
    } catch (e) {
        console.error(e);
    }
}

export const DeleteUserLease = async (userId, leaseId, roomTypeId) => {

    try {
        await Promise.all([
            ExecuteQuery("DELETE FROM user_lease WHERE lease_id=? AND user_id=? AND room_type_id = ?",
                [
                    leaseId,
                    userId,
                    roomTypeId
                ])]);
    } catch (e) {
        console.error(e);
    }
}

export const ChangeUserLeaseRoomType = async (userId, leaseId, roomTypeId) => {
    let resp;

    try {
        resp = await ExecuteQuery(`
                    UPDATE user_lease
                    SET room_type_id = ?
                    WHERE lease_id = ?
                      AND user_id = ?
            `,
            [
                roomTypeId,
                leaseId,
                userId
            ]);
    } catch (e) {
        console.error(e);
    }
}

export const UpdateUserLease = async (userId, leaseId, data) => {
    try {
        await ExecuteTransaction([
            {
                // update the lease with user provided data
                string: `
                    UPDATE user_lease
                    SET signature=?,
                        signed_date = ?,
                        lease_discount=?,
                        vehicle_color=?,
                        vehicle_make_model=?,
                        vehicle_license=?,
                        vehicle_state=?,
                        vehicle_owner=?,
                        lease_address=?,
                        lease_home_phone=?,
                        lease_cell_phone=?,
                        lease_email=?,
                        lease_parent_name=?,
                        lease_parent_phone=?
                    WHERE lease_id = ?
                      AND user_id = ?`
                ,
                params:
                    [
                        data.signature,
                        new Date(data.signed_date).toISOString(),
                        data.lease_discount,
                        data.vehicle_color,
                        data.vehicle_make_model,
                        data.vehicle_license,
                        data.vehicle_state,
                        data.vehicle_owner,
                        data.lease_address,
                        data.lease_home_phone,
                        data.lease_cell_phone,
                        data.lease_email,
                        data.lease_parent_name,
                        data.lease_parent_phone,
                        leaseId,
                        userId
                    ]
            }
        ]);
    } catch
        (e) {
        console.error(e);
    }
}

export const GetActiveSemesterTenantNames = async (site) => {
    const query = `
        SELECT DISTINCT semester,
                        SUBSTR(ult.semester, LOCATE(' ', ult.semester) + 1) AS year,
                        ult.user_id,
                        CONCAT(ult.first_name, ' ', ult.last_name)          AS name,
                        ult.apartment_number
        FROM lease l
                 JOIN user_lease_tenant ult
                      ON ult.lease_id = l.id AND ult.semester IN (l.semester1, l.semester2) AND
                         ult.apartment_number IS NOT null
                 JOIN application a on a.lease_id = ult.lease_id AND a.user_id = ult.user_id
        WHERE l.site = ?
          AND SUBSTR(ult.semester, LOCATE(' ', ult.semester) + 1) >= (YEAR(CURDATE()) - 1)
        ORDER BY year, semester`;

    let [rows] = await ExecuteQuery(
        query,
        [site]
    );
    return rows;
}

export const GetActiveSemesterTenants = async (site) => {
    const query = `
        SELECT DISTINCT ult.semester                                                      AS "Semester",
                        SUBSTR(ult.semester, LOCATE(' ', ult.semester) + 1)               AS year,
                        CASE
                            WHEN ult.apartment_number LIKE 'SW%' THEN 'Stadium Way'
                            WHEN ult.apartment_number LIKE 'CW%' THEN 'College Way'
                            WHEN ult.apartment_number is null THEN ''
                            ELSE 'Park Place' END                                         AS "Apartment Location",
                        ult.last_name                                                     AS "Last Name",
                        ult.first_name                                                    AS "First Name",
                        CASE ult.gender WHEN 'M' THEN 'Male' ELSE 'Female' END            AS "Gender",
                        ult.email                                                         AS "eMail",
                        ult.home_phone                                                    AS "Home Phone",
                        ult.cell_phone                                                    AS "Cell Phone",
                        a.school_year                                                     AS "Education Status",
                        DATE_FORMAT(ult.date_of_birth, '%m/%d/%y')                        AS "Birthdate",
                        CASE WHEN deposit_date IS NULL THEN 'App Only' ELSE 'Deposit' END AS "Application Status",
                        DATE_FORMAT(a.submit_date, '%m/%d/%y')                            AS "Application Received Date",
                        CASE ult_old.lease_id WHEN null THEN 'Returning' ELSE 'New' END   AS "Tenant Status",
                        CASE rt.room_type
                            WHEN 'Shared' THEN 'Shared Room(Spring or Summer only)'
                            WHEN 'Private' THEN 'Individual Room(Spring or Summer only)'
                            ELSE 'Private Suite(Spring or Summer only)' END               AS "Room Type",
                        ult.apartment_number                                              AS "Apartment Assignment",
                        CASE ul.signed_date WHEN null THEN 'Not Signed' ELSE 'Signed' END AS "Lease Agreement Status",
                        ul.vehicle_license                                                AS "License Plate #"
        FROM lease l
                 JOIN user_lease_tenant ult
                      ON ult.lease_id = l.id AND ult.semester IN (l.semester1, l.semester2)
                 JOIN application a
                      on a.lease_id = ult.lease_id AND a.user_id = ult.user_id
                 JOIN room_type rt on a.room_type_id = rt.id and rt.site = l.site
                 LEFT JOIN user_lease ul on l.id = ul.lease_id AND ul.user_id = ult.user_id
                 LEFT JOIN user_lease_tenant ult_old
                           ON ult_old.user_id = ult.user_id AND ult_old.lease_id <> ult.lease_id
        WHERE l.site = ?
          AND SUBSTR(ult.semester, LOCATE(' ', ult.semester) + 1) >= (YEAR(CURDATE()) - 1)
        ORDER BY year, semester`;

    let [rows] = await ExecuteQuery(
        query,
        [site]
    );
    return rows;
}

export const GetActiveSemesters = async (site) => {
    const query = `
        SELECT DISTINCT ult.semester, SUBSTR(ult.semester, LOCATE(' ', ult.semester) + 1) AS year
        FROM lease l
                 JOIN user_lease_tenant ult ON ult.lease_id = l.id 
        WHERE l.site = ?
          AND SUBSTR(ult.semester, LOCATE(' ', ult.semester) + 1) >= (YEAR(CURDATE()) - 1)
        ORDER BY year, CASE WHEN semester LIKE 'Fall%' THEN 3 WHEN semester LIKE 'Spring%' THEN 1 ELSE 2 END `;

    let [rows] = await ExecuteQuery(
        query,
        [site]
    );
    return rows;
};

export const GetActiveSemesterApartments = async (site) => {
    const query = `
        SELECT DISTINCT ult.semester,
                        SUBSTR(ult.semester, LOCATE(' ', ult.semester) + 1) AS year,
                        ult.apartment_number
        FROM lease l
                 JOIN user_lease_tenant ult
                      ON ult.lease_id = l.id AND ult.semester IN (l.semester1, l.semester2) AND
                         ult.apartment_number IS NOT null
                 JOIN application a on a.lease_id = ult.lease_id AND a.user_id = ult.user_id
        WHERE l.site = ?
          AND SUBSTR(ult.semester, LOCATE(' ', ult.semester) + 1) >= (YEAR(CURDATE()) - 1)
        ORDER BY year, semester`;

    let [rows] = await ExecuteQuery(
        query,
        [site]
    );
    return rows;
};