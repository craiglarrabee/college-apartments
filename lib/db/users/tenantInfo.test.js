
import { ExecuteQuery } from "../pool";
import {AddTenantInfo, GetTenantInfo} from "./tenantInfo";
jest.mock("../pool");

describe("GetTenantInfo", () => {
  it("should get the tenant info by id", async () => {
    const id = 1;
    const rows = { length: 1, tenant: "Tenant Info" };
    ExecuteQuery.mockResolvedValueOnce([rows]);
    const result = await GetTenantInfo(id);
    expect(result).toEqual(rows[0]);
    expect(ExecuteQuery).toHaveBeenCalledWith("SELECT t.*, a.lease_id AS pending_application FROM tenant t LEFT JOIN application a ON a.user_id = t.user_id AND a.processed = false WHERE t.user_id = ?", [id]);
  });

  it("should return null if there are no rows", async () => {
    const id = 1;
    const rows = { length: 0, tenant: "Tenant Info" };
    ExecuteQuery.mockResolvedValueOnce([rows]);
    const result = await GetTenantInfo(id);
    expect(result).toBeNull();
    expect(ExecuteQuery).toHaveBeenCalledWith("SELECT t.*, a.lease_id AS pending_application FROM tenant t LEFT JOIN application a ON a.user_id = t.user_id AND a.processed = false WHERE t.user_id = ?", [id]);
  });
});

describe("AddTenantInfo", () => {

  it("should add tenant info to the database", async () => {
    const id = 1;
    const data = {
      last_name: "Smith",
      first_name: "Jane",
      middle_name: "Doe",
      gender: "Female",
      date_of_birth: "1-1-1990",
      last_4_social: "1234",
      cell_phone: "1234567890",
      cell_phone2: "0987654321",
      home_phone: "5555555555",
      email: "jane@example.com",
      email2: "jane.doe@example.com",
      convicted_crime: "1",
      convicted_explain: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      charged_crime: "0",
      charged_explain: null,
      street: "123 Main St.",
      city: "Anytown",
      state: "CA",
      zip: "12345",
      parent_name: "John Smith",
      parent_street: "456 Market St.",
      parent_city: "Anytown",
      parent_state: "CA",
      parent_zip: "12345",
      parent_phone: "5555555555"
    };
    ExecuteQuery.mockResolvedValueOnce([]);
    await AddTenantInfo(id, data);
    expect(ExecuteQuery).toHaveBeenCalledWith(
      "REPLACE INTO tenant (user_id, last_name, first_name, middle_name, gender, date_of_birth, last_4_social, cell_phone, cell_phone2, home_phone, email, email2, convicted_crime, convicted_explain, charged_crime, charged_explain, street, city, state, zip, parent_name, parent_street, parent_city, parent_state, parent_zip, parent_phone) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        id,
        data.last_name,
        data.first_name,
        data.middle_name,
        data.gender,
        data.date_of_birth,
        data.last_4_social,
        data.cell_phone,
        data.cell_phone2,
        data.home_phone,
        data.email,
        data.email2,
        data.convicted_crime,
        data.convicted_crime === "1" ? data.convicted_explain : null,
        data.charged_crime,
        data.charged_crime === "1" ? data.charged_explain : null,
        data.street,
        data.city,
        data.state,
        data.zip,
        data.parent_name,
        data.parent_street,
        data.parent_city,
        data.parent_state,
        data.parent_zip,
        data.parent_phone
      ]
    );
  });

  it("should log the error if ExecuteQuery throws an error", async () => {
    const id = 1;
    const data = {
      last_name: "Smith",
      first_name: "Jane",
      middle_name: "Doe",
      gender: "Female",
      date_of_birth: "1-1-1990",
      last_4_social: "1234",
      cell_phone: "1234567890",
      cell_phone2: "0987654321",
      home_phone: "5555555555",
      email: "jane@example.com",
      email2: "jane.doe@example.com",
      convicted_crime: "1",
      convicted_explain: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      charged_crime: "0",
      charged_explain: null,
      street: "123 Main St.",
      city: "Anytown",
      state: "CA",
      zip: "12345",
      parent_name: "John Smith",
      parent_street: "456 Market St.",
      parent_city: "Anytown",
      parent_state: "CA",
      parent_zip: "12345",
      parent_phone: "5555555555"
    };
    const error = new Error("ExecuteQuery failed");
    ExecuteQuery.mockRejectedValueOnce(error);
    const consoleSpy = jest.spyOn(console, "log").mockImplementationOnce(() => {});
    await AddTenantInfo(id, data);
    expect(ExecuteQuery).toHaveBeenCalledWith(
      "REPLACE INTO tenant (user_id, last_name, first_name, middle_name, gender, date_of_birth, last_4_social, cell_phone, cell_phone2, home_phone, email, email2, convicted_crime, convicted_explain, charged_crime, charged_explain, street, city, state, zip, parent_name, parent_street, parent_city, parent_state, parent_zip, parent_phone) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        id,
        data.last_name,
        data.first_name,
        data.middle_name,
        data.gender,
        data.date_of_birth,
        data.last_4_social,
        data.cell_phone,
        data.cell_phone2,
        data.home_phone,
        data.email,
        data.email2,
        data.convicted_crime,
        data.convicted_crime === "1" ? data.convicted_explain : null,
        data.charged_crime,
        data.charged_crime === "1" ? data.charged_explain : null,
        data.street,
        data.city,
        data.state,
        data.zip,
        data.parent_name,
        data.parent_street,
        data.parent_city,
        data.parent_state,
        data.parent_zip,
        data.parent_phone
      ]
    );
    expect(consoleSpy).toHaveBeenCalledWith(error);
  });
});
