import {ExecuteQuery} from "../pool";

export const GetUserLease = async (userId, leaseDefinitionId) => {

    let [rows] = await ExecuteQuery("SELECT l.id, l.lease_id, l.user_id, l.room_options_id, DATE_FORMAT(l.lease_date, '%M %d, %Y') AS lease_date, l.signature, l.lease_discount, l.vehicle_color, l.vehicle_make_model, l.vehicle_license, l.vehicle_state, l.vehicle_owner, l.lease_address, l.lease_home_phone, l.lease_cell_phone, l.lease_email, l.lease_parent_name, l.lease_parent_phone, CONCAT(t.first_name, ' ', t.last_name) AS name, a.room_type_id FROM user_lease l JOIN tenant t on l.user_id = t.user_id JOIN application a on l.lease_id = a.lease_id WHERE l.user_id = ? AND l.lease_id = ?", [userId, leaseDefinitionId]);
    //we should only have one
    if (rows && rows.length === 1) return rows[0];
    return null;
}

export const GetUserLeases = async (leaseId, submitted) => {
    let [rows] = await ExecuteQuery("SELECT l.id, l.lease_id, l.user_id, l.room_options_id, DATE_FORMAT(l.lease_date, '%M %d, %Y') AS lease_date, l.signature, DATE_FORMAT(l.signed_date, '%M %d, %Y') AS signature_date, l.lease_discount, l.vehicle_color, l.vehicle_make_model, l.vehicle_license, l.vehicle_state, l.vehicle_owner, l.lease_address, l.lease_home_phone, l.lease_cell_phone, l.lease_email, l.lease_parent_name, l.lease_parent_phone, CONCAT(t.first_name, ' ', t.last_name) AS name, a.room_type_id FROM user_lease l JOIN user_lease_tenant t on l.user_id = t.user_id AND l.lease_id = t.lease_id JOIN application a on l.lease_id = a.lease_id and l.user_id = a.user_id WHERE l.lease_id = ? ",
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
        resp = await ExecuteQuery("UPDATE user_lease SET  signature=?, lease_discount=?, vehicle_color=?, vehicle_make_model=?, vehicle_license=?, vehicle_state=?, vehicle_owner=?, lease_address=?, lease_home_phone=?, lease_cell_phone=?, lease_email=?, lease_parent_name=?, lease_parent_phone=? WHERE lease_id=? AND user_id=?",
            [
                data.signature,
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