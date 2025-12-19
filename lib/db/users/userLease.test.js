import {ExecuteQuery} from "../pool";
import {AddUserLease, GetUserLease} from "./userLease";

jest.mock("../pool");

describe("GetUserLease", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return undefined if no rows are found", async () => {
        ExecuteQuery.mockResolvedValueOnce([[]]);

        const result = await GetUserLease("123", "456");

        expect(result).toBeUndefined();
        expect(ExecuteQuery).toHaveBeenCalledTimes(1);
        const [sql, params] = ExecuteQuery.mock.calls[0];
        expect(sql).toEqual(expect.stringContaining("FROM user_lease"));
        expect(params).toEqual(["123", "456"]);
    });

    it("should return the first row if only one is found", async () => {
        const data = {id: 1, foo: "bar"};
        ExecuteQuery.mockResolvedValueOnce([[data]]);

        const result = await GetUserLease("123", "456");

        expect(result).toEqual(data);
        expect(ExecuteQuery).toHaveBeenCalledTimes(1);
        const [sql, params] = ExecuteQuery.mock.calls[0];
        expect(sql).toEqual(expect.stringContaining("FROM user_lease"));
        expect(params).toEqual(["123", "456"]);
    });
});

describe("AddUserLease", () => {
    const data = {
        room_type_id: "123",
        lease_date: "2022-01-01",
        signature: "signature",
        discount: 0.2,
        vehicle_color: "black",
        vehicle_make_model: "Tesla Model S",
        vehicle_license: "ABC123",
        vehicle_state: "CA",
        vehicle_owner: "John Doe",
        lease_address: "123 Main St",
        lease_home_phone: "123-456-7890",
        lease_cell_phone: "098-765-4321",
        lease_email: "johndoe@example.com",
        lease_parent_name: "Jane Doe",
        lease_parent_phone: "111-111-1111",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should write user lease data via REPLACE INTO SELECT", async () => {
        ExecuteQuery.mockResolvedValueOnce([]);

        await AddUserLease("123", "456", data);

        expect(ExecuteQuery).toHaveBeenCalledTimes(1);
        const [sql, params] = ExecuteQuery.mock.calls[0];
        expect(sql).toEqual(expect.stringContaining("REPLACE INTO user_lease"));
        expect(sql).toEqual(expect.stringContaining("SELECT DISTINCT a.lease_id"));
        expect(params).toEqual([
            data.discount,
            "456",
            "123",
        ]);
    });

    it("should log errors to console.error when database throws error", async () => {
        const error = new Error("Database error");
        ExecuteQuery.mockRejectedValueOnce(error);
        const originalError = console.error;
        console.error = jest.fn();

        await AddUserLease("123", "456", data);

        expect(console.error).toHaveBeenCalled();
        console.error = originalError;
    });
});