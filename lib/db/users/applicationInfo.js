import Connection from "../connection";

export const GetApplicationInfo = async (id) => {
    const conn = await Connection();
    let [rows] = await conn.execute("SELECT * FROM application WHERE student_id = ?", [id]);
    //we should only have one
    if (rows && rows.length === 1) return rows[0];
    conn.release();
    return null;
}

export const AddApplicationInfo = async (id, data) => {
    const conn = await Connection();
    try {
        await conn.execute("REPLACE INTO application (student_id, clean_work, maint_work, maint_experience) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [
                id,
                data.clean_work,
                data.maint_work,
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
                data.convicted_explain,
                data.charged_crime,
                data.charged_explain,
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