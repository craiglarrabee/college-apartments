import {ExecuteQuery} from "../pool";

export const GetUserLease = async (userId, leaseId) => {

    let [rows] = await ExecuteQuery("SELECT l.id, l.lease_id, l.user_id, l.room_options_id, DATE_FORMAT(l.lease_date, '%M %d, %Y') AS lease_date, l.signature, DATE_FORMAT(l.signed_date, '%M %d, %Y') AS signed_date, l.lease_discount, l.vehicle_color, l.vehicle_make_model, l.vehicle_license, l.vehicle_state, l.vehicle_owner, l.lease_address, l.lease_home_phone, l.lease_cell_phone, l.lease_email, l.lease_parent_name, l.lease_parent_phone, CONCAT(t.first_name, ' ', t.last_name) AS name, a.room_type_id FROM user_lease l JOIN user_lease_tenant t on l.user_id = t.user_id AND l.lease_id = t.lease_id JOIN application a on l.user_id = a.user_id AND l.lease_id = a.lease_id  WHERE l.user_id = ? AND l.lease_id = ?",
        [
            userId,
            leaseId
        ]);
    //we shoultd only have one
    if (rows && rows.length === 1) return rows[0];
    return null;
}

export const GetUserLeases = async (leaseId, submitted) => {
    let [rows] = await ExecuteQuery("SELECT l.id, l.lease_id, l.user_id, l.room_options_id, DATE_FORMAT(l.lease_date, '%M %d, %Y') AS lease_date, l.signature, DATE_FORMAT(l.signed_date, '%M %d, %Y') AS signed_date, l.lease_discount, l.vehicle_color, l.vehicle_make_model, l.vehicle_license, l.vehicle_state, l.vehicle_owner, l.lease_address, l.lease_home_phone, l.lease_cell_phone, l.lease_email, l.lease_parent_name, l.lease_parent_phone, CONCAT(t.first_name, ' ', t.last_name) AS name, a.room_type_id, ld.spring_year AS lease_spring_year, ld.summer_year AS lease_summer_year, ld.fall_year AS lease_fall_year, t.spring_year, t.summer_year, t.fall_year FROM user_lease l JOIN user_lease_tenant t on l.user_id = t.user_id AND l.lease_id = t.lease_id JOIN application a on l.lease_id = a.lease_id and l.user_id = a.user_id JOIN lease ld ON ld.id = l.lease_id WHERE l.lease_id = ? ",
        [
            leaseId
        ]);
    return rows;
}

export const AddUserLease = async (userId, leaseId, data) => {

    try {
        await ExecuteQuery("INSERT INTO user_lease (lease_id, user_id, room_options_id, lease_address, lease_home_phone, lease_cell_phone, lease_email, lease_parent_name, lease_parent_phone, lease_discount) SELECT a.lease_id, a.user_id, a.room_type_id, CONCAT(t.street,', ',t.city,', ',t.state,' ',t.zip), t.home_phone, t.cell_phone, t.email, t.parent_name, t.parent_phone, ? FROM application a JOIN user_lease_tenant t on a.user_id = t.user_id AND a.lease_id = t.lease_id WHERE a.lease_id=? AND a.user_id=?",
            [
                data.discount ? data.discount : 0,
                leaseId,
                userId
            ]);
    } catch (e) {
        console.log(e);
    }
}

export const DeleteUserLease = async (userId, leaseId) => {

    try {
        await ExecuteQuery("DELETE FROM user_lease WHERE lease_id=? AND user_id=?",
            [
                leaseId,
                userId
            ]);
    } catch (e) {
        console.log(e);
    }
}

export const UpdateUserLease = async (userId, leaseId, data) => {
    let resp;

    try {
        resp = await ExecuteQuery("UPDATE user_lease SET  signature=?, signed_date = ?, lease_discount=?, vehicle_color=?, vehicle_make_model=?, vehicle_license=?, vehicle_state=?, vehicle_owner=?, lease_address=?, lease_home_phone=?, lease_cell_phone=?, lease_email=?, lease_parent_name=?, lease_parent_phone=? WHERE lease_id=? AND user_id=?",
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
            ]);
    } catch (e) {
        console.log(e);
    }
    console.log(resp);
}

export const GetActiveSemesterTenantNames = async (site) => {
    const query = `SELECT DISTINCT CONCAT('Summer ', l.summer_year)            AS semester,
                                   CONCAT(l.summer_year, '-2')                 AS ord,
                                   ult.user_id,
                                   CONCAT(ult.last_name, ', ', ult.first_name) AS name,
                                   ult.apartment_number
                   FROM lease l
                            JOIN user_lease_tenant ult ON ult.lease_id = l.id AND ult.summer_year = l.summer_year AND
                                                          ult.apartment_number IS NOT null
                            JOIN application a on a.lease_id = ult.lease_id AND a.user_id = ult.user_id
                   WHERE l.site = ?
                     AND l.summer_year >= YEAR(curdate())
                   UNION
                   SELECT DISTINCT CONCAT('Spring ', l.spring_year)            AS semester,
                                   CONCAT(l.spring_year, '-1')                 AS ord,
                                   ult.user_id,
                                   CONCAT(ult.last_name, ', ', ult.first_name) AS name,
                                   ult.apartment_number
                   FROM lease l
                            JOIN user_lease_tenant ult ON ult.lease_id = l.id AND ult.spring_year = l.spring_year AND
                                                          ult.apartment_number IS NOT null
                            JOIN application a on a.lease_id = ult.lease_id AND a.user_id = ult.user_id
                   WHERE l.site = ?
                     AND l.spring_year >= YEAR(curdate())
                   UNION
                   SELECT DISTINCT CONCAT('Fall ', l.fall_year)                AS semester,
                                   CONCAT(l.fall_year, '-3')                   AS ord,
                                   ult.user_id,
                                   CONCAT(ult.last_name, ', ', ult.first_name) AS name,
                                   ult.apartment_number
                   FROM lease l
                            JOIN user_lease_tenant ult ON ult.lease_id = l.id AND ult.fall_year = l.fall_year AND
                                                          ult.apartment_number IS NOT null
                            JOIN application a on a.lease_id = ult.lease_id AND a.user_id = ult.user_id
                   WHERE l.site = ?
                     AND l.fall_year >= YEAR(curdate())
                   ORDER BY ord`;

    let [rows] = await ExecuteQuery(
        query,
        [site, site, site]
    );
    return rows;
}

export const GetActiveSemesterTenants = async (site) => {
    const query =
        `SELECT DISTINCT CONCAT('Summer ', l.summer_year)                                  AS "Semester",
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
                       ON ult.lease_id = l.id AND ult.summer_year = l.summer_year
                  JOIN application a
                       on a.lease_id = ult.lease_id AND a.user_id = ult.user_id
                  JOIN room_type rt on a.room_type_id = rt.id and rt.site = l.site
                  LEFT JOIN user_lease ul on l.id = ul.lease_id AND ul.user_id = ult.user_id
                  LEFT JOIN user_lease_tenant ult_old
                            ON ult_old.user_id = ult.user_id AND ult_old.lease_id <> ult.lease_id
         WHERE l.site = ?
           AND l.summer_year >= YEAR(curdate())
         UNION
         SELECT DISTINCT CONCAT('Spring ', l.spring_year)                                  AS "Semester",
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
                       ON ult.lease_id = l.id AND ult.spring_year = l.spring_year
                  JOIN application a
                       on a.lease_id = ult.lease_id AND a.user_id = ult.user_id
                  JOIN room_type rt on a.room_type_id = rt.id and rt.site = l.site
                  LEFT JOIN user_lease ul on l.id = ul.lease_id AND ul.user_id = ult.user_id
                  LEFT JOIN user_lease_tenant ult_old
                            ON ult_old.user_id = ult.user_id AND ult_old.lease_id <> ult.lease_id
         WHERE l.site = ?
           AND l.spring_year >= YEAR(curdate())
         UNION
         SELECT DISTINCT CONCAT('Fall ', l.fall_year)                                      AS "Semester",
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
                             WHEN 'Shared' THEN 'Shared Room'
                             WHEN 'Private' THEN 'Individual Room'
                             ELSE 'Private Suite' END                                      AS "Room Type",
                         ult.apartment_number                                              AS "Apartment Assignment",
                         CASE ul.signed_date WHEN null THEN 'Not Signed' ELSE 'Signed' END AS "Lease Agreement Status",
                         ul.vehicle_license                                                AS "License Plate #"
         FROM lease l
                  JOIN user_lease_tenant ult
                       ON ult.lease_id = l.id AND ult.fall_year = l.fall_year
                  JOIN application a
                       on a.lease_id = ult.lease_id AND a.user_id = ult.user_id
                  JOIN room_type rt on a.room_type_id = rt.id and rt.site = l.site
                  LEFT JOIN user_lease ul on l.id = ul.lease_id AND ul.user_id = ult.user_id
                  LEFT JOIN user_lease_tenant ult_old
                            ON ult_old.user_id = ult.user_id AND ult_old.lease_id <> ult.lease_id
         WHERE l.site = ?
           AND l.fall_year >= YEAR(curdate())`;

    let [rows] = await ExecuteQuery(
        query,
        [site, site, site]
    );
    return rows;
}

export const GetActiveSemesters = async (site) => {
    const query = `SELECT DISTINCT CONCAT('Summer ', l.summer_year) AS semester, CONCAT(l.summer_year, '-2') AS ord
                   FROM lease l
                            JOIN user_lease_tenant ult ON ult.lease_id = l.id AND ult.summer_year = l.summer_year AND
                                                          ult.apartment_number IS NOT null
                            JOIN application a on a.lease_id = ult.lease_id AND a.user_id = ult.user_id
                   WHERE l.site = ?
                     AND l.summer_year >= YEAR(curdate())
                   UNION
                   SELECT DISTINCT CONCAT('Spring ', l.spring_year) AS semester, CONCAT(l.spring_year, '-1') AS ord
                   FROM lease l
                            JOIN user_lease_tenant ult ON ult.lease_id = l.id AND ult.spring_year = l.spring_year AND
                                                          ult.apartment_number IS NOT null
                            JOIN application a on a.lease_id = ult.lease_id AND a.user_id = ult.user_id
                   WHERE l.site = ?
                     AND l.spring_year >= YEAR(curdate())
                   UNION
                   SELECT DISTINCT CONCAT('Fall ', l.fall_year) AS semester, CONCAT(l.fall_year, '-3') AS ord
                   FROM lease l
                            JOIN user_lease_tenant ult ON ult.lease_id = l.id AND ult.fall_year = l.fall_year AND
                                                          ult.apartment_number IS NOT null
                            JOIN application a on a.lease_id = ult.lease_id AND a.user_id = ult.user_id
                   WHERE l.site = ?
                     AND l.fall_year >= (YEAR(curdate()) - 1)
                   ORDER BY ord`;

    let [rows] = await ExecuteQuery(
        query,
        [site, site, site]
    );
    return rows;
};

export const GetActiveSemesterApartments = async (site) => {
    const query = `SELECT DISTINCT CONCAT('Summer ', l.summer_year) AS semester, ult.apartment_number
                   FROM lease l
                            JOIN user_lease_tenant ult ON ult.lease_id = l.id AND ult.summer_year = l.summer_year AND
                                                          ult.apartment_number IS NOT null
                            JOIN application a on a.lease_id = ult.lease_id AND a.user_id = ult.user_id
                   WHERE l.site = ?
                     AND l.summer_year >= YEAR(curdate())
                   UNION
                   SELECT DISTINCT CONCAT('Spring ', l.spring_year) AS semester, ult.apartment_number
                   FROM lease l
                            JOIN user_lease_tenant ult ON ult.lease_id = l.id AND ult.spring_year = l.spring_year AND
                                                          ult.apartment_number IS NOT null
                            JOIN application a on a.lease_id = ult.lease_id AND a.user_id = ult.user_id
                   WHERE l.site = ?
                     AND l.spring_year >= YEAR(curdate())
                   UNION
                   SELECT DISTINCT CONCAT('Fall ', l.fall_year) AS semester, ult.apartment_number
                   FROM lease l
                            JOIN user_lease_tenant ult ON ult.lease_id = l.id AND ult.fall_year = l.fall_year AND
                                                          ult.apartment_number IS NOT null
                            JOIN application a on a.lease_id = ult.lease_id AND a.user_id = ult.user_id
                   WHERE l.site = ?
                     AND l.fall_year >= YEAR(curdate())
                   ORDER BY apartment_number`;

    let [rows] = await ExecuteQuery(
        query,
        [site, site, site]
    );
    return rows;
};