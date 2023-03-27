
import { ExecuteQuery } from "../pool";

describe("GetLeaseInfo", () => {
  it("returns null if no rows are found", async () => {
    const rows = [];
    jest.spyOn(ExecuteQuery, "ExecuteQuery").mockResolvedValue([rows]);
    const result = await GetLeaseInfo(1, 2);
    expect(result).toBeNull();
  });

  it("returns the row if one row is found", async () => {
    const rows = [{ id: 1 }];
    jest.spyOn(ExecuteQuery, "ExecuteQuery").mockResolvedValue([rows]);
    const result = await GetLeaseInfo(1, 2);
    expect(result).toEqual(rows[0]);
  });

  it("returns null if more than one row is found", async () => {
    const rows = [{ id: 1 }, { id: 2 }];
    jest.spyOn(ExecuteQuery, "ExecuteQuery").mockResolvedValue([rows]);
    const result = await GetLeaseInfo(1, 2);
    expect(result).toBeNull();
  });
});

describe("AddLeaseInfo", () => {
  it("calls ExecuteQuery with the correct arguments", async () => {
    jest.spyOn(ExecuteQuery, "ExecuteQuery").mockResolvedValue([[]]);
    const data = {
      room_options_id: 1,
      lease_date: "2022-12-31",
      signature: "John Smith",
      lease_discount: 0.1,
      vehicle_color: "red",
      vehicle_make_model: "Toyota Camry",
      vehicle_license: "1234",
      vehicle_state: "CA",
      vehicle_owner: "Jane Smith",
      lease_address: "123 Main St",
      lease_home_phone: "555-555-5555",
      lease_cell_phone: "555-555-5555",
      lease_email: "john@example.com",
      lease_parent_name: "Bob Smith",
      lease_parent_phone: "555-555-5555",
    };
    await AddLeaseInfo(1, 2, data);
    expect(ExecuteQuery.ExecuteQuery).toHaveBeenCalledWith(
      "INSERT INTO user_lease (lease_id, user_id, room_options_id, lease_date, signature, lease_discount, vehicle_color, vehicle_make_model, vehicle_license, vehicle_state, vehicle_owner, lease_address, lease_home_phone, lease_cell_phone, lease_email, lease_parent_name, lease_parent_phone) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        2,
        1,
        data.room_options_id,
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

  it("logs an error if ExecuteQuery throws an error", async () => {
    const error = new Error("ExecuteQuery error");
    jest.spyOn(ExecuteQuery, "ExecuteQuery").mockRejectedValue(error);
    jest.spyOn(console, "log");
    const data = {};
    await AddLeaseInfo(1, 2, data);
    expect(console.log).toHaveBeenCalledWith(error);
  });
});
