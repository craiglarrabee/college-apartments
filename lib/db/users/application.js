import {ExecuteQuery} from "../pool";

export const GetApplications = async (site, leaseId) => {
    const query = `
SELECT a.lease_id AS pending_application, ult.user_id, DATE_FORMAT(ult.date_of_birth, '%M %d, %Y') AS date_of_birth, a.room_type_id,
       DATE_FORMAT(a.submit_date, '%M %d, %Y') AS submit_date, DATE_FORMAT(a.deposit_date, '%M %d, %Y') AS deposit_date,
       a.processed, ult.apartment_number, DATE_FORMAT(ul.lease_date, '%M %d, %Y') AS lease_date,
       CONCAT(ult.last_name, ', ', ult.first_name) AS name, a.room_type_id, l.semester1, l.semester2, 
       SUM(IF(ult.semester = l.semester1, ult.selected, null)) AS semester1_selected,
       SUM(IF(ult.semester = l.semester2, ult.selected, null)) AS semester2_selected
FROM application a
    JOIN user_lease_tenant ult on ult.user_id = a.user_id 
    JOIN lease l ON l.id = a.lease_id
    LEFT JOIN user_lease ul ON ul.user_id = a.user_id AND ul.lease_id = a.lease_id
WHERE a.site = ?  and a.lease_id = ?
GROUP BY a.lease_id, ult.user_id, ult.date_of_birth, a.room_type_id, a.submit_date,
         a.deposit_date, a.processed, ult.apartment_number, ul.lease_date,
         ult.first_name, ult.last_name, a.room_type_id, l.semester1, l.semester2
       `;
    const [rows] = await ExecuteQuery(query,
        [
            site,
            leaseId
        ]);
    return rows;
}

export const GetApplication = async (site, userId, leaseId) => {

    let [rows] = await ExecuteQuery("SELECT site, user_id, lease_id, room_type_id, alternate_room_info, roomate, roomate2, roomate3, roomate4, roomate5, roomate_desc, likes_dislikes, referred_by, installments, school_year, previous_manager, DATE_FORMAT(submit_date, '%M %d, %Y') AS submit_date, DATE_FORMAT(deposit_date, '%M %d, %Y') AS deposit_date, processed, share_info, maint_work, maint_experience, clean_work, accepted FROM application WHERE site = ? AND user_id = ? AND lease_id = ?", [site, userId, leaseId]);
    //we should only have one
    if (rows && rows.length === 1) return rows[0];
    return null;
}

export const GetTenantApplications = async (userId) => {

    let [rows] = await ExecuteQuery(`SELECT a.site, a.user_id, a.lease_id, a.room_type_id, a.alternate_room_info, 
       a.roomate, a.roomate2, a.roomate3, a.roomate4, a.roomate5, a.roomate_desc, a.likes_dislikes, a.referred_by, 
       a.installments, a.school_year, a.previous_manager, DATE_FORMAT(a.submit_date, '%M %d, %Y') AS submit_date, 
       DATE_FORMAT(a.deposit_date, '%M %d, %Y') AS deposit_date, a.processed, a.share_info, a.maint_work, 
       a.maint_experience, a.clean_work, a.accepted, n.label
    FROM application a 
    INNER JOIN lease l on a.lease_id = l.id
    INNER JOIN site_nav n on n.page = CONCAT('leases/', l.id)
    WHERE user_id = ? 
       `, [userId]);
    return rows;
}

export const GetTenantPendingApplications = async (userId) => {

    let [rows] = await ExecuteQuery("SELECT * FROM application WHERE user_id = ? AND processed = false", [userId]);
    return rows;
}

export const DeleteApplication = async (userId, leaseId) => {

    let [rows] = await ExecuteQuery("DELETE FROM application WHERE user_id = ? AND lease_id = ?", [userId, leaseId]);
    return rows;
}

export const ProcessApplication = async (site, userId, leaseId, data) => {
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

export const ReceiveDeposit = async (site, userId, leaseId) => {
    try {
        await ExecuteQuery("UPDATE application SET deposit_date = NOW() WHERE site=? AND user_id=? AND lease_id=?",
            [
                site,
                userId,
                leaseId,
            ]);
        const [rows] = await ExecuteQuery("SELECT t.user_id, CONCAT(t.last_name, ', ', t.first_name) as name, DATE_FORMAT(a.submit_date, '%M %d, %Y') AS submit_date, DATE_FORMAT(a.deposit_date, '%M %d, %Y') AS deposit_date, processed FROM application a INNER JOIN tenant t ON a.user_id = t.user_id WHERE a.site = ? AND a.lease_id = ? and a.user_id = ?",
            [
                site,
                leaseId,
                userId
            ]);
        return rows[0];
    } catch (e) {
        console.log(e);
    }
}

export const AddApplication = async (site, userId, leaseId, data) => {

    try {
        await ExecuteQuery("REPLACE INTO application(site, user_id, lease_id, room_type_id, alternate_room_info, roomate, roomate2, roomate3, roomate4, roomate5, roomate_desc, likes_dislikes, referred_by, installments, school_year, previous_manager, share_info, maint_work, maint_experience, clean_work) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [
                site,
                userId,
                leaseId,
                data.room_type_id,
                data.alternate_room_info ? data.alternate_room_info : null,
                data.roomate ? data.roomate : null,
                data.roomate2 ? data.roomate2 : null,
                data.roomate3 ? data.roomate3 : null,
                data.roomate4 ? data.roomate4 : null,
                data.roomate5 ? data.roomate5 : null,
                data.roomate_desc ? data.roomate_desc : null,
                data.likes_dislikes ? data.likes_dislikes : null,
                data.referred_by ? data.referred_by : null,
                data.installments ? data.installments : 0,
                data.school_year ? data.school_year : null,
                data.previous_manager ? data.previous_manager : null,
                data.share_info ? data.share_info : 1,
                data.maint_work ? data.maint_work : 0,
                data.maint_work === "1" ? data.maint_experience : null,
                data.clean_work ? data.clean_work : 0
            ]);
    } catch (e) {
        console.log(e);
    }
}