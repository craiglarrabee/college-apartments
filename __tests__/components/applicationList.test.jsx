import {render, screen, fireEvent, act, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import ApplicationForm from "../../components/applicationForm";
import {ProcessedApplicationList, UnprocessedApplicationList} from "../../components/applicationList";

const users = [
    {
        name: "user1",
        user_id: 1,
        submit_date: "Dec 7, 1944"
    },
    {
        name: "user2",
        user_id: 2,
        submit_date: "Sep 11, 2001"
    }
];
const leaseId = 1;
const page = "page";
const site = "site";

describe("UnprocessedApplicationList component", () => {
    let user;
    beforeAll(() => {
        user = userEvent.setup();
    });

    beforeEach(() => {

    });

    it("should render the users names", () => {
        const {getByText} = render(<UnprocessedApplicationList data={users} site={site} page={page}
                                                               leaseId={leaseId}/>);
        const user1Name = getByText(users[0].name);
        expect(user1Name).toBeInTheDocument();
        const user2Name = getByText(users[1].name);
        expect(user2Name).toBeInTheDocument();
    });

    it("should render the application submit dates", () => {
        const {getByText} = render(<UnprocessedApplicationList data={users} site={site} page={page}
                                                               leaseId={leaseId}/>);
        const date1 = getByText(users[0].submit_date);
        expect(date1).toBeInTheDocument();
        const date2 = getByText(users[1].submit_date);
        expect(date2).toBeInTheDocument();
    });

    it("delete button should call handleDelete function", async () => {
        const delFn = jest.fn();
        const {getByText} = render(<UnprocessedApplicationList data={[users[0]]} handleDelete={delFn} site={site}
                                                               page={page} leaseId={leaseId}/>);
        await act(() => user.click(getByText("Delete")));
        await waitFor(() => {
            expect(delFn).toHaveBeenCalledWith(users[0].user_id, site, leaseId)
        });
    });

    it("process button should call handleProcess function", async () => {
        const procFn = jest.fn();
        const {getByText} = render(<UnprocessedApplicationList data={[users[0]]} handleProcess={procFn} site={site}
                                                               page={page} leaseId={leaseId}/>);
        await act(() => user.click(getByText("Process")));
        await waitFor(() => {
            expect(procFn).toHaveBeenCalledWith(users[0].user_id, site, leaseId, true)
        });
    });

    it("user's name should have href to their information", async () => {
        const {getByText} = render(<UnprocessedApplicationList data={[users[0]]} site={site} page={page}
                                                               leaseId={leaseId}/>);
        const url = getByText(users[0].name).href;
        expect(url.endsWith(`${page}/${users[0].user_id}?site=${site}`)).toBe(true);
    });
});
describe("ProcessedApplicationList component", () => {
    let user;
    beforeAll(() => {
        user = userEvent.setup();
    });

    beforeEach(() => {

    });

    it("should render the users names", () => {
        const {getByText} = render(<ProcessedApplicationList data={users} site={site} page={page} leaseId={leaseId}/>);
        const user1Name = getByText(users[0].name);
        expect(user1Name).toBeInTheDocument();
        const user2Name = getByText(users[1].name);
        expect(user2Name).toBeInTheDocument();
    });

    it("should render the application submit dates", () => {
        const {getByText} = render(<ProcessedApplicationList data={users} site={site} page={page} leaseId={leaseId}/>);
        const date1 = getByText(users[0].submit_date);
        expect(date1).toBeInTheDocument();
        const date2 = getByText(users[1].submit_date);
        expect(date2).toBeInTheDocument();
    });

    it("delete button should call handleDelete function", async () => {
        const delFn = jest.fn();
        const {getByText} = render(<ProcessedApplicationList data={[users[0]]} handleDelete={delFn} site={site}
                                                             page={page} leaseId={leaseId}/>);
        await act(() => user.click(getByText("Delete")));
        await waitFor(() => {
            expect(delFn).toHaveBeenCalledWith(users[0].user_id, site, leaseId)
        });
    });

    it("deposit button should call handleDeposit function", async () => {
        const depFn = jest.fn();
        const {getByText} = render(<ProcessedApplicationList data={[users[0]]} handleDeposit={depFn} site={site}
                                                             page={page} leaseId={leaseId}/>);
        await act(() => user.click(getByText("Deposit")));
        await waitFor(() => {
            expect(depFn).toHaveBeenCalledWith(users[0].user_id, site, leaseId)
        });
    });

    it("process button should call handleUnprocess function", async () => {
        const unprocFn = jest.fn();
        const {getByText} = render(<ProcessedApplicationList data={[users[0]]} handleProcess={unprocFn} site={site}
                                                             page={page} leaseId={leaseId}/>);
        await act(() => user.click(getByText("Unprocess")));
        await waitFor(() => {
            expect(unprocFn).toHaveBeenCalledWith(users[0].user_id, site, leaseId, false)
        });
    });

    it("user's name should have href to their information", async () => {
        const {getByText} = render(<ProcessedApplicationList data={[users[0]]} site={site} page={page}
                                                             leaseId={leaseId}/>);
        const url = getByText(users[0].name).href;
        expect(url.endsWith(`${page}/${users[0].user_id}?site=${site}`)).toBe(true);
    });
});
