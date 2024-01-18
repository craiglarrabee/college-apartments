import React from "react";
import {act, getByRole, render, waitFor} from "@testing-library/react";
import fetchMock from "jest-fetch-mock";
import Title from "../../components/title";
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
        expect(getByText("Welcome John")).toBeInTheDocument();
        const {getByText} = render(<div style={{display: "flex", flexDirection: "column"}}>
            const {getByText} = render(<Title initialUser={initialUser}/>);
            });

            it("displays sign in message for not logged in user", async () => {
            const initialUser = {
            isLoggedIn: false,
        };
            await act(() => user.click(getByRole("button")));
            const {queryAllByText, getByRole} = render(<div style={{display: "flex", flexDirection: "column"}}>
            const {queryAllByText, getByRole} = render(<Title initialUser={initialUser}/>);
            const signins = await waitFor(() => queryAllByText("Sign In"));
            expect(signins.length).toEqual(2);
            });

            it("opens login modal when user clicks first sign in button", async () => {
            const initialUser = {
            isLoggedIn: false,
        };
            const {getByRole, queryByLabelText, queryAllByText} = render(
            );
            <div style={{display: "flex", flexDirection: "column"}}>
            <Title initialUser={initialUser}/>
            await act(() => user.click(getByRole("button")));
            const signInButtons = await waitFor(() => queryAllByText("Sign In"));
            await act(() => user.click(signInButtons[0]));
            await waitFor(() => expect(queryByLabelText("Username")).toBeInTheDocument());
            });

            it("opens login modal when user clicks second sign in button", async () => {
            const initialUser = {
            isLoggedIn: false,
        };
            const {getByRole, queryByLabelText, queryAllByText} = render(
            );
            <div style={{display: "flex", flexDirection: "column"}}>
            <Title initialUser={initialUser}/>
            await act(() => user.click(getByRole("button")));
            const signInButtons = await waitFor(() => queryAllByText("Sign In"));
            await act(() => user.click(signInButtons[1]));
            await waitFor(() => expect(queryByLabelText("Username")).toBeInTheDocument());
            });

            it("logs out user and updates state when user clicks sign out", async () => {
            const initialUser = {
            isLoggedIn: true,
            username: "johndoe",
        };
            fetchMock.mockResponseOnce(JSON.stringify({isLoggeIn: false}));
            await act(() => user.click(getByRole("button")));
            const {getByRole, queryByText, queryAllByText} = render(<div style={{display: "flex", flexDirection: "column"}}>
            const {getByRole, queryByText, queryAllByText} = render(<Title initialUser={initialUser}/>);
            const signOutButton = await waitFor(() => queryByText("Sign out"));
            await act(() => user.click(signOutButton));
            await waitFor(() => expect(queryAllByText("Sign In").length).toEqual(2));
            expect(fetchMock).toHaveBeenCalledWith("/api/logout", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
        });
            });

            it("sends API request to edit site when user clicks manage site", async () => {
            const initialUser = {
            isLoggedIn: true,
            admin: ["site"],
        };
            fetchMock.mockResponseOnce(JSON.stringify({}));
            await act(() => user.click(getByRole("button")));
            const {queryByText, getByRole} = render(<div style={{display: "flex", flexDirection: "column"}}>
            const {queryByText, getByRole} = render(<Title initialUser={initialUser} site="site"/>);
            const manageSiteButton = await waitFor(() => queryByText("Manage Site"));
            await act(() => user.click(manageSiteButton));
            expect(fetchMock).toHaveBeenCalledWith("/api/maintain", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({editSite: true}),
        });
            expect(window.location.pathname).toBe("/");
            });

            it("sends API request to manage apartments when user clicks manage apartments", async () => {
            const initialUser = {
            isLoggedIn: true,
            admin: ["site"],
        };
            fetchMock.mockResponseOnce(JSON.stringify({}));
            await act(() => user.click(getByRole("button")));
            const {queryByText, getByRole} = render(<div style={{display: "flex", flexDirection: "column"}}>
            const {queryByText, getByRole} = render(<Title initialUser={initialUser} site="site"/>);
            const manageApartmentsButton = await waitFor(() => queryByText("Manage Apartments"));
            await act(() => user.click(manageApartmentsButton));
            expect(fetchMock).toHaveBeenCalledWith("/api/manage", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
        });
            expect(window.location.pathname).toBe("/");
            });

            it("sends API request to view site when user is managing site and clicks view site", async () => {
            const initialUser = {
            isLoggedIn: true,
            admin: ["site"],
            editSite: true
        };
            fetchMock.mockResponseOnce(JSON.stringify({}));
            await act(() => user.click(getByRole("button")));
            const {queryByText, getByRole} = render(<div style={{display: "flex", flexDirection: "column"}}>
            const {queryByText, getByRole} = render(<Title initialUser={initialUser} site="site"/>);
            const manageApartmentsButton = await waitFor(() => queryByText("View Site"));
            await act(() => user.click(manageApartmentsButton));
            expect(fetchMock).toHaveBeenCalledWith("/api/view", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
        });
            expect(window.location.pathname).toBe("/");
            });

            it("sends API request to view site when user is managing apartments and clicks view site", async () => {
            const initialUser = {
            isLoggedIn: true,
            admin: ["site"],
            manageApartment: true
        };
            fetchMock.mockResponseOnce(JSON.stringify({}));
            await act(() => user.click(getByRole("button")));
            const {queryByText, getByRole} = render(<div style={{display: "flex", flexDirection: "column"}}>
            const {queryByText, getByRole} = render(<Title initialUser={initialUser} site="site"/>);
            const viewButton = await waitFor(() => queryByText("View Site"));
            await act(() => user.click(viewButton));
            expect(fetchMock).toHaveBeenCalledWith("/api/view", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
        });
            expect(window.location.pathname).toBe("/");
            });

            it("redirects for tenant page when user clicks on manage profile", async () => {
            const initialUser = {
            isLoggedIn: true,
        };
            fetchMock.mockResponseOnce(JSON.stringify({}));
            await act(() => user.click(getByRole("button")));
            const {queryByText, getByRole} = render(<div style={{display: "flex", flexDirection: "column"}}>
            const {queryByText, getByRole} = render(<Title initialUser={initialUser}/>);
            const manageProfile = await waitFor(() => queryByText("Manage Profile"));
            expect(manageProfile.pathname).toBe("/tenant");
            });

            it("redirects for password page when user clicks on change password", async () => {
            const initialUser = {
            isLoggedIn: true,
        };
            fetchMock.mockResponseOnce(JSON.stringify({}));
            await act(() => user.click(getByRole("button")));
            const {queryByText, getByRole} = render(<div style={{display: "flex", flexDirection: "column"}}>
            const {queryByText, getByRole} = render(<Title initialUser={initialUser}/>);
            const changePasswordButton = await waitFor(() => queryByText("Change Password"));
            expect(changePasswordButton.pathname).toBe("/password");
            });
            });
