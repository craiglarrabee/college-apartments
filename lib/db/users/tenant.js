import {ExecuteQuery} from "../pool";

export const GetTenant = async (id) => {

    let [rows] = await ExecuteQuery("SELECT t.*, CONCAT(t.first_name, ' ', t.last_name) as name, a.lease_id AS pending_application FROM tenant t LEFT JOIN application a ON a.user_id = t.user_id AND a.processed = false WHERE t.user_id = ?", [id]);
    //we should only have one
    if (rows && rows.length === 1) return rows[0];
    return null;
};

export const GetUserLeaseTenantsByIdsAndSemester = async (site, year, semester, userIds) => {
    const idParams = userIds.length === 1 ? "?" : userIds.reduce((prev, curr, idx) => idx === 1 ? "?, ?" : prev + ", ?");
    let semesterFilter;
    switch (semester.toLowerCase()) {
        case "spring":
            semesterFilter = "spring_year ";
            break;
        case "summer":
            semesterFilter = "summer_year ";
            break;
        case "fall":
            semesterFilter = "fall_year ";
            break;
        default:
            return [];
    }
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
                                            fall_year,
                                            spring_year,
                                            summer_year
                                     FROM user_lease_tenant
                                     WHERE user_id IN (${idParams})
                                       AND ${semesterFilter} = ? `,
        [
            ...userIds,
            year
        ]
    );
    return rows;
};


export const GetUserLeaseTenantsByApartments = async (site, year, semester, apartments) => {
    const apartmentParams = apartments.length === 1 ? "?" : apartments.reduce((prev, curr, idx) => idx === 1 ? "?, ?" : prev + ", ?");

    let semesterFilter;
    switch (semester.toLowerCase()) {
        case "spring":
            semesterFilter = "spring_year ";
            break;
        case "summer":
            semesterFilter = "summer_year ";
            break;
        case "fall":
            semesterFilter = "fall_year ";
            break;
        default:
            return [];
    }
    const query = `SELECT t.id, t.last_name, t.first_name, t.middle_name, t.gender, DATE_FORMAT(t.date_of_birth, '%M %d, %Y') AS date_of_birth,\n
               t.last_4_social, t.cell_phone, t.cell_phone2, t.home_phone, t.email, t.email2, t.convicted_crime, t.convicted_explain,\n
               t.charged_crime, t.charged_explain, t.street, t.city, t.state, t.zip, t.parent_name, t.parent_street, t.parent_city,\n
               t.parent_state, t.parent_zip, t.parent_phone, t.user_id, t.lease_id, a.room_type_id, rt.base_type_id, rt.room_type,\n
               rt.room_desc , IF(rt.room_type = 'Suite', 2, 1) AS spots, t.apartment_number,  DATE_FORMAT(a.submit_date, '%M %d, %Y') AS submit_date,\n
               a.school_year, a.alternate_room_info, a.roomate, a.roomate2, a.roomate3, a.roomate4, a.roomate5, a.roomate_desc\n
        FROM application a\n
            INNER JOIN user_lease_tenant t ON a.user_id = t.user_id AND a.lease_id = t.lease_id 
            INNER JOIN room_type rt on a.site = rt.site AND a.room_type_id = rt.id\n
        WHERE a.processed = 1 AND a.deposit_date IS NOT NULL AND a.site = ? AND t.apartment_number IN (${apartmentParams}) AND ${semesterFilter} = ?
        ORDER BY a.submit_date\n`;

    try {
        let [rows] = await ExecuteQuery(
            query,
            [
                site,
                ...apartments,
                year
            ]);
        return rows;
    } catch (e) {
        console.log(e);
    }
};

export const GetUserLeaseTenants = async (site, year, semester) => {
    const query = `SELECT t.id, t.last_name, t.first_name, t.middle_name, t.gender, DATE_FORMAT(t.date_of_birth, '%M %d, %Y') AS date_of_birth,\n
               t.last_4_social, t.cell_phone, t.cell_phone2, t.home_phone, t.email, t.email2, t.convicted_crime, t.convicted_explain,\n
               t.charged_crime, t.charged_explain, t.street, t.city, t.state, t.zip, t.parent_name, t.parent_street, t.parent_city,\n
               t.parent_state, t.parent_zip, t.parent_phone, t.user_id, t.lease_id, a.room_type_id, rt.base_type_id, rt.room_type,\n
               rt.room_desc , IF(rt.room_type = 'Suite', 2, 1) AS spots, t.apartment_number,  DATE_FORMAT(a.submit_date, '%M %d, %Y') AS submit_date,\n
               a.school_year, a.alternate_room_info, a.roomate, a.roomate2, a.roomate3, a.roomate4, a.roomate5, a.roomate_desc\n
        FROM application a\n
            INNER JOIN user_lease_tenant t ON a.user_id = t.user_id AND a.lease_id = t.lease_id AND CASE ? WHEN 'fall' THEN t.fall_year WHEN 'spring' THEN t.spring_year WHEN 'summer' THEN t.summer_year END = ?\n
            INNER JOIN room_type rt on a.site = rt.site AND a.room_type_id = rt.id\n
        WHERE a.processed = 1 AND a.deposit_date IS NOT NULL AND a.site = ?\n
        ORDER BY a.submit_date\n`;

    try {
        let [rows] = await ExecuteQuery(
            query,
            [
                semester,
                year,
                site
            ]);
        return rows;
    } catch (e) {
        console.log(e);
    }
};

export const GetUserLeaseTenantsByGender = async (site, year, semester, gender) => {
    const query = `SELECT t.id, t.last_name, t.first_name, t.middle_name, t.gender, DATE_FORMAT(t.date_of_birth, '%M %d, %Y') AS date_of_birth,\n
               t.last_4_social, t.cell_phone, t.cell_phone2, t.home_phone, t.email, t.email2, t.convicted_crime, t.convicted_explain,\n
               t.charged_crime, t.charged_explain, t.street, t.city, t.state, t.zip, t.parent_name, t.parent_street, t.parent_city,\n
               t.parent_state, t.parent_zip, t.parent_phone, t.user_id, t.lease_id, a.room_type_id, rt.base_type_id, rt.room_type,\n
               rt.room_desc , IF(rt.room_type = 'Suite', 2, 1) AS spots, t.apartment_number,  DATE_FORMAT(a.submit_date, '%M %d, %Y') AS submit_date,\n
               a.school_year, a.alternate_room_info, a.roomate, a.roomate2, a.roomate3, a.roomate4, a.roomate5, a.roomate_desc\n
        FROM application a\n
            INNER JOIN user_lease_tenant t ON a.user_id = t.user_id AND a.lease_id = t.lease_id AND CASE ? WHEN 'fall' THEN t.fall_year WHEN 'spring' THEN t.spring_year WHEN 'summer' THEN t.summer_year END = ?\n
            INNER JOIN room_type rt on a.site = rt.site AND a.room_type_id = rt.id\n
        WHERE a.processed = 1 AND a.deposit_date IS NOT NULL AND a.site = ? AND t.gender = ?\n
        ORDER BY a.submit_date\n`;

    try {
        let [rows] = await ExecuteQuery(
            query,
            [
                semester,
                year,
                site,
                gender
            ]);
        return rows;
    } catch (e) {
        console.log(e);
    }
};

export const GetUserLeaseTenant = async (userId, leaseId) => {

    let [rows] = await ExecuteQuery("SELECT t.*, CONCAT(t.first_name, ' ', t.last_name) as name, a.lease_id AS pending_application FROM user_lease_tenant t INNER JOIN application a ON a.user_id = t.user_id AND a.lease_id = t.lease_id WHERE t.user_id = ? AND t.lease_id = ?",
        [
            userId,
            leaseId
        ]);
    //we should only have one
    if (rows && rows.length === 1) return rows[0];
    return null;
};
export const GetUserRoomates = async (userId, year, semester) => {
    const [rows] = await ExecuteQuery(`SELECT CONCAT(t.first_name, ' ', t.last_name) AS name, t.apartment_number,\n
               CASE WHEN a.share_info = 1 THEN t.email ELSE NULL END AS email,\n
               CASE WHEN a.share_info = 1 THEN t.cell_phone ELSE NULL END AS cell_phone,\n
               CASE WHEN a.share_info = 1 THEN t.home_phone ELSE NULL END AS home_phone\n
        FROM user_lease_tenant t INNER JOIN application a on t.lease_id = a.lease_id AND t.user_id = a.user_id\n
        WHERE t.apartment_number\n
                  IN (SELECT apartment_number FROM user_lease_tenant WHERE user_id = ? AND CASE ? WHEN 'fall' THEN t.fall_year WHEN 'spring' THEN t.spring_year WHEN 'summer' THEN t.summer_year END = ? )\n`,
        [
            userId,
            semester,
            year
        ]);
    return rows;
};

export const SetApartmentNumber = async (userId, leaseId, apartmentNumber) => {
    try {
        await ExecuteQuery("UPDATE user_lease_tenant SET apartment_number = ? WHERE user_id = ? AND lease_id = ?",
            [
                apartmentNumber !== "unassigned" ? apartmentNumber : null,
                userId,
                leaseId,
            ]);
    } catch (e) {
        console.log(e);
    }
};

export const SetTenantSemesters = async (userId, leaseId, fall_year, spring_year, summer_year) => {
    try {
        await ExecuteQuery("UPDATE user_lease_tenant SET fall_year = ?, spring_year = ?, summer_year = ? WHERE user_id = ? AND lease_id = ?",
            [
                fall_year,
                spring_year,
                summer_year,
                userId,
                leaseId,
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
        await ExecuteQuery("REPLACE INTO user_lease_tenant (last_name, first_name, middle_name, gender, date_of_birth, last_4_social, cell_phone, cell_phone2, home_phone, email, email2, convicted_crime, convicted_explain, charged_crime, charged_explain, street, city, state, zip, parent_name, parent_street, parent_city, parent_state, parent_zip, parent_phone, user_id, lease_id, fall_year, spring_year, summer_year) SELECT last_name, first_name, middle_name, gender, date_of_birth, last_4_social, cell_phone, cell_phone2, home_phone, email, email2, convicted_crime, convicted_explain, charged_crime, charged_explain, street, city, state, zip, parent_name, parent_street, parent_city, parent_state, parent_zip, parent_phone, user_id, l.id, l.fall_year, l.spring_year, l.summer_year  FROM tenant t INNER JOIN lease l ON l.id = ?  WHERE t.user_id = ?",
            [
                leaseId,
                userId
            ]);
    } catch (e) {
        console.log(e);
    }
};

export const DeleteUserLeaseTenant = async (userId, leaseId) => {

    let [rows] = await ExecuteQuery("DELETE FROM user_lease_tenant WHERE user_id = ? AND lease_id = ?", [userId, leaseId]);
    return rows;
};
