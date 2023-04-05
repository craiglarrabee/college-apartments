

import { GetNavLinks, AddNavLink } from "./navLinks";
import { ExecuteQuery } from "../pool";
jest.mock("../pool");

describe("GetNavLinks", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should call ExecuteQuery with correct queryString and parameters when user is admin and can manage apartment", async () => {
    const user = { admin: "admin-test", manageApartment: true };
    const site = "admin-test";
    const queryString = "SELECT n.* FROM site_nav n WHERE n.site = ? AND n.restricted = 1 ORDER BY position";
    const expectedRows = [
      { page: "test-page-1" },
      { page: "test-page-2" },
      { page: "test-page-3" },
    ];
    const mockedResponse = [expectedRows, undefined];
    ExecuteQuery.mockResolvedValue(mockedResponse);
    const result = await GetNavLinks(user, site);
    expect(ExecuteQuery).toHaveBeenCalledWith(queryString, [site]);
    expect(result).toEqual(expectedRows);
  });

  it("should call ExecuteQuery with correct queryString and parameters when user is admin and can edit site", async () => {
    const user = { admin: "admin-test", editSite: true };
    const site = "admin-test";
    const queryString =
      "SELECT n.* FROM site_nav n LEFT JOIN lease d ON d.site = n.site AND n.page = CONCAT('leases/', d.id) WHERE n.site = ? AND n.maintainable = 1 AND COALESCE(d.end_date, CURDATE() + interval 1 month) >= CURDATE() ORDER BY position";
    const expectedRows = [
      { page: "test-page-1" },
      { page: "test-page-2" },
      { page: "test-page-3" },
    ];
    const mockedResponse = [expectedRows, undefined];
    ExecuteQuery.mockResolvedValue(mockedResponse);
    const result = await GetNavLinks(user, site);
    expect(ExecuteQuery).toHaveBeenCalledWith(queryString, [site]);
    expect(result).toEqual(expectedRows);
  });

  it("should call ExecuteQuery with correct queryString and parameters when user is not admin", async () => {
    const user = { admin: "admin-test" };
    const site = "site-test";
    const queryString =
      "SELECT n.* FROM site_nav n WHERE n.site = ? AND n.restricted = 0 ORDER BY position";
    const expectedRows = [
      { page: "test-page-1" },
      { page: "test-page-2" },
      { page: "test-page-3" },
    ];
    const mockedResponse = [expectedRows, undefined];
    ExecuteQuery.mockResolvedValue(mockedResponse);
    const result = await GetNavLinks(user, site);
    expect(ExecuteQuery).toHaveBeenCalledWith(queryString, [site]);
    expect(result).toEqual(expectedRows);
  });
});

describe("AddNavLink", () => {
  it("should call ExecuteQuery with correct queryString and parameters", async () => {
    const site = "site-test";
    const leaseId = "lease-test-1";
    const leasename = "lease name test";
    const expectedNewRow = {
      site: "site-test",
      page: "leases/lease-test-1",
      parent_page: "test-parent-page",
      position: "05.lease-test-1",
      label: "test-label",
      restricted: "test-restricted",
    };
    const expectedQuery =
      "SELECT * FROM site_nav WHERE site = ? AND page='leases'";
    const expectedUpdateQuery =
      "INSERT INTO site_nav (site, page, parent_page, position, label, restricted) VALUES (?,?,?,?,?,?)";
    const expectedResponse = [{ insertId: "insert-test-id" }, undefined];
    const mockedQueryResponse =
      [
        {
          site: "site-test",
          page: "leases",
          parent_page: "test-parent-page",
          position: "05.lease-test-1",
          label: "test-label",
          restricted: "test-restricted",
        },
          undefined
      ];
    const expectedParameters = [
      expectedNewRow.site,
      expectedNewRow.page,
      expectedNewRow.parent_page,
      expectedNewRow.position,
      leasename,
      expectedNewRow.restricted,
    ];
    ExecuteQuery.mockImplementation((query, parameters) => {
      if (query === expectedQuery) {
        return [mockedQueryResponse, undefined];
      }
      if (query === expectedUpdateQuery) {
        return expectedResponse;
      }
      return [];
    });
    const result = await AddNavLink({ leaseId, leasename, site });
    expect(ExecuteQuery).toHaveBeenNthCalledWith(1, expectedQuery, [site]);
    expect(ExecuteQuery).toHaveBeenNthCalledWith(
      2,
      expectedUpdateQuery,
      expectedParameters
    );
    expect(result).toEqual(expectedResponse[0].insertId);
  });
});

