import React from "react";
import {act, getByRole, render, waitFor} from "@testing-library/react";
import fetchMock from "jest-fetch-mock";
import Title from "./Title";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import Router from "next/router";

let user;
describe("Title component", () => {
    beforeAll(() => {
        fetchMock.enableMocks();
        user = userEvent.setup();
        jest.mock('next/router');
        Router.reload = jest.fn();
    });

    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it("displays welcome message for logged in user", () => {
        const initialUser = {
            isLoggedIn: true,
            username: "johndoe",
            firstName: "John",
        };
        const {getByText} = render(<Title initialUser={initialUser}/>);
        expect(getByText("Welcome John")).toBeInTheDocument();
    });

    it("displays sign in message for not logged in user", async () => {
        const initialUser = {
            isLoggedIn: false,
        };
        const {queryByText, getByRole} = render(<Title initialUser={initialUser}/>);
        await user.click(getByRole("button"));
        const signin = await waitFor(() => queryByText("Sign In"));
        expect(signin).toBeInTheDocument();
    });

    it("opens login modal when user clicks sign in", async () => {
        const initialUser = {
            isLoggedIn: false,
        };
        const {getByRole, queryByLabelText, queryByText} = render(
            <Title initialUser={initialUser}/>
        );
        await user.click(getByRole("button"));
        const signInButton = await waitFor(() => queryByText("Sign In"));
        await user.click(signInButton);
        await waitFor(() => expect(queryByLabelText("Username")).toBeInTheDocument());
    });

    it("logs out user and updates state when user clicks sign out", async () => {
        const initialUser = {
            isLoggedIn: true,
            username: "johndoe",
        };
        fetchMock.mockResponseOnce(JSON.stringify({}));
        const {getByRole, queryByText} = render(<Title initialUser={initialUser}/>);
        await user.click(getByRole("button"));
        const signOutButton = await waitFor(() => queryByText("Sign out"));
        await user.click(signOutButton);
        await waitFor(() => expect(queryByText("Sign In")).toBeInTheDocument());
        expect(fetchMock).toHaveBeenCalledWith("/api/logout", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
        });
    });

    it("sends API request to edit site when user clicks manage site", async () => {
        const initialUser = {
            isLoggedIn: true,
            admin: true,
        };
        fetchMock.mockResponseOnce(JSON.stringify({}));
        const {queryByText, getByRole} = render(<Title initialUser={initialUser}/>);
        await user.click(getByRole("button"));
        const manageSiteButton = await waitFor(() => queryByText("Manage Site"));
        await user.click(manageSiteButton);
        expect(fetchMock).toHaveBeenCalledWith("/api/maintain", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({editSite: true}),
        });
        expect(window.location.pathname).toBe("/");
        expect(Router.reload).toHaveBeenCalled();
    });

    it("sends API request to manage apartments when user clicks manage apartments", async () => {
        const initialUser = {
            isLoggedIn: true,
            admin: true,
        };
        fetchMock.mockResponseOnce(JSON.stringify({}));
        const {queryByText, getByRole} = render(<Title initialUser={initialUser}/>);
        await user.click(getByRole("button"));
        const manageApartmentsButton = await waitFor(() => queryByText("Manage Apartments"));
        await user.click(manageApartmentsButton);
        expect(fetchMock).toHaveBeenCalledWith("/api/manage", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
        });
        expect(window.location.pathname).toBe("/");
        expect(Router.reload).toHaveBeenCalled();
    });

    it("sends API request to view site when user is managing site and clicks view site", async () => {
        const initialUser = {
            isLoggedIn: true,
            admin: true,
            editSite: true
        };
        fetchMock.mockResponseOnce(JSON.stringify({}));
        const {queryByText, getByRole} = render(<Title initialUser={initialUser}/>);
        await user.click(getByRole("button"));
        const manageApartmentsButton = await waitFor(() => queryByText("View Site"));
        await user.click(manageApartmentsButton);
        expect(fetchMock).toHaveBeenCalledWith("/api/view", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
        });
        expect(window.location.pathname).toBe("/");
        expect(Router.reload).toHaveBeenCalled();
    });

    it("sends API request to view site when user is managing apartments and clicks view site", async () => {
        const initialUser = {
            isLoggedIn: true,
            admin: true,
            manageApartment: true
        };
        fetchMock.mockResponseOnce(JSON.stringify({}));
        const {queryByText, getByRole} = render(<Title initialUser={initialUser}/>);
        await user.click(getByRole("button"));
        const viewButton = await waitFor(() => queryByText("View Site"));
        await user.click(viewButton);
        expect(fetchMock).toHaveBeenCalledWith("/api/view", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
        });
        expect(window.location.pathname).toBe("/");
        expect(Router.reload).toHaveBeenCalled();
    });

    it("redirects for tenant page when user clicks on manage profile", async () => {
        const initialUser = {
            isLoggedIn: true,
        };
        fetchMock.mockResponseOnce(JSON.stringify({}));
        const {queryByText, getByRole} = render(<Title initialUser={initialUser}/>);
        await user.click(getByRole("button"));
        const manageProfile = await waitFor(() => queryByText("Manage Profile"));
        expect(manageProfile.pathname).toBe("/tenant");
    });

    it("redirects for password page when user clicks on change password", async () => {
        const initialUser = {
            isLoggedIn: true,
        };
        fetchMock.mockResponseOnce(JSON.stringify({}));
        const {queryByText, getByRole} = render(<Title initialUser={initialUser}/>);
        await user.click(getByRole("button"));
        const changePasswordButton = await waitFor(() => queryByText("Change Password"));
        expect(changePasswordButton.pathname).toBe("/password");
    });
});
