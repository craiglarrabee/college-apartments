import {BeginTransaction, CommitTransaction, ExecuteQuery, ExecuteTransaction} from "../pool";


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
        console.error(e);
    }
};

export const AddApplication = async (site, userId, leaseId, data) => {
    await ExecuteQuery(`
                REPLACE INTO application(site, user_id, lease_id, room_type_id, alternate_room_info, roomate, roomate2,
                                         roomate3, roomate4, roomate5, roomate_desc, likes_dislikes, referred_by,
                                         installments, school_year, previous_manager, share_info, maint_work,
                                         maint_experience, clean_work, created_by_user_id, processed, esa, sms_enrolled)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
            data.clean_work ? data.clean_work : 0,
            data.created_by_user_id ? data.created_by_user_id : userId,
            data.processed ? data.processed : 0,
            data.esa ? data.esa : 0,
            data.sms_enrolled ? data.sms_enrolled : 0
        ]);
    await ExecuteTransaction([
            {
                // copy the tenant info for the first semester
                string: `
                    REPLACE INTO user_lease_tenant (last_name, first_name, middle_name, gender, date_of_birth,
                                                    last_4_social,
                                                    cell_phone, cell_phone2, home_phone, email, email2, convicted_crime,
                                                    convicted_explain, charged_crime, charged_explain, street, city,
                                                    state,
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
                           l.semester1 AS semester,
                           IF(l.semester1 IS NULL, 0, 1)
                    FROM tenant t
                             INNER JOIN lease l ON l.id = ?
                    WHERE t.user_id = ? `,
                params: [
                    leaseId,
                    userId
                ]
            },
            {
                // copy the tenant info for a second semester
                string: `
                    REPLACE INTO user_lease_tenant (last_name, first_name, middle_name, gender, date_of_birth,
                                                    last_4_social,
                                                    cell_phone, cell_phone2, home_phone, email, email2, convicted_crime,
                                                    convicted_explain, charged_crime, charged_explain, street, city,
                                                    state,
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
                           l.semester2 AS semester,
                           IF(l.semester2 IS NULL, 0, 1)
                    FROM tenant t
                             INNER JOIN lease l ON l.id = ?
                    WHERE t.user_id = ? `,
                params: [
                    leaseId,
                    userId
                ]
            }]);
};
export const GetApplications = async (site, leaseId) => {
    const query = `
        SELECT DISTINCT a.lease_id                                              AS pending_application,
                        ult.user_id,
                        ult.email,
                        DATE_FORMAT(ult.date_of_birth, '%M %d, %Y')             AS date_of_birth,
                        a.room_type_id,
                        a.esa,
                        DATE_FORMAT(a.submit_date, '%M %d, %Y')                 AS submit_date,
                        DATE_FORMAT(a.deposit_date, '%M %d, %Y')                AS deposit_date,
                        a.processed,
                        ult.apartment_number,
                        DATE_FORMAT(ul.lease_date, '%M %d, %Y')                 AS lease_date,
                        CONCAT(ult.first_name, ' ', ult.last_name)              AS name,
                        a.room_type_id,
                        l.semester1,
                        l.semester2,
                        SUM(IF(ult.semester = l.semester1, ult.selected, null)) AS semester1_selected,
                        SUM(IF(ult.semester = l.semester2, ult.selected, null)) AS semester2_selected
        FROM application a
                 JOIN user_lease_tenant ult on ult.user_id = a.user_id AND ult.lease_id = a.lease_id
                 JOIN lease l ON l.id = a.lease_id
                 LEFT JOIN user_lease ul ON ul.user_id = a.user_id AND ul.lease_id = a.lease_id
        WHERE a.site = ?
          and a.lease_id = ?
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
};

export const GetApplication = async (site, userId, leaseId, roomTypeId) => {
    let [rows] = await ExecuteQuery(`SELECT site,
                                            user_id,
                                            lease_id,
                                            room_type_id,
                                            alternate_room_info,
                                            esa,
                                            sms_enrolled,
                                            roomate,
                                            roomate2,
                                            roomate3,
                                            roomate4,
                                            roomate5,
                                            roomate_desc,
                                            likes_dislikes,
                                            referred_by,
                                            installments,
                                            school_year,
                                            previous_manager,
                                            DATE_FORMAT(submit_date, '%M %d, %Y')  AS submit_date,
                                            DATE_FORMAT(deposit_date, '%M %d, %Y') AS deposit_date,
                                            processed,
                                            share_info,
                                            maint_work,
                                            maint_experience,
                                            clean_work,
                                            accepted
                                     FROM application
                                     WHERE site = ?
                                       AND user_id = ?
                                       AND lease_id = ?
                                       AND room_type_id = ?
    `, [site, userId, leaseId, roomTypeId]);
    //we should only have one
    if (rows && rows.length === 1) return rows[0];
    return null;
};

export const GetTenantApplications = async (site, userId) => {

    let [rows] = await ExecuteQuery(`SELECT a.site,
                                            a.user_id,
                                            a.lease_id,
                                            a.room_type_id,
                                            rt.location,
                                            a.alternate_room_info,
                                            a.esa,
                                            a.sms_enrolled,
                                            a.roomate,
                                            a.roomate2,
                                            a.roomate3,
                                            a.roomate4,
                                            a.roomate5,
                                            a.roomate_desc,
                                            a.likes_dislikes,
                                            a.referred_by,
                                            a.installments,
                                            a.school_year,
                                            a.previous_manager,
                                            DATE_FORMAT(a.submit_date, '%M %d, %Y')  AS submit_date,
                                            DATE_FORMAT(a.deposit_date, '%M %d, %Y') AS deposit_date,
                                            a.processed,
                                            a.share_info,
                                            a.maint_work,
                                            a.maint_experience,
                                            a.clean_work,
                                            a.accepted,
                                            n.label,
                                            l.deposit_amount
                                     FROM application a
                                              INNER JOIN room_type rt on a.room_type_id = rt.id AND a.site = rt.site
                                              INNER JOIN lease l on a.lease_id = l.id AND a.site = l.site
                                              INNER JOIN site_nav n on n.page = CONCAT('leases/', l.id) AND a.site = n.site
                                     WHERE a.site = ?
                                       AND a.user_id = ?
    `, [site, userId]);
    return rows;
};

export const GetTenantPendingApplications = async (userId) => {

    let [rows] = await ExecuteQuery("SELECT * FROM application WHERE user_id = ? AND processed = false", [userId]);
    return rows;
};

export const DeleteApplication = async (userId, leaseId, roomTypeId) => {

    await ExecuteTransaction([
        {
            string:
                `
                    DELETE
                    FROM application
                    WHERE user_id = ?
                      AND lease_id = ?
                      AND room_type_id = ?
                `,
            params:
                [userId, leaseId, roomTypeId]
        },
        {
            string: `DELETE
                     FROM user_lease_tenant
                     WHERE lease_id = ?
                       AND user_id = ?`,
            params:
                [
                    leaseId,
                    userId,
                    roomTypeId
                ]
        }
    ]);
};

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
        console.error(e);
    }
};