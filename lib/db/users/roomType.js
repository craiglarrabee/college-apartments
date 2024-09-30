import {ExecuteQuery} from "../pool";
import {GetVisibleSemesterLeaseIds} from "./lease";

export const GetRoomType = async (site, roomTypeId) => {

    const [rows] = await ExecuteQuery("SELECT * FROM room_type WHERE id = ? AND site = ? ", [roomTypeId, site]);
    //we'd better only have one definition
    return rows[0];
}

export const GetBaseRoomTypes = async (site, semester) => {

    const [rows] = await ExecuteQuery(`
        SELECT DISTINCT CONCAT(room_type, ' ', GROUP_CONCAT(bldg)) label, id, site, location, room_type, room_desc, max(room_rent) room_rent
        FROM (SELECT DISTINCT REGEXP_REPLACE(a.apartment_number, '[0-9]', '') bldg,
                              rt.id,
                              rt.room_type,
                              rt.site,
                              rt.location,
                              rt.room_desc,
                              lr.room_rent
              FROM room_type rt
                       JOIN apartment a on rt.id = a.room_type_id AND a.site = rt.site
                       JOIN lease_rooms lr on rt.id = lr.room_type_id AND lr.site = rt.site
                       JOIN lease l on lr.lease_id = l.id AND ? IN (l.semester1, l.semester2)
              WHERE rt.site = ?) AS bldgs
        GROUP BY id, site, location, room_type
        ORDER BY id
    `, [semester, site]);
    return rows;
}

export const GetLocations = async (site, semester) => {

    const [rows] = await ExecuteQuery(`
        SELECT DISTINCT rt.location
              FROM room_type rt
                       JOIN apartment a on rt.id = a.room_type_id AND a.site = rt.site
                       JOIN lease_rooms lr on rt.id = lr.room_type_id AND lr.site = rt.site
                       JOIN lease l on lr.lease_id = l.id AND ? IN (l.semester1, l.semester2)
              WHERE rt.site = ?
    `, [semester, site]);
    return rows;
}

export const GetLeaseRooms = async (leaseId) => {

    const [rows] = await ExecuteQuery(`SELECT l.description, lr.*, rt.*, l.deposit_amount
                                       FROM lease_rooms lr
                                                JOIN room_type rt on rt.id = lr.room_type_id AND rt.site = lr.site
                                                JOIN lease l on l.id = lr.lease_id and l.site = lr.site
                                       WHERE lr.lease_id = ?
                                       ORDER BY lr.lease_id, lr.room_rent `,
        [
            leaseId
        ]);
    return rows;
}


export const GetVisibleSemesterLeaseRoomTypes = async (site, semester) => {
    const query = `
    SELECT l.id lease_id, l.description, lr.room_type_id, lr.room_rent, rt.base_type_id, rt.room_desc, rt.room_type
    FROM lease l
    JOIN lease_rooms lr on l.id = lr.lease_id AND l.site = lr.site
    JOIN room_type rt on lr.room_type_id = rt.id AND rt.site = l.site
    WHERE l.site = ? 
      AND ? IN (l.semester1, l.semester2) 
      AND CURRENT_TIMESTAMP BETWEEN COALESCE(l.start_date, CURRENT_TIMESTAMP) AND COALESCE(l.end_date, CURRENT_TIMESTAMP)
    `;
    const [rows] = await ExecuteQuery(query, [site, semester]);
    return rows;
}
export const GetVisibleSemesterLeaseRoomsMap = async (site, semester) => {
    const currentRooms = await GetVisibleSemesterLeaseRoomTypes(site, semester);
    const currentLeaseIds = [...new Set(currentRooms.map(item => item.lease_id))];
    let rooms = [];
    const currentLeases = currentLeaseIds.map(lease => {
        rooms = currentRooms.filter(room => room.lease_id === lease);
        return {leaseId: lease, leaseDescription: rooms[0].description, rooms: rooms};
    });
    return currentLeases;
};

export const GetLeaseRoomsMap = async (leaseId) => {
    const currentRooms = await GetLeaseRooms(leaseId);
    return [{leaseId: leaseId, leaseDescription: currentRooms[0].description, rooms: currentRooms}];
}

export const CopyLeaseRooms = async (source, target) => {
    try {
        await ExecuteQuery("INSERT INTO lease_rooms (site, room_type_id, lease_id, room_rent, room_full) SELECT site, room_type_id, ?, room_rent, room_full FROM lease_rooms WHERE lease_id = ?", [target, source]);
    } finally {

    }
}

export const AddLeaseRooms = async (site, leaseId) => {
    try {
        await ExecuteQuery("INSERT INTO lease_rooms (site, room_type_id, lease_id, room_rent) SELECT site, id, ?, 0 FROM room_type WHERE site = ?", [leaseId, site]);
    } finally {

    }
}

export const GetActiveSiteLeaseRooms = async (site) => {

    const [rows] = await ExecuteQuery("SELECT l.description, rt.room_desc, lr.lease_id, lr.room_type_id, lr.room_rent FROM lease_rooms lr JOIN room_type rt on rt.id = lr.room_type_id AND rt.site = lr.site JOIN lease l on l.id = lr.lease_id and l.site = lr.site WHERE l.site = ? AND CURDATE() BETWEEN COALESCE(l.start_date, CURDATE()) AND COALESCE(l.end_date, CURDATE()) ORDER BY l.id, lr.room_rent",
        [
            site
        ]);
    return rows;
}

export const GetUserAvailableLeaseRooms = async (site, userId) => {

    let query;
    if (site === "suu") {
        // suu allows multiple applications, until one has been processed
        query = `SELECT l.description, rt.room_desc, lr.lease_id, lr.room_type_id, lr.room_rent
                                       FROM lease_rooms lr
                                                JOIN room_type rt on rt.id = lr.room_type_id AND rt.site = lr.site
                                                JOIN lease l on l.id = lr.lease_id and l.site = lr.site
                                       WHERE l.site = ?
                                         AND l.id NOT IN (SELECT lease_id FROM user_lease WHERE user_id = ?)
                                         AND CURDATE() BETWEEN COALESCE(l.start_date, CURDATE()) AND COALESCE(l.end_date, CURDATE())
                                       ORDER BY l.id, lr.room_rent`;
    } else {
        // snow does not allow more than one application per user per lease period
        query = `SELECT l.description, rt.room_desc, lr.lease_id, lr.room_type_id, lr.room_rent
                                       FROM lease_rooms lr
                                                JOIN room_type rt on rt.id = lr.room_type_id AND rt.site = lr.site
                                                JOIN lease l on l.id = lr.lease_id and l.site = lr.site
                                       WHERE l.site = ?
                                         AND l.id NOT IN (SELECT lease_id FROM application WHERE user_id = ?)
                                         AND CURDATE() BETWEEN COALESCE(l.start_date, CURDATE()) AND COALESCE(l.end_date, CURDATE())
                                       ORDER BY l.id, lr.room_rent`;
    }
    const [rows] = await ExecuteQuery(query,
        [
            site,
            userId
        ]);
    return rows;
}

export const UpdateLeaseRoom = async (leaseId, roomTypeId, data) => {

    try {
        await ExecuteQuery("UPDATE lease_rooms SET room_rent = ? WHERE lease_id = ? AND room_type_id = ? ",
            [
                data.room_rent,
                leaseId,
                roomTypeId
            ]);
    } finally {
    }
}

export const UpdateRoomType = async (site, roomTypeId, data) => {

    try {
        //update
        await ExecuteQuery("UPDATE room_type SET room_desc = ? WHERE id = ? AND site = ?",
            [
                data.room_desc,
                roomTypeId,
                site
            ]);
    } catch (e) {
        console.error(new Date().toISOString() + " - " +e);
    } finally {
    }
}
