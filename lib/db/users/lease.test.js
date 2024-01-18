import {ExecuteQuery} from "../pool";
import {AddLease, GetLease, GetLeases, UpdateLease} from "./lease";

jest.mock("../pool", () => ({
    ExecuteQuery: jest.fn(),
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

    it("should call ExecuteQuery with correct parameters", async () => {
        const leaseId = 1;
        const leaseData = {description: "Sample Description", start_date: "2022-01-01", end_date: null};

        const expectedQuery =
            "UPDATE lease SET description = ?, start_date = ?, end_date = ? WHERE id = ?";

        await UpdateLease(leaseId, leaseData);

        expect(ExecuteQuery).toHaveBeenCalledTimes(1);
        expect(ExecuteQuery).toHaveBeenCalledWith(expectedQuery, [
            leaseData.description,
            leaseData.start_date,
            leaseData.end_date,
            leaseId,
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
