import Connection from "../connection";

export const GetTenantInfo = async (id) => {
    const conn = await Connection();
    let [rows] = await conn.execute("SELECT t.*, a.lease_id AS pending_application FROM tenant t LEFT JOIN application a ON a.user_id = t.user_id AND a.processed = false WHERE t.user_id = ?", [id]);
    //we should only have one
    if (rows && rows.length === 1) return rows[0];
    conn.release();
    return null;
}

export const AddTenantInfo = async (id, data) => {
    const conn = await Connection();
    try {
        await conn.execute("REPLACE INTO tenant (user_id, last_name, first_name, middle_name, gender, date_of_birth, last_4_social, cell_phone, cell_phone2, home_phone, email, email2, convicted_crime, convicted_explain, charged_crime, charged_explain, street, city, state, zip, parent_name, parent_street, parent_city, parent_state, parent_zip, parent_phone) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
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
    conn.release();
}