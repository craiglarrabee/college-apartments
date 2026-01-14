import {ExecuteQuery} from "../pool";
import {
  GetVisibleSemesterLeaseRoomTypes,
  GetVisibleSemesterLeaseRoomsMap,
  GetUserAvailableLeaseRooms,
  GetLeaseRoomsMap,
} from "./roomType";

jest.mock("../pool", () => ({
  ExecuteQuery: jest.fn(),
}));

describe("GetVisibleSemesterLeaseRoomTypes", () => {
  afterEach(() => jest.clearAllMocks());

  it("calls with site and semester and returns rows", async () => {
    const rows = [
      {lease_id: 1, description: "Fall", room_type_id: 2, room_rent: 500, base_type_id: 99, room_desc: "Deluxe"},
    ];
    ExecuteQuery.mockResolvedValueOnce([rows]);

    const result = await GetVisibleSemesterLeaseRoomTypes("siteA", "Fall 2025");

    expect(result).toEqual(rows);
    const [sql, params] = ExecuteQuery.mock.calls[0];
    expect(sql).toEqual(expect.stringContaining("FROM lease l"));
    expect(sql).toEqual(expect.stringContaining("JOIN lease_rooms"));
    expect(sql).toEqual(expect.stringContaining("JOIN room_type"));
    expect(sql).toEqual(expect.stringContaining("WHERE l.site = ?"));
    expect(params).toEqual(["siteA", "Fall 2025"]);
  });
});

describe("GetVisibleSemesterLeaseRoomsMap", () => {
  afterEach(() => jest.clearAllMocks());

  it("groups rows by lease_id and returns mapped structure", async () => {
    const rows = [
      {lease_id: 1, description: "Fall", room_type_id: 2, room_rent: 500, room_desc: "Deluxe"},
      {lease_id: 1, description: "Fall", room_type_id: 3, room_rent: 600, room_desc: "Private"},
      {lease_id: 2, description: "Spring", room_type_id: 5, room_rent: 700, room_desc: "Deluxe"},
    ];
    ExecuteQuery.mockResolvedValueOnce([rows]);

    const result = await GetVisibleSemesterLeaseRoomsMap("siteA", "Fall 2025");

    expect(result).toEqual([
      {leaseId: 1, leaseDescription: "Fall", rooms: rows.filter(r => r.lease_id === 1)},
      {leaseId: 2, leaseDescription: "Spring", rooms: rows.filter(r => r.lease_id === 2)},
    ]);
  });
});

describe("GetLeaseRoomsMap", () => {
  afterEach(() => jest.clearAllMocks());

  it("maps rooms for a single lease id with description", async () => {
    const rooms = [
      {description: "Lease One", room_type_id: 10},
      {description: "Lease One", room_type_id: 11},
    ];
    ExecuteQuery.mockResolvedValueOnce([rooms]);

    const result = await GetLeaseRoomsMap(123);

    expect(result).toEqual([{leaseId: 123, leaseDescription: "Lease One", rooms}]);
  });
});

describe("GetUserAvailableLeaseRooms", () => {
  afterEach(() => jest.clearAllMocks());

  it("uses SUU branch when site === 'suu'", async () => {
    ExecuteQuery.mockResolvedValueOnce([[]]);
    await GetUserAvailableLeaseRooms("suu", 99);
    const [sql, params] = ExecuteQuery.mock.calls[0];
    expect(sql).toEqual(expect.stringContaining("FROM lease_rooms lr"));
    expect(sql).toEqual(expect.stringContaining("AND l.id NOT IN (SELECT lease_id FROM user_lease"));
    expect(params).toEqual(["suu", 99]);
  });

  it("uses non-SUU branch otherwise (application constraint)", async () => {
    ExecuteQuery.mockResolvedValueOnce([[]]);
    await GetUserAvailableLeaseRooms("snow", 99);
    const [sql, params] = ExecuteQuery.mock.calls[0];
    expect(sql).toEqual(expect.stringContaining("FROM lease_rooms lr"));
    expect(sql).toEqual(expect.stringContaining("AND l.id NOT IN (SELECT lease_id FROM application"));
    expect(params).toEqual(["snow", 99]);
  });
});
