import {
    AddApplication,
    GetApplication,
    GetTenantPendingApplications,
    ProcessApplication
} from "./application";
import {ExecuteQuery} from "../pool";

jest.mock("../pool", () => ({
    ExecuteQuery: jest.fn(),
}));

describe("GetApplicationInfo", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should call ExecuteQuery with the site, userId, leaseId, and roomTypeId", async () => {
        const rows = [];
        ExecuteQuery.mockResolvedValueOnce([rows]);
        const site = "fakeSite";
        const userId = "fakeId";
        const leaseId = "fakeLeaseId";
        const roomTypeId = "fakeRoomTypeId";
        await GetApplication(site, userId, leaseId, roomTypeId);
        expect(ExecuteQuery).toHaveBeenCalledWith(`SELECT site,
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
                                            referred_desc,
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
                                       AND room_type_id = ?`, [site, userId, leaseId, roomTypeId]);
    });

    it("should return the only row if there is only one row in the result", async () => {
        const rows = [{id: 1}];
        ExecuteQuery.mockResolvedValueOnce([rows]);
        const result = await GetApplication("fakeSite", "fakeId", "fakeLeaseId", "fakeRoomTypeId");
        expect(result).toBe(rows[0]);
    });

    it("should return null if there are no rows or there are more than one rows in the result", async () => {
        ExecuteQuery.mockResolvedValueOnce([]);
        const result1 = await GetApplication("fakeSite", "fakeId", "fakeLeaseId", "fakeRoomTypeId");
        ExecuteQuery.mockResolvedValueOnce([[{id: 1}, {id: 2}]]);
        const result2 = await GetApplication("fakeSite", "fakeId", "fakeLeaseId", "fakeRoomTypeId");
        expect(result1).toBeNull();
        expect(result2).toBeNull();
    });
});

describe("GetPendingApplicationInfo", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should call ExecuteQuery with the userId, site, and processed = false", async () => {
        const userId = "fakeId";
        const site = "fakeSite";
        ExecuteQuery.mockResolvedValue([]);
        await GetTenantPendingApplications(userId, site);
        expect(ExecuteQuery).toHaveBeenCalledWith("SELECT * FROM application WHERE user_id = ? AND site = ? AND processed = false", [userId, site]);
    });

    it("should return the only row if there is only one row in the result", async () => {
        const rows = [{id: 1}];
        ExecuteQuery.mockResolvedValueOnce([rows]);
        const result = await GetTenantPendingApplications("fakeId", "fakeSite");
        expect(result).toBe(rows[0]);
    });

    it("should return null if there are no rows or there are more than one rows in the result", async () => {
        ExecuteQuery.mockResolvedValueOnce([]);
        const result1 = await GetTenantPendingApplications("fakeId", "fakeSite");
        ExecuteQuery.mockResolvedValueOnce([{id: 1}, {id: 2}]);
        const result2 = await GetTenantPendingApplications("fakeId", "fakeSite");
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
        const data = { processed: true };
        await ProcessApplication(site, userId, leaseId, data);
        expect(ExecuteQuery).toHaveBeenCalledWith("UPDATE application SET processed = ? WHERE site=? AND user_id=? AND lease_id=?", [data.processed, site, userId, leaseId]);
    });

    it("should not throw an error if ExecuteQuery resolves successfully", async () => {
        ExecuteQuery.mockResolvedValueOnce();
        await expect(ProcessApplication("fakeSite", "fakeId", "fakeLeaseId", { processed: true })).resolves.toBeUndefined();
    });

    it("should log an error if ExecuteQuery rejects", async () => {
        const error = new Error("fake");
        ExecuteQuery.mockRejectedValueOnce(error);
        console.error = jest.fn();
        await ProcessApplication("fakeSite", "fakeId", "fakeLeaseId", { processed: true });
        expect(console.error).toHaveBeenCalledWith(expect.stringContaining("fake"));
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
        ["alternate_room_info", null],
        ["roomate", null],
        ["roomate2", null],
        ["roomate3", null],
        ["roomate4", null],
        ["roomate5", null],
        ["roomate_desc", null],
        ["likes_dislikes", null],
        ["referred_by", null],
        ["referred_desc", null],
        ["installments", 0],
        ["school_year", null],
        ["previous_manager", null],
        ["share_info", 1],
        ["maint_work", 0],
        ["maint_experience", null],
        ["clean_work", 0],
        ["created_by_user_id", "fakeId"],
        ["processed", 0],
        ["esa", 0],
        ["sms_enrolled", 0]
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
        expect(ExecuteQuery).toHaveBeenCalledWith(`
                REPLACE INTO application(site, user_id, lease_id, room_type_id, alternate_room_info, roomate, roomate2,
                                         roomate3, roomate4, roomate5, roomate_desc, likes_dislikes, referred_by, referred_desc,
                                         installments, school_year, previous_manager, share_info, maint_work,
                                         maint_experience, clean_work, created_by_user_id, processed, esa, sms_enrolled)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, args);
    });

    it("should not throw an error if ExecuteQuery resolves successfully", async () => {
        ExecuteQuery.mockResolvedValueOnce();
        await expect(AddApplication("fakeSite", "fakeId", "fakeLeaseId", data)).resolves.toBeUndefined();
    });

    it("should log an error if ExecuteQuery rejects", async () => {
        const error = new Error("fake");
        const site = "fakeSite";
        const userId = "fakeId";
        const leaseId = "fakeLeaseId";
        ExecuteQuery.mockRejectedValueOnce(error);
        console.error = jest.fn();
        await AddApplication(site, userId, leaseId, data);
        expect(console.error).toHaveBeenCalledWith(expect.stringContaining("fake"));
    });
});