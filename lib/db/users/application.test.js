import {
    AddApplication,
    GetApplication,
    GetTenantPendingApplications,
    UpdateApplication
} from "./application";
import {ExecuteQuery} from "../pool";

jest.mock("../pool", () => ({
    ExecuteQuery: jest.fn(),
}));

describe("GetApplicationInfo", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should call ExecuteQuery with the site, userId, and leaseId", async () => {
        const rows = [];
        ExecuteQuery.mockResolvedValueOnce([rows]);
        const site = "fakeSite";
        const userId = "fakeId";
        const leaseId = "fakeLeaseId";
        await GetApplication(site, userId, leaseId);
        expect(ExecuteQuery).toHaveBeenCalledWith("SELECT * FROM application WHERE site = ? AND user_id = ? AND lease_id = ?", [site, userId, leaseId]);
    });

    it("should return the only row if there is only one row in the result", async () => {
        const rows = [{id: 1}];
        ExecuteQuery.mockResolvedValueOnce([rows]);
        const result = await GetApplication();
        expect(result).toBe(rows[0]);
    });

    it("should return null if there are no rows or there are more than one rows in the result", async () => {
        ExecuteQuery.mockResolvedValueOnce([]);
        const result1 = await GetApplication();
        ExecuteQuery.mockResolvedValueOnce([[{id: 1}, {id: 2}]]);
        const result2 = await GetApplication();
        expect(result1).toBeNull();
        expect(result2).toBeNull();
    });
});

describe("GetPendingApplicationInfo", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should call ExecuteQuery with the userId and processed = false", async () => {
        const userId = "fakeId";
        ExecuteQuery.mockResolvedValue([]);
        await GetTenantPendingApplications(userId);
        expect(ExecuteQuery).toHaveBeenCalledWith("SELECT * FROM application WHERE user_id = ? AND processed = false", [userId]);
    });

    it("should return the only row if there is only one row in the result", async () => {
        const rows = [{id: 1}];
        ExecuteQuery.mockResolvedValueOnce([rows]);
        const result = await GetTenantPendingApplications();
        expect(result).toBe(rows[0]);
    });

    it("should return null if there are no rows or there are more than one rows in the result", async () => {
        ExecuteQuery.mockResolvedValueOnce([]);
        const result1 = await GetTenantPendingApplications();
        ExecuteQuery.mockResolvedValueOnce([{id: 1}, {id: 2}]);
        const result2 = await GetTenantPendingApplications();
        expect(result1).toBeNull();
        expect(result2).toBeNull();
    });
});

describe("ProcessApplicationInfo", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should call ExecuteQuery with the site, userId, and leaseId", async () => {
        const site = "fakeSite";
        const userId = "fakeId";
        const leaseId = "fakeLeaseId";
        await UpdateApplication(site, userId, leaseId);
        expect(ExecuteQuery).toHaveBeenCalledWith("UPDATE application SET processed = NOW() WHERE site=? AND user_id=? AND lease_id=?", [site, userId, leaseId]);
    });

    it("should not throw an error if ExecuteQuery resolves successfully", async () => {
        ExecuteQuery.mockResolvedValueOnce();
        await expect(UpdateApplication()).resolves.toBeUndefined();
    });

    it("should log an error if ExecuteQuery rejects", async () => {
        const error = new Error("fake");
        ExecuteQuery.mockRejectedValueOnce(error);
        console.log = jest.fn();
        await UpdateApplication();
        expect(console.log).toHaveBeenCalledWith(error);
    });
});

describe("AddApplicationInfo", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const data = {
        room_type_id: "fakeRoomTypeId"
    };

    const optionalFields = [
        ["roomate", null],
        ["roomate2", null],
        ["roomate3", null],
        ["roomate4", null],
        ["roomate5", null],
        ["roomate_desc", null],
        ["likes_dislikes", null],
        ["referred_by", null],
        ["installments", 0],
        ["share_info", 1],
        ["maint_work", 0],
        ["maint_experience", null],
        ["clean_work", 0]
    ];

    it("should call ExecuteQuery with the site, userId, leaseId, and data fields", async () => {
        const site = "fakeSite";
        const userId = "fakeId";
        const leaseId = "fakeLeaseId";
        ExecuteQuery.mockResolvedValueOnce([]);
        await AddApplication(site, userId, leaseId, data);
        const args = [
            site,
            userId,
            leaseId,
            data.room_type_id,
            ...optionalFields.map(field => field[1]),
        ];
        expect(ExecuteQuery).toHaveBeenCalledWith("REPLACE INTO application(site, user_id, lease_id, room_type_id, roomate, roomate2, roomate3, roomate4, roomate5, roomate_desc, likes_dislikes, referred_by, installments, share_info, maint_work, maint_experience, clean_work) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", args);
    });

    it("should not throw an error if ExecuteQuery resolves successfully", async () => {
        ExecuteQuery.mockResolvedValueOnce();
        await expect(AddApplication()).resolves.toBeUndefined();
    });

    it("should log an error if ExecuteQuery rejects", async () => {
        const error = new Error("fake");
        const site = "fakeSite";
        const userId = "fakeId";
        const leaseId = "fakeLeaseId";
        ExecuteQuery.mockRejectedValueOnce(error);
        console.log = jest.fn();
        await AddApplication(site, userId, leaseId, data);
        expect(console.log).toHaveBeenCalledWith(error);
    });
});
