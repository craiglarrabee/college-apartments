import Connection from "../connection";

export const GetRoomType = async(roomTypeId) => {
    const conn = await Connection();
    const [rows] = await conn.execute("SELECT * FROM room_type WHERE id = ? ", [roomTypeId]);
    conn.release();
    //we'd better only have one definition
    return rows[0];
}

export const GetLeaseRooms = async(leaseId) => {
    const conn = await Connection();
    const [rows] = await conn.execute("SELECT * FROM lease_rooms lr JOIN room_type rt on rt.id = lr.room_type_id AND rt.site = lr.site WHERE lr.lease_id = ? ",
        [
            leaseId
        ]);
    conn.release();
    return rows;
}

export const UpdateLeaseRoom = async(leaseId, roomTypeId, data) => {
    const conn = await Connection();
    try {
        await conn.execute("UPDATE lease_rooms SET room_rent = ? WHERE lease_id = ? AND room_type_id = ? ",
            [
                data.room_rent,
                leaseId,
                roomTypeId
            ]);
    } finally {
        conn.release();
    }
}

export const UpdateRoomType = async(roomTypeId, data) => {
    const conn = await Connection();
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
        conn.release();
    }
}
