
import argon2 from "argon2";
import { ExecuteQuery } from "../pool";
import {AddUser, ChangeUserPassword, GetUser, GetUserAndVerifyPassword} from "./user";

jest.mock("argon2", () => ({
  hash: jest.fn().mockResolvedValue("hash"),
  verify: jest.fn().mockResolvedValue(true)
}));
jest.mock("../pool", () => ({
  ExecuteQuery: jest.fn()}));

describe("AddUser", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should call argon2.hash with the password", async () => {
    ExecuteQuery.mockResolvedValue([[{}]]);
    await AddUser("user1", "p@ssw0rd");
    expect(argon2.hash).toHaveBeenCalledWith("p@ssw0rd");
  });

  it("should call ExecuteQuery with the correct query and arguments", async () => {
    ExecuteQuery.mockResolvedValue([[{}]]);
    await AddUser("user1", "p@ssw0rd");
    expect(ExecuteQuery).toHaveBeenCalledWith("INSERT INTO user (username, password) VALUES (?,?)", ["user1", "hash"]);
  });
});

describe("GetUserAndVerifyPassword", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should call ExecuteQuery with the correct query and arguments", async () => {
    const expectedQuery = "SELECT user.password, user.id, tenant.first_name, tenant.email, site_admins.site FROM user LEFT JOIN tenant ON tenant.user_id = user.id LEFT JOIN site_admins ON site_admins.userid = user.id and site_admins.site = ? WHERE username = ?";
    const expectedArgs = ["site1", "user1"];
    ExecuteQuery.mockResolvedValue([[{}]]);
    await GetUserAndVerifyPassword("site1", "user1", "p@ssw0rd");
    expect(ExecuteQuery).toHaveBeenCalledWith(expectedQuery, expectedArgs);
  });

  it("should throw an error if query returns no rows", async () => {
    ExecuteQuery.mockResolvedValue([[]]); // Mock the ExecuteQuery function to return an empty array
    await expect(GetUserAndVerifyPassword("site1", "user1", "p@ssw0rd")).rejects.toThrow("invalid login");
  });

  it("should throw an error if password verification fails", async () => {
    const mockPassword = "hashed_password";
    const mockExecuteQuery = jest.fn().mockResolvedValue([[{ password: mockPassword }]]); // Mock the ExecuteQuery function to return a row with a different password
    argon2.verify.mockResolvedValue(false); // Mock the argon2.verify function to return false
    await expect(GetUserAndVerifyPassword("site1", "user1", "p@ssw0rd", mockExecuteQuery)).rejects.toThrow("invalid login");
  });

  it("should return the user data if password verification succeeds", async () => {
    const expectedUserData = { id: 1, first_name: "John", site: "site1" };
    ExecuteQuery.mockResolvedValue([[expectedUserData]]); // Mock the ExecuteQuery function to return the expected user data
    argon2.verify.mockResolvedValue(true); // Mock the argon2.verify function to return true
    const result = await GetUserAndVerifyPassword("site1", "user1", "p@ssw0rd");
    expect(result).toEqual(expectedUserData);
  });
});

describe("GetUser", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should call ExecuteQuery with the correct query and arguments", async () => {
    const expectedQuery = "SELECT id, username FROM user WHERE username = ?";
    const expectedArgs = ["user1"];
    await GetUser("user1");
    expect(ExecuteQuery).toHaveBeenCalledWith(expectedQuery, expectedArgs);
  });

  it("should return an empty object if query returns no rows", async () => {
    ExecuteQuery.mockResolvedValue([[]]); // Mock the ExecuteQuery function to return an empty array
    const result = await GetUser("user1");
    expect(result).toEqual({});
  });

  it("should return the user data if query returns a row", async () => {
    const expectedUserData = { id: 1, username: "user1" };
    ExecuteQuery.mockResolvedValue([[expectedUserData]]); // Mock the ExecuteQuery function to return the expected user data
    const result = await GetUser("user1");
    expect(result).toEqual(expectedUserData);
  });
});

describe("ChangeUserPassword", () => {
  const mockUserData = { id: 1 };
  const mockHashedPassword = "hashed_password";
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call GetUserAndVerifyPassword with the correct arguments", async () => {
    ExecuteQuery.mockResolvedValue([[mockUserData]]);
    await ChangeUserPassword("site1", "user1", "p@ssw0rd", "new_p@ssw0rd");
    expect(ExecuteQuery).toHaveBeenCalledWith("SELECT user.password, user.id, tenant.first_name, tenant.email, site_admins.site FROM user LEFT JOIN tenant ON tenant.user_id = user.id LEFT JOIN site_admins ON site_admins.userid = user.id and site_admins.site = ? WHERE username = ?", ["site1", "user1"]);
  });

  it("should throw an error if GetUserAndVerifyPassword returns no user data", async () => {
    ExecuteQuery.mockRejectedValue(new Error("invalid login"));
    await expect(ChangeUserPassword("site1", "user1", "p@ssw0rd", "new_p@ssw0rd")).rejects.toThrow("invalid login");
  });

  it("should call argon2.hash with the new password", async () => {
    argon2.hash.mockResolvedValue(mockHashedPassword);
    ExecuteQuery.mockResolvedValueOnce([[mockUserData]]);
    await ChangeUserPassword("site1", "user1", "p@ssw0rd", "new_p@ssw0rd");
    expect(argon2.hash).toHaveBeenCalledWith("new_p@ssw0rd");
  });

  it("should call ExecuteQuery with the correct query and arguments", async () => {
    const expectedQuery = "UPDATE user SET password=? WHERE username=?";
    const expectedArgs = [mockHashedPassword, "user1"];
    argon2.hash.mockResolvedValue(mockHashedPassword);
    ExecuteQuery.mockResolvedValueOnce([[mockUserData]]);
    await ChangeUserPassword("site1", "user1", "p@ssw0rd", "new_p@ssw0rd");
    expect(ExecuteQuery).toHaveBeenCalledWith(expectedQuery, expectedArgs);
  });
});
