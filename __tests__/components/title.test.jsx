import React from "react";
import {render} from "@testing-library/react";
import fetchMock from "jest-fetch-mock";
import Title from "../../components/title";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

let user;
describe("Title component (site param propagation)", () => {
    beforeAll(() => {
        fetchMock.enableMocks();
        user = userEvent.setup();
    });

    beforeEach(() => {
        fetchMock.resetMocks();
    });

    const openMenu = async (container) => {
        // Updated selector: react-bootstrap NavDropdown renders an anchor with class 'dropdown-toggle'
        const toggle = container.querySelector('.dropdown-toggle');
        if (!toggle) throw new Error('NavDropdown toggle not found');
        await user.click(toggle);
    };

    test("logs out user and calls /api/logout?site=site", async () => {
        const initialUser = {isLoggedIn: true, username: "johndoe"};
        fetchMock.mockResponseOnce(JSON.stringify({isLoggedIn: false}));
        const {container, findByText} = render(<Title initialUser={initialUser} site="site" />);
        await openMenu(container);
        const signOutItem = await findByText(/Sign out/i);
        await user.click(signOutItem);
        expect(fetchMock).toHaveBeenCalledWith("/api/logout?site=site", expect.objectContaining({method: "POST"}));
    });

    test("manage site triggers /api/maintain?site=site", async () => {
        const initialUser = {isLoggedIn: true, admin: ["site"], username: "admin"};
        fetchMock.mockResponseOnce(JSON.stringify({}));
        const {container, findByText} = render(<Title initialUser={initialUser} site="site" />);
        await openMenu(container);
        const manageSite = await findByText(/Manage Site/i);
        await user.click(manageSite);
        expect(fetchMock).toHaveBeenCalledWith("/api/maintain?site=site", expect.objectContaining({method: "POST"}));
    });

    test("manage apartments triggers /api/manage?site=site", async () => {
        const initialUser = {isLoggedIn: true, manage: ["site"], username: "manager"};
        fetchMock.mockResponseOnce(JSON.stringify({}));
        const {container, findByText} = render(<Title initialUser={initialUser} site="site" />);
        await openMenu(container);
        const manageApts = await findByText(/Manage Apartments/i);
        await user.click(manageApts);
        expect(fetchMock).toHaveBeenCalledWith("/api/manage?site=site", expect.objectContaining({method: "POST"}));
    });

    test("view site from edit mode triggers /api/view?site=site", async () => {
        const initialUser = {isLoggedIn: true, editSite: true, username: "editor"};
        fetchMock.mockResponseOnce(JSON.stringify({}));
        const {container, findByText} = render(<Title initialUser={initialUser} site="site" />);
        await openMenu(container);
        const viewSite = await findByText(/View Site/i);
        await user.click(viewSite);
        expect(fetchMock).toHaveBeenCalledWith("/api/view?site=site", expect.objectContaining({method: "POST"}));
    });

    test("view site from manage apartments mode triggers /api/view?site=site", async () => {
        const initialUser = {isLoggedIn: true, manageApartment: true, username: "aptmgr"};
        fetchMock.mockResponseOnce(JSON.stringify({}));
        const {container, findByText} = render(<Title initialUser={initialUser} site="site" />);
        await openMenu(container);
        const viewSite = await findByText(/View Site/i);
        await user.click(viewSite);
        expect(fetchMock).toHaveBeenCalledWith("/api/view?site=site", expect.objectContaining({method: "POST"}));
    });
});
