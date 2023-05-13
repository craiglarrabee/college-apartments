import {ExecuteQuery} from "../pool";

export const GetApartments = async (site) => {

    const [rows] = await ExecuteQuery("SELECT a.site, a.apartment_number, a.rooms, a.room_type_id, rt.room_type, rt.location, rt.room_desc FROM apartment a INNER JOIN room_type rt on a.site = rt.site and a.room_type_id = rt.id WHERE a.site = ? ",
        [site]);
    return rows;
}
