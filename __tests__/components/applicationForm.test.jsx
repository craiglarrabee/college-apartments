import React from "react";
import {render, screen, act} from "@testing-library/react";
import "@testing-library/jest-dom";
import ApplicationForm from "../../components/applicationForm";
import userEvent from "@testing-library/user-event";
import fetchMock from "jest-fetch-mock";

describe("ApplicationForm", () => {
    const mockPage = "mockPage";
    const mockNavPage = "mockNavPage";
    const mockSite = "mockSite";
    const mockRules = "mockRules";
    const mockDisclaimer = "mockDisclaimer";
    const mockGuaranty = "mockGuaranty";
    const mockCanEdit = true;
    const mockUserId = "mockUserId";
    const mockLeaseId = "mockLeaseId";
    const mockApplication = {};
    const testRoomTypeId = 2;
    let user;

    beforeAll(() => {
        fetchMock.enableMocks();
        user = userEvent.setup();
    });

    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.mockResponseOnce(undefined, {status: 204});
    });

    test("renders ApplicationForm component", () => {
        render(<ApplicationForm page={mockPage} navPage={mockNavPage} site={mockSite} rules={mockRules} disclaimer={mockDisclaimer} guaranty={mockGuaranty} canEdit={mockCanEdit} userId={mockUserId} leaseId={mockLeaseId} application={mockApplication} currentLeases={[]} roomTypeId={testRoomTypeId}/>);
        expect(screen.getByText("Room Type:")).toBeInTheDocument();
    });

    test("calls delete api when delete button is clicked", async () => {
        render(<ApplicationForm page={mockPage} navPage={mockNavPage} site={mockSite} rules={mockRules} disclaimer={mockDisclaimer} guaranty={mockGuaranty} canEdit={mockCanEdit} userId={mockUserId} leaseId={mockLeaseId} application={mockApplication} currentLeases={[]} roomTypeId={testRoomTypeId}/>);
        await act(() => user.click(screen.getByText("Delete")));
        expect(fetchMock).toHaveBeenCalledWith(`/api/users/${mockUserId}/leases/${mockLeaseId}/application?site=${mockSite}&roomTypeId=${testRoomTypeId}`, {method: "DELETE", headers: {"Content-Type": "application/json"}});
    });

    test("delete failure displays error", async () => {
        render(<ApplicationForm page={mockPage} navPage={mockNavPage} site={mockSite} rules={mockRules} disclaimer={mockDisclaimer} guaranty={mockGuaranty} canEdit={mockCanEdit} userId={mockUserId} leaseId={mockLeaseId} application={mockApplication} currentLeases={[]} roomTypeId={testRoomTypeId}/>);
        fetchMock.resetMocks();
        fetchMock.mockResponseOnce(JSON.stringify({error: "Error"}), {status: 400});
        await act(() => user.click(screen.getByText("Delete")));
        expect(fetchMock).toHaveBeenCalledWith(`/api/users/${mockUserId}/leases/${mockLeaseId}/application?site=${mockSite}&roomTypeId=${testRoomTypeId}`, {method: "DELETE", headers: {"Content-Type": "application/json"}});
        expect(screen.getByText("Error", {exact: false})).toBeInTheDocument();
    });

    test("calls update application api to mark processed when Mark Processed button is clicked", async () => {
        render(<ApplicationForm page={mockPage} navPage={mockNavPage} site={mockSite} rules={mockRules} disclaimer={mockDisclaimer} guaranty={mockGuaranty} canEdit={mockCanEdit} userId={mockUserId} leaseId={mockLeaseId} application={{...mockApplication, processed: true}} currentLeases={[]} roomTypeId={testRoomTypeId}/>);
        await act(() => user.click(screen.getByText("Mark Unprocessed")));
        expect(fetchMock).toHaveBeenCalledWith(`/api/users/${mockUserId}/leases/${mockLeaseId}/application?site=${mockSite}`, expect.objectContaining({method: "PUT"}));
    });

    test("mark processed failure displays error", async () => {
        render(<ApplicationForm page={mockPage} navPage={mockNavPage} site={mockSite} rules={mockRules} disclaimer={mockDisclaimer} guaranty={mockGuaranty} canEdit={mockCanEdit} userId={mockUserId} leaseId={mockLeaseId} application={mockApplication} currentLeases={[]} roomTypeId={testRoomTypeId}/>);
        fetchMock.resetMocks();
        fetchMock.mockResponseOnce(JSON.stringify({error: "Error"}), {status: 400});
        await act(() => user.click(screen.getByText("Mark Processed")));
        expect(fetchMock).toHaveBeenCalledWith(`/api/users/${mockUserId}/leases/${mockLeaseId}/application?site=${mockSite}`, expect.objectContaining({method: "PUT"}));
        expect(screen.getByText("Error", {exact: false})).toBeInTheDocument();
    });

    test("calls update application api to mark unprocessed when Mark Unprocessed button is clicked", async () => {
        render(<ApplicationForm page={mockPage} navPage={mockNavPage} site={mockSite} rules={mockRules} disclaimer={mockDisclaimer} guaranty={mockGuaranty} canEdit={mockCanEdit} userId={mockUserId} leaseId={mockLeaseId} application={mockApplication} currentLeases={[]} roomTypeId={testRoomTypeId}/>);
        await act(() => user.click(screen.getByText("Mark Processed")));
        expect(fetchMock).toHaveBeenCalledWith(`/api/users/${mockUserId}/leases/${mockLeaseId}/application?site=${mockSite}`, expect.objectContaining({method: "PUT"}));
    });

    test("mark unprocessed failure displays error", async () => {
        render(<ApplicationForm page={mockPage} navPage={mockNavPage} site={mockSite} rules={mockRules} disclaimer={mockDisclaimer} guaranty={mockGuaranty} canEdit={mockCanEdit} userId={mockUserId} leaseId={mockLeaseId} application={{...mockApplication, processed: true}} currentLeases={[]} roomTypeId={testRoomTypeId}/>);
        fetchMock.resetMocks();
        fetchMock.mockResponseOnce(JSON.stringify({error: "Error"}), {status: 400});
        await act(() => user.click(screen.getByText("Mark Unprocessed")));
        expect(fetchMock).toHaveBeenCalledWith(`/api/users/${mockUserId}/leases/${mockLeaseId}/application?site=${mockSite}`, expect.objectContaining({method: "PUT"}));
        expect(screen.getByText("Error", {exact: false})).toBeInTheDocument();
    });

    test("calls update application api to save application when Save button is clicked", async () => {
        render(<ApplicationForm page={mockPage} navPage={mockNavPage} site={mockSite} rules={mockRules} disclaimer={mockDisclaimer} guaranty={mockGuaranty} canEdit={mockCanEdit} userId={mockUserId} leaseId={1} application={mockApplication} currentLeases={[{leaseId: 1, rooms: [{room_type_id: 2}]}]} roomTypeId={testRoomTypeId}/>);
        await act(() => user.click(screen.getByDisplayValue("1_2")));
        await act(() => user.click(screen.getByText("Save")));
        expect(fetchMock).toHaveBeenCalledWith(`/api/users/${mockUserId}/leases/1/application?site=${mockSite}`, expect.objectContaining({method: "POST", headers: {"Content-Type": "application/json"}, body: expect.stringContaining("1_2")}));
    });
});