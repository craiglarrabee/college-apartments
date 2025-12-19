import {ExecuteQuery} from "../pool";
import {AddLease, GetLease, GetLeases, UpdateLease} from "./lease";

jest.mock("../pool", () => ({
    ExecuteQuery: jest.fn(),
    ExecuteTransaction: jest.fn().mockResolvedValue(undefined),
}));

describe("GetLease", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return correct Lease Data", async () => {
        const expectedLease = {id: 1, site: "AAA", description: "Sample Lease", start_date: "", end_date: ""};
        const dbResponse = [[{...expectedLease}]];

        ExecuteQuery.mockResolvedValueOnce(dbResponse);

        const result = await GetLease(expectedLease.id);

        expect(result).toEqual(expectedLease);
    });
});

describe("GetLeases", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return correct Lease Data List", async () => {
        const expectedLeases = [
            {id: 1, page: "leases/1", label: "Lease 1"},
            {id: 2, page: "leases/2", label: "Lease 2"},
        ];
        const dbResponse = [[...expectedLeases]];

        ExecuteQuery.mockResolvedValueOnce(dbResponse);

        const result = await GetLeases("AAA");

        expect(result).toEqual(expectedLeases);
    });
});

describe("UpdateLease", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should perform two UPDATEs via ExecuteTransaction with correct params order", async () => {
        const leaseId = 1;
        const leaseData = {
            description: "Sample Description",
            start_date: "2022-01-01",
            end_date: null,
            semesters: ["Fall 2025", "Spring 2026"],
            deposit_amount: 250,
            label: "Lease 1",
            site: "AAA",
            page: "leases/1",
        };

        await UpdateLease(leaseId, leaseData);

        // ExecuteTransaction is used; the first statement updates lease, the second updates site_nav label
        const { ExecuteTransaction } = require('../pool');
        expect(ExecuteTransaction).toHaveBeenCalledTimes(1);
        const calls = ExecuteTransaction.mock.calls[0][0];
        expect(Array.isArray(calls)).toBe(true);
        expect(calls).toHaveLength(2);
        // First update: lease
        expect(calls[0].string).toEqual(expect.stringContaining("UPDATE lease"));
        expect(calls[0].params).toEqual([
            leaseData.description,
            leaseData.start_date,
            leaseData.end_date,
            // semesters are sorted in impl
            "Fall 2025",
            "Spring 2026",
            leaseData.deposit_amount,
            leaseId,
        ]);
        // Second update: site_nav label
        expect(calls[1].string).toEqual(expect.stringContaining("UPDATE site_nav"));
        expect(calls[1].params).toEqual([
            leaseData.label,
            leaseData.site,
            leaseData.page,
        ]);
    });
});

describe("AddLease", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should call ExecuteQuery with correct parameters and return insertId", async () => {
        const leaseData = {site: "AAA", description: "Sample Description"};
        const expectedQuery = "INSERT INTO lease (site, description) VALUES (?,?)";

        const dbResponse = [{insertId: 1}];
        ExecuteQuery.mockResolvedValueOnce(dbResponse);

        const result = await AddLease(leaseData);

        expect(result).toBe(1);
        expect(ExecuteQuery).toHaveBeenCalledTimes(1);
        expect(ExecuteQuery).toHaveBeenCalledWith(expectedQuery, [leaseData.site, leaseData.description]);
    });
});
