import Connection from "../connection";

export const GetLeaseInfo = async (userId, leaseDefinitionId) => {
    const conn = await Connection();
    let [rows] = await conn.execute("SELECT * FROM lease WHERE user_id = ? and lease_id = ?", [userId, leaseDefinitionId]);
    //we should only have one
    if (rows && rows.length === 1) return rows[0];
    conn.release();
    return null;
}

export const AddLeaseInfo = async (userId, leaseDefinitionId, data) => {
    const conn = await Connection();
    try {
        await conn.execute("INSERT INTO lease (lease_definition_id, user_id, room_options_id, lease_date, signature, lease_discount, vehicle_color, vehicle_make_model, vehicle_license, vehicle_state, vehicle_owner, lease_address, lease_home_phone, lease_cell_phone, lease_email, lease_parent_name, lease_parent_phone) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [
                leaseDefinitionId,
                userId,
                data.room_options_id,
                data.lease_date,
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
                data.lease_parent_phone
            ]);
    } catch (e) {
        console.log(e);
    }
    conn.release();
}