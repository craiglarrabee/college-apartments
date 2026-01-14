import {ExecuteQuery} from "../pool";
import {GetUserAdminSites, ChangeUsername, DeleteUser} from "./user";

jest.mock("../pool", () => ({
  ExecuteQuery: jest.fn(),
}));

describe("GetUserAdminSites", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns rows and calls with correct params", async () => {
    const rows = [{site: "s1", site_privs: 1, apartment_privs: 0}];
    ExecuteQuery.mockResolvedValueOnce([rows]);

    const result = await GetUserAdminSites(123);

    expect(result).toEqual(rows);
    expect(ExecuteQuery).toHaveBeenCalledTimes(1);
    const [sql, params] = ExecuteQuery.mock.calls[0];
    expect(sql).toEqual(expect.stringContaining("FROM site_admins"));
    expect(sql).toEqual(expect.stringContaining("WHERE userid = ?"));
    expect(params).toEqual([123]);
  });
});

describe("ChangeUsername", () => {
  afterEach(() => jest.clearAllMocks());

  it("updates username for a given id", async () => {
    ExecuteQuery.mockResolvedValueOnce([{}]);

    await ChangeUsername(7, "newuser");

    expect(ExecuteQuery).toHaveBeenCalledWith(
      "UPDATE user SET username=? WHERE id=?",
      ["newuser", 7]
    );
  });
});

describe("DeleteUser", () => {
  afterEach(() => jest.clearAllMocks());

  it("performs cascade delete across related tables", async () => {
    ExecuteQuery.mockResolvedValue([{}]);

    await DeleteUser(42);

    // Expect multiple calls
    expect(ExecuteQuery.mock.calls.length).toBeGreaterThanOrEqual(8);

    // Collect SQL and params used
    const calls = ExecuteQuery.mock.calls.map(([sql, params]) => ({sql, params}));

    // Assert each expected deletion was issued with correct param
    const expectations = [
      {fragment: "FROM user WHERE id=", params: [42]},
      {fragment: "FROM tenant WHERE user_id=", params: [42]},
      {fragment: "FROM site_admins WHERE userid=", params: [42]},
      {fragment: "FROM user_lease_tenant WHERE user_id=", params: [42]},
      {fragment: "FROM user_lease WHERE user_id=", params: [42]},
      {fragment: "FROM user_payment WHERE user_id=", params: [42]},
      {fragment: "FROM application WHERE user_id=", params: [42]},
      {fragment: "FROM snowcoll_apts.email_queue WHERE user_id=", params: [42]},
    ];

    expectations.forEach(({fragment, params}) => {
      const found = calls.find(c => c.sql.includes(fragment) && JSON.stringify(c.params) === JSON.stringify(params));
      expect(found).toBeTruthy();
    });
  });
});
