import {ExecuteQuery} from "../pool";
import {AddUserLease, GetUserLease} from "./userLease";

jest.mock("../pool");

describe("GetUserLease", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return null if no rows are found", async () => {
        ExecuteQuery.mockResolvedValueOnce([[]]);

        const result = await GetUserLease("123", "456");

        expect(result).toBeNull();
        expect(ExecuteQuery).toHaveBeenCalledTimes(1);
        expect(ExecuteQuery).toHaveBeenCalledWith(
            "SELECT * FROM user_lease WHERE user_id = ? and lease_id = ?",
            ["123", "456"]
        );
    });

    it("should return the first row if only one is found", async () => {
        const data = {id: 1, foo: "bar"};
        ExecuteQuery.mockResolvedValueOnce([[data]]);

        const result = await GetUserLease("123", "456");

        expect(result).toEqual(data);
        expect(ExecuteQuery).toHaveBeenCalledTimes(1);
        expect(ExecuteQuery).toHaveBeenCalledWith(
            "SELECT * FROM user_lease WHERE user_id = ? and lease_id = ?",
            ["123", "456"]
        );
    });
});

describe("AddUserLease", () => {
    const data = {
        room_type_id: "123",
        lease_date: "2022-01-01",
        signature: "signature",
        lease_discount: 0.2,
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

    it("should insert data into database", async () => {
        ExecuteQuery.mockResolvedValueOnce([]);

        await AddUserLease("123", "456", data);

        expect(ExecuteQuery).toHaveBeenCalledTimes(1);
        expect(ExecuteQuery).toHaveBeenCalledWith(
            "INSERT INTO user_lease (lease_id, user_id, room_type_id, lease_date, signature, lease_discount, vehicle_color, vehicle_make_model, vehicle_license, vehicle_state, vehicle_owner, lease_address, lease_home_phone, lease_cell_phone, lease_email, lease_parent_name, lease_parent_phone) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [
                "456",
                "123",
                data.room_type_id,
                data.lease_date,
                data.signature,
                data.lease_discount,
                data.vehicle_color,
                data.vehicle_make_model,
                data.vehicle_license,
                data.vehicle_state,
                data.vehicle_owner,
                data.lease_address,
                data.lease_home_phone,
                data.lease_cell_phone,
                data.lease_email,
                data.lease_parent_name,
                data.lease_parent_phone,
            ]
        );
    });

    it("should log error when database throws error", async () => {
        const error = new Error("Database error");
        ExecuteQuery.mockRejectedValueOnce(error);
        console.log = jest.fn();

        await AddUserLease("123", "456", data);

        expect(console.log).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledWith(error);
    });
});