import Connection from "../connection";

export const GetRoomType = async(roomTypeId) => {
    const conn = Connection();
    const [rows] = await conn.execute("SELECT * FROM room_type WHERE id = ? ", [roomTypeId]);
        //we'd better only have one definition
    return rows[0];
}

export const GetLeaseRooms = async(leaseId) => {
    const conn = Connection();
    const [rows] = await conn.execute("SELECT * FROM lease_rooms lr JOIN room_type rt on rt.id = lr.room_type_id AND rt.site = lr.site WHERE lr.lease_id = ? ORDER BY lr.lease_id, lr.room_rent ",
        [
            leaseId
        ]);
        return rows;
}

export const GetActiveSiteLeaseRooms = async(site) => {
    const conn = Connection();
    const [rows] = await conn.execute("SELECT l.description, rt.room_desc, lr.lease_id, lr.room_type_id, lr.room_rent FROM lease_rooms lr JOIN room_type rt on rt.id = lr.room_type_id AND rt.site = lr.site JOIN lease l on l.id = lr.lease_id and l.site = lr.site WHERE l.site = ? AND CURDATE() BETWEEN COALESCE(l.start_date, CURDATE()) AND COALESCE(l.end_date, CURDATE()) ORDER BY l.id, lr.room_rent",
        [
            site
        ]);
        return rows;
}

export const UpdateLeaseRoom = async(leaseId, roomTypeId, data) => {
    const conn = Connection();
    try {
        await conn.execute("UPDATE lease_rooms SET room_rent = ? WHERE lease_id = ? AND room_type_id = ? ",
            [
                data.room_rent,
                leaseId,
                roomTypeId
            ]);
    } finally {
            }
}

export const UpdateRoomType = async(roomTypeId, data) => {
    const conn = Connection();
    try {
        //update
        await conn.execute("UPDATE room_type SET room_desc = ? WHERE id = ?",
            [
                data.room_desc,
                roomTypeId
            ]);
    } catch(e) {
        console.log(e);
    } finally {
            }
}
