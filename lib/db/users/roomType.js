import {ExecuteQuery} from "../pool";

export const GetRoomType = async (roomTypeId) => {

    const [rows] = await ExecuteQuery("SELECT * FROM room_type WHERE id = ? ", [roomTypeId]);
    //we"d better only have one definition
    return rows[0];
}

export const GetRoomTypes = async (site) => {

    const [rows] = await ExecuteQuery("SELECT * FROM room_type WHERE site = ? AND base_type_id = id", [site]);
    return rows;
}

export const GetLeaseRooms = async (leaseId) => {

    const [rows] = await ExecuteQuery("SELECT l.description, lr.*, rt.* FROM lease_rooms lr JOIN room_type rt on rt.id = lr.room_type_id AND rt.site = lr.site JOIN lease l on l.id = lr.lease_id and l.site = lr.site WHERE lr.lease_id = ? ORDER BY lr.lease_id, lr.room_rent ",
        [
            leaseId
        ]);
    return rows;
}

export const GetCurrentLeaseRooms = async (leaseId) => {
    const currentRooms = await GetLeaseRooms(leaseId);
    let currentLeases = [...new Set(currentRooms.map(room => room.lease_id))];
    currentLeases = currentLeases.map(lease => {
        let rooms = currentRooms.filter(room => room.lease_id === lease);
        return {leaseId: lease, leaseDescription: rooms[0].description, rooms: rooms};
    });
    return currentLeases;
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

    const [rows] = await ExecuteQuery("SELECT l.description, rt.room_desc, lr.lease_id, lr.room_type_id, lr.room_rent FROM lease_rooms lr JOIN room_type rt on rt.id = lr.room_type_id AND rt.site = lr.site JOIN lease l on l.id = lr.lease_id and l.site = lr.site WHERE l.site = ? AND l.id NOT IN (SELECT lease_id FROM user_lease WHERE user_id = ?) AND CURDATE() BETWEEN COALESCE(l.start_date, CURDATE()) AND COALESCE(l.end_date, CURDATE()) ORDER BY l.id, lr.room_rent",
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

export const UpdateRoomType = async (roomTypeId, data) => {

    try {
        //update
        await ExecuteQuery("UPDATE room_type SET room_desc = ? WHERE id = ?",
            [
                data.room_desc,
                roomTypeId
            ]);
    } catch (e) {
        console.log(e);
    } finally {
    }
}
