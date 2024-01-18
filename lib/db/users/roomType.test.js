import {ExecuteQuery} from "../pool";
import {
    GetRoomType,
    GetLeaseRooms,
    GetActiveSiteLeaseRooms,
    UpdateLeaseRoom,
    UpdateRoomType,
} from "./roomType";

jest.mock("../pool");

describe("GetRoomType", () => {
    it("should return row[0] of query", async () => {
        const row = {id: 1, name: "deluxe"};
        ExecuteQuery.mockResolvedValueOnce([[row]]);
        const result = await GetRoomType("1");
        expect(result).toEqual(row);
    });
});

describe("GetLeaseRooms", () => {
    it("should return rows of query", async () => {
        const rows = [{id: 1, name: "deluxe"}];
        ExecuteQuery.mockResolvedValueOnce([rows]);
        const result = await GetLeaseRooms("1");
        expect(result).toEqual(rows);
    });
});

describe("GetActiveSiteLeaseRooms", () => {
    it("should return rows of query", async () => {
        const rows = [{lease_id: 1, room_type_id: 2, room_rent: 10}];
        ExecuteQuery.mockResolvedValueOnce([rows]);
        const result = await GetActiveSiteLeaseRooms("site");
        expect(result).toEqual(rows);
    });
});

describe("UpdateLeaseRoom", () => {
    it("should update lease room", async () => {
        const data = {room_rent: 10};
        await UpdateLeaseRoom("lease_id", "room_type_id", data);
        expect(ExecuteQuery).toHaveBeenCalledWith(
            "UPDATE lease_rooms SET room_rent = ? WHERE lease_id = ? AND room_type_id = ? ",
            [data.room_rent, "lease_id", "room_type_id"]
        );
    });
});

describe("UpdateRoomType", () => {
    it("should update room type", async () => {
        const data = {room_desc: "new room desc"};
        await UpdateRoomType(1, data);
        expect(ExecuteQuery).toHaveBeenCalledWith(
            "UPDATE room_type SET room_desc = ? WHERE id = ?",
            [data.room_desc, 1]
        );
    });

    it("should catch error and not throw", async () => {
        const data = {room_desc: "new room desc"};
        ExecuteQuery.mockRejectedValueOnce(new Error("oops"));
        await expect(UpdateRoomType(1, data)).resolves.toBeUndefined();
        expect(ExecuteQuery).toHaveBeenCalled();
    });
});
