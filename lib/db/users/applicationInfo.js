import Connection from "../connection";

export const GetApplicationInfo = async (id) => {
    const conn = await Connection();
    let [rows] = await conn.execute("SELECT * FROM application WHERE user_id = ?", [id]);
    //we should only have one
    if (rows && rows.length === 1) return rows[0];
    conn.release();
    return null;
}

export const ProcessApplicationInfo = async (site, userId, leaseId) => {
    const conn = await Connection();
    try {
        await conn.execute("UPDATE application SET processed = NOW() WHERE site=? AND user_id=? AND lease_id=?",
            [
                site,
                userId,
                leaseId,
            ]);
    } catch (e) {
        console.log(e);
    }
    conn.release();
}

export const AddApplicationInfo = async (site, userId, leaseId, data) => {
    const conn = await Connection();
    try {
        await conn.execute("REPLACE INTO application(site, user_id, lease_id, room_type_id, roomate, roomate2, roomate3, roomate4, roomate5, roomate_desc, likes_dislikes, referred_by, installments, share_info, maint_work, maint_experience, clean_work) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [
                site,
                userId,
                leaseId,
                data.room_type_id,
                data.roomate ? data.roomate : null,
                data.roomate2 ? data.roomate2 : null,
                data.roomate3 ? data.roomate3 : null,
                data.roomate4 ? data.roomate4 : null,
                data.roomate5 ? data.roomate5 : null,
                data.roomate_desc ? data.roomate_desc : null,
                data.likes_dislikes ? data.likes_dislikes : null,
                data.referred_by ? data.referred_by : null,
                data.installments ? data.installments : 0,
                data.share_info ? data.share_info : 1,
                data.maint_work ? data.maint_work : 0,
                data.maint_experience ? data.maint_experience : null,
                data.clean_work ? data.clean_work : 0
            ]);
    } catch (e) {
        console.log(e);
    }
    conn.release();
}