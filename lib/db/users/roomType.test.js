import {ExecuteQuery} from "../pool";
import {
    GetRoomType,
    GetLeaseRooms,
    GetActiveSiteLeaseRooms,
    UpdateLeaseRoom,
    UpdateRoomType,
} from "./roomType";

jest.mock("../pool");

beforeEach(() => {
    jest.clearAllMocks();
});

describe("GetRoomType", () => {
    it("should return row[0] of query", async () => {
        const row = {id: 1, name: "deluxe"};
        ExecuteQuery.mockResolvedValueOnce([[row]]);
        const result = await GetRoomType("site", "1");
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
            "UPDATE lease_rooms SET room_rent = ?, room_full = ? WHERE lease_id = ? AND room_type_id = ? ",
            [data.room_rent, "lease_id", "room_type_id"]
        );
    });
});

describe("UpdateRoomType", () => {
    it("should update room type", async () => {
        const site = "site";
        const data = {room_desc: "new room desc"};
        await UpdateRoomType(site, 1, data);
        expect(ExecuteQuery).toHaveBeenCalledWith(
            "UPDATE room_type SET room_desc = ? WHERE id = ? AND site = ?",
            [data.room_desc, 1, site]
        );
    });

    it("should catch error and not throw", async () => {
        const site = "site";
        const data = {room_desc: "new room desc"};
        ExecuteQuery.mockRejectedValueOnce(new Error("oops"));
        await expect(UpdateRoomType(site, 1, data)).resolves.toBeUndefined();
        expect(ExecuteQuery).toHaveBeenCalled();
    });
});


// Additional coverage for roomType helpers and data loaders
import {
    GetBaseRoomTypes,
    GetLocations,
    CopyLeaseRooms,
    AddLeaseRooms,
} from "./roomType";

describe("GetBaseRoomTypes", () => {
    it("should select base room types with semester/site filters and return rows", async () => {
        const rows = [
            { id: 1, site: "site", location: "A", room_type: "Private", room_desc: "Private", room_rent: 500 },
        ];
        ExecuteQuery.mockResolvedValueOnce([rows]);
        const semester = "Fall 2025";
        const site = "site";
        const result = await GetBaseRoomTypes(site, semester);
        expect(ExecuteQuery).toHaveBeenCalledTimes(1);
        const [sql, params] = ExecuteQuery.mock.calls[0];
        expect(sql).toEqual(expect.stringContaining("FROM room_type rt"));
        expect(sql).toEqual(expect.stringContaining("JOIN apartment a"));
        expect(sql).toEqual(expect.stringContaining("JOIN lease_rooms lr"));
        expect(sql).toEqual(expect.stringContaining("JOIN lease l"));
        expect(sql).toEqual(expect.stringContaining("? IN (l.semester1, l.semester2)"));
        expect(params).toEqual([semester, site]);
        expect(result).toEqual(rows);
    });
});

describe("GetLocations", () => {
    it("should select distinct locations with semester/site filters and return rows", async () => {
        const rows = [{ location: "A" }, { location: "B" }];
        ExecuteQuery.mockResolvedValueOnce([rows]);
        const semester = "Spring 2026";
        const site = "site";
        const result = await GetLocations(site, semester);
        expect(ExecuteQuery).toHaveBeenCalledTimes(1);
        const [sql, params] = ExecuteQuery.mock.calls[0];
        expect(sql).toEqual(expect.stringContaining("SELECT DISTINCT rt.location"));
        expect(sql).toEqual(expect.stringContaining("FROM room_type rt"));
        expect(sql).toEqual(expect.stringContaining("JOIN apartment a"));
        expect(sql).toEqual(expect.stringContaining("JOIN lease_rooms lr"));
        expect(sql).toEqual(expect.stringContaining("JOIN lease l"));
        expect(sql).toEqual(expect.stringContaining("? IN (l.semester1, l.semester2)"));
        expect(params).toEqual([semester, site]);
        expect(result).toEqual(rows);
    });
});

describe("CopyLeaseRooms", () => {
    it("should INSERT SELECT lease_rooms from source to target with correct params", async () => {
        ExecuteQuery.mockResolvedValueOnce([]);
        const source = 1;
        const target = 2;
        await CopyLeaseRooms(source, target);
        expect(ExecuteQuery).toHaveBeenCalledTimes(1);
        const [sql, params] = ExecuteQuery.mock.calls[0];
        expect(sql).toEqual(expect.stringContaining("INSERT INTO lease_rooms"));
        expect(sql).toEqual(expect.stringContaining("SELECT site, room_type_id, ?, room_rent"));
        expect(params).toEqual([target, source]);
    });
});

describe("AddLeaseRooms", () => {
    it("should INSERT SELECT room types for a site into lease_rooms with correct params", async () => {
        ExecuteQuery.mockResolvedValueOnce([]);
        const site = "mysite";
        const leaseId = 42;
        await AddLeaseRooms(site, leaseId);
        expect(ExecuteQuery).toHaveBeenCalledTimes(1);
        const [sql, params] = ExecuteQuery.mock.calls[0];
        expect(sql).toEqual(expect.stringContaining("INSERT INTO lease_rooms"));
        expect(sql).toEqual(expect.stringContaining("SELECT site, id, ?, 0 FROM room_type WHERE site = ?"));
        expect(params).toEqual([leaseId, site]);
    });
});
