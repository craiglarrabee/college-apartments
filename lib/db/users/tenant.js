import {ExecuteQuery} from "../pool";

export const GetTenant = async (id) => {

    let [rows] = await ExecuteQuery("SELECT t.*, a.lease_id AS pending_application FROM tenant t LEFT JOIN application a ON a.user_id = t.user_id AND a.processed = false WHERE t.user_id = ?", [id]);
    //we should only have one
    if (rows && rows.length === 1) return rows[0];
    return null;
};

export const GetUserLeaseTenant = async (userId, leaseId) => {

    let [rows] = await ExecuteQuery("SELECT t.*, a.lease_id AS pending_application FROM user_lease_tenant t INNER JOIN application a ON a.user_id = t.user_id AND a.lease_id = t.lease_id WHERE t.user_id = ? AND t.lease_id = ?",
        [
            userId,
            leaseId
        ]);
    //we should only have one
    if (rows && rows.length === 1) return rows[0];
    return null;
};

export const GetUserLeaseTenants = async (leaseId) => {

    let [rows] = await ExecuteQuery("SELECT t.id, t.last_name, t.first_name, t.middle_name, t.gender, DATE_FORMAT(t.date_of_birth, '%M %d, %Y') AS date_of_birth, t.last_4_social, t.cell_phone, t.cell_phone2, t.home_phone, t.email, t.email2, t.convicted_crime, t.convicted_explain, t.charged_crime, t.charged_explain, t.street, t.city, t.state, t.zip, t.parent_name, t.parent_street, t.parent_city, t.parent_state, t.parent_zip, t.parent_phone, t.user_id, t.lease_id, a.room_type_id, rt.base_type_id, rt.room_type, rt.room_desc , IF(rt.room_type = 'Suite', 2, 1) AS spots, t.apartment_number,  DATE_FORMAT(a.submit_date, '%M %d, %Y') AS submit_date, a.alternate_room_info, a.roomate, a.roomate2, a.roomate3, a.roomate4, a.roomate5, a.roomate_desc FROM user_lease_tenant t INNER JOIN application a ON a.user_id = t.user_id AND a.lease_id = t.lease_id INNER JOIN room_type rt on a.site = rt.site AND a.room_type_id = rt.id WHERE a.processed = 1 AND a.lease_id = ? ORDER BY a.submit_date",
        [
            leaseId
        ]);
    return rows;
};

export const GetUserLeaseTenantsByRoomType = async (roomTypeId, leaseId) => {

    let [rows] = await ExecuteQuery("SELECT t.*, a.lease_id, a.room_type_id FROM user_lease_tenant t INNER JOIN application a ON a.user_id = t.user_id AND a.lease_id = t.lease_id WHERE a.room_type_id = ? AND a.lease_id = ?",
        [
            roomTypeId,
            leaseId
        ]);
    //we should only have one
    if (rows && rows.length === 1) return rows[0];
    return null;
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
        await ExecuteQuery("REPLACE INTO user_lease_tenant (last_name, first_name, middle_name, gender, date_of_birth, last_4_social, cell_phone, cell_phone2, home_phone, email, email2, convicted_crime, convicted_explain, charged_crime, charged_explain, street, city, state, zip, parent_name, parent_street, parent_city, parent_state, parent_zip, parent_phone, user_id, lease_id) SELECT last_name, first_name, middle_name, gender, date_of_birth, last_4_social, cell_phone, cell_phone2, home_phone, email, email2, convicted_crime, convicted_explain, charged_crime, charged_explain, street, city, state, zip, parent_name, parent_street, parent_city, parent_state, parent_zip, parent_phone, user_id, ? FROM tenant WHERE user_id = ?",
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
