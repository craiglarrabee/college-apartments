import {ExecuteQuery} from "../pool";

export const GetApplications = async (site, leaseId, processed) => {
    const [rows] = await ExecuteQuery("SELECT t.user_id, CONCAT(t.first_name, ' ', t.last_name) as name, DATE_FORMAT(a.submit_date, '%M %d, %Y %H:%:%S') AS submit_date FROM application a INNER JOIN tenant t ON a.user_id = t.user_id WHERE a.site = ? AND a.lease_id = ? AND a.processed = ?", [site, leaseId, processed ? 1 : 0]);
    return rows;
}

export const GetApplicationInfo = async (site, userId, leaseId) => {

    let [rows] = await ExecuteQuery("SELECT * FROM application WHERE site = ? AND user_id = ? AND lease_id = ?", [site, userId, leaseId]);
    //we should only have one
    if (rows && rows.length === 1) return rows[0];
    return null;
}

export const GetPendingApplicationInfo = async (userId) => {

    let [rows] = await ExecuteQuery("SELECT * FROM application WHERE user_id = ? AND processed = false", [userId]);
    //we should only have one
    if (rows && rows.length === 1) return rows[0];
    return null;
}

export const ProcessApplicationInfo = async (site, userId, leaseId, data) => {

    try {
        await ExecuteQuery("UPDATE application SET processed = ? WHERE site=? AND user_id=? AND lease_id=?",
            [
                data.processed,
                site,
                userId,
                leaseId,
            ]);
    } catch (e) {
        console.log(e);
    }
}

export const AddApplicationInfo = async (site, userId, leaseId, data) => {

    try {
        await ExecuteQuery("REPLACE INTO application(site, user_id, lease_id, room_type_id, roomate, roomate2, roomate3, roomate4, roomate5, roomate_desc, likes_dislikes, referred_by, installments, share_info, maint_work, maint_experience, clean_work) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
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
                data.maint_work === "1" ? data.maint_experience : null,
                data.clean_work ? data.clean_work : 0
            ]);
    } catch (e) {
        console.log(e);
    }
}