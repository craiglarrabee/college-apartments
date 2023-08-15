import {ExecuteQuery} from "../pool";


export const SearchTenantByName = async (site, searchStr) => {
    const query = `
        SELECT DISTINCT t.user_id, CONCAT(t.first_name, ' ', t.last_name) name
        FROM user_lease_tenant t
                 INNER JOIN application a on t.user_id = a.user_id
        WHERE a.site = ?
          AND MATCH(t.first_name, t.middle_name, t.last_name) AGAINST(?)
        UNION
        SELECT DISTINCT t.user_id, CONCAT(t.first_name, ' ', t.last_name) name
        FROM tenant t
                 INNER JOIN application a on t.user_id = a.user_id
        WHERE a.site = ?
          AND MATCH(t.first_name, t.middle_name, t.last_name) AGAINST(?)
    `;
    let [rows] = await ExecuteQuery(query, [
        site,
        searchStr,
        site,
        searchStr
    ]);
    return rows;
}
export const GetTenant = async (id) => {

    let [rows] = await ExecuteQuery(`
        SELECT t.last_name,
               t.first_name,
               t.middle_name,
               t.gender,
               DATE_FORMAT(t.date_of_birth, '%Y-%m-%d') as date_of_birth,
               t.last_4_social,
               t.cell_phone,
               t.cell_phone2,
               t.home_phone,
               t.email,
               t.email2,
               t.convicted_crime,
               t.convicted_explain,
               t.charged_crime,
               t.charged_explain,
               t.street,
               t.city,
               t.state,
               t.zip,
               t.parent_name,
               t.parent_street,
               t.parent_city,
               t.parent_state,
               t.parent_zip,
               t.parent_phone,
               t.user_id,
               CONCAT(t.last_name, ', ', t.first_name)   as name,
               a.lease_id                               AS pending_application
        FROM tenant t
                 LEFT JOIN application a ON a.user_id = t.user_id AND a.processed = false
        WHERE t.user_id = ?`, [id]);
    //we should only have one
    if (rows && rows.length === 1) return rows[0];
    return null;
};

export const GetUserLeaseTenantsByIdsAndSemester = async (site, semester, userIds) => {
    const idParams = userIds.length === 1 ? "?" : userIds.reduce((prev, curr, idx) => idx === 1 ? "?, ?" : prev + ", ?");
    let [rows] = await ExecuteQuery(`SELECT id,
                                            last_name,
                                            first_name,
                                            middle_name,
                                            gender,
                                            DATE_FORMAT(date_of_birth, '%M %d, %Y') AS date_of_birth,
                                            last_4_social,
                                            cell_phone,
                                            cell_phone2,
                                            home_phone,
                                            email,
                                            email2,
                                            convicted_crime,
                                            convicted_explain,
                                            charged_crime,
                                            charged_explain,
                                            street,
                                            city,
                                            state,
                                            zip,
                                            parent_name,
                                            parent_street,
                                            parent_city,
                                            parent_state,
                                            parent_zip,
                                            parent_phone,
                                            user_id,
                                            lease_id,
                                            apartment_number,
                                            semester
                                     FROM user_lease_tenant
                                     WHERE user_id IN (${idParams})
                                       AND semester = ? `,
        [
            ...userIds,
            semester
        ]
    );
    return rows;
};


export const GetUserLeaseTenantsByApartments = async (site, semester, apartments) => {
    const apartmentParams = apartments.length === 1 ? "?" : apartments.reduce((prev, curr, idx) => idx === 1 ? "?, ?" : prev + ", ?");

    const query = `SELECT t.id,
                          t.last_name,
                          t.first_name,
                          t.middle_name,
                          t.gender,
                          DATE_FORMAT(t.date_of_birth, '%M %d, %Y') AS date_of_birth,
                          t.last_4_social,
                          t.cell_phone,
                          t.cell_phone2,
                          t.home_phone,
                          t.email,
                          t.email2,
                          t.convicted_crime,
                          t.convicted_explain,
                          t.charged_crime,
                          t.charged_explain,
                          t.street,
                          t.city,
                          t.state,
                          t.zip,
                          t.parent_name,
                          t.parent_street,
                          t.parent_city,
                          t.parent_state,
                          t.parent_zip,
                          t.parent_phone,
                          t.user_id,
                          t.lease_id,
                          a.room_type_id,
                          rt.base_type_id,
                          rt.room_type,
                          rt.room_desc,
                          IF(rt.room_type = 'Suite', 2, 1)          AS spots,
                          t.apartment_number,
                          DATE_FORMAT(a.submit_date, '%M %d, %Y')   AS submit_date,
                          a.school_year,
                          a.alternate_room_info,
                          a.roomate,
                          a.roomate2,
                          a.roomate3,
                          a.roomate4,
                          a.roomate5,
                          a.roomate_desc
                   FROM application a
                            INNER JOIN user_lease_tenant t ON a.user_id = t.user_id AND a.lease_id = t.lease_id
                            INNER JOIN room_type rt on a.site = rt.site AND a.room_type_id = rt.id
                   WHERE a.processed = 1
                     AND a.deposit_date IS NOT NULL
                     AND a.site = ?
                     AND t.apartment_number IN (${apartmentParams})
                     AND t.semester = ?
                   ORDER BY a.submit_date  `;

    try {
        let [rows] = await ExecuteQuery(
            query,
            [
                site,
                ...apartments,
                semester
            ]);
        return rows;
    } catch (e) {
        console.log(e);
    }
};

export const GetUserLeaseTenants = async (site, semester) => {
    const query = `
        SELECT DISTINCT t.id,
                        t.last_name,
                        t.first_name,
                        t.middle_name,
                        t.gender,
                        DATE_FORMAT(t.date_of_birth, '%M %d, %Y') AS date_of_birth,
                        t.last_4_social,
                        t.cell_phone,
                        t.cell_phone2,
                        t.home_phone,
                        t.email,
                        t.email2,
                        t.convicted_crime,
                        t.convicted_explain,
                        t.charged_crime,
                        t.charged_explain,
                        t.street,
                        t.city,
                        t.state,
                        t.zip,
                        t.parent_name,
                        t.parent_street,
                        t.parent_city,
                        t.parent_state,
                        t.parent_zip,
                        t.parent_phone,
                        t.user_id,
                        t.lease_id,
                        a.room_type_id,
                        rt.base_type_id,
                        rt.room_type,
                        rt.room_desc,
                        IF(rt.room_type = 'Suite', 2, 1)          AS spots,
                        t.apartment_number,
                        DATE_FORMAT(a.submit_date, '%M %d, %Y')   AS submit_date,
                        a.school_year,
                        a.alternate_room_info,
                        a.roomate,
                        a.roomate2,
                        a.roomate3,
                        a.roomate4,
                        a.roomate5,
                        a.roomate_desc
        FROM application a
                 INNER JOIN user_lease_tenant t
                            ON a.user_id = t.user_id AND a.lease_id = t.lease_id AND t.semester = ?
                 INNER JOIN room_type rt on a.site = rt.site AND a.room_type_id = rt.id
        WHERE a.processed = 1
          AND a.deposit_date IS NOT NULL
          AND a.site = ?
        ORDER BY a.submit_date`;

    try {
        let [rows] = await ExecuteQuery(
            query,
            [
                semester,
                site
            ]);
        return rows;
    } catch (e) {
        console.log(e);
    }
};

export const GetPreviousLeaseTenants = async (site, currentSemester) => {
    const query = `
        SELECT DISTINCT ult.id,
                        ult.last_name,
                        ult.first_name,
                        ult.middle_name,
                        ult.gender,
                        DATE_FORMAT(ult.date_of_birth, '%M %d, %Y') AS date_of_birth,
                        ult.last_4_social,
                        ult.cell_phone,
                        ult.cell_phone2,
                        ult.home_phone,
                        ult.email,
                        ult.email2,
                        ult.convicted_crime,
                        ult.convicted_explain,
                        ult.charged_crime,
                        ult.charged_explain,
                        ult.street,
                        ult.city,
                        ult.state,
                        ult.zip,
                        ult.parent_name,
                        ult.parent_street,
                        ult.parent_city,
                        ult.parent_state,
                        ult.parent_zip,
                        ult.parent_phone,
                        ult.user_id,
                        ult.lease_id
        FROM application a
                 INNER JOIN user_lease_tenant ult
                            ON a.user_id = ult.user_id AND a.lease_id = ult.lease_id
                                AND ult.semester <> ? AND ult.apartment_number IS NOT NULL
        WHERE a.processed = 1
          AND a.deposit_date IS NOT NULL
          AND a.site = ?
          AND NOT EXISTS(SELECT * FROM user_lease_tenant WHERE user_id = ult.user_id AND semester <> ult.semester)
        ORDER BY a.submit_date`;

    try {
        let [rows] = await ExecuteQuery(
            query,
            [
                currentSemester,
                site
            ]);
        return rows;
    } catch (e) {
        console.log(e);
    }
};

export const GetUserLeaseTenantsByGender = async (site, semester, gender) => {
    const query = `SELECT t.id,
                          t.last_name,
                          t.first_name,
                          t.middle_name,
                          t.gender,
                          DATE_FORMAT(t.date_of_birth, '%M %d, %Y') AS date_of_birth,
                          t.last_4_social,
                          t.cell_phone,
                          t.cell_phone2,
                          t.home_phone,
                          t.email,
                          t.email2,
                          t.convicted_crime,
                          t.convicted_explain,
                          t.charged_crime,
                          t.charged_explain,
                          t.street,
                          t.city,
                          t.state,
                          t.zip,
                          t.parent_name,
                          t.parent_street,
                          t.parent_city,
                          t.parent_state,
                          t.parent_zip,
                          t.parent_phone,
                          t.user_id,
                          t.lease_id,
                          a.room_type_id,
                          rt.base_type_id,
                          rt.room_type,
                          rt.room_desc,
                          IF(rt.room_type = 'Suite', 2, 1)          AS spots,
                          t.apartment_number,
                          DATE_FORMAT(a.submit_date, '%M %d, %Y')   AS submit_date,
                          a.school_year,
                          a.alternate_room_info,
                          a.roomate,
                          a.roomate2,
                          a.roomate3,
                          a.roomate4,
                          a.roomate5,
                          a.roomate_desc
                   FROM application a
                            INNER JOIN user_lease_tenant t
                                       ON a.user_id = t.user_id AND a.lease_id = t.lease_id AND t.semester = ?
                            INNER JOIN room_type rt on a.site = rt.site AND a.room_type_id = rt.id
                   WHERE a.processed = 1
                     AND a.deposit_date IS NOT NULL
                     AND a.site = ?
                     AND t.gender = ?
                   ORDER BY a.submit_date  `;

    try {
        let [rows] = await ExecuteQuery(
            query,
            [
                semester,
                site,
                gender
            ]);
        return rows;
    } catch (e) {
        console.log(e);
    }
};

export const GetUserLeaseTenant = async (userId, leaseId) => {

    const query = `
        SELECT a.lease_id                                              AS pending_application,
               ult.user_id,
               ult.date_of_birth,
               a.room_type_id,
               CONCAT(ult.last_name, ', ', ult.first_name)              AS name,
               a.room_type_id,
               l.semester1,
               l.semester2,
               SUM(IF(ult.semester = l.semester1, ult.selected, null)) AS semester1_selected,
               SUM(IF(ult.semester = l.semester2, ult.selected, null)) AS semester2_selected
        FROM application a
                 JOIN user_lease_tenant ult on ult.user_id = a.user_id
                 JOIN lease l ON l.id = a.lease_id
        WHERE a.user_id = ?
          and a.lease_id = ?
        GROUP BY a.lease_id, ult.user_id, ult.date_of_birth, a.room_type_id,
                 ult.first_name, ult.last_name, a.room_type_id, l.semester1, l.semester2
    `;
    let [rows] = await ExecuteQuery(query,
        [
            userId,
            leaseId
        ]);
    //we should only have one
    if (rows && rows.length === 1) return rows[0];
    return null;
};
export const GetUserRoomates = async (userId, semester) => {
    const [rows] = await ExecuteQuery(`
                SELECT CONCAT(t.last_name, ', ', t.first_name)                     AS name,
                       t.apartment_number,
                       CASE WHEN a.share_info = 1 THEN t.email ELSE NULL END      AS email,
                       CASE WHEN a.share_info = 1 THEN t.cell_phone ELSE NULL END AS cell_phone,
                       CASE WHEN a.share_info = 1 THEN t.home_phone ELSE NULL END AS home_phone
                FROM user_lease_tenant t
                         INNER JOIN application a on t.lease_id = a.lease_id AND t.user_id = a.user_id
                WHERE t.apartment_number
                          IN (SELECT apartment_number
                              FROM user_lease_tenant
                              WHERE user_id = ?
                                AND t.semester = ?)  `,
        [
            userId,
            semester
        ]);
    return rows;
};

export const SetApartmentNumber = async (userId, leaseId, apartmentNumber) => {
    try {
        await ExecuteQuery("UPDATE user_lease_tenant SET apartment_number = ? WHERE user_id = ? AND lease_id = ?",
            [
                ["unassigned_type", "unassigned_others"].includes(apartmentNumber) ? null : apartmentNumber,
                userId,
                leaseId,
            ]);
    } catch (e) {
        console.log(e);
    }
};

export const SetTenantSemester = async (userId, leaseId, semester) => {
    try {
        await ExecuteQuery(`
                    UPDATE user_lease_tenant
                    SET selected = ?
                    WHERE user_id = ?
                      AND lease_id = ?
                      AND semester = ?`,
            [
                semester.selected,
                userId,
                leaseId,
                semester.value
            ]);
    } catch (e) {
        console.log(e);
    }
};

export const RemoveApartmentNumbers = async (leaseId) => {
    try {
        await ExecuteQuery("UPDATE user_lease_tenant SET apartment_number = NULL WHERE lease_id = ?",
            [
                leaseId,
            ]);
    } catch (e) {
        console.log(e);
    }
};

export const AddTenant = async (id, data) => {

    try {
        await ExecuteQuery("REPLACE INTO tenant (user_id, last_name, first_name, middle_name, gender, date_of_birth, last_4_social, cell_phone, cell_phone2, home_phone, email, email2, convicted_crime, convicted_explain, charged_crime, charged_explain, street, city, state, zip, parent_name, parent_street, parent_city, parent_state, parent_zip, parent_phone) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [
                id,
                data.last_name,
                data.first_name,
                data.middle_name,
                data.gender,
                data.date_of_birth,
                data.last_4_social,
                data.cell_phone,
                data.cell_phone2,
                data.home_phone,
                data.email,
                data.email2,
                data.convicted_crime,
                data.convicted_crime === "1" ? data.convicted_explain : null,
                data.charged_crime,
                data.charged_crime === "1" ? data.charged_explain : null,
                data.street,
                data.city,
                data.state,
                data.zip,
                data.parent_name,
                data.parent_street,
                data.parent_city,
                data.parent_state,
                data.parent_zip,
                data.parent_phone
            ]);
    } catch (e) {
        console.log(e);
    }
};

export const CopyTenantForUserLease = async (userId, leaseId) => {
    try {
        const [rows] = ExecuteQuery(`
            SELECT semester1 AS semester
            FROM lease
            WHERE id = ?
            UNION
            SELECT semester2 AS semester
            FROM lease
            WHERE id = ?
        `, [leaseId, leaseId]);

        await Promise.all(rows.forEach(semester => {
            ExecuteQuery(`
                        REPLACE INTO user_lease_tenant (last_name, first_name, middle_name, gender, date_of_birth,
                                                        last_4_social,
                                                        cell_phone, cell_phone2, home_phone, email, email2, convicted_crime,
                                                        convicted_explain, charged_crime, charged_explain, street, city, state,
                                                        zip,
                                                        parent_name, parent_street, parent_city, parent_state, parent_zip,
                                                        parent_phone, user_id, lease_id, semester, selected)
                        SELECT last_name,
                               first_name,
                               middle_name,
                               gender,
                               date_of_birth,
                               last_4_social,
                               cell_phone,
                               cell_phone2,
                               home_phone,
                               email,
                               email2,
                               convicted_crime,
                               convicted_explain,
                               charged_crime,
                               charged_explain,
                               street,
                               city,
                               state,
                               zip,
                               parent_name,
                               parent_street,
                               parent_city,
                               parent_state,
                               parent_zip,
                               parent_phone,
                               user_id,
                               l.id,
                               ? AS semester,
                               IF(? IS NULL, 0, 1)
                        FROM tenant t
                                 INNER JOIN lease l ON l.id = ?
                        WHERE t.user_id = ?`,
                [
                    semester,
                    semester,
                    leaseId,
                    userId
                ]);
        }));
    } catch (e) {
        console.log(e);
    }
};

export const DeleteUserLeaseTenant = async (userId, leaseId) => {

    let [rows] = await ExecuteQuery("DELETE FROM user_lease_tenant WHERE user_id = ? AND lease_id = ?", [userId, leaseId]);
    return rows;
};

