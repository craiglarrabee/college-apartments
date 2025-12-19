import {GetNavLinks, AddNavLink} from "./navLinks";
import {ExecuteQuery} from "../pool";

jest.mock("../pool");

describe("GetNavLinks", () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it("should call ExecuteQuery with correct query and parameters when user can manage apartment", async () => {
        const site = "site-a";
        const user = { manage: [site], manageApartment: true };
        const expectedRows = [
            {page: "test-page-1"},
            {page: "test-page-2"},
            {page: "test-page-3"},
        ];
        ExecuteQuery.mockResolvedValue([expectedRows]);
        const result = await GetNavLinks(user, site);
        const [sql, params] = ExecuteQuery.mock.calls[0];
        expect(sql).toEqual(expect.stringContaining("FROM site_nav"));
        expect(sql).toEqual(expect.stringContaining("UNION"));
        expect(params).toEqual([site, site, site, site]);
        expect(result).toEqual(expectedRows);
    });

    it("should call ExecuteQuery with correct queryString and parameters when user is admin and can edit site", async () => {
        const user = {admin: "admin-test", editSite: true};
        const site = "admin-test";
        const queryString =
            "SELECT n.* FROM site_nav n LEFT JOIN lease d ON d.site = n.site AND n.page = CONCAT('leases/', d.id) WHERE n.site = ? AND n.maintainable = 1 AND COALESCE(d.end_date, CURDATE() + interval 1 month) >= CURDATE() ORDER BY position";
        const expectedRows = [
            {page: "test-page-1"},
            {page: "test-page-2"},
            {page: "test-page-3"},
        ];
        const mockedResponse = [expectedRows, undefined];
        ExecuteQuery.mockResolvedValue(mockedResponse);
        const result = await GetNavLinks(user, site);
        expect(ExecuteQuery).toHaveBeenCalledWith(queryString, [site]);
        expect(result).toEqual(expectedRows);
    });

    it("should call ExecuteQuery with correct queryString and parameters when user is logged in but not admin", async () => {
        const user = { isLoggedIn: true, id: 42 };
        const site = "site-test";
        const expectedRows = [
            {page: "test-page-1"},
            {page: "test-page-2"},
            {page: "test-page-3"},
        ];
        const mockedResponse = [expectedRows, undefined];
        ExecuteQuery.mockResolvedValue(mockedResponse);
        const result = await GetNavLinks(user, site);
        const [sql, params] = ExecuteQuery.mock.calls[0];
        expect(sql).toEqual(expect.stringContaining("FROM site_nav"));
        expect(sql).toEqual(expect.stringContaining("UNION"));
        expect(Array.isArray(params)).toBe(true);
        expect(params).toEqual([site, user.id, site, site, user.id, site]);
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
            "INSERT INTO site_nav (site, page, parent_page, position, label, restricted, public) VALUES (?,?,?,?,?,?,0)";
        const expectedResponse = [{insertId: "insert-test-id"}];
        const mockedSelectRows = [
            {
                site: "site-test",
                page: "leases",
                parent_page: "test-parent-page",
                position: "05.lease-test-1",
                label: "test-label",
                restricted: "test-restricted",
            }
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
                return [mockedSelectRows];
            }
            if (query === expectedUpdateQuery) {
                return expectedResponse;
            }
            return [];
        });
        const result = await AddNavLink({leaseId, leasename, site});
        expect(ExecuteQuery).toHaveBeenNthCalledWith(1, expectedQuery, [site]);
        expect(ExecuteQuery).toHaveBeenNthCalledWith(
            2,
            expectedUpdateQuery,
            expectedParameters
        );
        expect(result).toEqual(expectedResponse[0].insertId);
    });
});

